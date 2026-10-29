"use client"

import Link from "next/link"
import type { Event } from "@/types"
import { MapPin, Video, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { canRegisterForEvent, isPastEvent } from "@/lib/event-time"
import { dateLocale } from "@/lib/date-locale"

interface EventCardProps {
  event: Event
  now: number
}

function formatEventDate(dateStr: string, intlLocale: string) {
  const date = new Date(dateStr)
  return {
    day:   date.toLocaleDateString(intlLocale, { day: "2-digit", timeZone: "Asia/Riyadh", calendar: "gregory" }),
    month: date.toLocaleDateString(intlLocale, { month: "short", timeZone: "Asia/Riyadh", calendar: "gregory" }).toUpperCase(),
    time:  date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh", timeZoneName: "short" }),
    year: date.toLocaleDateString(intlLocale, { year: "numeric", timeZone: "Asia/Riyadh", calendar: "gregory" }),
    full:  date.toLocaleDateString(intlLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Riyadh", calendar: "gregory" }),
  }
}

export function EventCard({ event, now }: EventCardProps) {
  const { locale, direction } = useLocale()
  const intlLocale = dateLocale(locale === "ar", "en-US")
  const d = formatEventDate(event.date, intlLocale)
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  const copy = {
    ar: { virtual: "عن بُعد", inPerson: "حضوري", membersOnly: "أعضاء فقط",
          limited: `${event.maxAttendees ?? 0} مقعد`, rsvp: "سجّل حضورك", details: "عرض التفاصيل" },
    en: { virtual: "Virtual", inPerson: "In-person", membersOnly: "Members only",
          limited: `${event.maxAttendees ?? 0} seats`, rsvp: "RSVP", details: "View details" },
    fr: { virtual: "En ligne", inPerson: "Présentiel", membersOnly: "Membres seulement",
          limited: `${event.maxAttendees ?? 0} places`, rsvp: "RSVP", details: "Voir les détails" },
  }[locale]

  const isPast = isPastEvent(event, now)
  const isOpen = canRegisterForEvent(event, now) && !!event.registrationUrl && /^https?:\/\//.test(event.registrationUrl)

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:border-indigo-200 hover:shadow-md">
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Date block + title */}
        <div className="flex gap-3 items-start">
          <div
            className="flex flex-col items-center justify-center rounded-xl shrink-0 h-14 w-14 border"
            style={{ background: "#EEF1FF", borderColor: "#E4E7F0" }}
          >
            <span className="sr-only">{d.full}</span>
            <span aria-hidden="true" className="text-xs font-extrabold uppercase tracking-widest text-[#3B52D4]">{d.month}</span>
            <span aria-hidden="true" className="text-xl font-black text-slate-900 leading-none">{d.day}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="mb-2 text-base font-extrabold leading-7 text-slate-900"><Link href={`/events/${encodeURIComponent(event.slug)}`} className="hover:text-[#3B52D4]">{event.title}</Link></h3>
            <time dateTime={event.date} className="text-xs text-slate-600 font-medium">{d.year} · {d.time}</time>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-7 text-slate-600 line-clamp-3 flex-1">{event.description}</p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          {isPast && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{locale === "ar" ? "فعالية سابقة" : "Past event"}</span>}
          <span
            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
            style={
              event.isVirtual
                ? { background: "#EFF6FF", color: "#1d4ed8", borderColor: "#BFDBFE" }
                : { background: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0" }
            }
          >
            {event.isVirtual
              ? <Video className="h-2.5 w-2.5" />
              : <MapPin className="h-2.5 w-2.5" />
            }
            {event.isVirtual ? copy.virtual : copy.inPerson}
          </span>

          {!event.isPublic && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EEF1FF] text-[#3B52D4] border border-[#E4E7F0]">
              {copy.membersOnly}
            </span>
          )}


        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm leading-6 text-slate-600">
          {event.isVirtual
            ? <Video className="mt-1 h-4 w-4 shrink-0" />
            : <MapPin className="mt-1 h-4 w-4 shrink-0" />
          }
          <span className="break-words">{event.location}</span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-5">
        <Link href={`/events/${encodeURIComponent(event.slug)}`} className="flex min-h-12 flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#3B52D4] transition-colors hover:border-indigo-300 hover:bg-indigo-50">
          {copy.details}<span className="sr-only">: {event.title}</span><ArrowIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
        {isOpen && <a href={event.registrationUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#3B52D4] px-4 py-3 text-sm font-bold text-white hover:bg-[#2E44C8]">{copy.rsvp}<span className="sr-only">: {event.title}</span></a>}
      </div>
    </article>
  )
}
