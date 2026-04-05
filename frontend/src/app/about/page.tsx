import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Users, Heart, Lightbulb, Globe } from "lucide-react"

const principles = [
  {
    icon: Shield,
    title: "Founder-First, Always",
    description:
      "Every decision we make is filtered through one question: does this serve founders? Wosool exists for builders, not institutions.",
  },
  {
    icon: Heart,
    title: "Trust Over Scale",
    description:
      "We grow deliberately. We&apos;d rather have 200 deeply engaged founders than 2,000 passive members. Quality of connection matters.",
  },
  {
    icon: Lightbulb,
    title: "Honest & Direct",
    description:
      "We tell founders what they need to hear, not what they want to hear. Candid feedback, honest assessments, no fluff.",
  },
  {
    icon: Globe,
    title: "Rooted in the GCC",
    description:
      "We celebrate the unique context of building in Saudi Arabia and the GCC. Local insight meets global ambition.",
  },
  {
    icon: Users,
    title: "Give More Than You Take",
    description:
      "The best communities are built on generosity. We ask every member to contribute their expertise, network, and time.",
  },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Our Story
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            About Wosool
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            We built Wosool because we believe founders in Saudi Arabia and the
            GCC deserve a truly premium support network — not another generic
            accelerator or events series.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
                Our Mission
              </p>
              <h2 className="text-4xl font-bold text-[#0A1628] mb-6">
                To accelerate the best founders in the GCC
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Wosool connects ambitious founders with the people, programs, and
                resources they need to build faster and smarter. We exist to
                bridge the gap between founders and the support structures that
                exist in more mature startup ecosystems.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Founded by entrepreneurs who&apos;ve built and scaled companies in the
                region, Wosool is built on deep understanding of what founders
                in Saudi Arabia and the GCC actually need.
              </p>
            </div>
            <div className="bg-[#F8F5EF] rounded-3xl p-10">
              <p className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
                Our Vision
              </p>
              <h3 className="text-2xl font-bold text-[#0A1628] mb-4">
                Saudi Arabia as a global hub for world-class founders
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where the most ambitious founders in the
                world choose Saudi Arabia and the GCC as the place to build
                their companies — and where Wosool is the connective tissue
                that makes this possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Wosool Exists */}
      <section className="py-24 px-4 section-cream">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            eyebrow="Why We Exist"
            heading="The gap we're closing"
            centered
          />
          <div className="space-y-6 text-left">
            {[
              "Most founder networks in the GCC are either too broad (10,000 LinkedIn connections) or too narrow (a closed circle of insiders). Wosool is curated, trusted, and designed for serious builders.",
              "Founders in Saudi Arabia often face unique challenges — navigating regulatory landscapes, finding early adopters, hiring senior talent, or raising from a small pool of local investors. Generic resources don't help.",
              "The best support founders get is from other founders who've been through it. Wosool systematises peer learning and warm introductions so you don't have to stumble upon them by chance.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex gap-4 bg-white rounded-2xl p-6 shadow-sm"
              >
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 px-4 bg-white" id="principles">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Our Principles"
            heading="The values that guide everything we do"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-2xl bg-[#F8F5EF]">
                <div className="h-10 w-10 rounded-xl bg-[#0A1628] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#C9A84C]" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-[#0A1628] mb-2">{title}</h3>
                <p
                  className="text-sm text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Model */}
      <section className="py-24 px-4 bg-[#0A1628] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            eyebrow="Community Model"
            heading="How Wosool works"
            subheading="Wosool operates as an invite-and-apply network. Members are vetted, verified, and matched based on their founder profile, stage, and goals."
            centered
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              { step: "1", title: "Apply", desc: "Submit your application and tell us about your journey." },
              { step: "2", title: "Get Verified", desc: "Our team reviews and verifies your founder profile." },
              { step: "3", title: "Get Connected", desc: "Access the network, programs, and matched introductions." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white/5 rounded-2xl p-6">
                <div className="h-10 w-10 rounded-full bg-[#C9A84C] text-[#0A1628] font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance & Trust */}
      <section className="py-24 px-4 section-cream">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="Governance & Trust"
            heading="A community built on accountability"
            centered
          />
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
            {[
              "All members are manually reviewed before being granted access.",
              "A Founder Score system ensures active, contributing members are recognised.",
              "Community guidelines are enforced by a member-elected advisory council.",
              "Conflict of interest policies apply to all introductions and referrals.",
              "Data privacy and confidentiality are treated as sacred — we never sell member data.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#C9A84C] text-lg mt-0.5">✓</span>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Placeholder */}
      <section className="py-24 px-4 bg-white" id="team">
        <div className="max-w-7xl mx-auto text-center">
          <SectionHeader
            eyebrow="Leadership"
            heading="The team behind Wosool"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Founder & CEO", "Head of Community", "Head of Programs"].map((role) => (
              <div
                key={role}
                className="bg-[#F8F5EF] rounded-2xl p-8 flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full bg-[#0A1628] flex items-center justify-center">
                  <Users className="h-8 w-8 text-[#C9A84C]" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[#0A1628]">Coming Soon</p>
                  <p className="text-sm text-gray-500">{role}</p>
                </div>
              </div>
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
            Applications are reviewed on a rolling basis.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/apply">Apply to Join Wosool</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
