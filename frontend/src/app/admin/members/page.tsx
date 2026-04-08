import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { founders } from "@/data/seed"
import { Search, Filter, CheckCircle, XCircle, Eye, Clock, UserCheck, AlertCircle } from "lucide-react"

type ApplicationStatus = "pending" | "reviewing" | "approved" | "rejected" | "waitlisted"

const statusBadge = (status: ApplicationStatus) => {
  switch (status) {
    case "pending": return <Badge variant="warning">Pending</Badge>
    case "reviewing": return <Badge variant="secondary">Reviewing</Badge>
    case "approved": return <Badge variant="success">Approved</Badge>
    case "rejected": return <Badge variant="destructive">Rejected</Badge>
    case "waitlisted": return <Badge variant="outline">Waitlisted</Badge>
  }
}

const applications = founders.map((f, i) => ({
  id: `app-${f.id}`,
  name: f.name,
  company: f.companyName,
  sector: f.sector,
  stage: f.stage,
  score: f.score,
  location: f.location,
  status: (["pending", "reviewing", "approved", "rejected", "pending", "waitlisted"] as ApplicationStatus[])[i],
  submittedAt: new Date(new Date(f.joinedAt).getTime() - 7 * 86400000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  reviewedBy: i === 2 ? "Admin" : i === 3 ? "Admin" : null,
}))

const stats = [
  { label: "Total Applications", value: applications.length, icon: AlertCircle, color: "text-blue-600" },
  { label: "Pending Review", value: applications.filter(a => a.status === "pending").length, icon: Clock, color: "text-amber-600" },
  { label: "Approved", value: applications.filter(a => a.status === "approved").length, icon: UserCheck, color: "text-emerald-600" },
  { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, icon: XCircle, color: "text-red-600" },
]

export default function AdminMembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage membership applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">Export</Button>
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
                placeholder="Search applications by name, company, or sector..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search applications"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Reviewing</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Waitlisted</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by stage"
              >
                <option>All Stages</option>
                <option>Pre-seed</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Scale-up</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Applications ({applications.length})</h3>
            <p className="text-sm text-gray-500">
              {applications.filter(a => a.status === "pending" || a.status === "reviewing").length} awaiting action
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Applicant</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Stage</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Score</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Submitted</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const initials = app.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{app.name}</p>
                            <p className="text-xs text-gray-400">{app.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{app.company}</p>
                        <p className="text-xs text-gray-400">{app.sector}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{app.stage}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#0A1628]">{app.score}</span>
                          <span className="text-xs text-gray-400">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {app.submittedAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${app.name}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {(app.status === "pending" || app.status === "reviewing") && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" aria-label={`Approve ${app.name}`}>
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" aria-label={`Reject ${app.name}`}>
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
