'use client'
import type { Founder } from '@/types'
import { ProfileCard } from './ProfileCard'
export function FounderCard({ founder }: { founder: Founder }) {
  const company = founder.primaryCompany
  return <ProfileCard data={{ company: company?.name || founder.companyName || founder.name, logo: company?.logoUrl, companyBrief: company?.description, website: company?.website, founder: founder.name, portrait: founder.avatarUrl, role: founder.position, founderBrief: founder.bio || founder.tagline, location: founder.location, sector: company?.sector || founder.sector, founderHref: `/founders/${founder.slug}`, href: company?.slug ? `/founders/companies/${company.slug}` : undefined, founderSocials: [{label:'LinkedIn',url:founder.linkedinUrl ?? ''},{label:'X',url:founder.twitterUrl ?? ''}].filter(s=>s.url) }} />
}
