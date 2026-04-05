import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { FounderCard } from "@/components/sections/FounderCard"
import { CompanyCard } from "@/components/sections/CompanyCard"
import { EventCard } from "@/components/sections/EventCard"
import { PartnerCard } from "@/components/sections/PartnerCard"
import { NewsCard } from "@/components/sections/NewsCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { founders, companies, events, partners, newsItems } from "@/data/seed"
import {
  Users,
  Globe,
  Layers,
  Handshake,
  Zap,
  CalendarDays,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  Star,
  MapPin,
  TrendingUp,
} from "lucide-react"

const trustStats = [
  { label: "Founders", value: "250+", icon: Users },
  { label: "Countries", value: "15", icon: Globe },
  { label: "Active Cohorts", value: "3", icon: Layers },
]

const whyWosool = [
  {
    icon: Handshake,
    title: "Trusted Network",
    description:
      "Every member is vetted and verified. No noise — just genuine founders who've earned their seat at the table.",
  },
  {
    icon: Zap,
    title: "Execution Support",
    description:
      "Expert office hours, warm intros, peer circles, and AI-powered matching to help you move faster.",
  },
  {
    icon: MapPin,
    title: "Saudi & GCC Focus",
    description:
      "Built for founders navigating the specific opportunities and challenges of the Saudi and GCC market.",
  },
]

const founderStages = [
  { stage: "Pre-seed", description: "Validating and building" },
  { stage: "Seed", description: "Finding product-market fit" },
  { stage: "Series A", description: "Scaling go-to-market" },
  { stage: "Scale-up", description: "Expanding regionally" },
  { stage: "Exited Founders", description: "Giving back, advising" },
]

const memberBenefits = [
  { icon: Handshake, label: "Warm Introductions" },
  { icon: Users, label: "Founder Circles" },
  { icon: BookOpen, label: "Expert Office Hours" },
  { icon: BrainCircuit, label: "AI Matching Engine" },
  { icon: CalendarDays, label: "Curated Events" },
  { icon: TrendingUp, label: "Growth Resources" },
]

export default function HomePage() {
  const featuredFounders = founders.filter((f) => f.isFeatured).slice(0, 3)
  const featuredCompanies = companies.slice(0, 3)
  const upcomingEvents = events.slice(0, 3)
  const latestNews = newsItems.slice(0, 3)

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="relative bg-[#0A1628] text-white py-28 px-4 overflow-hidden"
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-6 text-xs px-4 py-1.5 uppercase tracking-widest">
            Founders to Founders
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Wosool —{" "}
            <span className="text-[#C9A84C]">وصول</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
            The premium founders-to-founders network for ambitious entrepreneurs
            building in Saudi Arabia and the GCC.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg">
              <Link href="/apply">Apply to Join</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/founders">Explore Founders</Link>
            </Button>
          </div>

          {/* Trust stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-white/10">
            {trustStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5 text-[#C9A84C] mb-1" aria-hidden="true" />
                <span className="text-3xl font-bold text-white">{value}</span>
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Wosool */}
      <section className="py-24 px-4 bg-white" aria-label="Why Wosool">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Why Wosool"
            heading="Built for founders who are serious about building"
            subheading="Wosool is not a generic network. It's a curated community with tools, programs, and relationships designed to help you build faster."
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyWosool.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#F8F5EF]"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#0A1628] flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-[#C9A84C]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A1628] mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 px-4 section-cream" aria-label="Who Wosool is for">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Who It&apos;s For"
            heading="For founders at every stage of the journey"
            centered
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {founderStages.map(({ stage, description }) => (
              <div
                key={stage}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Star className="h-6 w-6 text-[#C9A84C] mx-auto mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-[#0A1628] text-sm mb-1">{stage}</h3>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Members Get */}
      <section className="py-24 px-4 bg-[#0A1628] text-white" aria-label="Member benefits">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="What Members Get"
            heading="Everything you need to build faster"
            subheading="Your membership unlocks a full suite of tools, programs, and connections."
            centered
            light
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {memberBenefits.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-center"
              >
                <Icon className="h-7 w-7 text-[#C9A84C]" aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link href="/apply">Apply to Join</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Founders */}
      <section className="py-24 px-4 bg-white" aria-label="Featured founders">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Featured Founders"
            heading="Meet some of our members"
            ctaLabel="See All Founders"
            ctaHref="/founders"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFounders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        </div>
      </section>

      {/* Founders' Companies */}
      <section className="py-24 px-4 section-cream" aria-label="Founders' companies">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Founders&apos; Companies"
            heading="Companies built by Wosool members"
            ctaLabel="Explore Companies"
            ctaHref="/founders/companies"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 px-4 bg-white" aria-label="Upcoming events">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Upcoming Events"
            heading="Gather with fellow founders"
            ctaLabel="View Calendar"
            ctaHref="/events"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 px-4 section-cream" aria-label="Partners and supporters">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Partners & Supporters"
            heading="Backed by the best in the ecosystem"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-24 px-4 bg-white" aria-label="Latest news">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Latest News"
            heading="Stories from the ecosystem"
            ctaLabel="Read All News"
            ctaHref="/news"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-24 px-4 bg-[#0A1628] text-white text-center"
        aria-label="Join Wosool"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to join{" "}
            <span className="text-[#C9A84C]">Wosool?</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Applications are reviewed on a rolling basis. Join a trusted network
            of verified founders committed to building something meaningful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/apply">Apply to Join <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
