import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Users, Building2, CalendarDays, Star, Download } from "lucide-react"

const kpiStats = [
  { label: "Total Members", value: "247", change: "+12%", trend: "up", icon: Users, color: "text-blue-600" },
  { label: "Active Founders", value: "183", change: "+8%", trend: "up", icon: Star, color: "text-amber-600" },
  { label: "Companies", value: "156", change: "+6%", trend: "up", icon: Building2, color: "text-emerald-600" },
  { label: "Events Hosted", value: "24", change: "+3", trend: "up", icon: CalendarDays, color: "text-purple-600" },
]

const monthlySignups = [
  { month: "Jan", value: 18 },
  { month: "Feb", value: 24 },
  { month: "Mar", value: 31 },
  { month: "Apr", value: 22 },
  { month: "May", value: 38 },
  { month: "Jun", value: 42 },
]

const maxSignup = Math.max(...monthlySignups.map(d => d.value))

const sectorDistribution = [
  { sector: "Fintech", count: 42, color: "bg-blue-500" },
  { sector: "HealthTech", count: 28, color: "bg-emerald-500" },
  { sector: "SaaS / B2B", count: 35, color: "bg-purple-500" },
  { sector: "Logistics", count: 19, color: "bg-amber-500" },
  { sector: "FoodTech", count: 14, color: "bg-orange-500" },
  { sector: "HRTech", count: 18, color: "bg-pink-500" },
]

const maxSectorCount = Math.max(...sectorDistribution.map(d => d.count))

const topMetrics = [
  { label: "Avg. Founder Score", value: "80", unit: "/100", change: "+3 pts", trend: "up" },
  { label: "Match Success Rate", value: "73", unit: "%", change: "+5%", trend: "up" },
  { label: "Event Attendance Rate", value: "82", unit: "%", change: "-2%", trend: "down" },
  { label: "Program Completion", value: "89", unit: "%", change: "+4%", trend: "up" },
  { label: "Avg. Response Time", value: "2.4", unit: "hrs", change: "-0.3h", trend: "up" },
  { label: "NPS Score", value: "72", unit: "", change: "+6", trend: "up" },
]

const recentActivity = [
  { metric: "New signups this week", value: "12", change: "+20%" },
  { metric: "Applications submitted", value: "8", change: "+33%" },
  { metric: "Matches made", value: "5", change: "+25%" },
  { metric: "Events RSVPs", value: "67", change: "+15%" },
  { metric: "Profile completions", value: "9", change: "+50%" },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">
            Platform metrics, growth trends, and engagement data.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map(({ label, value, change, trend, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                  {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {change}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Signups Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Monthly Signups</h3>
                <Badge variant="secondary">Last 6 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-48">
                {monthlySignups.map(({ month, value }) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">{value}</span>
                    <div className="w-full relative" style={{ height: "160px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-[#C9A84C] hover:bg-[#b8973f] transition-colors"
                        style={{ height: `${(value / maxSignup) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector Distribution */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Founders by Sector</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {sectorDistribution.map(({ sector, count, color }) => (
              <div key={sector}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{sector}</span>
                  <span className="text-xs font-bold text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${(count / maxSectorCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Key Performance Metrics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {topMetrics.map(({ label, value, unit, change, trend }) => (
                <div key={label} className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#0A1628]">{value}</span>
                    <span className="text-xs text-gray-400">{unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                    {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Snapshot */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">This Week</h3>
              <Badge variant="secondary">vs. last week</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.map(({ metric, value, change }, index) => (
              <div key={metric}>
                <div className="flex items-center justify-between py-3">
                  <p className="text-sm text-gray-700">{metric}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0A1628]">{value}</span>
                    <span className="text-xs text-emerald-600 font-medium">{change}</span>
                  </div>
                </div>
                {index < recentActivity.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
