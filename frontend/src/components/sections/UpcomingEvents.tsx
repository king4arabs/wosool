"use client"

import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { usePublicEvents } from "@/lib/use-public-events"
import { upcomingEvents } from "@/lib/event-time"
import { EventCard } from "./EventCard"

export function UpcomingEvents() {
  const { locale } = useLocale()
  const { events, loading, error, retry } = usePublicEvents()
  const upcoming = upcomingEvents(events).slice(0, 3)
  return (
    <div>
      {loading ? <p role="status" className="py-12 text-center text-slate-600">{locale === "ar" ? "جارٍ تحميل الفعاليات…" : "Loading events…"}</p>
        : upcoming.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((event) => <EventCard key={event.id} event={event} />)}</div>
        : <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto mb-4 h-8 w-8 text-[#3B52D4]" aria-hidden="true" />
          <p role={error ? "alert" : "status"} className="text-base font-semibold text-slate-800">{error ? (locale === "ar" ? "تعذر تحميل الفعاليات الآن." : "We could not load events right now.") : (locale === "ar" ? "ترقّب اللقاءات القادمة" : "More founder gatherings are on the way")}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{locale === "ar" ? "تواصل معنا للاستفسار عن لقاءات المجتمع أو اقتراح فعالية." : "Contact us to ask about community gatherings or suggest an event."}</p>
          {error && <button type="button" onClick={retry} className="mt-4 min-h-11 px-4 text-sm font-bold text-[#3B52D4]">{locale === "ar" ? "إعادة المحاولة" : "Try again"}</button>}
          <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#3B52D4] px-5 text-sm font-bold text-white">{locale === "ar" ? "تواصل معنا" : "Get in touch"}</Link>
        </div>}
      <Link href="/events" className="mx-auto mt-6 block w-fit py-3 text-sm font-bold text-[#3B52D4]">{locale === "ar" ? "استعرض جميع الفعاليات" : "Browse all events"}</Link>
    </div>
  )
}
