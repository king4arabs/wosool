"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminEvent, formatDate, fromCsvLines, toCsvLines } from "@/lib/admin"
import { Search, CalendarDays, MapPin, Users, Pencil, Trash2, Plus } from "lucide-react"

type EventForm = {
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  type: string
  format: "virtual" | "in-person"
  virtual_link: string
  max_attendees: string
  status: AdminEvent["status"]
  is_public: boolean
  requires_rsvp: boolean
  tags: string
}

const emptyForm: EventForm = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  location: "",
  type: "wosool",
  format: "in-person",
  virtual_link: "",
  max_attendees: "",
  status: "draft",
  is_public: true,
  requires_rsvp: true,
  tags: "",
}

function toForm(event?: AdminEvent | null): EventForm {
  if (!event) return emptyForm
  return {
    title: event.title,
    description: event.description || "",
    starts_at: event.starts_at.slice(0, 16),
    ends_at: event.ends_at ? event.ends_at.slice(0, 16) : "",
    location: event.location,
    type: event.type,
    format: event.format,
    virtual_link: event.virtual_link || "",
    max_attendees: event.max_attendees ? String(event.max_attendees) : "",
    status: event.status,
    is_public: event.is_public,
    requires_rsvp: event.requires_rsvp,
    tags: toCsvLines(event.tags),
  }
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadEvents = useCallback(async () => {
    const response = await api.get<AdminCollectionResponse<AdminEvent>>("/admin/events", {
      params: { search: search || undefined },
    })
    setEvents(response.data)
    setMeta(response.meta)
  }, [search])

  useEffect(() => {
    loadEvents().catch((err: Error) => toast(err.message, "error"))
  }, [loadEvents, toast])

  const openEditor = (event?: AdminEvent) => {
    setEditing(event || null)
    setForm(toForm(event))
    setOpen(true)
  }

  const saveEvent = async () => {
    setSaving(true)
    const payload = {
      ...form,
      ends_at: form.ends_at || null,
      virtual_link: form.virtual_link || null,
      max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
      tags: fromCsvLines(form.tags),
    }

    try {
      if (editing) {
        await api.put(`/admin/events/${editing.id}`, payload)
      } else {
        await api.post("/admin/events", payload)
      }
      toast(`Event ${editing ? "updated" : "created"}.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadEvents()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save event.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (event: AdminEvent) => {
    if (!window.confirm(`Delete ${event.title}?`)) return
    try {
      await api.delete(`/admin/events/${event.id}`)
      toast("Event deleted.", "success")
      await loadEvents()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete event.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-500 text-sm mt-1">Create, manage, and track all Wosool events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadEvents().catch((err: Error) => toast(err.message, "error"))}>Refresh</Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: meta.total || 0, icon: CalendarDays, color: "text-blue-600" },
          { label: "Upcoming", value: meta.upcoming || 0, icon: CalendarDays, color: "text-emerald-600" },
          { label: "In-Person", value: meta.in_person || 0, icon: MapPin, color: "text-purple-600" },
          { label: "Total RSVPs", value: meta.total_rsvps || 0, icon: Users, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events by title or location..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadEvents().catch((err: Error) => toast(err.message, "error"))}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Events ({events.length})</h3>
            <p className="text-sm text-gray-500">{meta.upcoming || 0} upcoming</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Event</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">RSVPs</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{formatDate(event.starts_at)}</p>
                      <p className="text-xs text-gray-400">{new Date(event.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.format === "virtual" ? "secondary" : "outline"}>{event.format}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{event.rsvp_count || 0}</span>
                      {event.max_attendees ? <span className="text-xs text-gray-400"> / {event.max_attendees}</span> : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => openEditor(event)}><Pencil className="h-4 w-4" /></button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteEvent(event)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
            <DialogDescription>Admin-managed event records back the live schedule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <Input placeholder="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              <Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} />
              <Input type="datetime-local" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} />
              <Input placeholder="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
              <Select value={form.format} onChange={(event) => setForm((current) => ({ ...current, format: event.target.value as EventForm["format"] }))}>
                <option value="in-person">in-person</option>
                <option value="virtual">virtual</option>
              </Select>
              <Input placeholder="Virtual link" value={form.virtual_link} onChange={(event) => setForm((current) => ({ ...current, virtual_link: event.target.value }))} />
              <Input placeholder="Max attendees" value={form.max_attendees} onChange={(event) => setForm((current) => ({ ...current, max_attendees: event.target.value }))} />
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminEvent["status"] }))}>
                <option value="draft">draft</option>
                <option value="upcoming">upcoming</option>
                <option value="live">live</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </Select>
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="flex gap-4 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_public} onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))} /> Public</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.requires_rsvp} onChange={(event) => setForm((current) => ({ ...current, requires_rsvp: event.target.checked }))} /> Requires RSVP</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveEvent} loading={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
