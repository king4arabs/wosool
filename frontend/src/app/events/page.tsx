"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { EventCard } from "@/components/sections/EventCard"
import { Button } from "@/components/ui/button"
import { eventsPageCopy, getSeedEvents, localizeEvent } from "@/data/localized-seed"
import { getCollectionItems, type ApiEvent, fetchJson, mapEvent, type WrappedResponse } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import type { Event, PaginatedResponse } from "@/types"

export default function EventsPage() {
  const { locale } = useLocale()
  const copy = eventsPageCopy[locale]
  const [events, setEvents] = useState<Event[]>(() => getSeedEvents(locale))
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    setEvents(getSeedEvents(locale))
  }, [locale])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetchJson<PaginatedResponse<ApiEvent> | WrappedResponse<ApiEvent[]>>("/api/v1/events")
        const items = getCollectionItems(response).map((item) => localizeEvent(mapEvent(item), locale))
        if (items.length > 0) setEvents(items)
      } catch {
        // seeded fallback stays
      }
    }
    void fetchEvents()
  }, [locale])

  const virtualEvents   = events.filter((e) =>  e.isVirtual)
  const inPersonEvents  = events.filter((e) => !e.isVirtual)
  const membersOnly     = events.filter((e) => !e.isPublic)

  const filtered =
    activeTab === 0 ? events :
    activeTab === 1 ? virtualEvents :
    activeTab === 2 ? inPersonEvents :
    membersOnly

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/4 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
            {copy.badge}
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            {copy.title.split(" ").slice(0, 3).join(" ")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
              {copy.title.split(" ").slice(3).join(" ")}
            </span>
          </h1>

          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {copy.description}
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[
              { label: locale === "ar" ? `${events.length} فعالية` : `${events.length} events` },
              { label: locale === "ar" ? `${virtualEvents.length} عن بُعد` : `${virtualEvents.length} virtual` },
              { label: locale === "ar" ? `${inPersonEvents.length} حضورية` : `${inPersonEvents.length} in-person` },
            ].map(({ label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600"
                style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab filter ── */}
      <div
        className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5"
        style={{ boxShadow: "0 2px 8px -2px rgba(15,22,40,0.04)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {copy.tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all"
                style={
                  activeTab === i
                    ? { background: "#3B52D4", color: "#fff", boxShadow: "0 4px 12px -2px rgba(59,82,212,0.3)" }
                    : { background: "#F8FAFC", color: "#64748b", border: "1px solid #E2E8F0" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Events grid ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {copy.eyebrow}
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.heading}</h2>
            </div>
            <span className="shrink-0 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400 font-medium">
                {locale === "ar" ? "لا توجد فعاليات في هذه الفئة" : "No events in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Suggest an event ── */}
      <section className="py-16 px-4 bg-[#F5F7FF]">
        <div className="mx-auto max-w-5xl">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/90 border border-slate-200/80 rounded-2xl px-8 py-8"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
          >
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                {locale === "ar" ? "للمجتمع" : "Community"}
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">{copy.ctaTitle}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{copy.ctaBody}</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold shrink-0"
            >
              <Link href="/contact">{copy.cta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Member CTA ── */}
      <section className="py-20 px-4 bg-slate-50/60">
        <div className="mx-auto max-w-2xl">
          <div
            className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-8 py-12 text-center relative overflow-hidden"
            style={{ boxShadow: "0 8px 40px -8px rgba(59,82,212,0.1)" }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#3B52D4]/6 blur-[80px]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {locale === "ar" ? "العضوية" : "Membership"}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.memberTitle}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">{copy.memberBody}</p>
              <Button
                asChild
                className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
              >
                <Link href="/apply">{copy.memberCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
