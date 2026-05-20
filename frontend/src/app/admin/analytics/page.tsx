"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { type AdminAnalyticsResponse } from "@/lib/admin"

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse["data"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<AdminAnalyticsResponse>("/admin/analytics")
      .then((response) => setAnalytics(response.data))
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  }

  if (!analytics) {
    return <div className="text-sm text-gray-500">Loading analytics…</div>
  }

  const kpiEntries = [
    ["Total Members", analytics.kpis.total_members],
    ["Active Founders", analytics.kpis.active_founders],
    ["Companies", analytics.kpis.companies],
    ["Events Hosted", analytics.kpis.events_hosted],
  ]

  const maxSignup = Math.max(...analytics.monthly_signups.map((entry) => entry.value), 1)
  const maxSector = Math.max(...analytics.sector_distribution.map((entry) => entry.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Production KPIs and weekly operating signals from the backend.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiEntries.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Monthly Signups</h3>
                <Badge variant="secondary">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-48">
                {analytics.monthly_signups.map(({ month, value }) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">{value}</span>
                    <div className="w-full relative" style={{ height: "160px" }}>
                      <div className="absolute bottom-0 w-full rounded-t-md bg-[#C9A84C]" style={{ height: `${(value / maxSignup) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Founders by Sector</h3></CardHeader>
          <CardContent className="space-y-3">
            {analytics.sector_distribution.map(({ sector, count }) => (
              <div key={sector}>
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-600">{sector}</span><span className="text-xs font-bold text-gray-900">{count}</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#0A1628]" style={{ width: `${(count / maxSector) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">This Week</h3></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.recent_activity.map((item) => (
            <div key={item.metric} className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">{item.metric}</p>
              <p className="mt-2 text-2xl font-bold text-[#0A1628]">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
