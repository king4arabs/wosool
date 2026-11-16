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
import { type AdminCollectionResponse, type AdminCompany } from "@/lib/admin"
import {
  adminCompanies,
  companyDisplayName,
  companyDisplayText,
  companyFieldErrors,
  companyFieldId,
  companyFields,
  companyFlags,
  companyPayload,
  companyStatusLabel,
  companyStatuses,
  fill,
  isCompanyStatus,
  isListedPublicly,
  toCompanyForm,
  validateCompanyForm,
  type CompanyField,
  type CompanyForm,
  type CompanyFormErrors,
} from "@/lib/admin-companies"
import { useLocale } from "@/lib/locale"
import { Search, Building2, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"

type TextField = Exclude<CompanyField, "status">
type FieldOptions = {
  required?: boolean
  hint?: string
  wide?: boolean
  multiline?: boolean
  type?: "text" | "url" | "number"
  /** Writing direction of the value: Arabic fields are rtl, codes and URLs ltr. */
  dir?: "ltr" | "rtl" | "auto"
  lang?: "ar" | "en"
}

export default function AdminCompaniesPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminCompanies(locale)
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editing, setEditing] = useState<AdminCompany | null>(null)
  const [form, setForm] = useState<CompanyForm>(() => toCompanyForm())
  const [errors, setErrors] = useState<CompanyFormErrors>({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const savingRef = useRef(false)
  const latestRequest = useRef(0)
  const currentQuery = useRef(query)

  // Reads the search through a ref so a refresh after a save or delete loads the search shown
  // now, and ignores slower responses to earlier requests.
  const load = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    try {
      const response = await api.get<AdminCollectionResponse<AdminCompany>>("/admin/companies", {
        params: { search: currentQuery.current || undefined },
      })
      if (request !== latestRequest.current) return
      setCompanies(response.data)
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
  // invalid field is focused once the form is enabled again.
  const [focusField, setFocusField] = useState<CompanyField | null>(null)
  useEffect(() => {
    if (!focusField || saving) return
    document.getElementById(companyFieldId(focusField))?.focus()
    setFocusField(null)
  }, [focusField, saving])

  const focusFirstError = (found: CompanyFormErrors) => {
    setFocusField(companyFields.find((field) => found[field]) ?? null)
  }

  const openEditor = (company?: AdminCompany) => {
    setEditing(company ?? null)
    setForm(toCompanyForm(company))
    setErrors({})
    setOpen(true)
  }

  const update = <K extends keyof CompanyForm>(name: K, value: CompanyForm[K]) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name as CompanyField]
      return next
    })
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (savingRef.current) return
    const found = validateCompanyForm(locale, form)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found)
      toast(copy.saveInvalid, "error")
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const payload = companyPayload(form)
      if (editing) await api.put(`/admin/companies/${editing.id}`, payload)
      else await api.post("/admin/companies", payload)
      toast(editing ? copy.updated : copy.created, "success")
      setOpen(false)
      setEditing(null)
      void load()
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? companyFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
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

  const destroy = async (company: AdminCompany) => {
    const name = companyDisplayName(locale, company)
    if (deletingId !== null || !window.confirm(fill(copy.confirmDelete, { name }))) return
    setDeletingId(company.id)
    try {
      await api.delete(`/admin/companies/${company.id}`)
      toast(copy.deleted, "success")
      void load()
    } catch {
      toast(copy.deleteFailed, "error")
    } finally {
      setDeletingId(null)
    }
  }

  const field = (name: TextField, label: string, options: FieldOptions = {}): ReactNode => {
    const id = companyFieldId(name)
    const describedBy = errors[name] ? `${id}-error` : options.hint ? `${id}-hint` : undefined
    const shared = {
      id,
      name,
      value: form[name],
      disabled: saving,
      required: options.required,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy,
      dir: options.dir ?? "auto",
      lang: options.lang,
    }
    return (
      <div className={options.wide ? "space-y-2 sm:col-span-2" : "space-y-2"}>
        <Label htmlFor={id}>
          {label}
          {options.required && <span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span>}
        </Label>
        {options.multiline
          ? <Textarea {...shared} rows={3} onChange={(event) => update(name, event.target.value)} />
          : <Input {...shared} type={options.type ?? "text"} inputMode={options.type === "number" ? "numeric" : undefined} onChange={(event) => update(name, event.target.value)} />}
        {options.hint && !errors[name] && <p id={`${id}-hint`} className="text-xs text-gray-500">{options.hint}</p>}
        {errors[name] && <p id={`${id}-error`} className="text-xs font-medium text-red-700">{errors[name]}</p>}
      </div>
    )
  }

  const statusId = companyFieldId("status")
  const searching = query !== ""

  let records: ReactNode
  if (status === "loading" && companies.length === 0) {
    records = <p role="status" className="text-sm text-gray-500">{copy.loading}</p>
  } else if (status === "error") {
    records = (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-gray-700">{copy.loadFailed}</p>
        <Button size="sm" variant="outline" className="min-h-11" onClick={() => void load()}>{copy.retry}</Button>
      </div>
    )
  } else if (companies.length === 0) {
    records = <p className="text-sm text-gray-500">{searching ? copy.emptySearch : copy.empty}</p>
  } else {
    records = companies.map((company) => {
      const name = companyDisplayName(locale, company)
      const details = [companyDisplayText(locale, company, "sector"), company.stage, companyDisplayText(locale, company, "location")].filter(Boolean)
      const founders = company.founders?.map((founder) => founder.user?.name).filter(Boolean).join(copy.listSeparator)
      const listed = isListedPublicly(company)
      return (
        <div key={company.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4">
          <div className="flex min-w-0 gap-3">
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:flex">
              <Building2 className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 break-words" dir="auto">{name}</p>
              {locale === "ar" && !company.ar?.name && <p className="text-xs text-amber-800 mt-1">{copy.missingArabic}</p>}
              {details.length > 0 && <p className="text-sm text-gray-500 mt-1 break-words" dir="auto">{details.join(" · ")}</p>}
              {founders && <p className="text-xs text-gray-500 mt-1 break-words">{fill(copy.founders, { names: founders })}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={listed ? "success" : "secondary"}>{listed ? copy.listed : copy.notListed}</Badge>
                {company.status !== "active" && <Badge variant="outline">{companyStatusLabel(locale, company.status)}</Badge>}
                {company.is_featured && <Badge variant="gold">{copy.flags.is_featured}</Badge>}
                {company.is_hiring && <Badge variant="secondary">{copy.flags.is_hiring}</Badge>}
                {company.is_fundraising && <Badge variant="warning">{copy.flags.is_fundraising}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label={fill(copy.openWebsite, { name })} title={copy.website}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            <Button size="sm" variant="ghost" className="min-h-11 min-w-11" onClick={() => openEditor(company)} aria-label={fill(copy.edit, { name })} title={fill(copy.edit, { name })}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11 min-w-11" disabled={deletingId === company.id} onClick={() => void destroy(company)} aria-label={fill(copy.remove, { name })} title={fill(copy.remove, { name })}>
              <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )
    })
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: copy.total, value: meta.total || 0 },
          { label: copy.hiringCount, value: meta.hiring || 0 },
          { label: copy.fundraisingCount, value: meta.fundraising || 0 },
        ].map((item) => <Card key={item.label}><CardContent className="pt-6"><p className="text-3xl font-bold text-gray-900">{item.value}</p><p className="text-sm text-gray-500 mt-1">{item.label}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardContent className="pt-5">
          <form role="search" className="flex gap-3" onSubmit={(event) => { event.preventDefault(); setQuery(searchInput.trim()) }}>
            <div className="flex-1 relative">
              <Label htmlFor="company-search" className="sr-only">{copy.searchLabel}</Label>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input id="company-search" type="search" dir="auto" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={copy.searchPlaceholder} className="ps-10" />
            </div>
            <Button type="submit" variant="outline" size="sm" className="min-h-11">{copy.search}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">{copy.records}</h3></CardHeader>
        <CardContent className="space-y-4" aria-busy={status === "loading"}>{records}</CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => { if (!saving) setOpen(next) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? copy.editTitle : copy.addTitle}</DialogTitle>
            <DialogDescription>{copy.dialogIntro}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={save} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("name", copy.name, { required: true, dir: "ltr", lang: "en" })}
              {field("name_ar", copy.nameAr, { dir: "rtl", lang: "ar" })}
              {field("sector", copy.sector, { dir: "ltr", lang: "en" })}
              {field("sector_ar", copy.sectorAr, { dir: "rtl", lang: "ar" })}
              {field("location", copy.location, { dir: "ltr", lang: "en" })}
              {field("location_ar", copy.locationAr, { dir: "rtl", lang: "ar" })}
              {field("description", copy.description, { multiline: true, dir: "ltr", lang: "en" })}
              {field("description_ar", copy.descriptionAr, { multiline: true, dir: "rtl", lang: "ar" })}
              {field("website", copy.website, { type: "url", dir: "ltr" })}
              <div className="space-y-2">
                <Label htmlFor={statusId}>
                  {copy.status}
                  <span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span>
                </Label>
                <Select
                  id={statusId}
                  name="status"
                  value={form.status}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={errors.status ? `${statusId}-error` : undefined}
                  onChange={(event) => update("status", event.target.value)}
                >
                  {companyStatuses.map((value) => <option key={value} value={value}>{copy.statuses[value]}</option>)}
                  {!isCompanyStatus(form.status) && <option value={form.status}>{form.status}</option>}
                </Select>
                {errors.status && <p id={`${statusId}-error`} className="text-xs font-medium text-red-700">{errors.status}</p>}
              </div>
              {field("stage", copy.stage, { dir: "ltr", hint: copy.stageHint })}
              {field("country_code", copy.countryCode, { dir: "ltr", hint: copy.countryCodeHint })}
              {field("founded_year", copy.foundedYear, { type: "number", dir: "ltr" })}
              {field("team_size", copy.teamSize, { type: "number", dir: "ltr" })}
            </div>
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium text-gray-900">{copy.flagsLegend}</legend>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {companyFlags.map((flag) => (
                  <label key={flag} htmlFor={companyFieldId(flag)} className="flex min-h-11 items-center gap-2 text-sm text-gray-900">
                    <input id={companyFieldId(flag)} type="checkbox" className="h-4 w-4" checked={form[flag]} disabled={saving} onChange={(event) => update(flag, event.target.checked)} />
                    {copy.flags[flag]}
                  </label>
                ))}
              </div>
            </fieldset>
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
