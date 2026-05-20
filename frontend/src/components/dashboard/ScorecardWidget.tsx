"use client"

import { useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Scorecard } from "@/types/platform"

interface ScorecardWidgetProps {
  initialScorecard: Scorecard | null
}

export default function ScorecardWidget({ initialScorecard }: ScorecardWidgetProps) {
  const [scorecard, setScorecard] = useState<Scorecard | null>(initialScorecard)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const metrics = useMemo(() => {
    if (!scorecard) return []
    return [
      { label: "Momentum", value: scorecard.tracking.momentum },
      { label: "Growth", value: scorecard.tracking.growth },
      { label: "Readiness", value: scorecard.tracking.readiness },
      { label: "Support Delta", value: scorecard.tracking.support_delta },
    ]
  }, [scorecard])

  async function triggerRecalculate(): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/member/scorecard/recalculate", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to recalculate scorecard")
      }

      const next = payload?.data as Scorecard | undefined
      if (!next) {
        throw new Error("Invalid scorecard response")
      }

      setScorecard(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!scorecard) {
    return (
      <Card className="border-[#1E293B] bg-[#121826] text-slate-100">
        <CardHeader>
          <CardTitle>Founder Scorecard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-400">No scorecard data is available yet.</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#1E293B] bg-[#121826] text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Founder Scorecard</CardTitle>
        <Button
          type="button"
          size="sm"
          onClick={triggerRecalculate}
          disabled={isLoading}
          className="bg-[#0EA5E9] text-[#0B0F19] hover:bg-[#38bdf8]"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Recalculate
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[#1E293B] bg-[#0B0F19] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Aggregate Score</p>
          <p className="mt-1 text-3xl font-semibold text-[#0EA5E9]">{scorecard.aggregate_score}</p>
        </div>

        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-300">{metric.label}</span>
              <span className="font-medium text-slate-100">{metric.value}</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
