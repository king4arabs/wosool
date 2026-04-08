import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { companies, founders } from "@/data/seed"
import { Search, Filter, Building2, Eye, ExternalLink } from "lucide-react"

const tableCompanies = companies.map((c) => ({
  ...c,
  founder: founders.find((f) => f.id === c.founderIds[0])?.name ?? "—",
  foundedFormatted: c.foundedYear.toString(),
}))

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage companies in the Wosool network.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            + Add Company
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
                placeholder="Search companies by name, sector, or location..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search companies"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by sector"
              >
                <option>All Sectors</option>
                <option>Fintech</option>
                <option>HealthTech</option>
                <option>SaaS / B2B</option>
                <option>Logistics</option>
                <option>FoodTech</option>
                <option>HRTech</option>
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
            <h3 className="font-semibold text-gray-900">All Companies ({tableCompanies.length})</h3>
            <p className="text-sm text-gray-500">
              {tableCompanies.filter(c => c.isHiring).length} hiring · {tableCompanies.filter(c => c.isFundraising).length} fundraising
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Founder</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Sector</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Stage</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Team Size</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-400">{company.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{company.founder}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{company.sector}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{company.stage}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{company.teamSize}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {company.isHiring && <Badge variant="success">Hiring</Badge>}
                        {company.isFundraising && <Badge variant="warning">Fundraising</Badge>}
                        {company.isCollaborating && <Badge variant="secondary">Collaborating</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${company.name}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {company.website && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Visit ${company.name} website`}>
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
