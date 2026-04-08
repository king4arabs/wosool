import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { BoardMemberCard } from "@/components/sections/BoardMemberCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Target, Eye, Compass, Users, Rocket, Handshake, GraduationCap, Lightbulb } from "lucide-react"
import { boardMembers } from "@/data/seed"

const objectives = [
  {
    icon: Rocket,
    title: "Empower Entrepreneurs",
    description: "Support and empower Saudi entrepreneurs in a dynamic ecosystem.",
  },
  {
    icon: Handshake,
    title: "Enhance Networking",
    description: "Enhance networking and partnerships between entrepreneurs and investors.",
  },
  {
    icon: Lightbulb,
    title: "Innovative Solutions",
    description: "Provide innovative financial and investment solutions for startups.",
  },
  {
    icon: GraduationCap,
    title: "Develop Skills",
    description: "Organize educational and training events to develop members' skills.",
  },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Who We Are
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            About <span className="text-[#C9A84C]">Wosool</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Supporting Saudi entrepreneurs — founders to founders. We empower
            visionary builders with the resources, mentorship, and connections
            they need to create lasting impact.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            {/* Vision */}
            <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2d4a] rounded-3xl p-10 text-white flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-[#C9A84C]/20 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-[#C9A84C]" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
                Our Vision
              </p>
              <h2 className="text-3xl font-bold mb-6">
                Innovation-Driven Future
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg flex-1">
                Empowering Saudi entrepreneurs to build successful and sustainable
                businesses while fostering an innovation-driven culture for a
                thriving economy.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-[#F8F5EF] rounded-3xl p-10 flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-[#0A1628] flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-[#C9A84C]" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
                Our Mission
              </p>
              <h2 className="text-3xl font-bold text-[#0A1628] mb-6">
                Building the Ecosystem
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg flex-1">
                Providing a supportive entrepreneurial environment through resources,
                mentorship, and strategic partnerships to ensure the success and
                sustainability of startups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-24 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Our Objectives"
            heading="What drives us forward"
            subheading="We are committed to creating a thriving entrepreneurial ecosystem in Saudi Arabia through focused, impactful initiatives."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {objectives.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="h-16 w-16 rounded-2xl bg-[#0A1628] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#C9A84C] transition-colors">
                  <Icon className="h-7 w-7 text-[#C9A84C] group-hover:text-[#0A1628] transition-colors" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1628] mb-3">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Our Services"
            heading="How we support founders"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Resources & Tools",
                description: "Access to curated resources, playbooks, and tools designed for Saudi startups — from incorporation guides to growth frameworks.",
                icon: "📚",
              },
              {
                title: "Mentorship & Advisory",
                description: "Connect with experienced founders and industry experts who provide hands-on guidance tailored to your stage and sector.",
                icon: "🧭",
              },
              {
                title: "Strategic Partnerships",
                description: "Leverage our network of institutional partners, investors, and corporate allies to accelerate your business growth.",
                icon: "🤝",
              },
              {
                title: "Founder Circles",
                description: "Join curated peer groups of 6–8 founders for structured accountability, candid feedback, and deep connections.",
                icon: "👥",
              },
              {
                title: "Events & Training",
                description: "Attend exclusive workshops, masterclasses, and networking dinners designed to sharpen your skills and expand your reach.",
                icon: "🎓",
              },
              {
                title: "Investment Readiness",
                description: "Prepare for fundraising with pitch coaching, financial modeling workshops, and warm introductions to investors.",
                icon: "💡",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="relative bg-[#F8F5EF] rounded-2xl p-8 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-4 block" aria-hidden="true">{service.icon}</span>
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board Members */}
      <section className="py-24 px-4 bg-[#0A1628] text-white" id="board">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Board Members"
            heading="The leaders behind Wosool"
            subheading="Our board brings together accomplished entrepreneurs, investors, and industry leaders who are passionate about empowering Saudi founders."
            centered
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boardMembers.map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#C9A84C]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0A1628] mb-4">
            Ready to be part of the story?
          </h2>
          <p className="text-[#0A1628]/70 mb-8">
            Join a community of visionary Saudi entrepreneurs building the future.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/apply">Apply to Join Wosool</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
