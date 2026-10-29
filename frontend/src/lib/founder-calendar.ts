import { bilingual, learningTopics, ONLINE_ANCHOR, onlineTopics, peerTopics, PROGRAM_END, PROGRAM_START, RAMADAN_BREAK_END, RAMADAN_BREAK_START, programTracks, visitTopics, type Bilingual, type CalendarKind, type CalendarLocale, type ProgramTrack } from "../data/founder-calendar"
import ecosystemSource from "../data/ecosystem-events.json"
import { eventPeriod, parseEventDate } from "./event-time"
import type { Event } from "../types"
import { dateLocale } from "./date-locale"

export type EcosystemRegion = "riyadh" | "saudi" | "gcc" | "mena" | "global"
export type EcosystemAccess = "registration" | "invitation" | "application" | "trade"
export type EcosystemFocus = "startups" | "tech" | "investment" | "fintech" | "commerce" | "cyber"

export interface EcosystemEventInfo {
  region: EcosystemRegion
  access: EcosystemAccess
  focus: EcosystemFocus
  organizer: string
}

export interface CalendarEntry {
  id: string
  date: string
  endDate?: string
  kind: CalendarKind
  title: Bilingual
  description: Bilingual
  status: "planned" | "fixed" | "tentative" | "published" | "scheduled"
  week?: number
  event?: Event
  source?: string
  location?: Bilingual
  ecosystem?: EcosystemEventInfo
}

const DAY = 86_400_000
const dateValue = (date: string) => Date.parse(`${date}T00:00:00Z`)

export function addCalendarDays(date: string, days: number): string {
  return new Date(dateValue(date) + days * DAY).toISOString().slice(0, 10)
}

/** Date-only keys always use Riyadh, regardless of the visitor's timezone. */
export function riyadhDate(instant: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant)
  const get = (type: string) => parts.find((part) => part.type === type)!.value
  return `${get("year")}-${get("month")}-${get("day")}`
}

export function calendarDateLabel(date: string, locale: CalendarLocale, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(dateLocale(locale === "ar", "en-GB"), { calendar: "gregory", timeZone: "UTC", day: "numeric", month: "long", ...options }).format(dateValue(date))
}

export function calendarMonthDays(month: string): string[] {
  const first = `${month}-01`
  const last = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate()
  const offset = new Date(dateValue(first)).getUTCDay()
  return Array.from({ length: Math.ceil((offset + last) / 7) * 7 }, (_, index) => addCalendarDays(first, index - offset))
}

export function shiftCalendarMonth(month: string, delta: number): string {
  return new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1)).toISOString().slice(0, 7)
}

export function isAcceleratorOff(date: string): boolean {
  return date >= RAMADAN_BREAK_START && date <= RAMADAN_BREAK_END
}

export function plannedFounderSessions(): CalendarEntry[] {
  const entries: CalendarEntry[] = []
  const counts: Record<ProgramTrack, number> = { learning: 0, visit: 0, peer: 0, online: 0 }
  for (let date = PROGRAM_START; date <= PROGRAM_END; date = addCalendarDays(date, 1)) {
    if (isAcceleratorOff(date)) continue
    const weekday = new Date(dateValue(date)).getUTCDay()
    const fridayIndex = (dateValue(date) - dateValue(ONLINE_ANCHOR)) / (DAY * 14)
    const kind: ProgramTrack | undefined = weekday === 3 ? "learning" : weekday === 6 ? "visit" : weekday === 0 ? "peer" : weekday === 5 && Number.isInteger(fridayIndex) && fridayIndex >= 0 ? "online" : undefined
    if (!kind) continue
    const topics = { learning: learningTopics, visit: visitTopics, peer: peerTopics, online: onlineTopics }[kind]
    const index = counts[kind]
    const title = topics[index]
    if (!title) continue
    entries.push({ id: `plan-${kind}-${date}`, date, kind, title, description: programTracks[kind].description, week: kind === "online" ? index * 2 + 1 : index + 1, status: "planned" })
    counts[kind] += 1
  }
  return entries
}

const fixedSource = "https://www.sama.gov.sa/en-us/Supervision/pages/holidayschedules.aspx"
const lunarSource = "https://www.timeanddate.com/holidays/saudi-arabia/2027"

/** Eid dates are planning estimates, never presented as an official leave period. */
export function saudiCalendarHolidays(year: number): CalendarEntry[] {
  const fixedDescription = bilingual("Saudi national occasion. Program arrangements around this date are TBD.", "مناسبة وطنية سعودية. ترتيبات البرنامج حول هذا التاريخ تُحدد لاحقًا.")
  const entries: CalendarEntry[] = [
    { id: `founding-${year}`, date: `${year}-02-22`, kind: "holiday", status: "fixed", title: bilingual("Saudi Founding Day", "يوم التأسيس السعودي"), description: fixedDescription, source: fixedSource },
    { id: `national-${year}`, date: `${year}-09-23`, kind: "holiday", status: "fixed", title: bilingual("Saudi National Day", "اليوم الوطني السعودي"), description: fixedDescription, source: fixedSource },
  ]
  if (year === 2027) {
    const description = bilingual("Tentative calendar date, subject to the official Saudi announcement. Holiday duration and cohort arrangements TBD.", "تاريخ تقويمي تقديري يخضع للإعلان الرسمي في السعودية. مدة الإجازة وترتيبات الدفعة تُحدد لاحقًا.")
    entries.push(
      { id: "ramadan-2027", date: "2027-02-08", kind: "holiday", status: "tentative", title: bilingual("Ramadan begins · observance", "بداية رمضان · مناسبة دينية"), description: bilingual("Estimated start of Ramadan. The accelerator is off throughout Ramadan; exact dates are subject to official announcement.", "بداية رمضان المتوقعة. تتوقف أنشطة المسرّعة طوال رمضان؛ التواريخ النهائية تخضع للإعلان الرسمي."), source: lunarSource },
      { id: "fitr-2027", date: "2027-03-10", kind: "holiday", status: "tentative", title: bilingual("Eid al-Fitr", "عيد الفطر"), description, source: lunarSource },
      { id: "arafat-2027", date: "2027-05-15", kind: "holiday", status: "tentative", title: bilingual("Arafat Day", "يوم عرفة"), description, source: lunarSource },
      { id: "adha-2027", date: "2027-05-16", kind: "holiday", status: "tentative", title: bilingual("Eid al-Adha", "عيد الأضحى"), description, source: lunarSource },
    )
  }
  return entries
}

export function publishedCalendarEntries(events: Event[], now: number): CalendarEntry[] {
  return events.filter((event) => eventPeriod(event, now) !== null).map((event) => ({
    id: `event-${event.id}`, date: riyadhDate(parseEventDate(event.date)),
    // End instants are exclusive, so midnight does not occupy the following day.
    endDate: riyadhDate(Math.max(parseEventDate(event.date), parseEventDate(event.endDate || event.date) - 1)),
    kind: "published", status: "published", title: bilingual(event.title, event.title), description: bilingual(event.description, event.description), event,
  }))
}

/** Public third-party conference discovery, kept independent from Wosool event/RSVP records. */
export function ecosystemCalendarEntries(): CalendarEntry[] {
  return ecosystemSource.map((item): CalendarEntry => ({
    id: `ecosystem-${item.id}`,
    date: item.date,
    endDate: item.endDate,
    kind: "ecosystem",
    status: "published",
    title: bilingual(item.title_en, item.title_ar),
    description: bilingual(item.description_en, item.description_ar),
    source: item.source_url,
    location: bilingual(item.city_en, item.city_ar),
    ecosystem: {
      region: item.region as EcosystemRegion,
      access: item.access as EcosystemAccess,
      focus: item.focus as EcosystemFocus,
      organizer: item.organizer,
    },
  }))
}

export function entriesOnDate(entries: CalendarEntry[], date: string): CalendarEntry[] {
  return entries.filter((entry) => entry.date <= date && (entry.endDate || entry.date) >= date)
}


export const acceleratorBreak: CalendarEntry = {
  id: "ramadan-accelerator-break-2027", date: RAMADAN_BREAK_START, endDate: RAMADAN_BREAK_END,
  kind: "break", status: "tentative", title: bilingual("Ramadan · accelerator off days", "رمضان · إجازة المسرّعة"),
  description: bilingual("The accelerator pauses throughout Ramadan: no planned learning labs, site visits, peer sessions or cohort online workshops. The full topic sequence resumes afterward. Expected dates are subject to the official Saudi moon-sighting announcement.", "تتوقف أنشطة المسرّعة طوال رمضان: لا مختبرات تعلّم أو زيارات أو لقاءات أقران أو ورش رقمية مخططة للدفعة. تُستكمل جميع الموضوعات بعد الإجازة. التواريخ المتوقعة تخضع للإعلان الرسمي في السعودية."),
  source: lunarSource,
}

/** Dates and Diriyah location supplied by the program lead on 12 October 2026. */
export const cohortMilestones: CalendarEntry[] = [
  { id: "eoa-demo-day-2027", date: "2027-05-15", kind: "milestone", status: "scheduled",
    title: bilingual("EOA Cohort Demo Day & Investment Opportunity", "يوم عروض دفعة EOA والفرص الاستثمارية"),
    description: bilingual("A cohort showcase for founders to present their startups and discuss investment opportunities. Participating companies, investors, agenda, time and venue TBA.", "يوم لعرض شركات الدفعة أمام المهتمين ومناقشة الفرص الاستثمارية. الشركات المشاركة والمستثمرون والبرنامج والوقت والموقع تُعلن لاحقًا."),
    location: bilingual("TBA", "يُعلن لاحقًا (TBA)") },
  { id: "eo-saudi-summit-2027", date: "2027-05-20", kind: "milestone", status: "scheduled",
    title: bilingual("EO Saudi Summit", "قمة EO السعودية"),
    description: bilingual("A gathering for the EO community in Diriyah. Exact venue, speakers, agenda, time and registration TBA.", "لقاء لمجتمع EO في الدرعية. الموقع التفصيلي والمتحدثون والبرنامج والوقت والتسجيل تُعلن لاحقًا."),
    location: bilingual("Diriyah · exact venue TBA", "الدرعية · الموقع التفصيلي يُعلن لاحقًا") },
]

export function internationalCalendarHolidays(year: number): CalendarEntry[] {
  const globalDescription = bilingual("International holiday or observance for planning with global partners. Observance varies by country; this does not create an accelerator off day.", "إجازة أو مناسبة دولية للتخطيط مع الشركاء حول العالم. يختلف الاحتفال بها حسب البلد، ولا تُعد إجازة للمسرّعة.")
  const source = "https://www.mom.gov.sg/newsroom/press-releases/2026/0618-public-holidays-for-2027"
  const fixed: [string, string, Bilingual, string][] = [
    ["new-year", "01-01", bilingual("New Year’s Day", "رأس السنة الميلادية"), source],
    ["women", "03-08", bilingual("International Women’s Day", "اليوم الدولي للمرأة"), "https://www.un.org/en/observances/womens-day"],
    ["earth", "04-22", bilingual("Earth Day", "يوم الأرض"), "https://www.un.org/en/observances/earth-day"],
    ["labour", "05-01", bilingual("International Workers’ Day / Labour Day", "عيد العمال العالمي"), source],
    ["msme", "06-27", bilingual("UN Micro-, Small and Medium-sized Enterprises Day", "يوم الأمم المتحدة للمشروعات المتناهية الصغر والصغيرة والمتوسطة"), "https://www.un.org/en/observances/micro-small-medium-businesses-day"],
    ["christmas", "12-25", bilingual("Christmas Day · Western tradition", "عيد الميلاد · التقويم الغربي"), source],
  ]
  const entries: CalendarEntry[] = fixed.map(([id, date, title, reference]) => ({ id: `international-${id}-${year}`, date: `${year}-${date}`, kind: "international", status: "fixed", title, description: globalDescription, source: reference }))
  if (year === 2027) entries.push(
    { id: "lunar-new-year-2027", date: "2027-02-06", kind: "international", status: "fixed", title: bilingual("Lunar New Year", "رأس السنة القمرية"), description: globalDescription, source },
    { id: "good-friday-2027", date: "2027-03-26", kind: "international", status: "fixed", title: bilingual("Good Friday · Western tradition", "الجمعة العظيمة · التقويم الغربي"), description: globalDescription, source },
    { id: "easter-2027", date: "2027-03-28", kind: "international", status: "fixed", title: bilingual("Easter Sunday · Western tradition", "عيد الفصح · التقويم الغربي"), description: globalDescription, source: "https://religion.princeton.edu/2026-2027-religious-holidays" },
    { id: "deepavali-2027", date: "2027-10-28", kind: "international", status: "fixed", title: bilingual("Deepavali / Diwali · Singapore", "ديبافالي / ديوالي · سنغافورة"), description: bilingual("Singapore’s published Deepavali date. Diwali dates vary by country and tradition; partner availability should be confirmed. Not an accelerator off day.", "تاريخ ديبافالي المعلن في سنغافورة. تختلف مواعيد ديوالي حسب البلد والتقاليد؛ يُرجى تأكيد توافر الشركاء. ليست إجازة للمسرّعة."), source },
  )
  return entries
}
