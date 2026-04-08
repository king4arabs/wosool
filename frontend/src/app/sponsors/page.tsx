import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { SponsorCard } from "@/components/sections/SponsorCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sponsors } from "@/data/seed"

const tiers = [
  {
    name: "Platinum",
    price: "Premium",
    benefits: [
      "Prime logo placement on all materials",
      "Speaking slot at annual summit",
      "Exclusive founder dinner invitation",
      "Monthly featured newsletter placement",
      "Direct access to curated founder intros",
    ],
  },
  {
    name: "Gold",
    price: "Standard",
    benefits: [
      "Logo on website and event materials",
      "Panel seat at two annual events",
      "Quarterly featured newsletter placement",
      "Access to community sponsor showcase",
    ],
  },
  {
    name: "Silver",
    price: "Entry",
    benefits: [
      "Logo on website",
      "One sponsored content piece per quarter",
      "Access to community sponsor showcase",
    ],
  },
]

const audienceStats = [
  { value: "250+", label: "Verified Founders" },
  { value: "SAR 500M+", label: "Combined Funding Raised" },
  { value: "15", label: "Countries Represented" },
  { value: "85%", label: "Decision Makers" },
]

export default function SponsorsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Sponsorship
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Reach the GCC&apos;s Best Founders
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sponsoring Wosool puts your brand in front of 250+ verified,
            ambitious founders building the next generation of GCC companies.
          </p>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {audienceStats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#0A1628]">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Sponsors */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Current Sponsors" heading="Proud Supporters of Wosool" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Sponsorship Packages"
            heading="Choose your level of support"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(({ name, benefits }) => (
              <div
                key={name}
                className={`rounded-2xl p-8 ${
                  name === "Platinum"
                    ? "bg-[#0A1628] text-white"
                    : "bg-[#F8F5EF]"
                }`}
              >
                <Badge
                  variant={
                    name === "Platinum" ? "gold" : name === "Gold" ? "warning" : "secondary"
                  }
                  className="mb-4"
                >
                  {name}
                </Badge>
                <h3
                  className={`text-xl font-bold mb-6 ${
                    name === "Platinum" ? "text-white" : "text-[#0A1628]"
                  }`}
                >
                  {name} Sponsor
                </h3>
                <ul className="space-y-3">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className={`flex items-start gap-2 text-sm ${
                        name === "Platinum" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="text-[#C9A84C] mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-xl mx-auto">
          <SectionHeader
            eyebrow="Get in Touch"
            heading="Sponsorship Enquiry"
            centered
          />
          <form className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organisation Name</Label>
              <Input id="org-name" placeholder="Your company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact Name</Label>
              <Input id="contact-name" placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Interested Tier</Label>
              <select
                id="tier"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option>Platinum</option>
                <option>Gold</option>
                <option>Silver</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your sponsorship goals..."
              />
            </div>
            <Button type="submit" className="w-full">
              Send Enquiry
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  )
}
