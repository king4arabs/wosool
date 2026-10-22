"use client"

import { Check } from "lucide-react"
import { PageHero, heroPrimary } from "@/components/sections/PageHero"
import { SponsorInquiryForm } from "@/components/sections/SponsorInquiryForm"
import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { SponsorCard } from "@/components/sections/SponsorCard"
import { Badge } from "@/components/ui/badge"
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
      <PageHero eyebrow={copy.badge} title={copy.title} description={copy.description} actions={<a href="#sponsor-inquiry" className={heroPrimary}>{copy.formTitle}</a>} />
      {collection.error && <CollectionStatus {...collection} hasMore={false} empty={false} />}

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {copy.stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-lg font-bold text-[var(--text-strong)]">{value}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{label}</p>
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sponsor-inquiry" className="section-cream scroll-mt-24 px-4 py-20">
        <div className="mx-auto max-w-xl">
          <SectionHeader eyebrow={copy.formEyebrow} heading={copy.formTitle} centered />
          <SponsorInquiryForm labels={copy.formLabels} tiers={copy.tierOptions} locale={locale} />
        </div>
      </section>
      {!collection.error && <CollectionStatus {...collection} empty={sponsorItems.length === 0} />}
    </PublicLayout>
  )
}
