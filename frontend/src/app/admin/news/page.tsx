"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { ApiError, api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminNewsItem } from "@/lib/admin"
import {
  adminNews,
  fill,
  isNewsRegion,
  isNewsStatus,
  isScheduled,
  newsFieldErrors,
  newsFieldId,
  newsFields,
  newsPayload,
  newsPublishTime,
  newsRegions,
  newsStatusLabel,
  newsStatuses,
  toNewsForm,
  validateNewsForm,
  type NewsField,
  type NewsForm,
  type NewsFormErrors,
} from "@/lib/admin-news"
import { useLocale } from "@/lib/locale"
import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react"

type TextField = Exclude<NewsField, "status" | "region">
type FieldOptions = {
  required?: boolean
  hint?: string
  wide?: boolean
  rows?: number
  type?: "text" | "url" | "datetime-local"
  ltr?: boolean
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminNews(locale)
  const [articles, setArticles] = useState<AdminNewsItem[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editing, setEditing] = useState<AdminNewsItem | null>(null)
  const [form, setForm] = useState<NewsForm>(() => toNewsForm())
  const [errors, setErrors] = useState<NewsFormErrors>({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const savingRef = useRef(false)
  const latestRequest = useRef(0)
  const currentQuery = useRef(query)

  // Reads the search through a ref so a refresh after a save or delete still loads the search
  // shown now, and ignores slower earlier responses.
  const load = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    try {
      const response = await api.get<AdminCollectionResponse<AdminNewsItem>>("/admin/news", {
        params: { search: currentQuery.current || undefined },
      })
      if (request !== latestRequest.current) return
      setArticles(response.data)
      setMeta(response.meta)
      setStatus("ready")
    } catch {
      if (request === latestRequest.current) setStatus("error")
    }
  }, [])

  useEffect(() => {
    currentQuery.current = query
    void load()
  }, [query, load])

  // Fields are disabled while saving and a disabled input cannot take focus, so the first
  // invalid field is focused only once the form is enabled again.
  const [focusField, setFocusField] = useState<NewsField | null>(null)
  useEffect(() => {
    if (!focusField || saving) return
    document.getElementById(newsFieldId(focusField))?.focus()
    setFocusField(null)
  }, [focusField, saving])

  const focusFirstError = (found: NewsFormErrors) => {
    setFocusField(newsFields.find((field) => found[field]) ?? null)
  }

  // Submitting the search shown now (including an empty one) reloads it, so the list can be
  // refreshed after changes made elsewhere; a new search loads through the effect above.
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = searchInput.trim()
    if (next === query) void load()
    else setQuery(next)
  }

  const openEditor = (article?: AdminNewsItem) => {
    setEditing(article ?? null)
    setForm(toNewsForm(article))
    setErrors({})
    setOpen(true)
  }

  const update = <K extends keyof NewsForm>(name: K, value: NewsForm[K]) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name as NewsField]
      return next
    })
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (savingRef.current) return
    const found = validateNewsForm(locale, form, editing)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found)
      toast(copy.saveInvalid, "error")
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const payload = newsPayload(form, editing)
      if (editing) await api.put(`/admin/news/${editing.id}`, payload)
      else await api.post("/admin/news", payload)
      toast(editing ? copy.updated : copy.created, "success")
      setOpen(false)
      setEditing(null)
      void load()
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? newsFieldErrors(locale, (err.data as { errors?: unknown } | undefined)?.errors)
        : {}
      if (Object.keys(apiErrors).length) {
        setErrors(apiErrors)
        focusFirstError(apiErrors)
        toast(copy.saveInvalid, "error")
      } else {
        toast(copy.saveFailed, "error")
      }
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const destroy = async (article: AdminNewsItem) => {
    if (deletingId !== null || !window.confirm(fill(copy.confirmDelete, { name: article.title }))) return
    setDeletingId(article.id)
    try {
      await api.delete(`/admin/news/${article.id}`)
      toast(copy.deleted, "success")
      void load()
    } catch {
      toast(copy.deleteFailed, "error")
    } finally {
      setDeletingId(null)
    }
  }

  const describedBy = (name: NewsField, hint?: string) => {
    const id = newsFieldId(name)
    return errors[name] ? `${id}-error` : hint ? `${id}-hint` : undefined
  }

  const label = (name: NewsField, text: string, required?: boolean) => (
    <Label htmlFor={newsFieldId(name)}>
      {text}
      {required && <span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span>}
    </Label>
  )

  const messages = (name: NewsField, hint?: string) => {
    const id = newsFieldId(name)
    return (
      <>
        {hint && !errors[name] && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}
        {errors[name] && <p id={`${id}-error`} className="text-xs font-medium text-red-700">{errors[name]}</p>}
      </>
    )
  }

  const field = (name: TextField, text: string, options: FieldOptions = {}): ReactNode => {
    const shared = {
      id: newsFieldId(name),
      name,
      value: form[name],
      disabled: saving,
      required: options.required,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy(name, options.hint),
      dir: options.ltr ? "ltr" : "auto",
    }
    return (
      <div className={options.wide ? "space-y-2 sm:col-span-2" : "space-y-2"}>
        {label(name, text, options.required)}
        {options.rows
          ? <Textarea {...shared} rows={options.rows} onChange={(event) => update(name, event.target.value)} />
          : <Input {...shared} type={options.type ?? "text"} onChange={(event) => update(name, event.target.value)} />}
        {messages(name, options.hint)}
      </div>
    )
  }

  const choice = (name: "status" | "region", text: string, options: { value: string; label: string }[], required?: boolean): ReactNode => (
    <div className="space-y-2">
      {label(name, text, required)}
      <Select
        id={newsFieldId(name)}
        name={name}
        value={form[name]}
        disabled={saving}
        required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={describedBy(name)}
        onChange={(event) => update(name, event.target.value)}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
      {messages(name)}
    </div>
  )

  const statusOptions: { value: string; label: string }[] = newsStatuses.map((value) => ({ value, label: copy.statuses[value] }))
  if (!isNewsStatus(form.status)) statusOptions.push({ value: form.status, label: form.status })
  const regionOptions: { value: string; label: string }[] = [{ value: "", label: copy.regionUnset }, ...newsRegions.map((value) => ({ value, label: copy.regions[value] }))]
  if (form.region && !isNewsRegion(form.region)) regionOptions.push({ value: form.region, label: form.region })

  const searching = query !== ""
  let records: ReactNode
  if (status === "loading" && articles.length === 0) {
    records = <p role="status" className="text-sm text-gray-500">{copy.loading}</p>
  } else if (status === "error") {
    records = (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-gray-700">{copy.loadFailed}</p>
        <Button size="sm" variant="outline" className="min-h-11" onClick={() => void load()}>{copy.retry}</Button>
      </div>
    )
  } else if (articles.length === 0) {
    records = <p className="text-sm text-gray-500">{searching ? copy.emptySearch : copy.empty}</p>
  } else {
    records = (
      <ul className="space-y-3">
        {articles.map((article) => {
          const when = newsPublishTime(locale, article.published_at)
          return (
            <li key={article.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 break-words" dir="auto">{article.title}</p>
                <p className="mt-1 text-xs text-gray-500 break-words">
                  <span dir="auto">{fill(copy.by, { name: article.author_name })}</span>
                  {" · "}
                  {when ? fill(copy.publishedOn, { date: when }) : copy.notScheduled}
                  {article.source_name && <>{" · "}<span dir="auto">{fill(copy.source, { name: article.source_name })}</span></>}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={article.status === "published" ? "success" : article.status === "archived" ? "secondary" : "warning"}>
                    {newsStatusLabel(locale, article.status)}
                  </Badge>
                  {isScheduled(article) && <Badge variant="warning">{copy.scheduled}</Badge>}
                  {!article.is_public && <Badge variant="secondary">{copy.notPublic}</Badge>}
                  {article.is_featured && <Badge variant="gold">{copy.featured}</Badge>}
                  {article.category && <Badge variant="secondary"><span dir="auto">{article.category}</span></Badge>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" className="min-h-11 min-w-11" onClick={() => openEditor(article)} aria-label={fill(copy.edit, { name: article.title })} title={fill(copy.edit, { name: article.title })}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button size="sm" variant="ghost" className="min-h-11 min-w-11" disabled={deletingId === article.id} onClick={() => void destroy(article)} aria-label={fill(copy.remove, { name: article.title })} title={fill(copy.remove, { name: article.title })}>
                  <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{copy.intro}</p>
        </div>
        <Button size="sm" className="min-h-11" onClick={() => openEditor()}><Plus className="h-4 w-4 me-2" aria-hidden="true" />{copy.add}</Button>
      </div>

      <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{copy.publicNote}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: copy.total, value: meta.total || 0 },
          { label: copy.statuses.published, value: meta.published || 0 },
          { label: copy.statuses.draft, value: meta.drafts || 0 },
          { label: copy.featured, value: meta.featured || 0 },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <FileText className="mb-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <form role="search" className="flex gap-3" onSubmit={submitSearch}>
            <div className="flex-1 relative">
              <Label htmlFor="news-search" className="sr-only">{copy.searchLabel}</Label>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input id="news-search" type="search" dir="auto" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={copy.searchPlaceholder} className="ps-10" />
            </div>
            <Button type="submit" variant="outline" size="sm" className="min-h-11">{copy.search}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">{copy.records}</h3></CardHeader>
        <CardContent aria-busy={status === "loading"}>{records}</CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => { if (!saving) setOpen(next) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? copy.editTitle : copy.addTitle}</DialogTitle>
            <DialogDescription>{copy.dialogIntro}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={save} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("title", copy.titleField, { required: true, wide: true })}
              {field("category", copy.category, { required: true })}
              {field("author_name", copy.authorName, { required: true })}
              {choice("status", copy.status, statusOptions, true)}
              {field("published_at", copy.publishedAt, { type: "datetime-local", ltr: true, hint: copy.publishedAtHint })}
              {field("source_url", copy.sourceUrl, { type: "url", ltr: true, hint: copy.sourceUrlHint })}
              {field("source_name", copy.sourceName)}
              {field("image_url", copy.imageUrl, { type: "url", ltr: true })}
              {field("image_credit", copy.imageCredit)}
              {choice("region", copy.region, regionOptions)}
              {field("companies", copy.companies, { hint: copy.companiesHint })}
              {field("tags", copy.tags, { hint: copy.tagsHint, wide: true })}
              {field("excerpt", copy.excerpt, { required: true, wide: true, rows: 3 })}
              {field("key_facts", copy.keyFacts, { wide: true, rows: 4, hint: copy.keyFactsHint })}
              {field("content", copy.content, { wide: true, rows: 6 })}
              <label htmlFor={newsFieldId("is_public")} className="flex min-h-11 items-center gap-2 text-sm text-gray-900">
                <input id={newsFieldId("is_public")} type="checkbox" className="h-4 w-4" checked={form.is_public} disabled={saving} onChange={(event) => update("is_public", event.target.checked)} />
                {copy.isPublic}
              </label>
              <label htmlFor={newsFieldId("is_featured")} className="flex min-h-11 items-center gap-2 text-sm text-gray-900">
                <input id={newsFieldId("is_featured")} type="checkbox" className="h-4 w-4" checked={form.is_featured} disabled={saving} onChange={(event) => update("is_featured", event.target.checked)} />
                {copy.isFeatured}
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="min-h-11" disabled={saving} onClick={() => setOpen(false)}>{copy.cancel}</Button>
              <Button type="submit" className="min-h-11" disabled={saving} aria-busy={saving}>{saving ? copy.saving : copy.save}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
