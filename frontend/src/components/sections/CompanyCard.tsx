"use client"

import type { Company } from "@/types"
import { useLocale } from "@/lib/locale"
import { ProfileCard } from "./ProfileCard"

export function CompanyCard({ company }: { company: Company }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const founder = company.founders?.[0]

  const signals = [
    company.isHiring
      ? { label: ar ? "توظيف نشط" : "Hiring", tone: "success" as const }
      : null,
    company.isFundraising
      ? { label: ar ? "جمع استثمار" : "Fundraising", tone: "accent" as const }
      : null,
    company.isCollaborating
      ? { label: ar ? "منفتحة على التعاون" : "Open to collaboration", tone: "neutral" as const }
      : null,
  ].filter(
    (signal): signal is {
      label: string
      tone: "success" | "accent" | "neutral"
    } => Boolean(signal),
  )

  return (
    <ProfileCard
      data={{
        company: company.name,
        logo: company.logoUrl,
        companyBrief: company.description,
        website: company.website,
        location: company.location,
        sector: company.sector,
        stage: company.stage,
        founder: founder?.name,
        portrait: founder?.avatarUrl,
        role: founder?.position,
        founderBrief: founder?.bio || founder?.tagline,
        href: `/founders/companies/${company.slug}`,
        founderHref: founder ? `/founders/${founder.slug}` : undefined,
        founderSocials: founder
          ? [
              { label: "LinkedIn", url: founder.linkedinUrl ?? "" },
              { label: "X", url: founder.twitterUrl ?? "" },
            ].filter((social) => social.url)
          : [],
        signals,
      }}
    />
  )
}
