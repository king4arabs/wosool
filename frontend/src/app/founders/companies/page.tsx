"use client"

import Link from "next/link"
import { Briefcase, Search, TrendingUp, Users } from "lucide-react"
import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { CompanyCard } from "@/components/sections/CompanyCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  companiesPageCopy,
  localizeCompany,
} from "@/data/localized-seed"
import { type ApiCompany, mapCompany } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"

export default function CompaniesPage() {
  const { locale } = useLocale()
  const copy = companiesPageCopy[locale]
  const collection = usePublicCollection<ApiCompany>("/companies")
  const companyItems = collection.items.map(item => localizeCompany(mapCompany(item), locale))




  const hiring = companyItems.filter((company) => company.isHiring)
  const fundraising = companyItems.filter((company) => company.isFundraising)
  const collaborating = companyItems.filter((company) => company.isCollaborating)

  return (
    <PublicLayout>
      <section className="bg-[#0A1628] px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="gold" className="mb-4 px-4 py-1.5 text-xs uppercase tracking-widest">
            {copy.badge}
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">{copy.description}</p>
        </div>
      </section>
      {collection.error && <CollectionStatus {...collection} hasMore={false} empty={false} />}

      <section className="border-b border-gray-100 bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { icon: Briefcase, value: `${hiring.length}`, label: copy.stats[0] },
              { icon: TrendingUp, value: `${fundraising.length}`, label: copy.stats[1] },
              { icon: Users, value: `${collaborating.length}`, label: copy.stats[2] },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-5 w-5 text-[#C9A84C]" aria-hidden="true" />
                <span className="text-2xl font-bold text-[#0A1628]">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.directoryEyebrow} heading={copy.directoryTitle} />

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label={copy.searchAria}
                />
              </div>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label={copy.searchAria}
              >
                {copy.sectors.map((sector) => (
                  <option key={sector}>{sector}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label={copy.searchAria}
              >
                {copy.stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companyItems.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {hiring.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0A1628]">
                <Briefcase className="h-5 w-5 text-[#C9A84C]" />
                {copy.hiringTitle}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hiring.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}

          {fundraising.length > 0 && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0A1628]">
                <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
                {copy.fundraisingTitle}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fundraising.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#0A1628] px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold">{copy.ctaTitle}</h2>
          <p className="mb-8 text-gray-300">{copy.ctaBody}</p>
          <Button asChild>
            <Link href="/apply">{copy.cta}</Link>
          </Button>
        </div>
      </section>
      {!collection.error && <CollectionStatus {...collection} empty={companyItems.length === 0} />}
    </PublicLayout>
  )
}
