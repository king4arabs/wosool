"use client"

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Globe2, List, MapPin, Search, SlidersHorizontal, ChevronDown, Users, Video } from "lucide-react"
import { PROGRAM_END, PROGRAM_START, programTracks, type CalendarKind, type ProgramTrack } from "@/data/founder-calendar"
import { acceleratorBreak, addCalendarDays, cohortMilestones, ecosystemCalendarEntries, internationalCalendarHolidays, isAcceleratorOff, calendarDateLabel, calendarMonthDays, entriesOnDate, plannedFounderSessions, publishedCalendarEntries, riyadhDate, saudiCalendarHolidays, shiftCalendarMonth, type CalendarEntry, type EcosystemRegion } from "@/lib/founder-calendar"
import { useLocale } from "@/lib/locale"
import { formatEventTime } from "@/lib/event-registration"
import { calendarAgendaEntries, nextCalendarEntry } from "@/lib/calendar-discovery"
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
const organizerCalendars = [
  { en: "Monsha'at SME events", ar: "فعاليات منشآت لدعم رواد الأعمال", url: "https://www.monshaat.gov.sa/en/node/435054" },
  { en: "LEAP conferences", ar: "مؤتمرات ليب", url: "https://onegiantleap.com/" },
  { en: "Web Summit events", ar: "فعاليات ويب سامت", url: "https://websummit.com/" },
  { en: "Tech Week city calendars", ar: "تقويمات أسبوع التقنية العالمية", url: "https://www.tech-week.com/calendar" },
  { en: "FII Institute conferences", ar: "مؤتمرات معهد مبادرة مستقبل الاستثمار", url: "https://fii-institute.org/" },
] as const
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
  const [view, setView] = useState<"calendar" | "agenda">("agenda")
  const [includePast, setIncludePast] = useState(false)
  const [kind, setKind] = useState<CalendarKind | "all">("all")
  const [region, setRegion] = useState<EcosystemRegion | "all">("all")
  const [focus, setFocus] = useState<"all" | "startups" | "tech" | "investment" | "fintech" | "commerce" | "cyber">("all")
  const [specialAccess, setSpecialAccess] = useState(false)
  const [query, setQuery] = useState("")
  const month = chosenMonth || today.slice(0, 7)
  const selectedDate = chosenDate || today
  const year = Number(month.slice(0, 4))
  const allEntries = useMemo(() => [...planned, acceleratorBreak, ...cohortMilestones, ...saudiCalendarHolidays(year), ...internationalCalendarHolidays(year), ...publishedCalendarEntries(events, now), ...externalEvents], [events, now, year])
  const visible = allEntries.filter((entry) =>
    (kind === "all" || kind === entry.kind)
    && (region === "all" || entry.ecosystem?.region === region)
    && (focus === "all" || entry.ecosystem?.focus === focus)
    && (!specialAccess || entry.ecosystem?.access === "invitation" || entry.ecosystem?.access === "application")
    && [entry.title.ar, entry.title.en, entry.description.ar, entry.description.en, entry.location?.ar, entry.location?.en, entry.ecosystem?.organizer, entry.kind === "published" ? entry.event?.location : ""]
      .filter(Boolean).join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const days = calendarMonthDays(month)
  const monthEntries = calendarAgendaEntries(visible, month, today, includePast)
  const selectedEntries = entriesOnDate(visible, selectedDate)
  const nextSession = nextCalendarEntry(visible, selectedDate > today ? selectedDate : today)
  const nextMatch = nextCalendarEntry(visible, shiftCalendarMonth(month, 1) + "-01")
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
  const periodText = `${calendarDateLabel(PROGRAM_START, locale, { year: "numeric" })} – ${calendarDateLabel(PROGRAM_END, locale, { year: "numeric" })}`

  function navigateMonth(delta: number) {
    const next = shiftCalendarMonth(month, delta)
    if (next < "2025-10" || next > "2029-10") return
    setChosenMonth(next)
    setChosenDate(next === today.slice(0, 7) ? today : `${next}-01`)
  }
  function navigateDay(delta: number) {
    const next = addCalendarDays(selectedDate, delta)
    if (next < "2025-10-01" || next > "2029-10-31") return
    setChosenDate(next)
    setChosenMonth(next.slice(0, 7))
  }

  function clearFilters() {
    setQuery(""); setKind("all"); setRegion("all"); setFocus("all"); setSpecialAccess(false)
  }
  function chooseKind(value: CalendarKind | "all") {
    setKind(value)
    if (value !== "ecosystem") { setRegion("all"); setFocus("all"); setSpecialAccess(false) }
  }
  function openEntry(entry: CalendarEntry) {
    const target = entry.date < selectedDate ? selectedDate : entry.date
    setChosenMonth(target.slice(0, 7)); setChosenDate(target); setView("calendar")
  }
  function entryCard(entry: CalendarEntry) {
    const isPlan = entry.status === "planned"
    const isHoliday = ["holiday", "international", "break"].includes(entry.kind)
    const access = entry.ecosystem?.access
    return <article key={entry.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-start sm:p-5" data-calendar-entry={entry.id}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`rounded-lg border px-2.5 py-1 ${styles[entry.kind].badge}`}>{label(entry.kind)}</span>
        {isPlan || entry.status === "scheduled" ? <span className="text-slate-600">{ar ? "التسجيل لم يُفتح بعد" : "Registration not open yet"}</span> : entry.status === "tentative" ? <span className="text-slate-600">{ar ? "تاريخ تقديري" : "Tentative date"}</span> : null}
      </div>
      <h4 className="text-base font-extrabold leading-7 text-slate-900">{entry.title[locale]}</h4>
      <time dateTime={entry.date} className="mt-2 block text-sm leading-6 text-slate-600">{dateLabel(entry.date)}{entry.endDate && entry.endDate !== entry.date ? ` – ${dateLabel(entry.endDate)}` : ""}</time>
      {(entry.location || entry.event?.location) && <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin size={16} className="mt-1 shrink-0" aria-hidden="true" /><span>{entry.location?.[locale] || entry.event?.location}</span></p>}
      {entry.event && <p className="mt-1 text-sm text-slate-600">{formatEventTime(entry.event.date, locale)}</p>}
      {access === "invitation" || access === "application" ? <p className="mt-2 text-sm font-semibold text-amber-800">{access === "invitation" ? (ar ? "بالدعوة فقط" : "Invitation only") : (ar ? "يتطلب طلب مشاركة" : "Application required")}</p> : null}
      {isPlan && <p className="mt-2 text-sm text-slate-600">{programTracks[entry.kind as ProgramTrack].audience[locale]}</p>}
      <details className="group mt-3 border-t border-slate-100 pt-1">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#3B52D4] [&::-webkit-details-marker]:hidden">
          {ar ? "تفاصيل اللقاء" : "Event information"}<span className="sr-only">: {entry.title[locale]}</span><ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p className="text-sm leading-7 text-slate-600">{entry.description[locale]}</p>
        {isPlan && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{ar ? "يُعلن وقت اللقاء والمضيف والموقع عند فتح التسجيل." : "Time, host and venue will be announced when registration opens."}</p>}
        {entry.ecosystem && <div className="mt-3 text-sm leading-7 text-slate-600" data-external-event={entry.id}>
          <p><span className="font-bold text-slate-900">{ar ? "المنظّم: " : "Organizer: "}</span>{entry.ecosystem.organizer}</p>
          <p>{access === "invitation" ? (ar ? "بالدعوة فقط · حسب اعتماد الجهة المنظمة" : "Invitation only · organizer approval required") : access === "application" ? (ar ? "يتطلب طلب مشاركة وموافقة المنظم" : "Participation requires organizer approval") : access === "trade" ? (ar ? "دخول الزوار المهنيين وفق شروط المنظم" : "Trade visitor access subject to organizer terms") : (ar ? "التسجيل عبر الجهة المنظمة" : "Register with the organizer")}</p>
        </div>}
        {isHoliday && entry.source && <a href={entry.source} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "مرجع التاريخ" : "Date reference"}<Globe2 size={14} aria-hidden="true" /></a>}
      </details>
      {entry.ecosystem && <a href={entry.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B52D4] underline underline-offset-4">{ar ? "الموقع الرسمي والتسجيل" : "Official site & registration"}<Globe2 size={15} aria-hidden="true" /></a>}
      {entry.event && <Link href={`/events/${encodeURIComponent(entry.event.slug)}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3B52D4]">{ar ? "عرض الفعالية والتسجيل" : "View event & registration"}{ar ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Link>}
    </article>
  }

  return <section id="founder-calendar" aria-labelledby="founder-calendar-title" className="scroll-mt-28 bg-[#F5F7FF] px-4 py-10 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="founder-calendar-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{ar ? "اختر ما يلهم خطوتك القادمة" : "Make room for what’s next"}</h2>
        <p className="text-sm text-slate-600">{ar ? "المؤتمرات · لقاءات المؤسسين · برامج النمو" : "Conferences · Founder sessions · Growth programmes"}</p>
      </div>

      <div id="calendar-month-panel" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_60px_-30px_rgba(59,82,212,0.25)]">
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button type="button" disabled={month <= "2025-10"} onClick={() => navigateMonth(-1)} aria-label={ar ? "الشهر السابق" : "Previous month"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{ar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
              <h3 aria-live="polite" className="min-w-32 text-center text-lg font-extrabold text-slate-900 sm:min-w-44">{monthLabel}</h3>
              <button type="button" disabled={month >= "2029-10"} onClick={() => navigateMonth(1)} aria-label={ar ? "الشهر التالي" : "Next month"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{ar ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setChosenMonth(null); setChosenDate(null) }} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700">{ar ? "اليوم" : "Today"}</button>
              <div role="group" className="flex rounded-xl bg-slate-100 p-1" aria-label={ar ? "طريقة العرض" : "Calendar view"}>
                {(["calendar", "agenda"] as const).map((value) => <button type="button" key={value} onClick={() => setView(value)} aria-pressed={view === value} className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold ${view === value ? "bg-white text-[#3B52D4] shadow-sm" : "text-slate-600"}`}>{value === "calendar" ? <CalendarDays size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}{value === "calendar" ? (ar ? "التقويم" : "Calendar") : (ar ? "الأجندة" : "Agenda")}</button>)}
              </div>
            </div>
          </div>
          <label className="mt-4 flex w-fit items-center gap-3 text-xs font-semibold text-slate-600">{ar ? "السنة" : "Year"}
            <select value={year} onChange={(event) => { const candidate = `${event.target.value}-${month.slice(5)}`; const next = candidate < "2025-10" ? "2025-10" : candidate > "2029-10" ? "2029-10" : candidate; setChosenMonth(next); setChosenDate(`${next}-01`) }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900">{[2025, 2026, 2027, 2028, 2029].map((value) => <option key={value} value={value}>{value}</option>)}</select>
          </label>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 sm:flex-1">{ar ? "ابحث في هذا الشهر" : "Search this month"}<span className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={16} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "موضوع أو فعالية…" : "Topic or event…"} className="w-full min-w-0 bg-transparent py-3 text-base font-normal text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" /></span></label>
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 sm:w-auto">{ar ? "نوع النشاط" : "Activity type"}<select value={kind} onChange={(event) => chooseKind(event.target.value as CalendarKind | "all")} className="mt-2 block min-h-11 w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-normal text-slate-900"><option value="all">{ar ? "كل الأنشطة" : "All activities"}</option>{([...tracks, "break", "milestone", "holiday", "international", "published", "ecosystem"] as CalendarKind[]).map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <details className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 text-sm font-bold text-slate-700 [&::-webkit-details-marker]:hidden"><SlidersHorizontal size={16} aria-hidden="true" />{ar ? "تصفية المؤتمرات" : "Conference filters"}{(region !== "all" || focus !== "all" || specialAccess) && <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs text-indigo-800">{ar ? "تصفية مفعّلة" : "Filters active"}</span>}<ChevronDown size={16} className="ms-auto" aria-hidden="true" /></summary>
              <div className="flex flex-wrap items-end gap-3 pb-4">
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 sm:w-auto">{ar ? "المنطقة" : "Location"}
              <select value={region} onChange={(event) => { const value = event.target.value as EcosystemRegion | "all"; setRegion(value); if (value !== "all") setKind("ecosystem") }} aria-label={ar ? "اختر منطقة المؤتمرات" : "Conference region"} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-normal text-slate-900">
                <option value="all">{ar ? "كل المناطق" : "All locations"}</option>
                <option value="riyadh">{ar ? "الرياض" : "Riyadh"}</option>
                <option value="saudi">{ar ? "بقية السعودية" : "Rest of Saudi Arabia"}</option>
                <option value="gcc">{ar ? "الخليج" : "GCC"}</option>
                <option value="mena">{ar ? "الشرق الأوسط وشمال أفريقيا" : "MENA"}</option>
                <option value="global">{ar ? "العالم" : "Worldwide"}</option>
              </select>
            </label>
            <label className="w-full min-w-0 text-xs font-bold text-slate-600 sm:w-auto">{ar ? "المجال" : "Focus"}
              <select value={focus} onChange={(event) => { const value = event.target.value as typeof focus; setFocus(value); if (value !== "all") setKind("ecosystem") }} aria-label={ar ? "اختر مجال المؤتمرات" : "Conference focus"} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-normal text-slate-900">
                <option value="all">{ar ? "كل المجالات" : "All sectors"}</option>
                <option value="startups">{ar ? "الشركات الناشئة" : "Startups"}</option>
                <option value="investment">{ar ? "الاستثمار" : "Investment"}</option>
                <option value="fintech">{ar ? "التقنية المالية" : "Fintech"}</option>
                <option value="tech">{ar ? "التقنية والذكاء الاصطناعي" : "Technology & AI"}</option>
                <option value="commerce">{ar ? "التجارة والتوسع" : "Commerce & growth"}</option>
                <option value="cyber">{ar ? "الأمن السيبراني" : "Cybersecurity"}</option>
              </select>
            </label>
            <button type="button" aria-pressed={specialAccess} onClick={() => { const next = !specialAccess; setSpecialAccess(next); if (next) setKind("ecosystem") }} className={`min-h-11 self-end rounded-xl border px-4 py-2 text-xs font-bold ${specialAccess ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-700 hover:border-amber-400"}`}>
              {ar ? "الدعوات الخاصة واللقاءات المنتقاة" : "Invitations & curated meetings"}
            </button>
              </div>
            </details>
            {(query || kind !== "all" || region !== "all" || focus !== "all" || specialAccess) && <button type="button" className="min-h-11 px-2 text-xs font-bold text-[#3B52D4] underline" onClick={clearFilters}>{ar ? "مسح التصفية" : "Clear filters"}</button>}
          </div>
          {view === "calendar" && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">{Array.from(new Set(calendarAgendaEntries(visible, month, today, true).map((entry) => entry.kind))).map((value) => <span key={value} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className={`size-2 rounded-full ${styles[value].dot}`} />{label(value)}</span>)}</div>}

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
            <div className="mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">{dateLabel(selectedDate)}</h3>
              <div className="flex gap-2">
                <button type="button" disabled={selectedDate <= "2025-10-01"} onClick={() => navigateDay(-1)} aria-label={ar ? "اليوم السابق" : "Previous day"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 disabled:opacity-40">{ar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
                <button type="button" disabled={selectedDate >= "2029-10-31"} onClick={() => navigateDay(1)} aria-label={ar ? "اليوم التالي" : "Next day"} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 disabled:opacity-40">{ar ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
              </div>
            </div>
            <div className="space-y-4">{selectedEntries.length ? selectedEntries.map(entryCard) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm leading-7 text-slate-500"><CalendarDays className="mb-4 text-slate-400" aria-hidden="true" />{ar ? "لا توجد أنشطة معروضة لهذا اليوم ضمن التصفية الحالية." : "No activities shown for this day with the current filters."}{nextSession && <button type="button" onClick={() => openEntry(nextSession)} className="mt-4 block min-h-11 text-start font-bold text-[#3B52D4]">{ar ? "عرض الموعد المطابق التالي" : "View next matching date"}</button>}</div>}</div>
          </aside>
        </div> : <div className="p-4 sm:p-6">
          {month === today.slice(0, 7) && <div role="group" aria-label={ar ? "مواعيد الأجندة" : "Agenda period"} className="mb-5 flex flex-wrap gap-2">{[false, true].map((value) => <button key={String(value)} type="button" aria-pressed={includePast === value} onClick={() => setIncludePast(value)} className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${includePast === value ? "bg-indigo-50 text-indigo-800" : "text-slate-600 hover:bg-slate-50"}`}>{value ? (ar ? "الشهر كاملًا" : "Whole month") : (ar ? "من اليوم" : "From today")}</button>)}</div>}
          {monthEntries.length ? <CalendarAgenda key={[month, kind, region, focus, specialAccess, query, includePast].join(":")} entries={monthEntries} renderEntry={entryCard} ar={ar} /> : <div role="status" className="rounded-2xl bg-slate-50 px-5 py-8 text-center"><CalendarDays size={28} className="mx-auto mb-3 text-slate-400" aria-hidden="true" /><p className="text-sm leading-7 text-slate-600">{ar ? "لا توجد أنشطة مطابقة في هذه الفترة." : "No matching activities in this period."}</p><div className="mt-3 flex flex-wrap justify-center gap-3">{nextMatch && <button type="button" onClick={() => { const target = nextMatch.date < shiftCalendarMonth(month, 1) + "-01" ? shiftCalendarMonth(month, 1) + "-01" : nextMatch.date; setChosenMonth(target.slice(0, 7)); setChosenDate(target) }} className="min-h-11 font-bold text-[#3B52D4]">{ar ? "انتقل إلى الموعد التالي" : "Go to next matching date"}</button>}{(query || kind !== "all" || region !== "all" || focus !== "all" || specialAccess) && <button type="button" onClick={clearFilters} className="min-h-11 font-bold text-[#3B52D4] underline">{ar ? "مسح التصفية" : "Clear filters"}</button>}</div></div>}
        </div>}


        {(loading || error) && <div className="space-y-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 text-xs leading-6 text-slate-600">
          {loading && <p role="status">{ar ? "جارٍ تحميل فعاليات المجتمع…" : "Loading community events…"}</p>}
          {error && <p role="status">{ar ? "تعذر تحميل بعض فعاليات المجتمع؛ خطة البرنامج والإجازات متاحة." : "Some community events could not be loaded; the program plan and holidays remain available."} <button type="button" onClick={retry} className="min-h-11 px-2 font-bold text-[#3B52D4] underline">{ar ? "إعادة المحاولة" : "Retry"}</button></p>}
        </div>}
      </div>
      <details id="programme-overview" className="group mt-6 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-slate-900 [&::-webkit-details-marker]:hidden"><span>{ar ? "البرنامج الأسبوعي والمحطات الرئيسية" : "Weekly programme & key dates"}</span><ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
        <p className="mb-5 mt-2 text-sm leading-7 text-slate-600">{periodText}</p>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tracks.map((track) => { const Icon = trackIcons[track]; return <button type="button" key={track} onClick={() => { chooseKind(kind === track ? "all" : track); setView("agenda"); document.getElementById("calendar-month-panel")?.scrollIntoView({ block: "start" }) }} aria-pressed={kind === track} className={`rounded-2xl border p-4 text-start transition-shadow sm:p-5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${kind === track ? styles[track].badge : "border-slate-200 bg-white text-slate-800"}`}>
          <span className="mb-4 flex items-center justify-between gap-3"><Icon size={22} aria-hidden="true" /></span>
          <span className="block text-sm font-extrabold">{programTracks[track].cadence[locale]}</span>
          <span className="mt-1 block text-sm">{programTracks[track].title[locale]}</span>
          <span className="mt-3 block text-xs leading-5 opacity-80">{programTracks[track].audience[locale]}</span>
        </button> })}
      </div>

      <div role="group" className="mb-8 grid gap-3 lg:grid-cols-3" aria-label={ar ? "الإجازات والمحطات الرئيسية" : "Breaks and key milestones"}>
        {[acceleratorBreak, ...cohortMilestones].map((entry) => <button type="button" key={entry.id} onClick={() => { setChosenMonth(entry.date.slice(0, 7)); setChosenDate(entry.date); setKind("all"); setQuery(""); setRegion("all"); setFocus("all"); setSpecialAccess(false); setView("calendar"); document.getElementById("calendar-month-panel")?.scrollIntoView({ block: "start" }) }} className={`rounded-2xl border p-5 text-start ${styles[entry.kind].badge}`}>
          <span className="block text-xs font-bold">{calendarDateLabel(entry.date, locale, { year: "numeric" })}{entry.endDate ? ` – ${calendarDateLabel(entry.endDate, locale, { year: "numeric" })}` : ""}</span>
          <span className="mt-2 block text-base font-extrabold leading-7">{entry.title[locale]}</span>
          <span className="mt-2 block text-xs leading-6">{entry.kind === "break" ? (ar ? "لا أنشطة للمسرّعة" : "No accelerator activities") : entry.location?.[locale]}</span>
        </button>)}
      </div>

      </details>
      <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <summary className="min-h-11 cursor-pointer content-center text-base font-extrabold text-slate-900">{ar ? "المزيد من تقاويم المنظّمين" : "More organizer calendars"}</summary>
        <p className="mt-2 text-sm leading-6 text-slate-600">{ar ? "تجد هنا مصادر رسمية للفعاليات واللقاءات التي قد تُعلن تفاصيلها لاحقًا. تتولى الجهات المنظمة التسجيل والدعوات." : "Find more event calendars and upcoming announcements from organizers. Registration and invitations are handled by the individual hosts."}</p>
        <div className="mt-4 flex flex-wrap gap-2">{organizerCalendars.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-[#3B52D4] hover:border-indigo-300 hover:bg-indigo-50">{item[locale]}<Globe2 size={14} aria-hidden="true" /></a>)}</div>
      </details>
    </div>
  </section>
}


function CalendarAgenda({ entries, renderEntry, ar }: { entries: CalendarEntry[]; renderEntry: (entry: CalendarEntry) => ReactNode; ar: boolean }) {
  const [limit, setLimit] = useState(8)
  return <>
    <div className="grid items-start gap-4 md:grid-cols-2">{entries.slice(0, limit).map(renderEntry)}</div>
    {entries.length > limit && <div className="mt-6 text-center"><button type="button" onClick={() => setLimit((value) => value + 8)} className="min-h-12 rounded-xl border border-indigo-200 bg-indigo-50 px-6 text-sm font-bold text-indigo-800 hover:bg-indigo-100">{ar ? "عرض المزيد من المواعيد" : "Show more dates"}</button></div>}
  </>
}
