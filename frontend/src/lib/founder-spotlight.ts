import profiles from '../data/founder-spotlight.json'
import type { Founder } from '../types'

export type FounderSpotlight = Founder & {
  externalProfileOnly: true
  sourceUrl: string
}

/** Public editorial profiles, kept separate from approved community membership. */
export function getFounderSpotlights(locale: 'ar' | 'en'): FounderSpotlight[] {
  return profiles.map(profile => ({
    id: `spotlight-${profile.slug}`,
    slug: profile.slug,
    name: profile[`founder_name_${locale}`],
    position: profile[`role_${locale}`],
    tagline: profile[`founder_brief_${locale}`],
    bio: profile[`founder_brief_${locale}`],
    location: profile[`country_${locale}`],
    countryCode: profile.country_code,
    sector: profile[`sector_${locale}`],
    stage: '',
    avatarUrl: profile.portrait_url ?? '',
    companyName: profile[`company_name_${locale}`],
    linkedinUrl: profile.founder_socials?.find(link => link.label === 'LinkedIn')?.url,
    twitterUrl: profile.founder_socials?.find(link => link.label === 'X')?.url,
    primaryCompany: {
      id: `spotlight-company-${profile.slug}`,
      slug: profile.slug,
      name: profile[`company_name_${locale}`],
      description: profile[`company_brief_${locale}`],
      logoUrl: profile.logo_url ?? '',
      website: profile.website,
      location: profile[`country_${locale}`],
      sector: profile[`sector_${locale}`],
      countryCode: profile.country_code,
      stage: '',
      foundedYear: 0,
      teamSize: '',
      isHiring: false,
      isFundraising: false,
      isCollaborating: false,
      founderIds: [],
    },
    // These fields belong to member records and are not displayed for spotlights.
    joinedAt: '',
    score: 0,
    needs: [],
    offers: [],
    isVerified: false,
    isFeatured: false,
    externalProfileOnly: true,
    sourceUrl: profile.source_url,
  }))
}
