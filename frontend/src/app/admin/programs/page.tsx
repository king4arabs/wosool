import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { programs } from "@/data/seed"
import { Search, Filter, BookOpen, Users, Clock, Plus, Eye, Edit } from "lucide-react"

const tablePrograms = programs.map((p, i) => ({
  ...p,
  applicants: [45, 32, 18, 27][i],
  enrolled: [20, 8, 0, 12][i],
  deadlineFormatted: p.applicationDeadline
    ? new Date(p.applicationDeadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Rolling",
}))

const stats = [
  { label: "Total Programs", value: programs.length, icon: BookOpen, color: "text-blue-600" },
  { label: "Open for Applications", value: programs.filter(p => p.isOpen).length, icon: BookOpen, color: "text-emerald-600" },
  { label: "Total Applicants", value: tablePrograms.reduce((sum, p) => sum + p.applicants, 0), icon: Users, color: "text-amber-600" },
  { label: "Enrolled", value: tablePrograms.reduce((sum, p) => sum + p.enrolled, 0), icon: Users, color: "text-purple-600" },
]

export default function AdminProgramsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage programs, cohorts, and application pipelines.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Program
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
                placeholder="Search programs by name or category..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search programs"
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              aria-label="Filter by status"
            >
              <option>All Status</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Program Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tablePrograms.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{program.category}</p>
                </div>
                <Badge variant={program.isOpen ? "success" : "secondary"}>
                  {program.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{program.duration}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    <p className="text-xs text-gray-500">Cohort Size</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{program.cohortSize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{program.deadlineFormatted}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Applicants</p>
                    <p className="text-sm font-bold text-[#0A1628]">{program.applicants}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Enrolled</p>
                    <p className="text-sm font-bold text-[#0A1628]">{program.enrolled}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${program.name}`}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${program.name}`}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
