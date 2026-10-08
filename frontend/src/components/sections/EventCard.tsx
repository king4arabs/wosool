"use client"

import Link from "next/link"
import type { Event } from "@/types"
import { MapPin, Video, Users, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { isPastEvent } from "@/lib/event-time"

interface EventCardProps {
  event: Event
}

function formatEventDate(dateStr: string, intlLocale: string) {
  const date = new Date(dateStr)
  return {
    day:   date.toLocaleDateString(intlLocale, { day: "2-digit", timeZone: "Asia/Riyadh", calendar: "gregory" }),
    month: date.toLocaleDateString(intlLocale, { month: "short", timeZone: "Asia/Riyadh", calendar: "gregory" }).toUpperCase(),
    time:  date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh", timeZoneName: "short" }),
    full:  date.toLocaleDateString(intlLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Riyadh", calendar: "gregory" }),
  }
}

export function EventCard({ event }: EventCardProps) {
  const { locale, direction } = useLocale()
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US"
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

  const isPast = isPastEvent(event)
  const isOpen = !isPast && !!event.registrationUrl && /^https?:\/\//.test(event.registrationUrl)

  return (
    <div
      className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "0 8px 32px -4px rgba(59,82,212,0.12), 0 2px 8px -2px rgba(15,22,40,0.04)"
        el.style.borderColor = "rgba(59,82,212,0.22)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "0 2px 12px -2px rgba(15,22,40,0.06)"
        el.style.borderColor = "rgba(226,232,240,0.8)"
      }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Date block + title */}
        <div className="flex gap-3 items-start">
          <div
            className="flex flex-col items-center justify-center rounded-xl shrink-0 h-14 w-14 border"
            style={{ background: "#EEF1FF", borderColor: "#E4E7F0" }}
            aria-label={d.full}
          >
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#3B52D4]">{d.month}</span>
            <span className="text-xl font-black text-slate-900 leading-none">{d.day}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug mb-1">{event.title}</h3>
            <time dateTime={event.date} className="text-xs text-slate-600 font-medium">{d.time}</time>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{event.description}</p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          {isPast && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{locale === "ar" ? "فعالية سابقة" : "Past event"}</span>}
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border"
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
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EEF1FF] text-[#3B52D4] border border-[#E4E7F0]">
              {copy.membersOnly}
            </span>
          )}

          {event.maxAttendees && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
              <Users className="h-2.5 w-2.5" />
              {copy.limited}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          {event.isVirtual
            ? <Video className="h-3 w-3 shrink-0" />
            : <MapPin className="h-3 w-3 shrink-0" />
          }
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        {isOpen ? (
          <a
            href={event.registrationUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: "#3B52D4", boxShadow: "0 4px 12px -2px rgba(59,82,212,0.3)" }}
          >
            {copy.rsvp}
            <ArrowIcon className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Link
            href={`/events/${event.slug}`}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white transition-all hover:border-[#3B52D4]/40 hover:text-[#3B52D4] hover:bg-[#EEF1FF]/40"
          >
            {copy.details}
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
