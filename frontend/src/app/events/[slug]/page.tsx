"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type AgendaItem = {
  id: number
  title: string
  description?: string | null
  speaker?: string | null
  starts_at?: string | null
  ends_at?: string | null
  agenda_type?: string
}

type Speaker = {
  id: number
  name: string
  role?: string | null
  company?: string | null
  bio?: string | null
}

type EventResourceItem = {
  id: number
  title: string
  resource_type?: string
  url?: string | null
}

type EventDetails = {
  id: number
  title: string
  slug: string
  short_description?: string | null
  full_description?: string | null
  starts_at: string
  ends_at?: string | null
  location?: string | null
  city?: string | null
  country?: string | null
  type?: string | null
  category?: string | null
  mode?: string | null
  cover_image_url?: string | null
  tags?: string[]
  relevance_score?: number
  why_recommended?: string | null
  rsvp_count?: number
  agenda?: AgendaItem[]
  speakers?: Speaker[]
  resources?: EventResourceItem[]
  sponsor_partner_blocks?: Array<{ name?: string; type?: string; cta_link?: string }>
}

export default function EventDetailPage() {
  const { toast } = useToast()
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<"rsvp" | "save" | "share" | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [registrationState, setRegistrationState] = useState<string>("open")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    attendance_type: "in_person",
    reason_to_attend: "",
    what_user_is_looking_for: "",
    allow_ai_networking_suggestions: true,
    calendar_sync_option: "ics",
  })

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get<{ data: EventDetails }>(`/events/${slug}`)
      .then((response) => {
        setEvent(response.data)
        setIsSaved(false)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))

    api.get<{ data: { registration_state: string } }>(`/member/events/${slug}/registration-status`)
      .then((res) => setRegistrationState(res.data.registration_state))
      .catch(() => {})
  }, [slug])

  async function handleRsvp() {
    if (!event) return
    setBusyAction("rsvp")
    try {
      const res = await api.post<{ message?: string; registration_state?: string }>(`/member/events/${event.slug}/rsvp`, formData)
      toast(res.message || "تم التسجيل في الفعالية.", "success")
      setRegistrationState(res.registration_state || "registered")
      setIsModalOpen(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر إتمام التسجيل.", "error")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleSave() {
    if (!event) return
    setBusyAction("save")
    try {
      if (isSaved) {
        await api.delete(`/member/events/${event.slug}/save`)
        setIsSaved(false)
        toast("تمت إزالة الفعالية من المحفوظات.", "info")
      } else {
        await api.post(`/member/events/${event.slug}/save`)
        setIsSaved(true)
        toast("تم حفظ الفعالية.", "success")
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر تحديث الحفظ.", "error")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleShare() {
    if (!event) return
    setBusyAction("share")
    try {
      const res = await api.post<{ data?: { share_url?: string } }>(`/member/events/${event.slug}/share`)
      const shareUrl = res.data?.share_url || `${window.location.origin}/events/${event.slug}`
      await navigator.clipboard.writeText(shareUrl)
      toast("تم نسخ رابط الفعالية.", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر مشاركة الفعالية.", "error")
    } finally {
      setBusyAction(null)
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">جاري تحميل الفعالية...</div>
  if (error || !event) return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-rose-600">{error || "الفعالية غير موجودة."}</div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-slate-600">{event.short_description || event.full_description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.type || "فعالية"}</Badge>
            {event.category ? <Badge variant="secondary">{event.category}</Badge> : null}
            {typeof event.relevance_score === "number" ? <Badge variant="gold">مدى الصلة {event.relevance_score}%</Badge> : null}
          </div>
          {event.why_recommended ? <p className="text-xs text-[#3B52D4]">سبب التوصية: {event.why_recommended}</p> : null}
          <div className="text-xs text-slate-500">
            {new Date(event.starts_at).toLocaleString("ar-SA")} • {event.location || [event.city, event.country].filter(Boolean).join("، ")} • {event.mode || "حضوري"}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">نظرة عامة</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{event.full_description || event.short_description || "لا يوجد وصف بعد."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">الأجندة</h2>
              <div className="space-y-3">
                {(event.agenda || []).length === 0 ? <p className="text-sm text-slate-500">سيتم نشر الأجندة قريبًا.</p> : null}
                {(event.agenda || []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.agenda_type} {item.starts_at ? `• ${new Date(item.starts_at).toLocaleTimeString("ar-SA")}` : ""}</p>
                    {item.description ? <p className="text-sm text-slate-600 mt-1">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">المتحدثون</h2>
              <div className="space-y-3">
                {(event.speakers || []).length === 0 ? <p className="text-sm text-slate-500">سيتم الإعلان عن المتحدثين قريبًا.</p> : null}
                {(event.speakers || []).map((speaker) => (
                  <div key={speaker.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{speaker.name}</p>
                    <p className="text-xs text-slate-500">{speaker.role} {speaker.company ? `• ${speaker.company}` : ""}</p>
                    {speaker.bio ? <p className="text-sm text-slate-600 mt-1">{speaker.bio}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">الموارد</h2>
              <div className="space-y-2">
                {(event.resources || []).length === 0 ? <p className="text-sm text-slate-500">لا توجد موارد بعد.</p> : null}
                {(event.resources || []).map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">التسجيل</h3>
              <p className="text-xs text-slate-500">عدد المسجلين: {event.rsvp_count || 0}</p>
              <Button className="w-full" onClick={() => (canOpenRsvp(registrationState) ? setIsModalOpen(true) : undefined)} disabled={busyAction === "rsvp" || !canOpenRsvp(registrationState)}>
                {busyAction === "rsvp" ? "جاري التسجيل..." : ctaLabel(registrationState)}
              </Button>
              {["registered", "approved", "pending_approval", "waitlisted"].includes(registrationState) ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    if (!event) return
                    setBusyAction("rsvp")
                    try {
                      await api.delete(`/member/events/${event.slug}/rsvp`)
                      setRegistrationState("cancelled_by_user")
                      toast("تم إلغاء التسجيل.", "info")
                    } catch (err) {
                      toast(err instanceof Error ? err.message : "تعذر إلغاء التسجيل.", "error")
                    } finally {
                      setBusyAction(null)
                    }
                  }}
                >
                  إلغاء التسجيل
                </Button>
              ) : null}
              <Button variant="outline" className="w-full" onClick={handleSave} disabled={busyAction === "save"}>
                {busyAction === "save" ? "جاري الحفظ..." : isSaved ? "إزالة من المحفوظات" : "حفظ الفعالية"}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare} disabled={busyAction === "share"}>
                {busyAction === "share" ? "جاري المشاركة..." : "مشاركة الفعالية"}
              </Button>
              <a href={`/api/v1/events/${event.slug}/calendar.ics`} className="block">
                <Button variant="outline" className="w-full">تحميل ملف التقويم ICS</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تأكيد التسجيل في الفعالية</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">نوع الحضور</label>
              <Select value={formData.attendance_type} onChange={(e) => setFormData((prev) => ({ ...prev, attendance_type: e.target.value }))}>
                <option value="in_person">حضوري</option>
                <option value="online">عن بُعد</option>
                <option value="hybrid">هجين</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">سبب الحضور</label>
              <Textarea value={formData.reason_to_attend} onChange={(e) => setFormData((prev) => ({ ...prev, reason_to_attend: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">ما الذي تبحث عنه؟</label>
              <Textarea value={formData.what_user_is_looking_for} onChange={(e) => setFormData((prev) => ({ ...prev, what_user_is_looking_for: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">مزامنة التقويم</label>
              <Select value={formData.calendar_sync_option} onChange={(e) => setFormData((prev) => ({ ...prev, calendar_sync_option: e.target.value }))}>
                <option value="none">بدون مزامنة</option>
                <option value="google">تقويم جوجل (Google Calendar)</option>
                <option value="outlook">أوتلوك (Outlook)</option>
                <option value="ics">ملف تقويم (ICS)</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.allow_ai_networking_suggestions}
                onChange={(e) => setFormData((prev) => ({ ...prev, allow_ai_networking_suggestions: e.target.checked }))}
              />
              تفعيل اقتراحات التواصل
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
              <Button onClick={handleRsvp} disabled={busyAction === "rsvp"}>{busyAction === "rsvp" ? "جاري الإرسال..." : "تأكيد التسجيل"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
  function ctaLabel(state: string): string {
    switch (state) {
      case "invite_only": return "الدعوة فقط"
      case "registration_closed": return "أُغلق التسجيل"
      case "waitlisted": return "قائمة الانتظار"
      case "pending_approval": return "قيد المراجعة"
      case "approved": return "تمت الموافقة"
      case "registered": return "مسجل بالفعل"
      case "cancelled_by_user": return "سجّل الآن"
      case "requires_approval": return "طلب انضمام"
      case "full_capacity": return "انضم لقائمة الانتظار"
      default: return "سجّل الآن"
    }
  }

  function canOpenRsvp(state: string): boolean {
    return ["open", "requires_approval", "full_capacity", "cancelled_by_user"].includes(state)
  }
