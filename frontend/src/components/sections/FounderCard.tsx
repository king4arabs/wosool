"use client"

import type { ReactNode } from "react"
import type { Founder } from "@/types"
import { publicWebsite } from "@/lib/community-display"
import { useLocale } from "@/lib/locale"
import { ProfileCard } from "./ProfileCard"

export type FounderCardProfile = Founder & { externalProfileOnly?: boolean; sourceUrl?: string }

export function FounderCard({
  founder,
  actions,
}: {
  founder: FounderCardProfile
  actions?: ReactNode
}) {
  const company = founder.primaryCompany
  const { locale } = useLocale()
  const external = founder.externalProfileOnly === true
  const website = publicWebsite(company?.website)

  return (
    <ProfileCard
      variant="founder"
      data={{
        company: company?.name || founder.companyName,
        logo: company?.logoUrl,
        companyBrief: company?.description,
        website: company?.website,
        founder: founder.name,
        portrait: founder.avatarUrl,
        role: founder.position,
        founderBrief: founder.bio || founder.tagline,
        location: company?.location || founder.location,
        sector: company?.sector || founder.sector,
        stage: company?.stage || founder.stage,
        profileVerified: founder.isVerified,
        founderHref: external ? undefined : `/founders/${encodeURIComponent(founder.slug)}`,
        href: !external && company?.slug ? `/founders/companies/${encodeURIComponent(company.slug)}` : undefined,
        sources: external && founder.sourceUrl ? [founder.sourceUrl] : undefined,
        founderSocials: [
          { label: "LinkedIn", url: founder.linkedinUrl ?? "" },
          { label: "X", url: founder.twitterUrl ?? "" },
        ].filter((social) => social.url),
        actions: actions || (external && website ? <a href={website} target="_blank" rel="noopener noreferrer">{locale === 'ar' ? 'اكتشف الشركة' : 'Explore company'}</a> : undefined),
      }}
    />
  )
}
