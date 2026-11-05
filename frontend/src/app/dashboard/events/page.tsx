"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarDays, MapPin, Clock, Users, Bookmark, BookmarkCheck, Share2, Video, CheckCircle2, Hourglass } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"
import { resolveDashboardLocale, type DashboardLocale } from "@/lib/dashboard-i18n"
import {
  EVENT_PERIODS,
  activeRegistrations,
  attendanceType,
  dateTile,
  eventDate,
  eventTime,
  fill,
  formatLabel,
  isOnline,
  isUpcoming,
  memberEvents,
  organiserLabel,
  periodLabel,
  registrationLabel,
  stateAfterRsvp,
  type EventPeriod,
  type MemberEvent,
  type MemberRsvpRecord,
  type RegistrationState,
} from "@/lib/member-events"

interface PaginatedEvents {
  data: MemberEvent[]
}

function DateBlock({ locale, iso }: { locale: DashboardLocale; iso: string }) {
  const { day, month } = dateTile(locale, iso)
  return (
    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] flex flex-col items-center justify-center gap-0.5" aria-hidden="true">
      <span className="text-xs font-extrabold text-[#3B52D4] uppercase leading-none">{month}</span>
      <span className="text-xl font-black text-[#3B52D4] leading-none">{day}</span>
    </div>
  )
}

function EventCard({
  locale,
  event,
  registration,
  isSaved,
  isBusy,
  isSaving,
  onRsvp,
  onCancel,
  onSaveToggle,
  onShare,
}: {
  locale: DashboardLocale
  event: MemberEvent
  registration: RegistrationState | null
  isSaved: boolean
  isBusy: boolean
  isSaving: boolean
  onRsvp: () => void
  onCancel: () => void
  onSaveToggle: () => void
  onShare: () => void
}) {
  const copy = memberEvents(locale)
  const online = isOnline(event)
  const organiser = organiserLabel(locale, event.type)
  const confirmed = registration === "registered" || registration === "checked_in"

  return (
    <article className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl overflow-hidden transition-all hover:border-[#3B52D4]/20 hover:shadow-md" style={{ boxShadow: "0 2px 12px -2px rgba(59,82,212,0.06)" }}>
      {confirmed && <div className="h-0.5 bg-emerald-400" />}
      <div className="p-5">
        <div className="flex gap-4">
          <DateBlock locale={locale} iso={event.starts_at} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h2 className="text-sm font-black text-slate-900 leading-snug break-words"><bdi>{event.title}</bdi></h2>
              {registration && (
                <span className={["inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-extrabold", confirmed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"].join(" ")}>
                  {confirmed ? <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" /> : <Hourglass className="h-2.5 w-2.5" aria-hidden="true" />}
                  {registrationLabel(locale, registration)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-extrabold text-slate-600">
                {online ? <Video className="h-2.5 w-2.5" aria-hidden="true" /> : <MapPin className="h-2.5 w-2.5" aria-hidden="true" />}
                {formatLabel(locale, event)}
              </span>
              {organiser && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-extrabold text-slate-600">{organiser}</span>}
              {event.is_public === false && <span className="inline-flex items-center gap-1 rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-2 py-0.5 text-xs font-extrabold text-[#3B52D4]">{copy.membersOnly}</span>}
              {(event.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-500"><bdi>{tag}</bdi></span>
              ))}
            </div>

            {event.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5"><bdi>{event.description}</bdi></p>}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-4">
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden="true" />{eventDate(locale, event.starts_at)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" /><bdi>{eventTime(locale, event.starts_at)}{event.ends_at && ` – ${eventTime(locale, event.ends_at)}`}</bdi> {copy.riyadhTime}</span>
              {!online && event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" /><bdi>{event.location}</bdi></span>}
              {event.max_attendees ? <span className="flex items-center gap-1"><Users className="h-3 w-3" aria-hidden="true" />{fill(copy.seats, { count: event.max_attendees })}</span> : null}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {registration ? (
                <button type="button" disabled={isBusy} onClick={onCancel} className="px-3.5 h-8 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                  {isBusy ? copy.cancelling : copy.cancel}
                </button>
              ) : (
                <button type="button" disabled={isBusy} onClick={onRsvp} className="px-3.5 h-8 rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-xs font-bold transition-all shadow-sm shadow-[#3B52D4]/20 disabled:opacity-50">
                  {isBusy ? copy.rsvping : copy.rsvp}
                </button>
              )}

              <button type="button" disabled={isSaving} aria-pressed={isSaved} onClick={onSaveToggle} className={["flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50", isSaved ? "border-[#3B52D4]/30 bg-[#EEF1FF] text-[#3B52D4]" : "border-slate-200 text-slate-500 hover:border-[#3B52D4]/30 hover:text-[#3B52D4] hover:bg-[#EEF1FF]"].join(" ")}>
                {isSaved ? <BookmarkCheck className="h-3 w-3" aria-hidden="true" /> : <Bookmark className="h-3 w-3" aria-hidden="true" />}
                {isSaved ? copy.saved : copy.save}
              </button>

              <button type="button" onClick={onShare} className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors">
                <Share2 className="h-3 w-3" aria-hidden="true" />
                {copy.share}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function EventsPage() {
  const { toast } = useToast()
  const { locale: activeLocale } = useLocale()
  const locale = resolveDashboardLocale(activeLocale)
  const copy = memberEvents(locale)
  const [events, setEvents] = useState<MemberEvent[]>([])
  const [registrations, setRegistrations] = useState<Map<string, RegistrationState>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [period, setPeriod] = useState<EventPeriod>("all")
  const [activeTab, setActiveTab] = useState<"all" | "registered">("all")
  const latestRequest = useRef(0)
  const loadFailed = copy.loadFailed

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current
    setIsLoading(true)
    try {
      const [eventsRes, rsvpRes] = await Promise.all([
        api.get<PaginatedEvents>("/member/events/catalog", { params: { period: period === "all" ? undefined : period } }),
        api.get<{ data: MemberRsvpRecord[] }>("/member/events/rsvps").catch(() => ({ data: [] as MemberRsvpRecord[] })),
      ])
      // A slower response for an earlier period must not replace the one the member just picked.
      if (request !== latestRequest.current) return
      setEvents(eventsRes.data ?? [])
      setSaved(new Set((eventsRes.data ?? []).filter((e) => e.is_saved).map((e) => e.slug)))
      setRegistrations(activeRegistrations(rsvpRes.data ?? []))
    } catch {
      if (request === latestRequest.current) toast(loadFailed, "error")
    } finally {
      if (request === latestRequest.current) setIsLoading(false)
    }
  }, [period, toast, loadFailed])

  useEffect(() => { void refresh() }, [refresh])

  const onSaveToggle = useCallback(async (slug: string, isSaved: boolean) => {
    setSavingSlug(slug)
    try {
      if (isSaved) {
        await api.delete(`/member/events/${slug}/save`)
        setSaved((prev) => { const n = new Set(prev); n.delete(slug); return n })
      } else {
        await api.post(`/member/events/${slug}/save`)
        setSaved((prev) => new Set(prev).add(slug))
      }
    } catch {
      toast(copy.saveFailed, "error")
    } finally {
      setSavingSlug(null)
    }
  }, [toast, copy.saveFailed])

  const onShare = useCallback(async (slug: string) => {
    try {
      const res = await api.post<{ data?: { share_url?: string } }>(`/member/events/${slug}/share`)
      const url = res.data?.share_url || `${window.location.origin}/events/${slug}`
      await navigator.clipboard.writeText(url)
      toast(copy.linkCopied, "success")
    } catch {
      toast(copy.linkFailed, "error")
    }
  }, [toast, copy.linkCopied, copy.linkFailed])

  const onRsvp = useCallback(async (event: MemberEvent) => {
    setBusySlug(event.slug)
    try {
      const res = await api.post<{ message?: string; status?: string }>(`/member/events/${event.slug}/rsvp`, {
        attendance_type: attendanceType(event),
        reason_to_attend: "",
        what_user_is_looking_for: "",
        allow_ai_networking_suggestions: true,
        calendar_sync_option: "ics",
      })
      const state = stateAfterRsvp(res.status)
      if (!state) {
        // A rejected or no-show registration is returned unchanged: no place was given.
        toast(copy.notAccepted, "error")
        return
      }
      toast(res.message || copy.registeredToast, "success")
      setRegistrations((prev) => new Map(prev).set(event.slug, state))
    } catch (err) {
      toast(err instanceof ApiError && err.message ? err.message : copy.rsvpFailed, "error")
    } finally {
      setBusySlug(null)
    }
  }, [toast, copy.registeredToast, copy.rsvpFailed, copy.notAccepted])

  const onCancel = useCallback(async (slug: string) => {
    setBusySlug(slug)
    try {
      const res = await api.delete<{ message?: string }>(`/member/events/${slug}/rsvp`)
      toast(res?.message || copy.cancelledToast, "info")
      setRegistrations((prev) => { const n = new Map(prev); n.delete(slug); return n })
    } catch (err) {
      toast(err instanceof ApiError && err.message ? err.message : copy.cancelFailed, "error")
    } finally {
      setBusySlug(null)
    }
  }, [toast, copy.cancelledToast, copy.cancelFailed])

  const upcoming = events.filter(isUpcoming)
  const registered = upcoming.filter((e) => registrations.has(e.slug))
  const displayed = activeTab === "registered" ? registered : upcoming

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#3B52D4] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" aria-hidden="true" />
            {copy.badge}
          </div>
          <h1 className="text-xl font-black text-slate-900">{copy.title}</h1>
          {!isLoading && <p className="text-xs text-slate-500 font-medium mt-0.5">{fill(copy.summary, { upcoming: upcoming.length, registered: registered.length })}</p>}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}>
        <div role="group" aria-label={copy.tabsLabel} className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          {(["all", "registered"] as const).map((tab) => (
            <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={["px-3 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === tab ? "bg-white text-[#3B52D4] shadow-sm border border-slate-200/80" : "text-slate-500 hover:text-slate-700"].join(" ")}>
              {tab === "all" ? `${copy.tabUpcoming} (${upcoming.length})` : `${copy.tabRegistered} (${registered.length})`}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" aria-hidden="true" />

        <div role="group" aria-label={copy.periodLabel} className="flex flex-wrap items-center gap-1.5">
          {EVENT_PERIODS.map((value) => (
            <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className={["px-3 h-7 rounded-xl text-xs font-extrabold border transition-all", period === value ? "bg-[#3B52D4] border-[#2E44C8] text-white shadow-sm shadow-[#3B52D4]/20" : "border-slate-200 text-slate-500 hover:border-[#3B52D4]/30 hover:text-[#3B52D4] bg-white"].join(" ")}>
              {periodLabel(locale, value)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-20 justify-center" role="status">
          <span className="w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" aria-hidden="true" />
          <span className="text-slate-500 text-sm font-bold">{copy.loading}</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-white/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] border border-[#E4E7F0]"><CalendarDays className="h-5 w-5 text-[#3B52D4]" aria-hidden="true" /></div>
          <p className="text-sm font-bold text-slate-500">{activeTab === "registered" ? copy.emptyRegistered : copy.emptyUpcoming}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((event) => (
            <EventCard
              key={event.id}
              locale={locale}
              event={event}
              registration={registrations.get(event.slug) ?? null}
              isSaved={saved.has(event.slug)}
              isBusy={busySlug === event.slug}
              isSaving={savingSlug === event.slug}
              onRsvp={() => onRsvp(event)}
              onCancel={() => onCancel(event.slug)}
              onSaveToggle={() => onSaveToggle(event.slug, saved.has(event.slug))}
              onShare={() => onShare(event.slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
