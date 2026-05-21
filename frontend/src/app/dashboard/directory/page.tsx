"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Building2, TrendingUp, Handshake, CalendarPlus } from "lucide-react"
import { api } from "@/lib/api"

interface Scorecard {
  momentum_score: number
}

interface Company {
  company_name: string
  scorecard: Scorecard
}

interface Founder {
  id: number
  first_name: string
  last_name: string
  city: string
  expertise: string
  immediate_need: string
  companies: Company[]
}

interface PaginatedResponse {
  data: Founder[]
  links?: {
    prev?: string | null
    next?: string | null
  }
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

function clampMomentum(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

export default function FounderDirectoryPage() {
  const [items, setItems] = useState<Founder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<PaginatedResponse>("/founder-directory", {
          params: { page, per_page: 12 },
        })
        if (cancelled) return
        setItems(Array.isArray(response.data) ? response.data : [])
        setLastPage(response.meta?.last_page && response.meta.last_page > 0 ? response.meta.last_page : 1)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load founder directory.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [page])

  const canPrev = useMemo(() => page > 1, [page])
  const canNext = useMemo(() => page < lastPage, [lastPage, page])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-black text-slate-900">Founder Directory</h1>
        <p className="mt-1 text-sm text-slate-600">
          Curated founders with live venture momentum signals.
        </p>
      </section>

      {loading ? <p className="text-sm text-slate-500">Loading founders...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((founder) => {
            const company = founder.companies?.[0]
            const momentum = clampMomentum(company?.scorecard?.momentum_score ?? 0)
            return (
              <article
                key={founder.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
                style={{ boxShadow: "0 8px 30px -14px rgba(15,22,40,0.18)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {founder.first_name} {founder.last_name}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{company?.company_name || "—"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{founder.city || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Core Expertise</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{founder.expertise || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Immediate Need</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{founder.immediate_need || "—"}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[#3B52D4]" />
                      Venture Momentum Index
                    </span>
                    <span>{momentum}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3B52D4] to-[#5D73F0] transition-all"
                      style={{ width: `${momentum}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3B52D4]/35 bg-[#EEF1FF] px-4 py-2.5 text-sm font-bold text-[#3B52D4] hover:bg-[#E3E8FF]">
                    <Handshake className="h-4 w-4" />
                    Request Intro
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100">
                    <CalendarPlus className="h-4 w-4" />
                    Book Discussion
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">
            Page {page} of {lastPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

