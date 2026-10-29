"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Search, ArrowUpRight, Users } from "lucide-react"
import { PageHero, heroPrimary, heroSecondary } from "@/components/sections/PageHero"
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
  const ar = locale === "ar"
  const copy = eventsPageCopy[locale]
  const [activeTab, setActiveTab] = useState(0)
  const [query, setQuery] = useState("")
  const [period, setPeriod] = useState<"upcoming" | "past">("upcoming")
  const upcoming = usePublicEvents("upcoming")
  const past = usePublicEvents("past")
  const { events: allEvents, loading, error, retry } = period === "upcoming" ? upcoming : past
  const calendarEvents = useMemo(() => Array.from(new Map([...upcoming.events, ...past.events].map((event) => [event.id, event])).values()), [upcoming.events, past.events])
  const now = useEventNow()
  const events = eventsForPeriod(allEvents, period, now)
  const filtered = events.filter((event) =>
    (activeTab === 0 || (activeTab === 1 && event.isVirtual) || (activeTab === 2 && !event.isVirtual) || (activeTab === 3 && !event.isPublic)) &&
    [event.title, event.description, event.location, ...event.tags].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  )
  const hasFilters = activeTab !== 0 || Boolean(query.trim())

  return (
    <PublicLayout>
      <PageHero
        eyebrow={ar ? "لقاءات وصول" : "WOSOOL EVENTS"}
        title={ar ? "لقاؤك القادم يبدأ هنا." : "Find your next connection."}
        description={ar ? "تعلّم مع المؤسسين، واكتشف مؤتمرات وفرصًا توسّع أعمالك." : "Learn with fellow founders. Discover conferences and conversations that move your business forward."}
        actions={<>
          <a href="#founder-calendar" className={heroPrimary}><CalendarDays size={18} aria-hidden="true" />{ar ? "استكشف التقويم" : "Explore the calendar"}</a>
          <a href="#community-events" className={heroSecondary}><Users size={18} aria-hidden="true" />{ar ? "فعاليات المجتمع" : "Community events"}</a>
        </>}
      />

      <FounderCalendar events={calendarEvents} now={now} loading={upcoming.loading || past.loading} error={upcoming.error || past.error} retry={() => { upcoming.retry(); past.retry() }} />

      <section id="community-events" aria-labelledby="community-events-title" className="scroll-mt-28 bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="community-events-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{ar ? "لقاءات مجتمع وصول" : "Meet the Wosool community"}</h2>
            <div role="group" className="flex rounded-xl bg-slate-100 p-1" aria-label={ar ? "فترة الفعاليات" : "Event period"}>
              {(["upcoming", "past"] as const).map((value) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className={`min-h-11 rounded-lg px-4 text-sm font-bold ${period === value ? "bg-white text-[#3B52D4] shadow-sm" : "text-slate-600"}`}>
                {value === "upcoming" ? (ar ? "القادمة" : "Upcoming") : (ar ? "السابقة" : "Past")}
              </button>)}
            </div>
          </div>
          <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 md:w-72">{ar ? "ابحث عن لقاء" : "Find a community event"}
              <span className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-indigo-500"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "موضوع أو مدينة…" : "Topic or city…"} className="w-full min-w-0 bg-transparent py-3 text-base font-normal text-slate-900 outline-none" /></span>
            </label>
            <div role="group" aria-label={ar ? "نوع اللقاء" : "Community event type"} className="flex flex-wrap gap-2">
              {copy.tabs.map((tab, i) => <button key={tab} type="button" aria-pressed={activeTab === i} onClick={() => setActiveTab(i)} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${activeTab === i ? "border-[#3B52D4] bg-[#3B52D4] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>{tab}</button>)}
            </div>
            {hasFilters && <button type="button" onClick={() => { setActiveTab(0); setQuery("") }} className="min-h-11 text-sm font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "مسح التصفية" : "Clear filters"}</button>}
          </div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <p role="status" className="rounded-2xl bg-slate-50 px-6 py-12 text-center text-slate-600">{ar ? "جارٍ تحميل الفعاليات…" : "Loading events…"}</p> : error ? (
              <div className="rounded-2xl border border-slate-200 p-8 text-center"><p role="alert" className="text-slate-700">{ar ? "تعذر تحميل الفعاليات. حاول مجددًا." : "Unable to load events. Please try again."}</p><Button type="button" onClick={retry} className="mt-4">{ar ? "إعادة المحاولة" : "Try again"}</Button></div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <CalendarDays className="mx-auto mb-4 text-slate-400" size={28} aria-hidden="true" />
                <p className="font-bold text-slate-800">{hasFilters ? (ar ? "لا توجد لقاءات تطابق بحثك." : "No events match your search.") : period === "past" ? (ar ? "لا توجد لقاءات سابقة معروضة حاليًا." : "No past community events are listed yet.") : (ar ? "ترقّب لقاءات المجتمع القادمة." : "More community events are on the way.")}</p>
                {hasFilters ? <button type="button" onClick={() => { setActiveTab(0); setQuery("") }} className="mt-3 min-h-11 font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "عرض كل اللقاءات" : "Show all community events"}</button> : <a href="#founder-calendar" className="mt-3 inline-flex min-h-11 items-center font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "استكشف المؤتمرات وخطة البرنامج" : "Explore conferences and the programme"}</a>}
              </div>
            ) : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((event) => <EventCard key={event.id} event={event} now={now} />)}</div>}
          </div>
        </div>
      </section>

      <section aria-labelledby="host-event-title" className="border-t border-slate-200 bg-[#F5F7FF] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl"><h2 id="host-event-title" className="text-xl font-extrabold text-slate-900">{ar ? "لديك تجربة تستحق المشاركة؟" : "Have something worth sharing?"}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{ar ? "اقترح لقاءً أو استضف زيارة لشركتك مع مجتمع وصول." : "Suggest a session or welcome the Wosool community into your company."}</p></div>
          <Link href="/contact" className={`${heroSecondary} justify-center`}>{copy.cta}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </PublicLayout>
  )
}
