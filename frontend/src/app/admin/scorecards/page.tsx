import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { founders } from "@/data/seed"
import { Search, Trophy, TrendingUp, BarChart3 } from "lucide-react"

const sortedFounders = [...founders].sort((a, b) => b.score - a.score)

const categoryAverages = [
  { category: "Product & Traction", average: 78, total: 100 },
  { category: "Team & Leadership", average: 82, total: 100 },
  { category: "Market Opportunity", average: 74, total: 100 },
  { category: "Fundraising Readiness", average: 69, total: 100 },
  { category: "Network & Community", average: 85, total: 100 },
]

const scoreDistribution = [
  { range: "90–100", count: 1, color: "bg-emerald-500" },
  { range: "80–89", count: 2, color: "bg-emerald-400" },
  { range: "70–79", count: 2, color: "bg-amber-400" },
  { range: "60–69", count: 1, color: "bg-orange-400" },
  { range: "Below 60", count: 0, color: "bg-red-400" },
]

const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1)

export default function AdminScorecardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scorecards</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track founder scores and performance across categories.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Average Score", value: Math.round(founders.reduce((sum, f) => sum + f.score, 0) / founders.length), icon: TrendingUp, color: "text-blue-600" },
          { label: "Highest Score", value: sortedFounders[0].score, icon: Trophy, color: "text-amber-600" },
          { label: "Founders Scored", value: founders.length, icon: BarChart3, color: "text-emerald-600" },
          { label: "Above 80", value: founders.filter(f => f.score >= 80).length, icon: TrendingUp, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Founders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Top Founders by Score</h3>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search founders..."
                    className="pl-10 pr-4 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    aria-label="Search founders"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Rank</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Founder</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Sector</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Score</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedFounders.map((founder, index) => {
                      const initials = founder.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                      return (
                        <tr key={founder.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                              index === 0 ? "bg-amber-100 text-amber-700" :
                              index === 1 ? "bg-gray-200 text-gray-700" :
                              index === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-gray-50 text-gray-500"
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{founder.name}</p>
                                <p className="text-xs text-gray-400">{founder.companyName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">{founder.sector}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#0A1628]">{founder.score}</span>
                            <span className="text-xs text-gray-400">/100</span>
                          </td>
                          <td className="px-6 py-4 w-32">
                            <Progress value={founder.score} className="h-2" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Averages & Distribution */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Average by Category</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryAverages.map(({ category, average }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">{category}</p>
                    <p className="text-xs font-bold text-gray-900">{average}%</p>
                  </div>
                  <Progress value={average} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Score Distribution</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {scoreDistribution.map(({ range, count, color }) => (
                <div key={range} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{range}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
