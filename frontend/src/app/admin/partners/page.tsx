import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { partners } from "@/data/seed"
import { Search, Filter, Handshake, Eye, ExternalLink, Plus } from "lucide-react"

const statusBadge = (status: string) => {
  switch (status) {
    case "Confirmed": return <Badge variant="success">Confirmed</Badge>
    case "Prospective": return <Badge variant="warning">Prospective</Badge>
    case "Ecosystem-Aligned": return <Badge variant="secondary">Ecosystem-Aligned</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

const typeBadge = (type: string) => {
  switch (type) {
    case "Ecosystem Partner": return <Badge variant="gold">Ecosystem</Badge>
    case "Knowledge Partner": return <Badge variant="secondary">Knowledge</Badge>
    case "Community Partner": return <Badge variant="outline">Community</Badge>
    case "Strategic Supporter": return <Badge variant="default">Strategic</Badge>
    default: return <Badge variant="secondary">{type}</Badge>
  }
}

export default function AdminPartnersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partners</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage ecosystem, knowledge, and strategic partners.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Partners", value: partners.length, color: "text-blue-600" },
          { label: "Confirmed", value: partners.filter(p => p.status === "Confirmed").length, color: "text-emerald-600" },
          { label: "Prospective", value: partners.filter(p => p.status === "Prospective").length, color: "text-amber-600" },
          { label: "Partner Types", value: new Set(partners.map(p => p.type)).size, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Handshake className={`h-5 w-5 ${color}`} aria-hidden="true" />
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
                placeholder="Search partners by name or sector..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search partners"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Prospective</option>
                <option>Ecosystem-Aligned</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by type"
              >
                <option>All Types</option>
                <option>Ecosystem Partner</option>
                <option>Knowledge Partner</option>
                <option>Community Partner</option>
                <option>Strategic Supporter</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Partners ({partners.length})</h3>
            <p className="text-sm text-gray-500">
              {partners.filter(p => p.status === "Confirmed").length} confirmed
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Partner</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Sector</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Handshake className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{partner.name}</p>
                          <p className="text-xs text-gray-400 max-w-xs truncate">{partner.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{typeBadge(partner.type)}</td>
                    <td className="px-6 py-4 text-gray-700">{partner.sector}</td>
                    <td className="px-6 py-4">{statusBadge(partner.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${partner.name}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {partner.website && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Visit ${partner.name} website`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
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
