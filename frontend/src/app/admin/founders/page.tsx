import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { founders } from "@/data/seed"
import { Search, Filter, CheckCircle, XCircle, Eye } from "lucide-react"

const statusBadge = (status: string) => {
  switch (status) {
    case "active": return <Badge variant="success">Active</Badge>
    case "pending": return <Badge variant="warning">Pending</Badge>
    case "rejected": return <Badge variant="destructive">Rejected</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
}

const tableFounders = founders.map((f, i) => ({
  ...f,
  status: i === 0 ? "active" : i === 1 ? "active" : i === 2 ? "pending" : i === 3 ? "active" : i === 4 ? "pending" : "active",
  joinedFormatted: new Date(f.joinedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
}))

export default function AdminFoundersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Founders</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and review all founders in the Wosool network.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            + Add Founder
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
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
                placeholder="Search founders by name, company, or sector..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search founders"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by sector"
              >
                <option>All Sectors</option>
                <option>Fintech</option>
                <option>HealthTech</option>
                <option>SaaS / B2B</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Founders ({tableFounders.length})</h3>
            <p className="text-sm text-gray-500">
              {tableFounders.filter((f) => f.status === "pending").length} pending review
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Score</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Joined</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableFounders.map((founder) => {
                  const initials = founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <tr key={founder.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{founder.name}</p>
                            <p className="text-xs text-gray-400">{founder.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{founder.companyName}</p>
                        <p className="text-xs text-gray-400">{founder.sector}</p>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(founder.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#0A1628]">{founder.score}</span>
                          <span className="text-xs text-gray-400">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {founder.joinedFormatted}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${founder.name}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {founder.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" aria-label={`Approve ${founder.name}`}>
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" aria-label={`Reject ${founder.name}`}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
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
  )
}
