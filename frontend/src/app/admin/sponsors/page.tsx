"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminSponsor } from "@/lib/admin"
import {
  adminSponsors,
  fill,
  isSponsorTier,
  sponsorContract,
  sponsorFieldErrors,
  sponsorFieldId,
  sponsorFields,
  sponsorPayload,
  sponsorTierLabel,
  sponsorTiers,
  toSponsorForm,
  validateSponsorForm,
  type SponsorField,
  type SponsorForm,
  type SponsorFormErrors,
} from "@/lib/admin-sponsors"
import { useLocale } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"

type TextField = Exclude<SponsorField, "tier">
type FieldOptions = {
  required?: boolean
  hint?: string
  wide?: boolean
  multiline?: boolean
  type?: "text" | "email" | "url" | "number" | "date"
  ltr?: boolean
}

export default function AdminSponsorsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminSponsors(locale)
  const [sponsors, setSponsors] = useState<AdminSponsor[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editing, setEditing] = useState<AdminSponsor | null>(null)
  const [form, setForm] = useState<SponsorForm>(() => toSponsorForm())
  const [errors, setErrors] = useState<SponsorFormErrors>({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const savingRef = useRef(false)
  const latestRequest = useRef(0)
  const currentQuery = useRef(query)

  // Reads the search through a ref so a refresh after a save or delete that started under an
  // earlier search still loads the search shown now, and ignores slower earlier responses.
  const load = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    try {
      const response = await api.get<AdminCollectionResponse<AdminSponsor>>("/admin/sponsors", {
        params: { search: currentQuery.current || undefined },
      })
      if (request !== latestRequest.current) return
      setSponsors(response.data)
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
  const [focusField, setFocusField] = useState<SponsorField | null>(null)
  useEffect(() => {
    if (!focusField || saving) return
    document.getElementById(sponsorFieldId(focusField))?.focus()
    setFocusField(null)
  }, [focusField, saving])

  const focusFirstError = (found: SponsorFormErrors) => {
    setFocusField(sponsorFields.find((field) => found[field]) ?? null)
  }

  const openEditor = (sponsor?: AdminSponsor) => {
    setEditing(sponsor ?? null)
    setForm(toSponsorForm(sponsor))
    setErrors({})
    setOpen(true)
  }

  const update = <K extends keyof SponsorForm>(name: K, value: SponsorForm[K]) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name as SponsorField]
      return next
    })
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (savingRef.current) return
    const found = validateSponsorForm(locale, form)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found)
      toast(copy.saveInvalid, "error")
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const payload = sponsorPayload(form)
      if (editing) await api.put(`/admin/sponsors/${editing.id}`, payload)
      else await api.post("/admin/sponsors", payload)
      toast(editing ? copy.updated : copy.created, "success")
      setOpen(false)
      setEditing(null)
      void load()
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? sponsorFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
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

  const destroy = async (sponsor: AdminSponsor) => {
    if (deletingId !== null || !window.confirm(fill(copy.confirmDelete, { name: sponsor.name }))) return
    setDeletingId(sponsor.id)
    try {
      await api.delete(`/admin/sponsors/${sponsor.id}`)
      toast(copy.deleted, "success")
      void load()
    } catch {
      toast(copy.deleteFailed, "error")
    } finally {
      setDeletingId(null)
    }
  }

  const field = (name: TextField, label: string, options: FieldOptions = {}): ReactNode => {
    const id = sponsorFieldId(name)
    const describedBy = errors[name] ? `${id}-error` : options.hint ? `${id}-hint` : undefined
    const shared = {
      id,
      name,
      value: form[name],
      disabled: saving,
      required: options.required,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy,
      dir: options.ltr ? "ltr" : "auto",
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

  const tierId = sponsorFieldId("tier")
  const searching = query !== ""

  let records: ReactNode
  if (status === "loading" && sponsors.length === 0) {
    records = <p role="status" className="text-sm text-gray-500">{copy.loading}</p>
  } else if (status === "error") {
    records = (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-gray-700">{copy.loadFailed}</p>
        <Button size="sm" variant="outline" className="min-h-11" onClick={() => void load()}>{copy.retry}</Button>
      </div>
    )
  } else if (sponsors.length === 0) {
    records = <p className="text-sm text-gray-500">{searching ? copy.emptySearch : copy.empty}</p>
  } else {
    records = sponsors.map((sponsor) => {
      const contract = sponsorContract(locale, sponsor)
      return (
        <div key={sponsor.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 break-words" dir="auto">{sponsor.name}</p>
            {sponsor.description && <p className="text-sm text-gray-500 mt-1 break-words" dir="auto">{sponsor.description}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="gold">{sponsorTierLabel(locale, sponsor.tier)}</Badge>
              <Badge variant={sponsor.is_active ? "success" : "secondary"}>{sponsor.is_active ? copy.active : copy.hidden}</Badge>
            </div>
            {contract && <p className="text-xs text-gray-500 mt-2">{contract}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="sm" variant="ghost" className="min-h-11 min-w-11" onClick={() => openEditor(sponsor)} aria-label={fill(copy.edit, { name: sponsor.name })} title={fill(copy.edit, { name: sponsor.name })}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11 min-w-11" disabled={deletingId === sponsor.id} onClick={() => void destroy(sponsor)} aria-label={fill(copy.remove, { name: sponsor.name })} title={fill(copy.remove, { name: sponsor.name })}>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: copy.total, value: meta.total || 0 },
          { label: copy.active, value: meta.active || 0 },
          { label: copy.tiers.platinum, value: meta.platinum || 0 },
          { label: copy.tiers.gold, value: meta.gold || 0 },
        ].map((item) => <Card key={item.label}><CardContent className="pt-6"><p className="text-3xl font-bold text-gray-900">{item.value}</p><p className="text-sm text-gray-500 mt-1">{item.label}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardContent className="pt-5">
          <form role="search" className="flex gap-3" onSubmit={(event) => { event.preventDefault(); setQuery(searchInput.trim()) }}>
            <div className="flex-1 relative">
              <Label htmlFor="sponsor-search" className="sr-only">{copy.searchLabel}</Label>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input id="sponsor-search" type="search" dir="auto" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={copy.searchPlaceholder} className="ps-10" />
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
              {field("name", copy.name, { required: true })}
              <div className="space-y-2">
                <Label htmlFor={tierId}>
                  {copy.tier}
                  <span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span>
                </Label>
                <Select
                  id={tierId}
                  name="tier"
                  value={form.tier}
                  disabled={saving}
                  required
                  aria-invalid={Boolean(errors.tier)}
                  aria-describedby={errors.tier ? `${tierId}-error` : undefined}
                  onChange={(event) => update("tier", event.target.value)}
                >
                  {sponsorTiers.map((tier) => <option key={tier} value={tier}>{copy.tiers[tier]}</option>)}
                  {!isSponsorTier(form.tier) && <option value={form.tier}>{form.tier}</option>}
                </Select>
                {errors.tier && <p id={`${tierId}-error`} className="text-xs font-medium text-red-700">{errors.tier}</p>}
              </div>
              {field("website", copy.website, { type: "url", ltr: true })}
              {field("logo_url", copy.logoUrl, { type: "url", ltr: true })}
              {field("contact_name", copy.contactName)}
              {field("contact_email", copy.contactEmail, { type: "email", ltr: true })}
              {field("contract_start", copy.contractStart, { type: "date", ltr: true })}
              {field("contract_end", copy.contractEnd, { type: "date", ltr: true })}
              {field("display_order", copy.displayOrder, { type: "number", hint: copy.displayOrderHint })}
              <label htmlFor={sponsorFieldId("is_active")} className="flex min-h-11 items-center gap-2 self-end text-sm text-gray-900">
                <input id={sponsorFieldId("is_active")} type="checkbox" className="h-4 w-4" checked={form.is_active} disabled={saving} onChange={(event) => update("is_active", event.target.checked)} />
                {copy.isActive}
              </label>
              {field("description", copy.description, { wide: true, multiline: true })}
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
