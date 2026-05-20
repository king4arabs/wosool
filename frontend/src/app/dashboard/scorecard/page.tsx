"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"

type ScorecardResponse = {
  data: {
    overall_score: number
    ai_summary?: string | null
    improvement_suggestions?: string[] | null
    metrics?: Array<{
      id: number
      metric_label: string
      value: number
      max_value: number
      explanation?: string | null
    }>
  }
}

type ScoreHistoryResponse = {
  data: Array<{ label: string; overall_score: number }>
}

export default function ScorecardPage() {
  const [scorecard, setScorecard] = useState<ScorecardResponse["data"] | null>(null)
  const [history, setHistory] = useState<ScoreHistoryResponse["data"]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<ScorecardResponse>("/member/scorecard"),
      api.get<ScoreHistoryResponse>("/member/scorecard/history").catch(() => ({ data: [] })),
    ])
      .then(([scorecardResponse, historyResponse]) => {
        setScorecard(scorecardResponse.data)
        setHistory(historyResponse.data)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Scorecard is not available yet for your profile.</div>
  }

  if (!scorecard) {
    return <div className="text-sm text-gray-500">Loading scorecard…</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="h-28 w-28 rounded-full bg-[#0A1628] flex flex-col items-center justify-center mb-2">
                <Star className="h-5 w-5 text-[#C9A84C] mb-1" aria-hidden="true" />
                <span className="text-4xl font-bold text-white">{scorecard.overall_score}</span>
              </div>
              <Badge variant="gold">Live score</Badge>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Your Founder Score</h2>
              <p className="text-gray-600 mb-4">
                {scorecard.ai_summary || "Your score reflects the current strength of your profile, community presence, and network fit."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Score Breakdown</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {(scorecard.metrics ?? []).map((metric) => (
            <div key={metric.id}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-medium text-sm text-[#0A1628]">{metric.metric_label}</span>
                  {metric.explanation && <span className="text-xs text-gray-500 ml-2">{metric.explanation}</span>}
                </div>
                <span className="font-bold text-[#0A1628] text-sm">{metric.value}/{metric.max_value}</span>
              </div>
              <Progress value={(metric.value / metric.max_value) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#0A1628] flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#C9A84C]" />Score History</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((point) => (
              <div key={point.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{point.label}</span>
                <span className="font-semibold text-[#0A1628]">{point.overall_score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">How to Improve</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {(scorecard.improvement_suggestions ?? []).length === 0 && (
            <p className="text-sm text-gray-500">No improvement suggestions yet.</p>
          )}
          {(scorecard.improvement_suggestions ?? []).map((suggestion) => (
            <div key={suggestion} className="rounded-xl bg-[#F8F5EF] px-4 py-3 text-sm text-gray-700">{suggestion}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
