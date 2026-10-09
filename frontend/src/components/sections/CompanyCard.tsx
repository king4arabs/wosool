'use client'
import type { Company } from '@/types'
import { ProfileCard } from './ProfileCard'
export function CompanyCard({ company }: { company: Company }) {
  const founder = company.founders?.[0]
  return <ProfileCard data={{ company: company.name, logo: company.logoUrl, companyBrief: company.description, website: company.website, location: company.location, sector: company.sector, founder: founder?.name, portrait: founder?.avatarUrl, role: founder?.position, founderBrief: founder?.bio || founder?.tagline, href: `/founders/companies/${company.slug}`, founderHref: founder ? `/founders/${founder.slug}` : undefined, founderSocials: founder ? [{label:'LinkedIn',url:founder.linkedinUrl ?? ''},{label:'X',url:founder.twitterUrl ?? ''}].filter(s=>s.url) : [] }} />
}
