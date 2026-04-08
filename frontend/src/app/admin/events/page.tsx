import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { events } from "@/data/seed"
import { Search, Filter, CalendarDays, MapPin, Users, Eye, Edit, Plus } from "lucide-react"

const tableEvents = events.map((e, i) => ({
  ...e,
  rsvpCount: [32, 18, 28, 15, 42, 67][i],
  dateFormatted: new Date(e.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  timeFormatted: new Date(e.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  status: new Date(e.date) > new Date() ? "upcoming" : "past",
}))

const stats = [
  { label: "Total Events", value: events.length, icon: CalendarDays, color: "text-blue-600" },
  { label: "Upcoming", value: tableEvents.filter(e => e.status === "upcoming").length, icon: CalendarDays, color: "text-emerald-600" },
  { label: "In-Person", value: events.filter(e => !e.isVirtual).length, icon: MapPin, color: "text-purple-600" },
  { label: "Total RSVPs", value: tableEvents.reduce((sum, e) => sum + e.rsvpCount, 0), icon: Users, color: "text-amber-600" },
]

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-500 text-sm mt-1">
            Create, manage, and track all Wosool events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
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
                placeholder="Search events by title or location..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search events"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by type"
              >
                <option>All Types</option>
                <option>In-Person</option>
                <option>Virtual</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Upcoming</option>
                <option>Past</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Events ({tableEvents.length})</h3>
            <p className="text-sm text-gray-500">
              {tableEvents.filter(e => e.status === "upcoming").length} upcoming
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Event</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">RSVPs</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Visibility</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-gray-400" aria-hidden="true" />
                          <p className="text-xs text-gray-400">{event.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{event.dateFormatted}</p>
                      <p className="text-xs text-gray-400">{event.timeFormatted}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.isVirtual ? "secondary" : "outline"}>
                        {event.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#0A1628]">{event.rsvpCount}</span>
                        {event.maxAttendees && (
                          <span className="text-xs text-gray-400">/{event.maxAttendees}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.isPublic ? "success" : "warning"}>
                        {event.isPublic ? "Public" : "Members Only"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${event.title}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${event.title}`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
