"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { PageHero, heroPrimary, heroSecondary } from "@/components/sections/PageHero"
import { ArrowDown, BarChart3, Handshake, Lightbulb, Rocket, Scale } from "lucide-react"
import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { PartnerLogoMarquee } from "@/components/sections/PartnerLogoMarquee"
import { PartnerEcosystem } from "@/components/sections/PartnerEcosystem"
import { localizePartner, partnersPageCopy } from "@/data/localized-seed"
import { type ApiPartner, mapPartner } from "@/lib/content-api"
import { createPartnerVisitStore, partnerDiscoveryOrder } from "@/lib/partner-discovery"
import { useLocale } from "@/lib/locale"

const topicIcons = [Scale, BarChart3, Rocket]

export default function PartnersPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const copy = partnersPageCopy[locale]
  const collection = usePublicCollection<ApiPartner>("/partners")
  const [visitStore] = useState(createPartnerVisitStore)
  const visitSeed = useSyncExternalStore(visitStore.subscribe, visitStore.getSnapshot, visitStore.getServerSnapshot)
  const confirmedPartners = partnerDiscoveryOrder(collection.items.map(item => localizePartner(mapPartner(item), locale)).filter(partner => partner.status === "Confirmed"), visitSeed)

  return (
    <PublicLayout>
      <PageHero eyebrow={copy.badge} title={copy.title} description={copy.description} actions={<>
        <a href="#partner-ecosystem" className={heroPrimary}>{ar ? "استكشف الجهات" : "Explore organizations"}<ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
        <a href="#become-partner" className={heroSecondary}>{ar ? "كن شريكًا" : "Become a partner"}</a>
      </>} />

      <PartnerEcosystem visitSeed={visitSeed} />

      {(confirmedPartners.length > 0 || collection.error || collection.hasMore) && <section aria-labelledby="confirmed-partners" className="border-t border-slate-100 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold text-indigo-700">{copy.sectionEyebrow}</p>
          <h2 id="confirmed-partners" className="mt-2 text-2xl font-extrabold text-slate-900">{copy.sectionTitle}</h2>
          <PartnerLogoMarquee partners={confirmedPartners.map(partner => ({ id: partner.id, name_ar: partner.name, name_en: partner.name, website: partner.website, logo_path: partner.logoUrl }))} label={copy.sectionTitle} />
          <CollectionStatus {...collection} empty={false} />
        </div>
      </section>}

      <section aria-labelledby="partner-sessions" className="border-y border-slate-200/70 bg-[var(--surface-soft)] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold text-indigo-700">{copy.accessEyebrow}</p>
            <h2 id="partner-sessions" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{copy.accessTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{copy.accessBody}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{copy.accessHint}</p>
            <Link href="/login" className={`${heroPrimary} mt-6`}>{copy.accessCta}</Link>
          </div>
          <div className="grid gap-3">
            {copy.accessTopics.map((topic, i) => {
              const Icon = topicIcons[i] ?? Lightbulb
              return <div key={topic} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700" aria-hidden="true"><Icon className="h-6 w-6" strokeWidth={1.8} /></div>
                <div><h3 className="text-base font-bold text-slate-900">{topic}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{copy.accessDescriptions[i]}</p></div>
              </div>
            })}
          </div>
        </div>
      </section>

      <section id="become-partner" aria-labelledby="partner-contact" className="scroll-mt-24 bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex max-w-2xl items-start gap-4">
            <Handshake className="mt-1 hidden h-8 w-8 shrink-0 text-indigo-700 sm:block" aria-hidden="true" />
            <div><h2 id="partner-contact" className="text-2xl font-extrabold tracking-tight text-slate-900">{copy.ctaTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{copy.ctaBody}</p></div>
          </div>
          <Link href="/contact" className={`${heroPrimary} shrink-0`}>{copy.cta}</Link>
        </div>
      </section>
    </PublicLayout>
  )
}
