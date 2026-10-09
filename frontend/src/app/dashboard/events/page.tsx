"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDays, MapPin, Clock, Users, Bookmark, BookmarkCheck, Share2, Video, CheckCircle2, Sparkles } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface ApiEvent {
  id: number
  title: string
  slug: string
  description?: string | null
  starts_at: string
  ends_at?: string | null
  location?: string | null
  type?: string | null
  format?: string | null
  max_attendees?: number | null
  is_public?: boolean
  status?: string
  tags?: string[] | null
  is_saved?: boolean
  relevance_score?: number
  why_recommended?: string | null
  mode?: string | null
}

interface PaginatedEvents {
  data: ApiEvent[]
}

interface MemberRsvpRecord {
  event: ApiEvent
  registration: {
    status: string
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" })
}

const PERIODS = [
  { value: "all", label: "الكل" },
  { value: "today", label: "اليوم" },
  { value: "this_week", label: "هذا الأسبوع" },
  { value: "this_month", label: "هذا الشهر" },
] as const

type Period = (typeof PERIODS)[number]["value"]

function DateBlock({ iso }: { iso: string }) {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString("ar-SA", { month: "short" })
  return (
    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] flex flex-col items-center justify-center gap-0.5">
      <span className="text-xs font-extrabold text-[#3B52D4] uppercase leading-none">{month}</span>
      <span className="text-xl font-black text-[#3B52D4] leading-none">{day}</span>
    </div>
  )
}

function EventCard({
  event,
  isRegistered,
  isSaved,
  isBusy,
  isSaving,
  onRsvp,
  onCancel,
  onSaveToggle,
  onShare,
}: {
  event: ApiEvent
  isRegistered: boolean
  isSaved: boolean
  isBusy: boolean
  isSaving: boolean
  onRsvp: () => void
  onCancel: () => void
  onSaveToggle: () => void
  onShare: () => void
}) {
  const isVirtual = event.format === "virtual"

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl overflow-hidden transition-all hover:border-[#3B52D4]/20 hover:shadow-md" style={{ boxShadow: "0 2px 12px -2px rgba(59,82,212,0.06)" }}>
      {isRegistered && <div className="h-0.5 bg-emerald-400" />}
      <div className="p-5">
        <div className="flex gap-4">
          <DateBlock iso={event.starts_at} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-black text-slate-900 leading-snug">{event.title}</h3>
              {isRegistered && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  مسجل
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-extrabold text-slate-600">
                {isVirtual ? <Video className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                {isVirtual ? "عن بُعد" : (event.type ?? "حضوري")}
              </span>
              {event.is_public === false && <span className="inline-flex items-center gap-1 rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-2 py-0.5 text-xs font-extrabold text-[#3B52D4]">للأعضاء فقط</span>}
              {(event.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-500">{tag}</span>
              ))}
            </div>

            {event.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5">{event.description}</p>}

            {event.why_recommended && (
              <div className="flex items-start gap-1.5 mb-2.5 rounded-lg bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1.5">
                <Sparkles className="h-3 w-3 text-[#3B52D4] shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-[#3B52D4] leading-relaxed">{event.why_recommended}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mb-4">
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(event.starts_at)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(event.starts_at)}{event.ends_at && ` – ${formatTime(event.ends_at)}`}</span>
              {!isVirtual && event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
              {event.max_attendees && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.max_attendees} مشارك كحد أقصى</span>}
              {typeof event.relevance_score === "number" && <span className="text-[#3B52D4] font-bold">{event.relevance_score}% صلة</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isRegistered ? (
                <button type="button" disabled={isBusy} onClick={onCancel} className="px-3.5 h-8 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                  {isBusy ? "جاري الإلغاء…" : "إلغاء التسجيل"}
                </button>
              ) : (
                <button type="button" disabled={isBusy} onClick={onRsvp} className="px-3.5 h-8 rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-xs font-bold transition-all shadow-sm shadow-[#3B52D4]/20 disabled:opacity-50">
                  {isBusy ? "جاري الإرسال…" : "سجّل الآن"}
                </button>
              )}

              <button type="button" disabled={isSaving} onClick={onSaveToggle} className={["flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50", isSaved ? "border-[#3B52D4]/30 bg-[#EEF1FF] text-[#3B52D4]" : "border-slate-200 text-slate-500 hover:border-[#3B52D4]/30 hover:text-[#3B52D4] hover:bg-[#EEF1FF]"].join(" ")}>
                {isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                {isSaved ? "محفوظ" : "حفظ"}
              </button>

              <button type="button" onClick={onShare} className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors">
                <Share2 className="h-3 w-3" />
                مشاركة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [rsvpedSlugs, setRsvpedSlugs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [period, setPeriod] = useState<Period>("all")
  const [activeTab, setActiveTab] = useState<"all" | "registered">("all")

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [eventsRes, rsvpRes] = await Promise.all([
        api.get<PaginatedEvents>("/member/events/catalog", { params: { period: period === "all" ? undefined : period } }),
        api.get<{ data: MemberRsvpRecord[] }>("/member/events/rsvps").catch(() => ({ data: [] as MemberRsvpRecord[] })),
      ])
      setEvents(eventsRes.data ?? [])
      setSaved(new Set((eventsRes.data ?? []).filter((e) => e.is_saved).map((e) => e.slug)))
      setRsvpedSlugs(new Set((rsvpRes.data ?? []).map((entry) => entry.event.slug)))
    } catch {
      toast("تعذر تحميل الفعاليات.", "error")
    } finally {
      setIsLoading(false)
    }
  }, [period, toast])

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
      toast("تعذر تحديث حالة الحفظ.", "error")
    } finally {
      setSavingSlug(null)
    }
  }, [toast])

  const onShare = useCallback(async (slug: string) => {
    try {
      const res = await api.post<{ data?: { share_url?: string } }>(`/member/events/${slug}/share`)
      const url = res.data?.share_url || `${window.location.origin}/events/${slug}`
      await navigator.clipboard.writeText(url)
      toast("تم نسخ رابط الفعالية.", "success")
    } catch {
      toast("تعذر نسخ الرابط.", "error")
    }
  }, [toast])

  const onRsvp = useCallback(async (slug: string) => {
    setBusySlug(slug)
    try {
      const res = await api.post<{ message: string }>(`/member/events/${slug}/rsvp`, {
        attendance_type: "in_person",
        reason_to_attend: "",
        what_user_is_looking_for: "",
        allow_ai_networking_suggestions: true,
        calendar_sync_option: "ics",
      })
      toast(res.message ?? "تم تأكيد التسجيل.", "success")
      setRsvpedSlugs((prev) => new Set(prev).add(slug))
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "تعذر إتمام التسجيل.", "error")
    } finally {
      setBusySlug(null)
    }
  }, [toast])

  const onCancel = useCallback(async (slug: string) => {
    setBusySlug(slug)
    try {
      await api.delete(`/member/events/${slug}/rsvp`)
      toast("تم إلغاء التسجيل.", "info")
      setRsvpedSlugs((prev) => { const n = new Set(prev); n.delete(slug); return n })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "تعذر إلغاء التسجيل.", "error")
    } finally {
      setBusySlug(null)
    }
  }, [toast])

  const upcoming = events.filter((e) => !["completed", "cancelled"].includes(e.status ?? ""))
  const registered = upcoming.filter((e) => rsvpedSlugs.has(e.slug))
  const displayed = activeTab === "registered" ? registered : upcoming

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-20 justify-center">
        <span className="w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" />
        <span className="text-slate-500 text-sm font-bold">جاري تحميل الفعاليات…</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#3B52D4] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
            الفعاليات
          </div>
          <h1 className="text-xl font-black text-slate-900">فعاليات الشبكة</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{upcoming.length} فعالية قادمة · {registered.length} مسجل بها</p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          {(["all", "registered"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={["px-3 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === tab ? "bg-white text-[#3B52D4] shadow-sm border border-slate-200/80" : "text-slate-500 hover:text-slate-700"].join(" ")}>
              {tab === "all" ? `القادمة (${upcoming.length})` : `المسجل بها (${registered.length})`}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button key={p.value} type="button" onClick={() => setPeriod(p.value)} className={["px-3 h-7 rounded-xl text-xs font-extrabold border transition-all", period === p.value ? "bg-[#3B52D4] border-[#2E44C8] text-white shadow-sm shadow-[#3B52D4]/20" : "border-slate-200 text-slate-500 hover:border-[#3B52D4]/30 hover:text-[#3B52D4] bg-white"].join(" ")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-white/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] border border-[#E4E7F0]"><CalendarDays className="h-5 w-5 text-[#3B52D4]" /></div>
          <p className="text-sm font-bold text-slate-500">{activeTab === "registered" ? "لم تسجل في أي فعالية بعد." : "لا توجد فعاليات قادمة حالياً."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRegistered={rsvpedSlugs.has(event.slug)}
              isSaved={saved.has(event.slug)}
              isBusy={busySlug === event.slug}
              isSaving={savingSlug === event.slug}
              onRsvp={() => onRsvp(event.slug)}
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
