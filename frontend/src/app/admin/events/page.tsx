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
import type { AdminCollectionResponse, AdminEvent } from "@/lib/admin"
import {
  adminEvents,
  emptyEventForm,
  eventFieldErrors,
  eventFieldId,
  eventFormats,
  eventModes,
  eventOptionLabel,
  eventOrganizerTypes,
  eventPayload,
  eventStartLabel,
  eventStatuses,
  eventStatusFlows,
  eventTypes,
  eventVisibilities,
  fill,
  toEventForm,
  validateEventForm,
  type EventForm,
  type EventFormErrors,
  type EventFormField,
  type EventOptionGroup,
} from "@/lib/admin-events"
import { useLocale } from "@/lib/locale"
import { Search, CalendarDays, MapPin, Users, Pencil, Trash2, Plus } from "lucide-react"

type TextField = { [K in EventFormField]: EventForm[K] extends string ? K : never }[EventFormField]
type FlagField = { [K in EventFormField]: EventForm[K] extends boolean ? K : never }[EventFormField]

const fieldOrder: EventFormField[] = [
  "title", "slug", "type", "category",
  "starts_at", "ends_at", "registration_deadline", "timezone",
  "location", "venue_name", "city", "country", "google_maps_url", "format", "mode", "virtual_link", "online_meeting_url", "cover_image_url", "gallery_images",
  "status", "status_flow", "visibility", "organizer_type", "organizer_name", "tags",
  "max_attendees", "capacity_limit",
  "short_description", "description", "full_description",
  "targeting_rules", "ai_settings", "rsvp_settings",
]

const optionValues: Record<EventOptionGroup, readonly string[]> = {
  type: eventTypes,
  format: eventFormats,
  mode: eventModes,
  status: eventStatuses,
  status_flow: eventStatusFlows,
  organizer_type: eventOrganizerTypes,
  visibility: eventVisibilities,
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminEvents(locale)
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [form, setForm] = useState<EventForm>(emptyEventForm)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const latestRequest = useRef(0)
  const currentQuery = useRef(query)

  // Reads the search through a ref so a refresh after a save or delete that started under an
  // earlier search still loads the search shown now; a slower earlier response is ignored.
  const loadEvents = useCallback(async () => {
    const request = ++latestRequest.current
    setStatus("loading")
    try {
      const response = await api.get<AdminCollectionResponse<AdminEvent>>("/admin/events", {
        params: { search: currentQuery.current || undefined },
      })
      if (request !== latestRequest.current) return
      setEvents(response.data)
      setMeta(response.meta)
      setStatus("ready")
    } catch {
      if (request === latestRequest.current) setStatus("error")
    }
  }, [])

  useEffect(() => {
    currentQuery.current = query
    void loadEvents()
  }, [query, loadEvents])

  const update = <K extends EventFormField>(name: K, value: EventForm[K]) => {
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous))
  }

  const openEditor = (event?: AdminEvent) => {
    setEditing(event || null)
    setForm(toEventForm(event))
    setErrors({})
    setOpen(true)
  }

  const focusFirstError = (found: EventFormErrors) => {
    const first = fieldOrder.find((name) => found[name])
    if (first) window.requestAnimationFrame(() => document.getElementById(eventFieldId(first))?.focus())
  }

  const saveEvent = async () => {
    const found = validateEventForm(locale, form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      focusFirstError(found)
      return
    }
    setSaving(true)
    try {
      const payload = eventPayload(form)
      if (editing) {
        await api.put(`/admin/events/${editing.id}`, payload)
      } else {
        await api.post("/admin/events", payload)
      }
      toast(editing ? copy.updated : copy.created, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyEventForm)
      await loadEvents()
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? eventFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.saveInvalid)
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

  const deleteEvent = async (event: AdminEvent) => {
    if (!window.confirm(fill(copy.confirmDelete, { name: event.title }))) return
    try {
      await api.delete(`/admin/events/${event.id}`)
      toast(copy.deleted, "success")
      await loadEvents()
    } catch {
      toast(copy.deleteFailed, "error")
    }
  }

  const describedBy = (name: EventFormField, hint?: string) => {
    const id = eventFieldId(name)
    if (errors[name]) return { "aria-invalid": true, "aria-describedby": `${id}-error` }
    return hint ? { "aria-invalid": false, "aria-describedby": `${id}-hint` } : { "aria-invalid": false }
  }

  const field = (name: EventFormField, label: string, control: ReactNode, options: { required?: boolean; hint?: string; wide?: boolean } = {}) => (
    <div className={`space-y-1.5 ${options.wide ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={eventFieldId(name)}>
        {label}
        {options.required && <span className="text-red-600"> *<span className="sr-only"> ({copy.required})</span></span>}
      </Label>
      {control}
      {options.hint && !errors[name] && <p id={`${eventFieldId(name)}-hint`} className="text-xs text-gray-500">{options.hint}</p>}
      {errors[name] && <p id={`${eventFieldId(name)}-error`} className="text-xs font-medium text-red-700">{errors[name]}</p>}
    </div>
  )

  const text = (name: TextField, label: string, options: { required?: boolean; hint?: string; wide?: boolean; ltr?: boolean; type?: string; inputMode?: "numeric" | "url" } = {}) =>
    field(name, label, (
      <Input
        id={eventFieldId(name)}
        type={options.type}
        inputMode={options.inputMode}
        dir={options.ltr ? "ltr" : undefined}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        required={options.required}
        aria-required={options.required || undefined}
        {...describedBy(name, options.hint)}
      />
    ), options)

  const longText = (name: TextField, label: string, options: { hint?: string; ltr?: boolean } = {}) =>
    field(name, label, (
      <Textarea
        id={eventFieldId(name)}
        dir={options.ltr ? "ltr" : undefined}
        className={options.ltr ? "font-mono text-xs" : undefined}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        {...describedBy(name, options.hint)}
      />
    ), { ...options, wide: true })

  const choice = (name: EventOptionGroup, label: string, options: { required?: boolean } = {}) => {
    const values = optionValues[name]
    const current = form[name]
    return field(name, label, (
      <Select id={eventFieldId(name)} value={current} onChange={(e) => update(name, e.target.value)} {...describedBy(name)}>
        {/* A stored code the page does not list stays selectable, so saving never changes it silently. */}
        {!values.includes(current) && <option value={current}>{current}</option>}
        {values.map((value) => <option key={value} value={value}>{eventOptionLabel(locale, name, value)}</option>)}
      </Select>
    ), options)
  }

  const flag = (name: FlagField, label: string) => (
    <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" className="h-4 w-4" checked={form[name]} onChange={(e) => update(name, e.target.checked)} />
      {label}
    </label>
  )

  const section = (title: string, children: ReactNode) => (
    <fieldset className="space-y-3">
      <legend className="w-full border-b border-gray-200 pb-1 text-base font-bold text-gray-900">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  )

  const empty = status === "ready" && events.length === 0
  const refresh = () => void loadEvents()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{copy.intro}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>{copy.refresh}</Button>
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 me-2" aria-hidden="true" />{copy.create}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: copy.totalEvents, value: meta.total || 0, icon: CalendarDays, color: "text-blue-600" },
          { label: copy.upcomingEvents, value: meta.upcoming || 0, icon: CalendarDays, color: "text-emerald-600" },
          { label: copy.inPersonEvents, value: meta.in_person || 0, icon: MapPin, color: "text-purple-600" },
          { label: copy.totalRsvps, value: meta.total_rsvps || 0, icon: Users, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-6"><Icon className={`h-5 w-5 ${color}`} aria-hidden="true" /><p className="text-3xl font-bold text-gray-900 mt-2">{value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></CardContent></Card>
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
              if (next === query) void loadEvents()
              else setQuery(next)
            }}
          >
            <div className="flex-1 relative">
              <label htmlFor="event-search" className="sr-only">{copy.searchLabel}</label>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input id="event-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={copy.searchLabel} className="ps-10" />
            </div>
            <Button type="submit" variant="outline" size="sm">{copy.search}</Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite">
        {status === "loading" && events.length === 0 && <p className="text-sm text-gray-500">{copy.loading}</p>}
        {status === "error" && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{copy.loadFailed}</p>
            <Button variant="outline" size="sm" onClick={refresh}>{copy.retry}</Button>
          </div>
        )}
        {empty && <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">{query ? copy.emptySearch : copy.empty}</p>}
      </div>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{fill(copy.allEvents, { count: events.length })}</h3>
              <p className="text-sm text-gray-500">{fill(copy.upcomingCount, { count: meta.upcoming || 0 })}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th scope="col" className="text-start px-6 py-3 font-medium text-gray-500">{copy.columnEvent}</th>
                    <th scope="col" className="text-start px-6 py-3 font-medium text-gray-500">{copy.columnDate}</th>
                    <th scope="col" className="text-start px-6 py-3 font-medium text-gray-500">{copy.columnFormat}</th>
                    <th scope="col" className="text-start px-6 py-3 font-medium text-gray-500">{copy.columnRsvps}</th>
                    <th scope="col" className="text-start px-6 py-3 font-medium text-gray-500">{copy.columnActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((event) => {
                    const start = eventStartLabel(locale, event)
                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 break-words">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.location}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-700">{start?.date ?? "—"}</p>
                          {start && <p className="text-xs text-gray-500">{start.time}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={event.format === "virtual" ? "secondary" : "outline"}>{eventOptionLabel(locale, "format", event.format)}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{event.rsvp_count || 0}</span>
                          {event.max_attendees ? <span className="text-xs text-gray-500"> / {event.max_attendees}</span> : null}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/events/${event.id}`} className="inline-flex min-h-11 items-center px-2 text-blue-600 hover:text-blue-800 text-xs font-semibold">{copy.manage}</Link>
                            <button type="button" className="inline-flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-700" onClick={() => openEditor(event)} aria-label={fill(copy.edit, { name: event.title })} title={copy.editShort}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                            <button type="button" className="inline-flex h-11 w-11 items-center justify-center text-red-500 hover:text-red-700" onClick={() => void deleteEvent(event)} aria-label={fill(copy.remove, { name: event.title })} title={copy.removeShort}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? copy.dialogEdit : copy.dialogCreate}</DialogTitle>
            <DialogDescription>{copy.dialogDescription}</DialogDescription>
          </DialogHeader>
          <form
            noValidate
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              void saveEvent()
            }}
          >
            {section(copy.sectionBasics, (
              <>
                {text("title", copy.eventTitle, { required: true, wide: true })}
                {text("slug", copy.slug, { ltr: true, hint: copy.slugHint })}
                {choice("type", copy.type, { required: true })}
                {text("category", copy.category)}
              </>
            ))}
            {section(copy.sectionSchedule, (
              <>
                {text("starts_at", copy.startsAt, { type: "datetime-local", required: true })}
                {text("ends_at", copy.endsAt, { type: "datetime-local" })}
                {text("registration_deadline", copy.registrationDeadline, { type: "datetime-local" })}
                {text("timezone", copy.timezone, { ltr: true, hint: copy.timezoneHint })}
              </>
            ))}
            {section(copy.sectionPlace, (
              <>
                {text("location", copy.location, { required: true, wide: true })}
                {text("venue_name", copy.venueName)}
                {text("city", copy.city)}
                {text("country", copy.country)}
                {text("google_maps_url", copy.googleMapsUrl, { type: "url", ltr: true })}
                {choice("format", copy.format, { required: true })}
                {choice("mode", copy.mode)}
                {text("virtual_link", copy.virtualLink, { type: "url", ltr: true })}
                {text("online_meeting_url", copy.onlineMeetingUrl, { type: "url", ltr: true })}
                {text("cover_image_url", copy.coverImageUrl, { type: "url", ltr: true })}
                {text("gallery_images", copy.galleryImages, { ltr: true, hint: copy.listHint })}
              </>
            ))}
            {section(copy.sectionAudience, (
              <>
                {choice("status", copy.status, { required: true })}
                {choice("status_flow", copy.statusFlow)}
                {choice("visibility", copy.visibility)}
                {choice("organizer_type", copy.organizerType)}
                {text("organizer_name", copy.organizerName)}
                {text("tags", copy.tags, { hint: copy.listHint })}
              </>
            ))}
            {section(copy.sectionRegistration, (
              <>
                {text("max_attendees", copy.maxAttendees, { inputMode: "numeric" })}
                {text("capacity_limit", copy.capacityLimit, { inputMode: "numeric" })}
                {flag("is_public", copy.isPublic)}
                {flag("requires_rsvp", copy.requiresRsvp)}
                {flag("waitlist_enabled", copy.waitlistEnabled)}
                {flag("requires_approval", copy.requiresApproval)}
              </>
            ))}
            {section(copy.sectionDescriptions, (
              <>
                {longText("short_description", copy.shortDescription, { hint: copy.shortDescriptionHint })}
                {longText("description", copy.description)}
                {longText("full_description", copy.fullDescription)}
              </>
            ))}
            {section(copy.sectionAdvanced, (
              <>
                {longText("targeting_rules", copy.targetingRules, { ltr: true, hint: copy.jsonHint })}
                {longText("ai_settings", copy.aiSettings, { ltr: true, hint: copy.jsonHint })}
                {longText("rsvp_settings", copy.rsvpSettings, { ltr: true, hint: copy.jsonHint })}
              </>
            ))}
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
