"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { canRegisterForEvent } from "@/lib/event-time"
import { useEventNow } from "@/lib/use-event-now"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import {
  canOpenRsvp,
  eventSignInHref,
  formatEventDateTime,
  formatEventTime,
  holdsRegistration,
  registrationCtaLabel,
} from "@/lib/event-registration"

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
  status?: string | null
  status_flow?: string | null
  registration_deadline?: string | null
  requires_rsvp?: boolean
  rsvp_required?: boolean
  id: number
  title: string
  slug: string
  description?: string | null
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
  format?: string | null
  is_saved?: boolean
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


const FORMAT_LABELS: Record<string, { ar: string; en: string }> = {
  "in-person": { ar: "حضوري", en: "In person" },
  in_person: { ar: "حضوري", en: "In person" },
  virtual: { ar: "عن بُعد", en: "Online" },
  online: { ar: "عن بُعد", en: "Online" },
  hybrid: { ar: "حضوري وعن بُعد", en: "In person and online" },
}

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  wosool: { ar: "فعالية وصول", en: "Wosool event" },
  partner: { ar: "فعالية شريك", en: "Partner event" },
}

export default function EventDetailPage() {
  // Detail pages need the site header, footer and <main> landmark like every other public page.
  return (
    <PublicLayout>
      <EventDetailPageContent />
    </PublicLayout>
  )
}

function EventDetailPageContent() {
  const now = useEventNow()
  const { toast } = useToast()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const t = useCallback((arabic: string, english: string) => (ar ? arabic : english), [ar])
  const { user, isLoading: authLoading } = useAuth()
  const signedIn = Boolean(user)
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<"rsvp" | "save" | "share" | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [registrationState, setRegistrationState] = useState<string>("open")
  const [eventState, setEventState] = useState<string | null>(null)
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
    let active = true
    setLoading(true)
    setError(null)
    setIsModalOpen(false)
    api.get<{ data: EventDetails }>(`/events/${slug}`, { cache: "no-store" })
      .then((response) => {
        if (!active) return
        setEvent(response.data)
        setIsSaved(Boolean(response.data.is_saved))
      })
      .catch((err: Error) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  // Registration status is private: only signed-in members ask for it, so visitors make no failing requests.
  useEffect(() => {
    setRegistrationState("open")
    setEventState(null)
    if (!slug || authLoading || !signedIn) return
    let active = true
    api.get<{ data: { event_state: string; registration_state: string } }>(`/member/events/${slug}/registration-status`, { cache: "no-store" })
      .then((res) => { if (active) { setRegistrationState(res.data.registration_state); setEventState(res.data.event_state) } })
      .catch(() => {})
    return () => { active = false }
  }, [slug, authLoading, signedIn])

  const timing = event ? { date: event.starts_at, endDate: event.ends_at ?? undefined, status: event.status ?? undefined, statusFlow: event.status_flow ?? undefined, registrationDeadline: event.registration_deadline ?? undefined } : null
  const registrationOpen = Boolean(timing && canRegisterForEvent(timing, now) &&
    (event?.requires_rsvp || event?.rsvp_required) && !["registration_closed", "invite_only"].includes(eventState || ""))
  const effectiveRegistrationState = registrationOpen ? registrationState : "registration_closed"

  async function handleRsvp() {
    if (!event || !timing || !canRegisterForEvent(timing, Date.now()) || !registrationOpen || !canOpenRsvp(registrationState)) return
    setBusyAction("rsvp")
    try {
      const res = await api.post<{ message?: string; registration_state?: string }>(`/member/events/${event.slug}/rsvp`, formData)
      toast(res.message || t("تم تسجيلك في الفعالية.", "You are registered for this event."), "success")
      setRegistrationState(res.registration_state || "registered")
      setIsModalOpen(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : t("تعذر إتمام التسجيل.", "Registration did not go through."), "error")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCancel() {
    if (!event) return
    setBusyAction("rsvp")
    try {
      await api.delete(`/member/events/${event.slug}/rsvp`)
      setRegistrationState("cancelled_by_user")
      toast(t("تم إلغاء تسجيلك.", "Your registration is cancelled."), "info")
    } catch (err) {
      toast(err instanceof Error ? err.message : t("تعذر إلغاء التسجيل.", "Could not cancel your registration."), "error")
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
        toast(t("أُزيلت الفعالية من محفوظاتك.", "Removed from your saved events."), "info")
      } else {
        await api.post(`/member/events/${event.slug}/save`)
        setIsSaved(true)
        toast(t("حُفظت الفعالية.", "Event saved."), "success")
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : t("تعذر تحديث المحفوظات.", "Could not update your saved events."), "error")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleShare() {
    if (!event) return
    setBusyAction("share")
    const fallbackUrl = `${window.location.origin}/events/${event.slug}`
    try {
      // Members get a tracked link; visitors copy the public page address.
      const res = signedIn
        ? await api.post<{ data?: { share_url?: string } }>(`/member/events/${event.slug}/share`).catch(() => null)
        : null
      await navigator.clipboard.writeText(res?.data?.share_url || fallbackUrl)
      toast(t("نُسخ رابط الفعالية.", "Event link copied."), "success")
    } catch {
      toast(t("تعذر نسخ الرابط. انسخه من شريط العنوان.", "Could not copy the link. Copy it from the address bar."), "error")
    } finally {
      setBusyAction(null)
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500" role="status">{t("جارٍ تحميل الفعالية...", "Loading event...")}</div>
  if (error || !event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-3">
        <h1 className="text-xl font-bold text-slate-900">{t("لم نجد هذه الفعالية", "We could not find this event")}</h1>
        <p className="text-sm text-rose-600">{error || t("ربما أُزيلت أو تغيّر رابطها.", "It may have been removed or its link changed.")}</p>
        <Link href="/events" className="text-sm font-semibold text-[#3B52D4] underline-offset-4 hover:underline">{t("كل الفعاليات", "All events")}</Link>
      </div>
    )
  }

  const description = event.full_description || event.description || event.short_description
  const summary = event.short_description || event.description
  const formatKey = event.format || event.mode || ""
  const formatLabel = FORMAT_LABELS[formatKey]?.[locale] ?? formatKey
  const typeLabel = TYPE_LABELS[event.type || ""]?.[locale] ?? (event.type || t("فعالية", "Event"))
  const place = event.location && event.location.toLowerCase() !== "online"
    ? event.location
    : [event.city, event.country].filter(Boolean).join(ar ? "، " : ", ")
  const when = formatEventDateTime(event.starts_at, locale, event.ends_at)
  const showRegistration = Boolean(event.requires_rsvp || event.rsvp_required)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{typeLabel}</Badge>
            {formatLabel ? <Badge variant="secondary">{formatLabel}</Badge> : null}
            {event.category ? <Badge variant="secondary">{event.category}</Badge> : null}
          </div>
          <h1 dir="auto" className="text-2xl font-bold text-slate-900">{event.title}</h1>
          {summary ? <p dir="auto" className="text-slate-600">{summary}</p> : null}
          <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-[auto_1fr] sm:gap-x-3">
            <dt className="font-semibold text-slate-900">{t("الموعد", "When")}</dt>
            <dd>{when}</dd>
            {place ? (
              <>
                <dt className="font-semibold text-slate-900">{t("المكان", "Where")}</dt>
                <dd>{place}</dd>
              </>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">{t("عن الفعالية", "About this event")}</h2>
              <p dir="auto" className="text-sm text-slate-600 whitespace-pre-wrap">{description || t("لم يُنشر وصف بعد.", "No description has been published yet.")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">{t("البرنامج", "Agenda")}</h2>
              <div className="space-y-3">
                {(event.agenda || []).length === 0 ? <p className="text-sm text-slate-500">{t("سيُنشر البرنامج قبل الفعالية.", "The agenda will be published before the event.")}</p> : null}
                {(event.agenda || []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <p dir="auto" className="text-sm font-semibold text-slate-900">{item.title}</p>
                    {item.starts_at || item.speaker ? (
                      <p className="text-xs text-slate-500">
                        {[item.starts_at ? formatEventTime(item.starts_at, locale) : "", item.speaker || ""].filter(Boolean).join(" • ")}
                      </p>
                    ) : null}
                    {item.description ? <p dir="auto" className="text-sm text-slate-600 mt-1">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">{t("المتحدثون", "Speakers")}</h2>
              <div className="space-y-3">
                {(event.speakers || []).length === 0 ? <p className="text-sm text-slate-500">{t("سيُعلن عن المتحدثين قبل الفعالية.", "Speakers will be announced before the event.")}</p> : null}
                {(event.speakers || []).map((speaker) => (
                  <div key={speaker.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{speaker.name}</p>
                    {speaker.role || speaker.company ? (
                      <p className="text-xs text-slate-500">{[speaker.role, speaker.company].filter(Boolean).join(" • ")}</p>
                    ) : null}
                    {speaker.bio ? <p dir="auto" className="text-sm text-slate-600 mt-1">{speaker.bio}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(event.resources || []).length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold mb-3">{t("المواد", "Materials")}</h2>
                <ul className="space-y-2">
                  {(event.resources || []).map((resource) => (
                    <li key={resource.id}>
                      {resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"
                        >
                          {resource.title}
                        </a>
                      ) : (
                        <span className="block rounded-lg border border-slate-200 p-3 text-sm text-slate-600">{resource.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold">{t("التسجيل", "Registration")}</h2>
              {showRegistration ? (
                <p className="text-xs text-slate-500">{t(`عدد المسجلين: ${event.rsvp_count || 0}`, `Registered so far: ${event.rsvp_count || 0}`)}</p>
              ) : (
                <p className="text-xs text-slate-500">{t("لا تحتاج هذه الفعالية إلى تسجيل.", "This event does not need registration.")}</p>
              )}
              {showRegistration && !signedIn && !authLoading ? (
                registrationOpen ? (
                  <>
                    <Button asChild className="w-full">
                      <Link href={eventSignInHref(event.slug)}>{t("سجّل الدخول للتسجيل", "Sign in to register")}</Link>
                    </Button>
                    <p className="text-xs text-slate-500">
                      {t("التسجيل متاح لأعضاء وصول. ليس لديك حساب؟", "Registration is for Wosool members. No account yet?")}{" "}
                      <Link href="/apply" className="font-semibold text-[#3B52D4] underline-offset-4 hover:underline">{t("قدّم على العضوية", "Apply to join")}</Link>
                    </p>
                  </>
                ) : (
                  <Button className="w-full" disabled>{registrationCtaLabel("registration_closed", locale)}</Button>
                )
              ) : null}
              {showRegistration && signedIn ? (
                <>
                  <Button className="w-full" onClick={() => (canOpenRsvp(effectiveRegistrationState) ? setIsModalOpen(true) : undefined)} disabled={busyAction === "rsvp" || !canOpenRsvp(effectiveRegistrationState)}>
                    {busyAction === "rsvp" ? t("جارٍ التسجيل...", "Registering...") : registrationCtaLabel(effectiveRegistrationState, locale)}
                  </Button>
                  {holdsRegistration(registrationState) ? (
                    <Button variant="outline" className="w-full" onClick={handleCancel} disabled={busyAction === "rsvp"}>
                      {t("إلغاء التسجيل", "Cancel registration")}
                    </Button>
                  ) : null}
                </>
              ) : null}
              {signedIn ? (
                <Button variant="outline" className="w-full" onClick={handleSave} disabled={busyAction === "save"} aria-pressed={isSaved}>
                  {busyAction === "save" ? t("جارٍ الحفظ...", "Saving...") : isSaved ? t("إزالة من المحفوظات", "Remove from saved") : t("احفظ الفعالية", "Save event")}
                </Button>
              ) : null}
              <Button variant="outline" className="w-full" onClick={handleShare} disabled={busyAction === "share"}>
                {busyAction === "share" ? t("جارٍ النسخ...", "Copying...") : t("انسخ رابط الفعالية", "Copy event link")}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href={`/api/v1/events/${event.slug}/calendar.ics`} download>{t("أضف إلى التقويم (ICS)", "Add to calendar (.ics)")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("أكّد تسجيلك", "Confirm your registration")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="rsvp-attendance" className="text-xs font-bold text-slate-500">{t("طريقة الحضور", "How will you attend?")}</label>
              <Select id="rsvp-attendance" value={formData.attendance_type} onChange={(e) => setFormData((prev) => ({ ...prev, attendance_type: e.target.value }))}>
                <option value="in_person">{t("حضوري", "In person")}</option>
                <option value="online">{t("عن بُعد", "Online")}</option>
                <option value="hybrid">{t("حضوري وعن بُعد", "In person and online")}</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="rsvp-reason" className="text-xs font-bold text-slate-500">{t("لماذا تريد الحضور؟", "Why do you want to attend?")}</label>
              <Textarea id="rsvp-reason" value={formData.reason_to_attend} onChange={(e) => setFormData((prev) => ({ ...prev, reason_to_attend: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label htmlFor="rsvp-looking-for" className="text-xs font-bold text-slate-500">{t("من تريد أن تقابل أو ماذا تبحث عنه؟", "Who do you want to meet, or what are you looking for?")}</label>
              <Textarea id="rsvp-looking-for" value={formData.what_user_is_looking_for} onChange={(e) => setFormData((prev) => ({ ...prev, what_user_is_looking_for: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label htmlFor="rsvp-calendar" className="text-xs font-bold text-slate-500">{t("إضافة إلى التقويم", "Add to calendar")}</label>
              <Select id="rsvp-calendar" value={formData.calendar_sync_option} onChange={(e) => setFormData((prev) => ({ ...prev, calendar_sync_option: e.target.value }))}>
                <option value="none">{t("لا شيء", "None")}</option>
                <option value="google">{t("تقويم Google", "Google Calendar")}</option>
                <option value="outlook">Outlook</option>
                <option value="ics">{t("ملف تقويم (ICS)", "Calendar file (.ics)")}</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.allow_ai_networking_suggestions}
                onChange={(e) => setFormData((prev) => ({ ...prev, allow_ai_networking_suggestions: e.target.checked }))}
              />
              {t("اقترح عليّ مؤسسين للتعارف خلال الفعالية", "Suggest founders I could meet at the event")}
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t("رجوع", "Back")}</Button>
              <Button onClick={handleRsvp} disabled={busyAction === "rsvp" || !canOpenRsvp(effectiveRegistrationState)}>
                {!registrationOpen ? registrationCtaLabel("registration_closed", locale) : busyAction === "rsvp" ? t("جارٍ الإرسال...", "Sending...") : t("أكّد التسجيل", "Confirm registration")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
