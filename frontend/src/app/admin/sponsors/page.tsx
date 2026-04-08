import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { sponsors } from "@/data/seed"
import { Search, Filter, Award, Eye, ExternalLink, Plus } from "lucide-react"

const tierBadge = (tier: string) => {
  switch (tier) {
    case "Platinum": return <Badge variant="gold">Platinum</Badge>
    case "Gold": return <Badge variant="warning">Gold</Badge>
    case "Silver": return <Badge variant="secondary">Silver</Badge>
    case "Bronze": return <Badge variant="outline">Bronze</Badge>
    default: return <Badge variant="secondary">{tier}</Badge>
  }
}

const tableSponsors = sponsors.map((s, i) => ({
  ...s,
  contractStart: ["Jan 2026", "Mar 2026", "Feb 2026"][i],
  contractEnd: ["Dec 2026", "Feb 2027", "Jan 2027"][i],
  amount: ["SAR 500,000", "SAR 250,000", "SAR 100,000"][i],
}))

export default function AdminSponsorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sponsors</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage sponsor relationships, tiers, and contracts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sponsors", value: sponsors.length, color: "text-blue-600" },
          { label: "Active", value: sponsors.filter(s => s.isActive).length, color: "text-emerald-600" },
          { label: "Platinum", value: sponsors.filter(s => s.tier === "Platinum").length, color: "text-amber-600" },
          { label: "Total Value", value: "SAR 850K", color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Award className={`h-5 w-5 ${color}`} aria-hidden="true" />
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
                placeholder="Search sponsors by name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search sponsors"
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              aria-label="Filter by tier"
            >
              <option>All Tiers</option>
              <option>Platinum</option>
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Sponsors ({tableSponsors.length})</h3>
            <p className="text-sm text-gray-500">
              {tableSponsors.filter(s => s.isActive).length} active
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Sponsor</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Tier</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Contract</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Award className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sponsor.name}</p>
                          <p className="text-xs text-gray-400 max-w-xs truncate">{sponsor.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{tierBadge(sponsor.tier)}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{sponsor.contractStart}</p>
                      <p className="text-xs text-gray-400">to {sponsor.contractEnd}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#0A1628]">{sponsor.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={sponsor.isActive ? "success" : "secondary"}>
                        {sponsor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${sponsor.name}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {sponsor.website && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Visit ${sponsor.name} website`}>
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
