"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Globe2, List, MapPin, Search, Users, Video } from "lucide-react"
import { PROGRAM_END, PROGRAM_START, programTracks, type CalendarKind, type ProgramTrack } from "@/data/founder-calendar"
import { acceleratorBreak, cohortMilestones, ecosystemCalendarEntries, internationalCalendarHolidays, isAcceleratorOff, calendarDateLabel, calendarMonthDays, entriesOnDate, plannedFounderSessions, publishedCalendarEntries, riyadhDate, saudiCalendarHolidays, shiftCalendarMonth, type CalendarEntry, type EcosystemRegion } from "@/lib/founder-calendar"
import { useLocale } from "@/lib/locale"
import type { Event } from "@/types"

const tracks: ProgramTrack[] = ["learning", "visit", "peer", "online"]
const trackIcons = { learning: BookOpen, visit: MapPin, peer: Users, online: Video }
const styles: Record<CalendarKind, { badge: string; dot: string }> = {
  learning: { badge: "bg-indigo-50 text-indigo-800 border-indigo-200", dot: "bg-indigo-600" },
  visit: { badge: "bg-teal-50 text-teal-800 border-teal-200", dot: "bg-teal-600" },
  peer: { badge: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200", dot: "bg-fuchsia-600" },
  online: { badge: "bg-sky-50 text-sky-800 border-sky-200", dot: "bg-sky-600" },
  holiday: { badge: "bg-amber-50 text-amber-900 border-amber-200", dot: "bg-amber-600" },
  international: { badge: "bg-orange-50 text-orange-900 border-orange-200", dot: "bg-orange-600" },
  break: { badge: "bg-amber-100 text-amber-950 border-amber-300", dot: "bg-amber-700" },
  milestone: { badge: "bg-violet-100 text-violet-900 border-violet-300", dot: "bg-violet-700" },
  published: { badge: "bg-slate-100 text-slate-800 border-slate-300", dot: "bg-slate-600" },
  ecosystem: { badge: "bg-emerald-50 text-emerald-900 border-emerald-300", dot: "bg-emerald-600" },
}
const planned = plannedFounderSessions()
const externalEvents = ecosystemCalendarEntries()
const subscribeToday = (callback: () => void) => {
  const interval = window.setInterval(callback, 60_000)
  window.addEventListener("focus", callback)
  return () => { window.clearInterval(interval); window.removeEventListener("focus", callback) }
}
const todaySnapshot = () => riyadhDate(Date.now())
const serverSnapshot = () => PROGRAM_START

export function FounderCalendar({ events, now, loading, error, retry }: { events: Event[]; now: number; loading: boolean; error: boolean; retry: () => void }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const today = useSyncExternalStore(subscribeToday, todaySnapshot, serverSnapshot)
  const [chosenMonth, setChosenMonth] = useState<string | null>(null)
  const [chosenDate, setChosenDate] = useState<string | null>(null)
  const [view, setView] = useState<"calendar" | "agenda">("calendar")
  const [kind, setKind] = useState<CalendarKind | "all">("all")
  const [region, setRegion] = useState<EcosystemRegion | "all">("all")
  const [specialAccess, setSpecialAccess] = useState(false)
  const [query, setQuery] = useState("")
  const month = chosenMonth || today.slice(0, 7)
  const selectedDate = chosenDate || today
  const year = Number(month.slice(0, 4))
  const allEntries = useMemo(() => [...planned, acceleratorBreak, ...cohortMilestones, ...saudiCalendarHolidays(year), ...internationalCalendarHolidays(year), ...publishedCalendarEntries(events, now), ...externalEvents], [events, now, year])
  const visible = allEntries.filter((entry) =>
    (kind === "all" || kind === entry.kind)
    && (region === "all" || entry.ecosystem?.region === region)
    && (!specialAccess || entry.ecosystem?.access === "invitation" || entry.ecosystem?.access === "application")
    && [entry.title.ar, entry.title.en, entry.description.ar, entry.description.en, entry.location?.ar, entry.location?.en, entry.ecosystem?.organizer, entry.kind === "published" ? entry.event?.location : ""]
      .filter(Boolean).join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const days = calendarMonthDays(month)
  const monthEnd = days.filter((date) => date.startsWith(month)).at(-1)!
  const monthEntries = visible.filter((entry) => entry.date <= monthEnd && (entry.endDate || entry.date) >= `${month}-01`).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  const selectedEntries = entriesOnDate(visible, selectedDate)
  const nextSession = planned.find((entry) => entry.date >= today)
  const label = (value: CalendarKind) => {
    if (value === "holiday") return ar ? "المناسبات السعودية" : "Saudi holidays"
    if (value === "international") return ar ? "مناسبات دولية" : "International occasions"
    if (value === "break") return ar ? "إجازات المسرّعة" : "Accelerator off days"
    if (value === "milestone") return ar ? "محطات البرنامج" : "Program milestones"
    if (value === "published") return ar ? "فعاليات المجتمع" : "Community events"
    if (value === "ecosystem") return ar ? "مؤتمرات وفرص عالمية" : "Global conferences & opportunities"
    return programTracks[value].title[locale]
  }
  const dateLabel = (date: string) => calendarDateLabel(date, locale, { weekday: "long", year: "numeric" })
  const monthLabel = calendarDateLabel(`${month}-01`, locale, { day: undefined, month: "long", year: "numeric" })
  const tbd = ar ? "يُحدد لاحقًا (TBD)" : "TBD"
  const periodText = `${calendarDateLabel(PROGRAM_START, locale, { year: "numeric" })} – ${calendarDateLabel(PROGRAM_END, locale, { year: "numeric" })}`

  function navigateMonth(delta: number) {
    const next = shiftCalendarMonth(month, delta)
    if (next < "2025-10" || next > "2029-10") return
    setChosenMonth(next)
    setChosenDate(next === today.slice(0, 7) ? today : `${next}-01`)
  }

  function entryCard(entry: CalendarEntry) {
    const isPlan = entry.status === "planned"
    const isHoliday = ["holiday", "international", "break"].includes(entry.kind)
    return <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm" data-calendar-entry={entry.id}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className={`rounded-lg border px-2.5 py-1 ${styles[entry.kind].badge}`}>{label(entry.kind)}</span>
        <span className="text-slate-500">{isPlan ? (ar ? "مخطط · التفاصيل لاحقًا" : "Planned · details TBD") : entry.status === "tentative" ? (ar ? "تاريخ تقديري" : "Tentative date") : entry.status === "fixed" ? (ar ? "تاريخ ثابت" : "Fixed date") : entry.status === "scheduled" ? (ar ? "مجدول · التفاصيل لاحقًا" : "Scheduled · details TBA") : (ar ? "منشورة" : "Published")}</span>
      </div>
      <time dateTime={entry.date} className="text-xs font-semibold text-slate-500">{dateLabel(entry.date)}{entry.endDate && entry.endDate !== entry.date ? ` – ${dateLabel(entry.endDate)}` : ""}</time>
      <h4 className="mt-2 text-base font-extrabold leading-relaxed text-slate-900">{entry.title[locale]}</h4>
      <p className="mt-2 text-sm leading-7 text-slate-600">{entry.description[locale]}</p>
      {isPlan && <>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span>{ar ? `الأسبوع ${entry.week} من 26` : `Week ${entry.week} of 26`}</span><span aria-hidden="true">·</span>
          <span>{programTracks[entry.kind as ProgramTrack].audience[locale]}</span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
          {[
            [ar ? "الوقت · الرياض" : "Time · Riyadh", tbd],
            [ar ? "المضيف / الميسّر" : "Host / facilitator", tbd],
            [entry.kind === "online" ? (ar ? "رابط الانضمام" : "Joining link") : (ar ? "الموقع / صيغة اللقاء" : "Venue / format"), tbd],
            [ar ? "التسجيل" : "Registration", tbd],
          ].map(([term, value]) => <div key={term}><dt className="text-slate-500">{term}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>)}
        </dl>
      </>}
      {entry.kind === "milestone" && <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-violet-50 p-3 text-xs">
        <div className="col-span-2"><dt className="text-slate-500">{ar ? "الموقع" : "Location"}</dt><dd className="mt-1 font-bold text-slate-800">{entry.location?.[locale]}</dd></div>
        <div><dt className="text-slate-500">{ar ? "الوقت · الرياض" : "Time · Riyadh"}</dt><dd className="mt-1 font-bold text-slate-800">{ar ? "يُعلن لاحقًا (TBA)" : "TBA"}</dd></div>
        <div><dt className="text-slate-500">{ar ? "التسجيل والبرنامج" : "Registration & agenda"}</dt><dd className="mt-1 font-bold text-slate-800">{ar ? "يُعلن لاحقًا (TBA)" : "TBA"}</dd></div>
      </dl>}
      {isHoliday && entry.source && <a href={entry.source} target="_blank" rel="noreferrer noopener" className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "مرجع التاريخ" : "Date reference"}<Globe2 size={14} aria-hidden="true" /></a>}
      {entry.event && <Link href={`/events/${encodeURIComponent(entry.event.slug)}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B52D4]">{ar ? "تفاصيل الفعالية" : "Event details"}{ar ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Link>}
    </article>
  }

  return <section id="founder-calendar" aria-labelledby="founder-calendar-title" className="scroll-mt-24 bg-[#F5F7FF] px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-extrabold tracking-wide text-[#3B52D4]">{ar ? "تعلّم. زُر. شارك. انمُ." : "LEARN. EXPLORE. CONNECT. GROW."}</p>
          <h2 id="founder-calendar-title" className="text-2xl font-black text-slate-900 sm:text-3xl">{ar ? "تقويم نمو المؤسسين" : "Your founder growth calendar"}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{ar ? "26 أسبوعًا للتعلّم بموضوعات مختلفة، مع إجازة رمضان ومحطات رئيسية في مايو." : "26 learning weeks, each with its own focus, a Ramadan break, and key milestones in May."}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-xs leading-6 text-slate-600"><strong className="block text-slate-900">{ar ? "فترة التعلّم المقترحة" : "Proposed learning window"}</strong>{periodText}<span className="block">{ar ? "جميع المواعيد بتوقيت الرياض (UTC+3)" : "All dates in Riyadh time (UTC+3)"}</span></div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tracks.map((track) => { const Icon = trackIcons[track]; return <button type="button" key={track} onClick={() => setKind(kind === track ? "all" : track)} aria-pressed={kind === track} className={`rounded-2xl border p-4 text-start transition-shadow sm:p-5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${kind === track ? styles[track].badge : "border-slate-200 bg-white text-slate-800"}`}>
          <span className="mb-4 flex items-center justify-between gap-3"><Icon size={22} aria-hidden="true" /><span className="text-xs font-semibold">{track === "online" ? (ar ? "13 ورشة" : "13 workshops") : (ar ? "26 لقاءً" : "26 sessions")}</span></span>
          <span className="block text-sm font-extrabold">{programTracks[track].cadence[locale]}</span>
          <span className="mt-1 block text-sm">{programTracks[track].title[locale]}</span>
          <span className="mt-3 block text-xs leading-5 opacity-80">{programTracks[track].audience[locale]}</span>
        </button> })}
      </div>

      <div role="group" className="mb-8 grid gap-3 lg:grid-cols-3" aria-label={ar ? "الإجازات والمحطات الرئيسية" : "Breaks and key milestones"}>
        {[acceleratorBreak, ...cohortMilestones].map((entry) => <button type="button" key={entry.id} onClick={() => { setChosenMonth(entry.date.slice(0, 7)); setChosenDate(entry.date); setKind("all"); setQuery(""); setView("calendar"); document.getElementById("calendar-month-panel")?.scrollIntoView({ block: "start" }) }} className={`rounded-2xl border p-5 text-start ${styles[entry.kind].badge}`}>
          <span className="block text-xs font-bold">{calendarDateLabel(entry.date, locale, { year: "numeric" })}{entry.endDate ? ` – ${calendarDateLabel(entry.endDate, locale, { year: "numeric" })}` : ""}</span>
          <span className="mt-2 block text-base font-extrabold leading-7">{entry.title[locale]}</span>
          <span className="mt-2 block text-xs leading-6">{entry.kind === "break" ? (ar ? "لا أنشطة للمسرّعة" : "No accelerator activities") : entry.location?.[locale]}</span>
        </button>)}
      </div>

      <div id="calendar-month-panel" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_60px_-30px_rgba(59,82,212,0.25)]">
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigateMonth(-1)} aria-label={ar ? "الشهر السابق" : "Previous month"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">{ar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
              <h3 aria-live="polite" className="min-w-32 text-center text-lg font-extrabold text-slate-900 sm:min-w-44">{monthLabel}</h3>
              <button type="button" onClick={() => navigateMonth(1)} aria-label={ar ? "الشهر التالي" : "Next month"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">{ar ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setChosenMonth(null); setChosenDate(null) }} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700">{ar ? "اليوم" : "Today"}</button>
              <div role="group" className="flex rounded-xl bg-slate-100 p-1" aria-label={ar ? "طريقة العرض" : "Calendar view"}>
                {(["calendar", "agenda"] as const).map((value) => <button type="button" key={value} onClick={() => setView(value)} aria-pressed={view === value} className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold ${view === value ? "bg-white text-[#3B52D4] shadow-sm" : "text-slate-600"}`}>{value === "calendar" ? <CalendarDays size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}{value === "calendar" ? (ar ? "التقويم" : "Calendar") : (ar ? "الأجندة" : "Agenda")}</button>)}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 sm:flex-1">{ar ? "ابحث في هذا الشهر" : "Search this month"}<span className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={16} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "موضوع أو فعالية…" : "Topic or event…"} className="w-full min-w-0 bg-transparent py-3 text-sm font-normal text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" /></span></label>
            <label className="w-full text-xs font-bold text-slate-600 sm:w-auto">{ar ? "نوع النشاط" : "Activity type"}<select value={kind} onChange={(event) => setKind(event.target.value as CalendarKind | "all")} className="mt-2 block min-h-11 w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900"><option value="all">{ar ? "كل الأنشطة" : "All activities"}</option>{([...tracks, "break", "milestone", "holiday", "international", "published"] as CalendarKind[]).map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            {(query || kind !== "all") && <button type="button" className="min-h-11 px-2 text-xs font-bold text-[#3B52D4] underline" onClick={() => { setQuery(""); setKind("all") }}>{ar ? "مسح التصفية" : "Clear filters"}</button>}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-600">{([...tracks, "break", "milestone", "holiday", "international", "published"] as CalendarKind[]).map((value) => <span key={value} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className={`size-2 rounded-full ${styles[value].dot}`} />{label(value)}</span>)}</div>
        </div>

        {view === "calendar" ? <div className="grid xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="min-w-0 p-2 sm:p-5">
            <table className="w-full table-fixed border-separate border-spacing-1" aria-label={monthLabel}>
              <thead><tr>{Array.from({ length: 7 }, (_, index) => <th key={index} scope="col" className="pb-3 text-center text-[10px] font-bold text-slate-500 sm:text-xs">{calendarDateLabel(`2026-10-${11 + index}`, locale, { weekday: "short", month: undefined, day: undefined })}</th>)}</tr></thead>
              <tbody>{Array.from({ length: days.length / 7 }, (_, week) => <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((date) => {
                const entries = entriesOnDate(visible, date)
                const inMonth = date.startsWith(month)
                const offDay = isAcceleratorOff(date)
                return <td key={date} className="align-top"><button type="button" disabled={!inMonth} onClick={() => setChosenDate(date)} aria-pressed={selectedDate === date} aria-current={date === today ? "date" : undefined} className={`flex h-[76px] w-full min-w-0 flex-col rounded-xl border p-1.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:h-[116px] sm:p-2 ${!inMonth ? "border-transparent text-slate-300" : selectedDate === date ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : offDay ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"}`}>
                  <span className="sr-only">{`${dateLabel(date)}${offDay ? (ar ? " · إجازة المسرّعة" : " · Accelerator off day") : ""} · ${entries.length} ${ar ? "نشاط" : "activities"}${entries.length ? `: ${entries.map((entry) => entry.title[locale]).join("; ")}` : ""}`}</span><span aria-hidden="true" className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs font-bold ${date === today ? "bg-[#3B52D4] text-white" : ""}`}>{new Intl.NumberFormat(locale).format(Number(date.slice(-2)))}</span>
                  {inMonth && <><span className="flex flex-wrap gap-1 sm:hidden" aria-hidden="true">{entries.slice(0, 4).map((entry) => <span key={entry.id} className={`size-1.5 rounded-full ${styles[entry.kind].dot}`} />)}</span><span className="hidden w-full space-y-1 sm:block" aria-hidden="true">{entries.slice(0, 2).map((entry) => <span key={entry.id} className={`block truncate rounded px-1 py-1 text-[10px] font-semibold ${styles[entry.kind].badge}`}>{entry.title[locale]}</span>)}</span>{entries.length > 2 && <span aria-hidden="true" className="mt-1 hidden text-[10px] text-slate-500 sm:block">+{entries.length - 2}</span>}</>}
                </button></td>
              })}</tr>)}</tbody>
            </table>
          </div>
          <aside aria-label={ar ? "تفاصيل اليوم المحدد" : "Selected day details"} className="min-w-0 border-t border-slate-200 bg-slate-50/70 p-4 sm:p-5 xl:border-s xl:border-t-0" aria-live="polite">
            <p className="text-xs font-bold text-[#3B52D4]">{ar ? "يومك في وصول" : "YOUR DAY AT WOSOOL"}</p>
            <h3 className="mt-2 mb-5 text-lg font-extrabold text-slate-900">{dateLabel(selectedDate)}</h3>
            <div className="space-y-4">{selectedEntries.length ? selectedEntries.map(entryCard) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm leading-7 text-slate-500"><CalendarDays className="mb-4 text-slate-400" aria-hidden="true" />{ar ? "لا توجد أنشطة معروضة لهذا اليوم ضمن التصفية الحالية." : "No activities shown for this day with the current filters."}{nextSession && <button type="button" onClick={() => { setChosenMonth(nextSession.date.slice(0, 7)); setChosenDate(nextSession.date); setKind("all"); setQuery("") }} className="mt-4 block min-h-11 text-start font-bold text-[#3B52D4]">{ar ? "عرض اللقاء المخطط القادم" : "View next planned session"}</button>}</div>}</div>
          </aside>
        </div> : <div className="p-4 sm:p-6"><p role="status" className="mb-5 text-sm text-slate-600">{ar ? `${monthEntries.length} نشاط في ${monthLabel}` : `${monthEntries.length} activities in ${monthLabel}`}</p>{monthEntries.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{monthEntries.map(entryCard)}</div> : <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{ar ? "لا توجد أنشطة مطابقة في هذا الشهر." : "No matching activities this month."}</p>}</div>}

        {(loading || error) && <div className="space-y-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 text-xs leading-6 text-slate-600">
          {loading && <p role="status">{ar ? "جارٍ تحميل فعاليات المجتمع…" : "Loading community events…"}</p>}
          {error && <p role="status">{ar ? "تعذر تحميل بعض فعاليات المجتمع؛ خطة البرنامج والإجازات متاحة." : "Some community events could not be loaded; the program plan and holidays remain available."} <button type="button" onClick={retry} className="min-h-11 px-2 font-bold text-[#3B52D4] underline">{ar ? "إعادة المحاولة" : "Retry"}</button></p>}
        </div>}
      </div>
    </div>
  </section>
}
