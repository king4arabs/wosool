import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { FounderCard } from "@/components/sections/FounderCard"
import { EventCard } from "@/components/sections/EventCard"
import { PartnerLogoSlider } from "@/components/sections/PartnerLogoSlider"
import { NewsCard } from "@/components/sections/NewsCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { founders, events, partners, newsItems } from "@/data/seed"
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
  MapPin,
  TrendingUp,
  Target,
  Eye,
  Rocket,
  GraduationCap,
} from "lucide-react"

const trustStats = [
  { label: "Entrepreneurs Supported", value: "250+", icon: Users },
  { label: "Strategic Partners", value: "15+", icon: Globe },
  { label: "Active Programs", value: "6", icon: Layers },
]

const whyWosool = [
  {
    icon: Handshake,
    title: "Founder to Founder",
    description:
      "Every member is a verified entrepreneur. Real connections, real experience — founders supporting founders at every stage.",
  },
  {
    icon: Zap,
    title: "Resources & Mentorship",
    description:
      "Access expert office hours, strategic mentorship, and curated resources designed to accelerate your startup journey.",
  },
  {
    icon: MapPin,
    title: "Saudi-Focused Ecosystem",
    description:
      "Built specifically for Saudi entrepreneurs navigating local opportunities, regulations, and the Vision 2030 landscape.",
  },
]

const pillars = [
  { icon: Target, title: "Strategic Partnerships", description: "Connecting startups with investors and institutions" },
  { icon: Eye, title: "Innovation Culture", description: "Fostering creativity and forward-thinking solutions" },
  { icon: Rocket, title: "Startup Growth", description: "Accelerating success through structured support" },
  { icon: GraduationCap, title: "Skills Development", description: "Training and workshops for founders" },
]

const memberBenefits = [
  { icon: Handshake, label: "Strategic Partnerships" },
  { icon: Users, label: "Founder Circles" },
  { icon: BookOpen, label: "Expert Mentorship" },
  { icon: BrainCircuit, label: "Innovation Labs" },
  { icon: CalendarDays, label: "Curated Events" },
  { icon: TrendingUp, label: "Growth Resources" },
]

export default function HomePage() {
  const featuredFounders = founders.filter((f) => f.isFeatured).slice(0, 3)
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
            Supporting Saudi Entrepreneurs
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Wosool —{" "}
            <span className="text-[#C9A84C]">وصول</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-4">
            Founder to Founders
          </p>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Empowering Saudi entrepreneurs to build successful and sustainable
            businesses through resources, mentorship, and strategic partnerships.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg">
              <Link href="/apply">Apply to Join</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/about">Learn More</Link>
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

      {/* Vision & Mission Snapshot */}
      <section className="py-20 px-4 bg-white" aria-label="Vision and Mission">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2d4a] rounded-2xl p-8 text-white">
              <Eye className="h-8 w-8 text-[#C9A84C] mb-4" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-2">Vision</h3>
              <p className="text-lg leading-relaxed text-gray-200">
                Empowering Saudi entrepreneurs to build successful and sustainable businesses
                while fostering an innovation-driven culture for a thriving economy.
              </p>
            </div>
            <div className="bg-[#F8F5EF] rounded-2xl p-8">
              <Target className="h-8 w-8 text-[#C9A84C] mb-4" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-2">Mission</h3>
              <p className="text-lg leading-relaxed text-gray-700">
                Providing a supportive entrepreneurial environment through resources,
                mentorship, and strategic partnerships to ensure the success and sustainability of startups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Wosool */}
      <section className="py-24 px-4 section-cream" aria-label="Why Wosool">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Why Wosool"
            heading="Built for Saudi entrepreneurs who are serious about building"
            subheading="Wosool is a curated community with resources, programs, and relationships designed to help you build faster and smarter."
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyWosool.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-white"
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

      {/* Our Pillars */}
      <section className="py-24 px-4 bg-white" aria-label="Our Pillars">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Our Objectives"
            heading="What drives us forward"
            centered
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-[#F8F5EF] rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <Icon className="h-8 w-8 text-[#C9A84C] mx-auto mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-[#0A1628] text-sm mb-1">{title}</h3>
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
            eyebrow="Our Services"
            heading="Everything you need to build and scale"
            subheading="Your membership unlocks a full suite of resources, mentorship, and strategic connections."
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
            eyebrow="Featured Entrepreneurs"
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

      {/* Upcoming Events */}
      <section className="py-24 px-4 section-cream" aria-label="Upcoming events">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Events & Training"
            heading="Gather, learn, and grow together"
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

      {/* Partners Slider */}
      <section className="py-20 px-4 bg-white" aria-label="Partners and supporters">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Partners & Supporters"
            heading="Backed by the best in the ecosystem"
            ctaLabel="View All Partners"
            ctaHref="/partners"
            centered
          />
          <PartnerLogoSlider partners={partners} />
        </div>
      </section>

      {/* Latest News */}
      <section className="py-24 px-4 section-cream" aria-label="Latest news">
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
            Join a community of visionary Saudi entrepreneurs committed to building
            successful and sustainable businesses. Applications are reviewed on a rolling basis.
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
