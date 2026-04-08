import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { PartnerLogoSlider } from "@/components/sections/PartnerLogoSlider"
import { PartnerCard } from "@/components/sections/PartnerCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { partners } from "@/data/seed"

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
            Our <span className="text-[#C9A84C]">Partners</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Wosool partners with leading institutions, investors, and
            organisations committed to supporting Saudi entrepreneurs.
          </p>
        </div>
      </section>

      {/* Logo Slider */}
      <section className="py-12 px-4 bg-[#F8F5EF] border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-4">
            Trusted By
          </p>
          <PartnerLogoSlider partners={partners} />
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Our Partners" heading="The Network Behind the Network" centered />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
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
            Partner with us to support the next generation of Saudi founders and
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
