"use client"

import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { SponsorCard } from "@/components/sections/SponsorCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  localizeSponsor,
  sponsorsPageCopy,
} from "@/data/localized-seed"
import { type ApiSponsor, mapSponsor } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"

export default function SponsorsPage() {
  const { locale } = useLocale()
  const copy = sponsorsPageCopy[locale]
  const collection = usePublicCollection<ApiSponsor>("/sponsors")
  const sponsorItems = collection.items.map(item => localizeSponsor(mapSponsor(item), locale))




  return (
    <PublicLayout>
      <section className="bg-[#0A1628] px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="gold" className="mb-4 px-4 py-1.5 text-xs tracking-widest">
            {copy.badge}
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">{copy.description}</p>
        </div>
      </section>
      {collection.error && <CollectionStatus {...collection} hasMore={false} empty={false} />}

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {copy.stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#0A1628]">{value}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.currentEyebrow} heading={copy.currentTitle} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sponsorItems.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.tiersEyebrow} heading={copy.tiersTitle} centered />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {copy.tiers.map(({ name, benefits }, index) => (
              <div
                key={name}
                className={`rounded-2xl p-8 ${index === 0 ? "bg-[#0A1628] text-white" : "bg-[#F7F8FB]"}`}
              >
                <Badge variant={index === 0 ? "gold" : index === 1 ? "warning" : "secondary"} className="mb-4">
                  {name}
                </Badge>
                <h3 className={`mb-6 text-xl font-bold ${index === 0 ? "text-white" : "text-[#0A1628]"}`}>
                  {locale === "ar" ? `باقة ${name}` : `${name} Tier`}
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className={`flex items-start gap-2 text-sm ${index === 0 ? "text-gray-300" : "text-gray-600"}`}
                    >
                      <span className="mt-0.5 text-[#4056C7]">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-20">
        <div className="mx-auto max-w-xl">
          <SectionHeader eyebrow={copy.formEyebrow} heading={copy.formTitle} centered />
          <form className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="org-name">{copy.formLabels.orgName}</Label>
              <Input id="org-name" placeholder={copy.formLabels.orgPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">{copy.formLabels.contactName}</Label>
              <Input id="contact-name" placeholder={copy.formLabels.contactPlaceholder} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{copy.formLabels.email}</Label>
              <Input id="contact-email" type="email" placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">{copy.formLabels.tier}</Label>
              <select
                id="tier"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4056C7]"
              >
                {copy.tierOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{copy.formLabels.message}</Label>
              <Textarea id="message" placeholder={copy.formLabels.messagePlaceholder} />
            </div>
            <Button type="submit" className="w-full">
              {copy.formLabels.submit}
            </Button>
          </form>
        </div>
      </section>
      {!collection.error && <CollectionStatus {...collection} empty={sponsorItems.length === 0} />}
    </PublicLayout>
  )
}
