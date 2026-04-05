import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { PartnerCard } from "@/components/sections/PartnerCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { partners } from "@/data/seed"

const partnerTypes = [
  "Ecosystem Partner",
  "Knowledge Partner",
  "Community Partner",
  "Strategic Supporter",
]

export default function PartnersPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Partners & Supporters
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Backed by the Best in the Ecosystem
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Wosool partners with leading institutions, investors, and
            organisations committed to supporting founders in the GCC.
          </p>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {partnerTypes.map((type) => (
              <div
                key={type}
                className="rounded-2xl bg-[#F8F5EF] p-5 text-center"
              >
                <p className="text-sm font-semibold text-[#0A1628]">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Our Partners" heading="The Network Behind the Network" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Partner Office Hours */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            eyebrow="Partner Office Hours"
            heading="Get direct access to our partners"
            subheading="Wosool members can book 1-on-1 sessions with partner organizations for legal advice, financial guidance, or strategic support."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {["Legal & Compliance", "Financial Advisory", "Strategic Growth"].map((topic) => (
              <div
                key={topic}
                className="bg-[#F8F5EF] rounded-2xl p-6 text-center"
              >
                <p className="font-semibold text-[#0A1628]">{topic}</p>
                <p className="text-sm text-gray-500 mt-1">Book a session →</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild variant="secondary">
              <Link href="/login">Login to Book Sessions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-20 px-4 bg-[#C9A84C]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0A1628] mb-4">
            Become a Wosool Partner
          </h2>
          <p className="text-[#0A1628]/70 mb-8">
            Partner with us to support the next generation of GCC founders and
            gain access to our curated network.
          </p>
          <Button asChild variant="secondary">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
