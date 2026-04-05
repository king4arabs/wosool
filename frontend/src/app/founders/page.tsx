import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { FounderCard } from "@/components/sections/FounderCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { founders } from "@/data/seed"
import { Search } from "lucide-react"

const sectors = ["All", "Fintech", "HealthTech", "SaaS / B2B", "Logistics", "FoodTech", "HRTech"]
const stages = ["All", "Pre-seed", "Seed", "Series A", "Scale-up", "Exited"]
const locations = ["All", "Saudi Arabia", "UAE", "Bahrain", "Kuwait", "Qatar"]

export default function FoundersPage() {
  const featuredFounders = founders.filter((f) => f.isFeatured)
  const allFounders = founders

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Founders Directory
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Meet Our Founders</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            250+ verified founders building companies across Saudi Arabia, UAE,
            and the broader GCC region.
          </p>
        </div>
      </section>

      {/* Featured Founders */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Featured Members"
            heading="Spotlight founders"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFounders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        </div>
      </section>

      {/* Directory with Filters */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Directory"
            heading="All Founders"
          />

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search founders by name, company, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="Search founders"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="Filter by sector"
                >
                  {sectors.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="Filter by stage"
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="Filter by location"
                >
                  {locations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {allFounders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Showing {allFounders.length} of 250+ founders. Members-only profiles require login.
            </p>
            <Button asChild variant="secondary">
              <Link href="/login">Login to See All Founders</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Book a Discussion CTA */}
      <section className="py-20 px-4 bg-[#0A1628] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Want a warm introduction?</h2>
          <p className="text-gray-300 mb-8">
            Members can request curated introductions through the platform. Not
            a member yet? Apply to join.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/apply">Apply to Join</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Book a Discussion</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
