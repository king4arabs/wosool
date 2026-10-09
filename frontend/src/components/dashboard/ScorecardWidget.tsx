"use client"

import { useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import type { Scorecard } from "@/types/platform"
import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { dashboardDictionary } from "@/lib/dashboard-i18n"

interface ScorecardWidgetProps {
  initialScorecard: Scorecard | null
  locale: DashboardLocale
}

export default function ScorecardWidget({ initialScorecard, locale }: ScorecardWidgetProps) {
  const copy = dashboardDictionary[locale].scorecard
  const [scorecard, setScorecard] = useState<Scorecard | null>(initialScorecard)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const metrics = useMemo(() => {
    if (!scorecard) return []
    return [
      { label: copy.momentum,     value: scorecard.tracking.momentum,      color: "#3B52D4" },
      { label: copy.growth,       value: scorecard.tracking.growth,         color: "#059669" },
      { label: copy.readiness,    value: scorecard.tracking.readiness,      color: "#7c3aed" },
      { label: copy.supportDelta, value: scorecard.tracking.support_delta,  color: "#0891b2" },
    ]
  }, [copy.growth, copy.momentum, copy.readiness, copy.supportDelta, scorecard])

  async function triggerRecalculate(): Promise<void> {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/v1/member/scorecard/recalculate", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "X-Locale": locale },
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message || copy.recalculateFailed)
      const next = payload?.data as Scorecard | undefined
      if (!next) throw new Error(copy.invalidResponse)
      setScorecard(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unexpectedError)
    } finally {
      setIsLoading(false)
    }
  }

  if (!scorecard) {
    return (
      <div
        className="rounded-2xl border border-slate-200/80 bg-white p-6"
        style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.05)" }}
      >
        <h3 className="text-sm font-black text-slate-900 mb-1">{copy.title}</h3>
        <p className="text-xs text-slate-400">{copy.noData}</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#3B52D4] mb-2">
            {copy.badge}
          </div>
          <h3 className="text-sm font-black text-slate-900">{copy.title}</h3>
        </div>
        <button
          type="button"
          onClick={triggerRecalculate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          {copy.recalculate}
        </button>
      </div>

      {/* Aggregate score */}
      <div
        className="rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] px-5 py-4 flex items-center justify-between"
      >
        <p className="text-xs font-extrabold text-[#3B52D4] uppercase tracking-wider">{copy.aggregate}</p>
        <p className="text-2xl font-black text-[#3B52D4]">{scorecard.aggregate_score}</p>
      </div>

      {/* Metric bars */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-600">{metric.label}</span>
              <span className="font-black text-slate-900">{metric.value}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metric.value, 100)}%`, background: metric.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}
