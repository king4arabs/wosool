import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { CompanyCard } from "@/components/sections/CompanyCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { companies } from "@/data/seed"
import { Search, Briefcase, TrendingUp, Users } from "lucide-react"

const sectors = ["All", "Fintech", "HealthTech", "SaaS / B2B", "Logistics", "FoodTech", "HRTech"]
const stages = ["All", "Pre-seed", "Seed", "Series A", "Scale-up"]

export default function CompaniesPage() {
  const hiring = companies.filter((c) => c.isHiring)
  const fundraising = companies.filter((c) => c.isFundraising)
  const collaborating = companies.filter((c) => c.isCollaborating)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Founders&apos; Companies
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Companies Built by Wosool Members
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover startups, growth companies, and scale-ups founded by
            members of the Wosool network.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { icon: Briefcase, value: `${hiring.length}`, label: "Actively Hiring" },
              { icon: TrendingUp, value: `${fundraising.length}`, label: "Fundraising" },
              { icon: Users, value: `${collaborating.length}`, label: "Open to Collaborate" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-5 w-5 text-[#C9A84C]" aria-hidden="true" />
                <span className="text-2xl font-bold text-[#0A1628]">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Directory" heading="All Companies" />

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search companies..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="Search companies"
                />
              </div>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by sector"
              >
                {sectors.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by stage"
              >
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Open Opportunities */}
          {hiring.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C9A84C]" />
                Open for Hiring
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hiring.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}

          {fundraising.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
                Actively Fundraising
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fundraising.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-[#0A1628] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">List your company</h2>
          <p className="text-gray-300 mb-8">
            Wosool members can list their companies and access warm introductions
            from fellow founders.
          </p>
          <Button asChild>
            <Link href="/apply">Apply to Join</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
