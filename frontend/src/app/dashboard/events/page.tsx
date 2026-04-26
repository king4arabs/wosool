"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Clock, Users } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface ApiEvent {
  id: number
  title: string
  slug: string
  description?: string | null
  starts_at: string
  ends_at?: string | null
  location?: string | null
  type?: string | null
  format?: string | null
  max_attendees?: number | null
  is_public?: boolean
  status?: string
  tags?: string[] | null
}

interface PaginatedEvents {
  data: ApiEvent[]
}

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

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [rsvpedSlugs, setRsvpedSlugs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [eventsRes, rsvpRes] = await Promise.all([
        api.get<PaginatedEvents>("/events"),
        api.get<{ data: ApiEvent[] }>("/member/events/rsvps").catch(() => ({ data: [] as ApiEvent[] })),
      ])
      setEvents(eventsRes.data ?? [])
      setRsvpedSlugs(new Set((rsvpRes.data ?? []).map((e) => e.slug)))
    } catch {
      toast("Could not load events.", "error")
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onRsvp = useCallback(
    async (slug: string) => {
      setBusySlug(slug)
      try {
        const res = await api.post<{ message: string; status?: string }>(
          `/member/events/${slug}/rsvp`
        )
        toast(res.message ?? "RSVP confirmed.", "success")
        setRsvpedSlugs((prev) => new Set(prev).add(slug))
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Could not RSVP."
        toast(msg, "error")
      } finally {
        setBusySlug(null)
      }
    },
    [toast]
  )

  const onCancel = useCallback(
    async (slug: string) => {
      setBusySlug(slug)
      try {
        await api.delete(`/member/events/${slug}/rsvp`)
        toast("RSVP cancelled.", "info")
        setRsvpedSlugs((prev) => {
          const next = new Set(prev)
          next.delete(slug)
          return next
        })
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Could not cancel."
        toast(msg, "error")
      } finally {
        setBusySlug(null)
      }
    },
    [toast]
  )

  const upcoming = events.filter((e) => !["completed", "cancelled"].includes(e.status ?? ""))
  const registered = upcoming.filter((e) => rsvpedSlugs.has(e.slug))

  if (isLoading) {
    return <div className="max-w-4xl text-sm text-gray-500">Loading events…</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Upcoming</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {upcoming.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming events right now.</p>
          )}
          {upcoming.map((event) => {
            const isRegistered = rsvpedSlugs.has(event.slug)
            const isVirtual = event.format === "virtual"
            return (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-[#0A1628] text-white flex flex-col items-center justify-center">
                      <span className="text-xs text-[#C9A84C]">
                        {new Date(event.starts_at).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(event.starts_at).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[#0A1628]">{event.title}</h3>
                        {isRegistered && <Badge variant="success">Registered</Badge>}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(event.starts_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.starts_at)}
                          {event.ends_at && ` – ${formatTime(event.ends_at)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {isVirtual ? "Virtual" : event.location ?? ""}
                        </span>
                        {event.max_attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Max {event.max_attendees} attendees
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(event.tags ?? []).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant={isVirtual ? "secondary" : "default"}>
                          {isVirtual ? "Virtual" : event.type ?? "In-Person"}
                        </Badge>
                        {event.is_public === false && <Badge variant="gold">Members Only</Badge>}
                      </div>
                      <div className="mt-4">
                        {isRegistered ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busySlug === event.slug}
                            onClick={() => onCancel(event.slug)}
                          >
                            {busySlug === event.slug ? "Cancelling…" : "Cancel Registration"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={busySlug === event.slug}
                            onClick={() => onRsvp(event.slug)}
                          >
                            {busySlug === event.slug ? "Submitting…" : "RSVP Now"}
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

        <TabsContent value="registered" className="mt-6 space-y-4">
          {registered.length === 0 && (
            <p className="text-sm text-gray-500">You haven&apos;t registered for any events yet.</p>
          )}
          {registered.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-[#0A1628] text-white flex flex-col items-center justify-center">
                    <span className="text-xs text-[#C9A84C]">
                      {new Date(event.starts_at).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {new Date(event.starts_at).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0A1628]">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.starts_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.format === "virtual" ? "Virtual" : event.location ?? ""}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Badge variant="success">Registered</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-3"
                        disabled={busySlug === event.slug}
                        onClick={() => onCancel(event.slug)}
                      >
                        {busySlug === event.slug ? "Cancelling…" : "Cancel Registration"}
                      </Button>
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
