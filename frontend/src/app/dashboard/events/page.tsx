import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { events } from "@/data/seed"
import { CalendarDays, MapPin, Clock, Users, ExternalLink } from "lucide-react"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const registeredEventIds = new Set(["e1", "e3"])

const pastEvents = [
  {
    id: "past-1",
    title: "Wosool Founders Dinner — Riyadh Edition",
    date: "2026-02-20T19:30:00+03:00",
    endDate: "2026-02-20T23:00:00+03:00",
    location: "Riyadh, Saudi Arabia",
    type: "In-Person",
    isVirtual: false,
    tags: ["Networking", "Dinner", "Riyadh"],
    attended: true,
  },
  {
    id: "past-2",
    title: "Expert Office Hours — Product-Market Fit",
    date: "2026-01-15T16:00:00+03:00",
    endDate: "2026-01-15T18:00:00+03:00",
    location: "Virtual",
    type: "Virtual",
    isVirtual: true,
    tags: ["Office Hours", "PMF"],
    attended: false,
  },
]

export default function EventsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Upcoming</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        {/* All Upcoming */}
        <TabsContent value="all" className="mt-6 space-y-4">
          {events.map((event) => {
            const isRegistered = registeredEventIds.has(event.id)
            return (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-[#0A1628] text-white flex flex-col items-center justify-center">
                      <span className="text-xs text-[#C9A84C]">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[#0A1628]">{event.title}</h3>
                        {isRegistered && <Badge variant="success">Registered</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.date)}{event.endDate && ` – ${formatTime(event.endDate)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.isVirtual ? "Virtual" : event.location}
                        </span>
                        {event.maxAttendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Max {event.maxAttendees} attendees
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant={event.isVirtual ? "secondary" : "default"}>
                          {event.type}
                        </Badge>
                        {!event.isPublic && <Badge variant="gold">Members Only</Badge>}
                      </div>
                      <div className="mt-4">
                        {isRegistered ? (
                          <Button size="sm" variant="outline">
                            Cancel Registration
                          </Button>
                        ) : (
                          <Button size="sm">RSVP Now</Button>
                        )}
                        {event.isVirtual && event.registrationUrl && (
                          <Button size="sm" variant="outline" className="ml-2 gap-1" asChild>
                            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              Event Link
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Registered */}
        <TabsContent value="registered" className="mt-6 space-y-4">
          {events
            .filter((e) => registeredEventIds.has(e.id))
            .map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-[#0A1628] text-white flex flex-col items-center justify-center">
                      <span className="text-xs text-[#C9A84C]">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0A1628]">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.isVirtual ? "Virtual" : event.location}
                        </span>
                      </div>
                      <div className="mt-3">
                        <Badge variant="success">Registered</Badge>
                        <Button size="sm" variant="outline" className="ml-3">
                          Cancel Registration
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Past Events */}
        <TabsContent value="past" className="mt-6 space-y-4">
          {pastEvents.map((event) => (
            <Card key={event.id} className="opacity-80">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gray-200 text-gray-500 flex flex-col items-center justify-center">
                    <span className="text-xs">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0A1628]">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.isVirtual ? "Virtual" : event.location}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {event.attended ? (
                        <Badge variant="success">Attended</Badge>
                      ) : (
                        <Badge variant="secondary">Missed</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
