"use client"

import { useEffect, useState } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { EventCard } from "@/components/sections/EventCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { events as seedEvents } from "@/data/seed"
import type { Event } from "@/types"

const tabs = ["All", "Virtual", "In-Person", "Members Only"]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(seedEvents)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/v1/events", {
          headers: { Accept: "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const data = json.data ?? json
          if (Array.isArray(data) && data.length > 0) {
            setEvents(
              data.map((e: Record<string, unknown>) => ({
                id: String(e.id),
                title: String(e.title ?? ""),
                slug: String(e.slug ?? ""),
                description: String(e.description ?? ""),
                date: String(e.starts_at ?? e.date ?? ""),
                endDate: e.ends_at ? String(e.ends_at) : undefined,
                location: String(e.location ?? ""),
                type: String(e.type ?? ""),
                isVirtual: e.format === "virtual",
                maxAttendees: e.max_attendees ? Number(e.max_attendees) : undefined,
                isPublic: Boolean(e.is_public),
                tags: Array.isArray(e.tags) ? e.tags.map(String) : [],
              }))
            )
          }
        }
      } catch {
        // Fallback to seed data
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const virtualEvents = events.filter((e) => e.isVirtual)
  const inPersonEvents = events.filter((e) => !e.isVirtual)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Events Calendar
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Gather With Fellow Founders
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From intimate dinners to virtual roundtables — Wosool events are
            designed for meaningful connections and candid conversations.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 px-4 bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  i === 0
                    ? "bg-[#0A1628] text-white"
                    : "text-gray-600 hover:text-[#0A1628] hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Events */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Upcoming" heading="All Events" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Virtual */}
          {virtualEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">🖥️ Virtual Events</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {virtualEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* In-Person */}
          {inPersonEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">📍 In-Person Events</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {inPersonEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0A1628] mb-4">
            Want to host an event for the community?
          </h2>
          <p className="text-gray-600 mb-8">
            Wosool members can propose and host events. Reach out to tell us
            your idea.
          </p>
          <Button asChild variant="secondary">
            <Link href="/contact">Propose an Event</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0A1628] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Join to access all members-only events
          </h2>
          <p className="text-gray-300 mb-8">
            Many Wosool events are exclusive to members. Apply to join for full
            access.
          </p>
          <Button asChild size="lg">
            <Link href="/apply">Apply to Join</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
