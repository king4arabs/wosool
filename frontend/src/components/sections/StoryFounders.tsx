"use client"

import Link from "next/link"
import type { ApiFounder } from "@/lib/content-api"
import { isDirectoryRecordVisible } from "@/lib/directory-geography"
import { useLocale } from "@/lib/locale"
import { companyMatches } from "@/lib/news-feed"
import { usePublicCollection } from "@/lib/use-public-collection"

/** Mount only for stories that identify a company. Never substitute seed identities. */
export function StoryFounders({ companies }: { companies: string[] }) {
  const { locale } = useLocale()
  const names = [...new Set(companies.map(name => name.trim()).filter(Boolean))].slice(0, 10)
  const params = new URLSearchParams(names.map(name => ["companies[]", name]))
  const { items } = usePublicCollection<ApiFounder>("/founders?" + params, 24)
  // Older APIs may ignore the filter. Confirm the exact public company relationship locally too.
  const founders = items.filter(row => row.is_public === true && row.status === "active" && isDirectoryRecordVisible(row) &&
    row.companies?.some(company => company.is_public === true && company.status === "active" &&
      companyMatches({ companies: names }, company.name_aliases ?? [company.name, company.slug])))
  if (!founders.length) return null
  return <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
    <h2 className="font-bold">{locale === "ar" ? "المؤسسون" : "Founders"}</h2>
    <ul>{founders.map(founder => <li key={founder.slug}><Link href={"/founders/" + encodeURIComponent(founder.slug)} className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--link)]">{founder.name || founder.display_name}</Link></li>)}</ul>
  </section>
}
