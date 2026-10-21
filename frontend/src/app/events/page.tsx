"use client"

import { useMemo, useState } from "react"
import { PageHero } from "@/components/sections/PageHero"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FounderCalendar } from "@/components/events/FounderCalendar"
import { EventCard } from "@/components/sections/EventCard"
import { Button } from "@/components/ui/button"
import { eventsPageCopy } from "@/data/localized-seed"
import { usePublicEvents } from "@/lib/use-public-events"
import { eventsForPeriod } from "@/lib/event-time"
import { useEventNow } from "@/lib/use-event-now"
import { useLocale } from "@/lib/locale"

export default function EventsPage() {
  const { locale } = useLocale()
  const copy = eventsPageCopy[locale]
  const [activeTab, setActiveTab] = useState(0)
  const [period, setPeriod] = useState<"upcoming" | "past">("upcoming")
  const upcoming = usePublicEvents("upcoming")
  const past = usePublicEvents("past")
  const { events: allEvents, loading, error, retry } = period === "upcoming" ? upcoming : past
  const calendarEvents = useMemo(() => Array.from(new Map([...upcoming.events, ...past.events].map((event) => [event.id, event])).values()), [upcoming.events, past.events])
  const now = useEventNow()
  const events = eventsForPeriod(allEvents, period, now)

  const virtualEvents   = events.filter((e) =>  e.isVirtual)
  const inPersonEvents  = events.filter((e) => !e.isVirtual)
  const membersOnly     = events.filter((e) => !e.isPublic)

  const filtered =
    activeTab === 0 ? events :
    activeTab === 1 ? virtualEvents :
    activeTab === 2 ? inPersonEvents :
    membersOnly

  return (
    <PublicLayout>
      <PageHero
        eyebrow={locale === "ar" ? "تقويم وصول ومسرّعة EO الرياض" : "Wosool and EO Riyadh Accelerator calendar"}
        title={locale === "ar" ? "لقاءات أسبوعية مع مؤسسين يبنون شركات حقيقية" : "Weekly sessions with founders who are building real companies"}
        description={locale === "ar" ? "جلسات تعلّم وزيارات للشركات ونقاشات بين الأقران، مرتبة حسب الأسبوع مع مراعاة الإجازات الرسمية في السعودية." : "Learning sessions, company visits and peer discussions, laid out week by week around Saudi public holidays."}
      />

      <FounderCalendar events={calendarEvents} now={now} loading={upcoming.loading || past.loading} error={upcoming.error || past.error} retry={() => { upcoming.retry(); past.retry() }} />

      {/* ── Tab filter ── */}
      <div
        className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5"
        style={{ boxShadow: "0 2px 8px -2px rgba(15,22,40,0.04)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div role="group" className="mb-3 flex gap-2" aria-label={locale === "ar" ? "الفترة" : "Event period"}>
            {(["upcoming", "past"] as const).map((value) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${period === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {value === "upcoming" ? (locale === "ar" ? "الفعاليات القادمة" : "Upcoming events") : (locale === "ar" ? "الفعاليات السابقة" : "Past events")}
            </button>)}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {copy.tabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                aria-pressed={activeTab === i}
                onClick={() => setActiveTab(i)}
                className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all"
                style={
                  activeTab === i
                    ? { background: "#3B52D4", color: "#fff", boxShadow: "0 4px 12px -2px rgba(59,82,212,0.3)" }
                    : { background: "#F8FAFC", color: "#64748b", border: "1px solid #E2E8F0" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Events grid ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {period === "past" ? (locale === "ar" ? "الأرشيف" : "Archive") : copy.eyebrow}
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{period === "past" ? (locale === "ar" ? "الفعاليات السابقة" : "Past events") : (locale === "ar" ? "فعاليات المجتمع القادمة" : "Upcoming community events")}</h2>
            </div>
            <span className="shrink-0 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>

          {loading ? <p role="status" className="py-12 text-center text-slate-600">{locale === "ar" ? "جارٍ تحميل الفعاليات…" : "Loading events…"}</p> : error ? (
            <div className="rounded-2xl border border-slate-200 p-8 text-center"><p role="alert" className="text-slate-700">{locale === "ar" ? "تعذر تحميل الفعاليات. حاول مجددًا." : "Unable to load events. Please try again."}</p><Button type="button" onClick={retry} className="mt-4">{locale === "ar" ? "إعادة المحاولة" : "Try again"}</Button></div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600 font-medium">
                {locale === "ar" ? "لا توجد فعاليات في هذه الفئة" : "No events in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} now={now} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Suggest an event ── */}
      <section className="py-16 px-4 bg-[#F5F7FF]">
        <div className="mx-auto max-w-5xl">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/90 border border-slate-200/80 rounded-2xl px-8 py-8"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
          >
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                {locale === "ar" ? "للمجتمع" : "Community"}
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">{copy.ctaTitle}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{copy.ctaBody}</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold shrink-0"
            >
              <Link href="/contact">{copy.cta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Member CTA ── */}
      <section className="py-20 px-4 bg-slate-50/60">
        <div className="mx-auto max-w-2xl">
          <div
            className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-8 py-12 text-center relative overflow-hidden"
            style={{ boxShadow: "0 8px 40px -8px rgba(59,82,212,0.1)" }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#3B52D4]/6 blur-[80px]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {locale === "ar" ? "العضوية" : "Membership"}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.memberTitle}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">{copy.memberBody}</p>
              <Button
                asChild
                className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
              >
                <Link href="/apply">{copy.memberCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
