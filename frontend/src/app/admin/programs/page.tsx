"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { ApiError, api } from "@/lib/api"
import type { AdminCollectionResponse, AdminProgram } from "@/lib/admin"
import {
  adminPrograms,
  emptyProgramForm,
  fill,
  programFieldErrors,
  programFieldId,
  programFormats,
  programOptionLabel,
  programPayload,
  programStatusFlows,
  programVisibilities,
  toProgramForm,
  validateProgramForm,
  type ProgramForm,
  type ProgramFormErrors,
  type ProgramFormField,
} from "@/lib/admin-programs"
import { useLocale } from "@/lib/locale"
import { Search, BookOpen, Users, Plus, Pencil, Trash2 } from "lucide-react"

const fieldOrder: ProgramFormField[] = ["name", "title", "slug", "program_type", "category", "duration", "visibility", "status_flow", "format", "city_region", "capacity", "application_deadline", "starts_at", "ends_at", "tags", "short_description", "full_description", "objective", "who_it_is_for", "expected_outcomes"]

export default function AdminProgramsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminPrograms(locale)
  const [programs, setPrograms] = useState<AdminProgram[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editing, setEditing] = useState<AdminProgram | null>(null)
  const [form, setForm] = useState<ProgramForm>(emptyProgramForm)
  const [errors, setErrors] = useState<ProgramFormErrors>({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const latestRequest = useRef(0)
  const currentQuery = useRef(query)

  // Reads the search through a ref so a refresh after a save or delete that started under an
  // earlier search still loads the search shown now.
  const loadPrograms = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    try {
      const response = await api.get<AdminCollectionResponse<AdminProgram>>("/admin/programs", {
        params: { search: currentQuery.current || undefined },
      })
      if (request !== latestRequest.current) return
      setPrograms(response.data)
      setMeta(response.meta)
      setStatus("ready")
    } catch {
      if (request === latestRequest.current) setStatus("error")
    }
  }, [])

  useEffect(() => {
    currentQuery.current = query
    void loadPrograms()
  }, [query, loadPrograms])

  const update = <K extends ProgramFormField>(field: K, value: ProgramForm[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous))
  }

  const openEditor = (program?: AdminProgram) => {
    setEditing(program || null)
    setForm(toProgramForm(program))
    setErrors({})
    setOpen(true)
  }

  const focusFirstError = (found: ProgramFormErrors) => {
    const first = fieldOrder.find((field) => found[field])
    if (first) window.requestAnimationFrame(() => document.getElementById(programFieldId(first))?.focus())
  }

  const saveProgram = async () => {
    const found = validateProgramForm(locale, form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      focusFirstError(found)
      return
    }
    setSaving(true)
    try {
      const payload = programPayload(form)
      if (editing) {
        await api.put(`/admin/programs/${editing.id}`, payload)
      } else {
        await api.post("/admin/programs", payload)
      }
      toast(editing ? copy.updated : copy.created, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyProgramForm)
      await loadPrograms()
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? programFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.saveInvalid)
        : {}
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors)
        focusFirstError(apiErrors)
        toast(copy.saveInvalid, "error")
      } else {
        toast(copy.saveFailed, "error")
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteProgram = async (program: AdminProgram) => {
    const name = program.title || program.name
    if (!window.confirm(fill(copy.confirmDelete, { name }))) return
    try {
      await api.delete(`/admin/programs/${program.id}`)
      toast(copy.deleted, "success")
      await loadPrograms()
    } catch {
      toast(copy.deleteFailed, "error")
    }
  }

  const invalid = (field: ProgramFormField) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${programFieldId(field)}-error` } : { "aria-invalid": false }

  const field = (name: ProgramFormField, label: string, control: ReactNode, options: { required?: boolean; hint?: string; wide?: boolean } = {}) => (
    <div className={`space-y-1.5 ${options.wide ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={programFieldId(name)}>
        {label}
        {options.required && <span className="text-red-600"> *<span className="sr-only"> ({copy.required})</span></span>}
      </Label>
      {control}
      {options.hint && !errors[name] && <p id={`${programFieldId(name)}-hint`} className="text-xs text-gray-500">{options.hint}</p>}
      {errors[name] && <p id={`${programFieldId(name)}-error`} className="text-xs font-medium text-red-700">{errors[name]}</p>}
    </div>
  )

  const text = (name: Exclude<ProgramFormField, "is_open">, extra: Record<string, unknown> = {}) => (
    <Input id={programFieldId(name)} value={form[name]} onChange={(e) => update(name, e.target.value)} {...invalid(name)} {...extra} />
  )

  const longText = (name: Exclude<ProgramFormField, "is_open">) => (
    <Textarea id={programFieldId(name)} value={form[name]} onChange={(e) => update(name, e.target.value)} {...invalid(name)} />
  )

  const empty = status === "ready" && programs.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{copy.intro}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadPrograms()}>{copy.refresh}</Button>
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 me-2" aria-hidden="true" />{copy.create}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: copy.totalPrograms, value: meta.total || 0, icon: BookOpen, color: "text-blue-600" },
          { label: copy.openPrograms, value: meta.open || 0, icon: BookOpen, color: "text-emerald-600" },
          { label: copy.applicants, value: meta.applicants || 0, icon: Users, color: "text-amber-600" },
          { label: copy.cohorts, value: meta.cohorts || 0, icon: Users, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-6"><Icon className={`h-5 w-5 ${color}`} aria-hidden="true" /><p className="text-3xl font-bold mt-2">{value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <form
            role="search"
            className="flex gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const next = searchInput.trim()
              if (next === query) void loadPrograms()
              else setQuery(next)
            }}
          >
            <div className="flex-1 relative">
              <label htmlFor="program-search" className="sr-only">{copy.searchLabel}</label>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input id="program-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={copy.searchLabel} className="ps-10" />
            </div>
            <Button type="submit" variant="outline" size="sm">{copy.search}</Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite">
        {status === "loading" && programs.length === 0 && <p className="text-sm text-gray-500">{copy.loading}</p>}
        {status === "error" && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{copy.loadFailed}</p>
            <Button variant="outline" size="sm" onClick={() => void loadPrograms()}>{copy.retry}</Button>
          </div>
        )}
        {empty && <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">{query ? copy.emptySearch : copy.empty}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programs.map((program) => {
          const name = program.title || program.name
          return (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="font-semibold text-gray-900 break-words">{name}</h3><p className="text-xs text-gray-500 mt-0.5">{program.program_type || program.category}</p></div>
                  <Badge variant={program.is_open ? "success" : "secondary"}>{program.is_open ? copy.open : copy.closed}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.short_description || program.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-4">
                    <div><p className="text-xs text-gray-500">{copy.applications}</p><p className="text-sm font-bold text-[#0A1628]">{program.applications_count || 0}</p></div>
                    <div><p className="text-xs text-gray-500">{copy.cohortsShort}</p><p className="text-sm font-bold text-[#0A1628]">{program.cohorts_count || 0}</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/programs/${program.id}`} className="inline-flex min-h-11 items-center px-2 text-blue-600 hover:text-blue-800 text-xs font-semibold">{copy.manage}</Link>
                    <button type="button" className="inline-flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-700" onClick={() => openEditor(program)} aria-label={fill(copy.edit, { name })} title={copy.editShort}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                    <button type="button" className="inline-flex h-11 w-11 items-center justify-center text-red-500 hover:text-red-700" onClick={() => void deleteProgram(program)} aria-label={fill(copy.remove, { name })} title={copy.removeShort}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? copy.dialogEdit : copy.dialogCreate}</DialogTitle>
            <DialogDescription>{copy.dialogDescription}</DialogDescription>
          </DialogHeader>
          <form
            noValidate
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void saveProgram()
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {field("name", copy.name, text("name", { required: true, "aria-required": true }), { required: true })}
              {field("title", copy.displayTitle, text("title"))}
              {field("slug", copy.slug, text("slug", { dir: "ltr", "aria-describedby": errors.slug ? `${programFieldId("slug")}-error` : `${programFieldId("slug")}-hint` }), { hint: copy.slugHint })}
              {field("program_type", copy.programType, text("program_type"))}
              {field("category", copy.category, text("category", { required: true, "aria-required": true }), { required: true })}
              {field("duration", copy.duration, text("duration"))}
              {field("visibility", copy.visibility, (
                <Select id={programFieldId("visibility")} value={form.visibility} onChange={(e) => update("visibility", e.target.value)} {...invalid("visibility")}>
                  {programVisibilities.map((value) => <option key={value} value={value}>{programOptionLabel(locale, "visibility", value)}</option>)}
                </Select>
              ))}
              {field("status_flow", copy.status, (
                <Select id={programFieldId("status_flow")} value={form.status_flow} onChange={(e) => update("status_flow", e.target.value)} {...invalid("status_flow")}>
                  {programStatusFlows.map((value) => <option key={value} value={value}>{programOptionLabel(locale, "status_flow", value)}</option>)}
                </Select>
              ))}
              {field("format", copy.format, (
                <Select id={programFieldId("format")} value={form.format} onChange={(e) => update("format", e.target.value)} {...invalid("format")}>
                  {programFormats.map((value) => <option key={value} value={value}>{programOptionLabel(locale, "format", value)}</option>)}
                </Select>
              ))}
              {field("city_region", copy.cityRegion, text("city_region"))}
              {field("capacity", copy.capacity, text("capacity", { inputMode: "numeric" }))}
              {field("application_deadline", copy.deadline, text("application_deadline", { type: "date" }))}
              {field("starts_at", copy.startsAt, text("starts_at", { type: "datetime-local" }))}
              {field("ends_at", copy.endsAt, text("ends_at", { type: "datetime-local", min: form.starts_at || undefined }))}
              {field("tags", copy.tags, text("tags", { "aria-describedby": errors.tags ? `${programFieldId("tags")}-error` : `${programFieldId("tags")}-hint` }), { hint: copy.tagsHint, wide: true })}
              {field("short_description", copy.shortDescription, longText("short_description"), { wide: true })}
              {field("full_description", copy.fullDescription, longText("full_description"), { wide: true })}
              {field("objective", copy.objective, longText("objective"), { wide: true })}
              {field("who_it_is_for", copy.whoItIsFor, longText("who_it_is_for"), { wide: true })}
              {field("expected_outcomes", copy.expectedOutcomes, longText("expected_outcomes"), { wide: true })}
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={form.is_open} onChange={(e) => update("is_open", e.target.checked)} />
              {copy.isOpen}
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{copy.cancel}</Button>
              <Button type="submit" loading={saving}>{copy.save}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
