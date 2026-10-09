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
import Link from "next/link"

type EventForm = {
  title: string
  slug: string
  description: string
  short_description: string
  full_description: string
  starts_at: string
  ends_at: string
  registration_deadline: string
  timezone: string
  location: string
  venue_name: string
  city: string
  country: string
  google_maps_url: string
  type: string
  category: string
  format: "virtual" | "in-person"
  mode: "in-person" | "online" | "hybrid"
  virtual_link: string
  online_meeting_url: string
  cover_image_url: string
  gallery_images: string
  max_attendees: string
  capacity_limit: string
  organizer_type: "wosool" | "founder" | "partner" | "sponsor" | "external_ecosystem"
  organizer_name: string
  visibility: "public" | "members_only" | "founder_only" | "invite_only" | "circle_only"
  status: AdminEvent["status"]
  status_flow: NonNullable<AdminEvent["status_flow"]>
  is_public: boolean
  requires_rsvp: boolean
  waitlist_enabled: boolean
  rsvp_required: boolean
  allow_public_registration: boolean
  allow_guest_registration: boolean
  requires_approval: boolean
  auto_approve_trusted_members: boolean
  targeting_rules: string
  ai_settings: string
  rsvp_settings: string
  tags: string
}

const emptyForm: EventForm = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  full_description: "",
  starts_at: "",
  ends_at: "",
  registration_deadline: "",
  timezone: "Asia/Riyadh",
  location: "",
  venue_name: "",
  city: "",
  country: "",
  google_maps_url: "",
  type: "Wosool Event",
  category: "",
  format: "in-person",
  mode: "in-person",
  virtual_link: "",
  online_meeting_url: "",
  cover_image_url: "",
  gallery_images: "",
  max_attendees: "",
  capacity_limit: "",
  organizer_type: "wosool",
  organizer_name: "",
  visibility: "public",
  status: "draft",
  status_flow: "draft",
  is_public: true,
  requires_rsvp: true,
  waitlist_enabled: true,
  rsvp_required: true,
  allow_public_registration: true,
  allow_guest_registration: false,
  requires_approval: false,
  auto_approve_trusted_members: true,
  targeting_rules: "",
  ai_settings: "",
  rsvp_settings: "",
  tags: "",
}

const EVENT_TYPES = [
  "Wosool Event",
  "Founder Circle",
  "Founder Dinner",
  "Founder-led Session",
  "Office Hours",
  "Workshop",
  "Demo Day",
  "Partner Event",
  "Sponsor Event",
  "Public Ecosystem Event",
  "Webinar",
  "Networking Event",
  "Wellness Session",
  "Private Roundtable",
  "Investor Session",
] as const

const EVENT_TYPE_LABELS: Record<(typeof EVENT_TYPES)[number], string> = {
  "Wosool Event": "فعالية وصول",
  "Founder Circle": "دائرة مؤسسين",
  "Founder Dinner": "عشاء مؤسسين",
  "Founder-led Session": "جلسة يقودها مؤسس",
  "Office Hours": "ساعات مكتبية",
  Workshop: "ورشة عمل",
  "Demo Day": "يوم العروض",
  "Partner Event": "فعالية شريك",
  "Sponsor Event": "فعالية راعٍ",
  "Public Ecosystem Event": "فعالية منظومة عامة",
  Webinar: "ندوة ويب",
  "Networking Event": "فعالية تشبيك",
  "Wellness Session": "جلسة رفاه",
  "Private Roundtable": "طاولة مستديرة خاصة",
  "Investor Session": "جلسة مستثمرين",
}

function toForm(event?: AdminEvent | null): EventForm {
  if (!event) return emptyForm
  return {
    title: event.title,
    slug: event.slug,
    description: event.description || "",
    short_description: event.short_description || "",
    full_description: event.full_description || event.description || "",
    starts_at: event.starts_at.slice(0, 16),
    ends_at: event.ends_at ? event.ends_at.slice(0, 16) : "",
    registration_deadline: event.registration_deadline ? event.registration_deadline.slice(0, 16) : "",
    timezone: event.timezone || "Asia/Riyadh",
    location: event.location,
    venue_name: event.venue_name || "",
    city: event.city || "",
    country: event.country || "",
    google_maps_url: event.google_maps_url || "",
    type: event.type,
    category: event.category || "",
    format: event.format,
    mode: event.mode || (event.format === "virtual" ? "online" : "in-person"),
    virtual_link: event.virtual_link || "",
    online_meeting_url: event.online_meeting_url || "",
    cover_image_url: event.cover_image_url || event.image_url || "",
    gallery_images: toCsvLines(event.gallery_images),
    max_attendees: event.max_attendees ? String(event.max_attendees) : "",
    capacity_limit: event.capacity_limit ? String(event.capacity_limit) : "",
    organizer_type: event.organizer_type || "wosool",
    organizer_name: event.organizer_name || "",
    visibility: event.visibility || "public",
    status: event.status,
    status_flow: event.status_flow || "draft",
    is_public: event.is_public,
    requires_rsvp: event.requires_rsvp,
    waitlist_enabled: event.waitlist_enabled ?? true,
    rsvp_required: event.rsvp_required ?? true,
    allow_public_registration: event.allow_public_registration ?? true,
    allow_guest_registration: event.allow_guest_registration ?? false,
    requires_approval: event.requires_approval ?? false,
    auto_approve_trusted_members: event.auto_approve_trusted_members ?? true,
    targeting_rules: event.targeting_rules ? JSON.stringify(event.targeting_rules, null, 2) : "",
    ai_settings: event.ai_settings ? JSON.stringify(event.ai_settings, null, 2) : "",
    rsvp_settings: event.rsvp_settings ? JSON.stringify(event.rsvp_settings, null, 2) : "",
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

    try {
      const payload = {
        ...form,
        slug: form.slug || undefined,
        ends_at: form.ends_at || null,
        registration_deadline: form.registration_deadline || null,
        virtual_link: form.virtual_link || null,
        online_meeting_url: form.online_meeting_url || null,
        cover_image_url: form.cover_image_url || null,
        gallery_images: fromCsvLines(form.gallery_images),
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
        capacity_limit: form.capacity_limit ? Number(form.capacity_limit) : null,
        targeting_rules: form.targeting_rules ? JSON.parse(form.targeting_rules) : {},
        ai_settings: form.ai_settings ? JSON.parse(form.ai_settings) : {},
        rsvp_settings: form.rsvp_settings ? JSON.parse(form.rsvp_settings) : {},
        tags: fromCsvLines(form.tags),
      }

      if (editing) {
        await api.put(`/admin/events/${editing.id}`, payload)
      } else {
        await api.post("/admin/events", payload)
      }
      toast(`${editing ? "تم تحديث" : "تم إنشاء"} الفعالية بنجاح.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadEvents()
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر حفظ الفعالية.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (event: AdminEvent) => {
    if (!window.confirm(`هل تريد حذف فعالية: ${event.title}؟`)) return
    try {
      await api.delete(`/admin/events/${event.id}`)
      toast("تم حذف الفعالية.", "success")
      await loadEvents()
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر حذف الفعالية.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الفعاليات</h2>
          <p className="text-gray-500 text-sm mt-1">إدارة فعاليات وصول ومتابعة دورة حياتها بالكامل.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadEvents().catch((err: Error) => toast(err.message, "error"))}>تحديث</Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء فعالية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الفعاليات", value: meta.total || 0, icon: CalendarDays, color: "text-blue-600" },
          { label: "الفعاليات القادمة", value: meta.upcoming || 0, icon: CalendarDays, color: "text-emerald-600" },
          { label: "الفعاليات الحضورية", value: meta.in_person || 0, icon: MapPin, color: "text-purple-600" },
          { label: "إجمالي التسجيلات", value: meta.total_rsvps || 0, icon: Users, color: "text-amber-600" },
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
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالعنوان أو الموقع..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadEvents().catch((err: Error) => toast(err.message, "error"))}>بحث</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">كل الفعاليات ({events.length})</h3>
            <p className="text-sm text-gray-500">{meta.upcoming || 0} قادمة</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">الفعالية</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">التاريخ</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">النوع</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">التسجيلات</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">الإجراءات</th>
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
                      <p className="text-xs text-gray-400">{new Date(event.starts_at).toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" })}</p>
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
                        <Link href={`/admin/events/${event.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">إدارة</Link>
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
            <DialogTitle>{editing ? "تعديل فعالية" : "إنشاء فعالية"}</DialogTitle>
            <DialogDescription>هذه البيانات تُستخدم مباشرة في جدول الفعاليات الحي.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="عنوان الفعالية" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <Input placeholder="المعرّف (اختياري)" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
              <Input placeholder="الموقع" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              <Input placeholder="اسم المكان" value={form.venue_name} onChange={(event) => setForm((current) => ({ ...current, venue_name: event.target.value }))} />
              <Input placeholder="المدينة" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
              <Input placeholder="الدولة" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
              <Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} />
              <Input type="datetime-local" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} />
              <Input type="datetime-local" value={form.registration_deadline} onChange={(event) => setForm((current) => ({ ...current, registration_deadline: event.target.value }))} />
              <Input placeholder="المنطقة الزمنية" value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} />
              <Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                {EVENT_TYPES.map((eventType) => (
                  <option key={eventType} value={eventType}>{EVENT_TYPE_LABELS[eventType]}</option>
                ))}
              </Select>
              <Input placeholder="الفئة" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              <Select value={form.format} onChange={(event) => setForm((current) => ({ ...current, format: event.target.value as EventForm["format"] }))}>
                <option value="in-person">حضوري</option>
                <option value="virtual">افتراضي</option>
              </Select>
              <Select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value as EventForm["mode"] }))}>
                <option value="in-person">حضوري</option>
                <option value="online">عن بعد</option>
                <option value="hybrid">هجين</option>
              </Select>
              <Input placeholder="رابط البث الافتراضي" value={form.virtual_link} onChange={(event) => setForm((current) => ({ ...current, virtual_link: event.target.value }))} />
              <Input placeholder="رابط الاجتماع" value={form.online_meeting_url} onChange={(event) => setForm((current) => ({ ...current, online_meeting_url: event.target.value }))} />
              <Input placeholder="الحد الأقصى للحضور" value={form.max_attendees} onChange={(event) => setForm((current) => ({ ...current, max_attendees: event.target.value }))} />
              <Input placeholder="سعة الفعالية" value={form.capacity_limit} onChange={(event) => setForm((current) => ({ ...current, capacity_limit: event.target.value }))} />
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminEvent["status"] }))}>
                <option value="draft">مسودة</option>
                <option value="pending_approval">بانتظار الموافقة</option>
                <option value="upcoming">قادمة</option>
                <option value="live">مباشرة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
                <option value="hidden">مخفية</option>
              </Select>
              <Select value={form.status_flow} onChange={(event) => setForm((current) => ({ ...current, status_flow: event.target.value as EventForm["status_flow"] }))}>
                <option value="draft">مسودة</option>
                <option value="pending_review">بانتظار المراجعة</option>
                <option value="published">منشورة</option>
                <option value="registration_closed">التسجيل مغلق</option>
                <option value="live_now">مباشرة الآن</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
                <option value="archived">مؤرشفة</option>
              </Select>
              <Select value={form.organizer_type} onChange={(event) => setForm((current) => ({ ...current, organizer_type: event.target.value as EventForm["organizer_type"] }))}>
                <option value="wosool">وصول</option>
                <option value="founder">مؤسس</option>
                <option value="partner">شريك</option>
                <option value="sponsor">راعٍ</option>
                <option value="external_ecosystem">منظومة خارجية</option>
              </Select>
              <Input placeholder="اسم المنظم" value={form.organizer_name} onChange={(event) => setForm((current) => ({ ...current, organizer_name: event.target.value }))} />
              <Select value={form.visibility} onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as EventForm["visibility"] }))}>
                <option value="public">عام</option>
                <option value="members_only">للأعضاء فقط</option>
                <option value="founder_only">للمؤسسين فقط</option>
                <option value="invite_only">بدعوات فقط</option>
                <option value="circle_only">لدائرة محددة</option>
              </Select>
              <Input placeholder="رابط خرائط Google" value={form.google_maps_url} onChange={(event) => setForm((current) => ({ ...current, google_maps_url: event.target.value }))} />
              <Input placeholder="رابط صورة الغلاف" value={form.cover_image_url} onChange={(event) => setForm((current) => ({ ...current, cover_image_url: event.target.value }))} />
              <Input placeholder="روابط المعرض (مفصولة بفاصلة)" value={form.gallery_images} onChange={(event) => setForm((current) => ({ ...current, gallery_images: event.target.value }))} />
              <Input placeholder="الوسوم (مفصولة بفاصلة)" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            </div>
            <Input placeholder="وصف مختصر" value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} />
            <Textarea placeholder="وصف الفعالية" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <Textarea placeholder="وصف تفصيلي" value={form.full_description} onChange={(event) => setForm((current) => ({ ...current, full_description: event.target.value }))} />
            <Textarea placeholder="قواعد الاستهداف (JSON)" value={form.targeting_rules} onChange={(event) => setForm((current) => ({ ...current, targeting_rules: event.target.value }))} />
            <Textarea placeholder="إعدادات اقتراحات التواصل (JSON)" value={form.ai_settings} onChange={(event) => setForm((current) => ({ ...current, ai_settings: event.target.value }))} />
            <Textarea placeholder="إعدادات التسجيل RSVP (JSON)" value={form.rsvp_settings} onChange={(event) => setForm((current) => ({ ...current, rsvp_settings: event.target.value }))} />
            <div className="flex gap-4 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_public} onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))} /> فعالية عامة</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.requires_rsvp} onChange={(event) => setForm((current) => ({ ...current, requires_rsvp: event.target.checked }))} /> يتطلب تسجيل RSVP</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.waitlist_enabled} onChange={(event) => setForm((current) => ({ ...current, waitlist_enabled: event.target.checked }))} /> تفعيل قائمة الانتظار</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.requires_approval} onChange={(event) => setForm((current) => ({ ...current, requires_approval: event.target.checked }))} /> يتطلب موافقة</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={saveEvent} loading={saving}>حفظ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
