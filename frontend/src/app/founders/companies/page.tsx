"use client"

import Link from "next/link"
import { useState } from "react"
import { Briefcase, Search, TrendingUp, Users } from "lucide-react"
import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { CardBrowser } from "@/components/sections/CardBrowser"
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
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("")
  const [stage, setStage] = useState("")
  const companyItems = collection.items.map(item => localizeCompany(mapCompany(item), locale))




  const filtered = companyItems.filter(c => (!search || `${c.name} ${c.description} ${c.location}`.toLowerCase().includes(search.toLowerCase())) && (!sector || c.sector === sector) && (!stage || c.stage === stage))
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
          <SectionHeader eyebrow={copy.directoryEyebrow} heading={copy.directoryTitle} /><Link href="/startups" className="inline-flex min-h-11 items-center text-blue-700 underline">{locale === "ar" ? "استكشف الشركات من السعودية إلى العالم" : "Explore startups from Saudi Arabia to the world"}</Link>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search" value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label={copy.searchAria}
                />
              </div>
              <select value={sector} onChange={e=>setSector(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label={copy.searchAria}
              >
                <option value="">{copy.sectors[0]}</option>{[...new Set(companyItems.map(c=>c.sector).filter(Boolean))].map(value=><option key={value}>{value}</option>)}
              </select>
              <select value={stage} onChange={e=>setStage(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label={copy.searchAria}
              >
                <option value="">{copy.stages[0]}</option>{[...new Set(companyItems.map(c=>c.stage).filter(Boolean))].map(value=><option key={value}>{value}</option>)}
              </select>
            </div>
          </div>

          <CardBrowser key={`${search}-${sector}-${stage}`} items={filtered.map(company => ({ id: company.id, content: <CompanyCard company={company} /> }))} />

          {hiring.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0A1628]">
                <Briefcase className="h-5 w-5 text-[#C9A84C]" />
                {copy.hiringTitle}
              </h2>
              <CardBrowser key={`${search}-${sector}-${stage}`} items={hiring.map(company => ({ id: company.id, content: <CompanyCard company={company} /> }))} />
            </div>
          )}

          {fundraising.length > 0 && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0A1628]">
                <TrendingUp className="h-5 w-5 text-[#C9A84C]" />
                {copy.fundraisingTitle}
              </h2>
              <CardBrowser key={`${search}-${sector}-${stage}`} items={fundraising.map(company => ({ id: company.id, content: <CompanyCard company={company} /> }))} />
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
