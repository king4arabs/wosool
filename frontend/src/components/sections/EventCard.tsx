import Link from "next/link"
import type { Event } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Video, Users, Calendar } from "lucide-react"

interface EventCardProps {
  event: Event
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    full: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  }
}

export function EventCard({ event }: EventCardProps) {
  const dateInfo = formatEventDate(event.date)

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        <div className="flex gap-4 mb-4">
          {/* Date block */}
          <div
            className="flex flex-col items-center justify-center bg-[#0A1628] text-white rounded-xl p-3 h-16 w-16 shrink-0"
            aria-label={dateInfo.full}
          >
            <span className="text-xs font-medium text-[#C9A84C] uppercase">{dateInfo.month}</span>
            <span className="text-2xl font-bold leading-none">{dateInfo.day}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0A1628] line-clamp-2 mb-1">{event.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{dateInfo.time}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant={event.isVirtual ? "secondary" : "outline"}>
            {event.isVirtual ? "Virtual" : "In-Person"}
          </Badge>
          {!event.isPublic && <Badge variant="default">Members Only</Badge>}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {event.isVirtual ? (
            <Video className="h-3 w-3 shrink-0" />
          ) : (
            <MapPin className="h-3 w-3 shrink-0" />
          )}
          <span>{event.location}</span>
        </div>

        {event.maxAttendees && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Users className="h-3 w-3" />
            <span>Limited to {event.maxAttendees} attendees</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {event.registrationUrl ? (
          <Button asChild size="sm" className="w-full">
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
              RSVP
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/events/${event.slug}`}>Learn More</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
