import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { founders } from "@/data/seed"
import { Search, Filter, ArrowRight, CheckCircle, XCircle, Link2, Handshake } from "lucide-react"

type MatchStatus = "suggested" | "accepted" | "connected" | "declined"

const statusBadge = (status: MatchStatus) => {
  switch (status) {
    case "suggested": return <Badge variant="warning">Suggested</Badge>
    case "accepted": return <Badge variant="success">Accepted</Badge>
    case "connected": return <Badge variant="gold">Connected</Badge>
    case "declined": return <Badge variant="destructive">Declined</Badge>
  }
}

const matches = [
  { id: "m1", founder1: founders[0], founder2: founders[1], reason: "Both in healthcare/fintech crossover, complementary needs", score: 92, status: "connected" as MatchStatus, matchedAt: "Mar 15, 2026" },
  { id: "m2", founder1: founders[2], founder2: founders[5], reason: "SaaS + HRTech synergy, both Riyadh-based", score: 87, status: "accepted" as MatchStatus, matchedAt: "Mar 18, 2026" },
  { id: "m3", founder1: founders[3], founder2: founders[0], reason: "Logistics meets fintech — supply chain finance opportunity", score: 81, status: "suggested" as MatchStatus, matchedAt: "Mar 20, 2026" },
  { id: "m4", founder1: founders[4], founder2: founders[2], reason: "FoodTech ops automation, shared distribution challenges", score: 76, status: "suggested" as MatchStatus, matchedAt: "Mar 22, 2026" },
  { id: "m5", founder1: founders[1], founder2: founders[5], reason: "HealthTech talent pipeline through HRTech platform", score: 84, status: "accepted" as MatchStatus, matchedAt: "Mar 10, 2026" },
  { id: "m6", founder1: founders[0], founder2: founders[3], reason: "Fintech payments for logistics — potential integration", score: 72, status: "declined" as MatchStatus, matchedAt: "Mar 5, 2026" },
]

const stats = [
  { label: "Total Matches", value: matches.length, icon: Link2, color: "text-blue-600" },
  { label: "Suggested", value: matches.filter(m => m.status === "suggested").length, icon: Handshake, color: "text-amber-600" },
  { label: "Accepted", value: matches.filter(m => m.status === "accepted").length, icon: CheckCircle, color: "text-emerald-600" },
  { label: "Connected", value: matches.filter(m => m.status === "connected").length, icon: Link2, color: "text-purple-600" },
]

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminMatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage founder-to-founder match suggestions and connections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            + Suggest Match
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
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

      {/* Search */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search matches by founder name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search matches"
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              aria-label="Filter by status"
            >
              <option>All Status</option>
              <option>Suggested</option>
              <option>Accepted</option>
              <option>Connected</option>
              <option>Declined</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Match Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Matches ({matches.length})</h3>
            <p className="text-sm text-gray-500">
              {matches.filter(m => m.status === "suggested").length} pending action
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {/* Founder 1 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">{getInitials(match.founder1.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{match.founder1.name}</p>
                  <p className="text-xs text-gray-400 truncate">{match.founder1.companyName} · {match.founder1.sector}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <ArrowRight className="h-4 w-4 text-gray-300" aria-hidden="true" />
              </div>

              {/* Founder 2 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">{getInitials(match.founder2.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{match.founder2.name}</p>
                  <p className="text-xs text-gray-400 truncate">{match.founder2.companyName} · {match.founder2.sector}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-500">{match.matchedAt}</p>
                  <p className="text-xs font-bold text-[#0A1628]">Score: {match.score}</p>
                </div>
                {statusBadge(match.status)}
                {match.status === "suggested" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" aria-label="Approve match">
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" aria-label="Decline match">
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
