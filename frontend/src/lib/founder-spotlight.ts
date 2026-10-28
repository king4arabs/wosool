import historicalProfiles from '../data/founder-spotlight.json'
import additionalProfiles from '../data/founder-spotlight-expansion-2026-10-16.json'
import discoveryProfiles from '../data/founder-spotlight-expansion-2026-10-22.json'
import type { Founder } from '../types'
import { isDirectoryRecordVisible } from './directory-geography'

export type FounderSpotlight = Founder & {
  externalProfileOnly: true
  sourceUrl: string
}

/** Curated editorial datasets do not establish registered or verified membership. */
const priority: Record<string, number> = { saudi: 0, gcc: 1, mena: 2, global: 3 }
const profiles = [...historicalProfiles, ...additionalProfiles, ...discoveryProfiles]
  .filter(profile => isDirectoryRecordVisible({ country_code: profile.country_code, location: profile.country_en }))
  .sort((left, right) => (priority[left.region] ?? 4) - (priority[right.region] ?? 4))

/** Public editorial profiles, kept separate from approved community membership. */
export function getFounderSpotlights(locale: 'ar' | 'en'): FounderSpotlight[] {
  return profiles.map(profile => ({
    activationStatus: 'unclaimed', canCommunicate: false, sourceUrls: profile.source_urls, sourceReviewedAt: profile.reviewed_at,
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
      slug: profile.company_key,
      name: profile[`company_name_${locale}`],
      description: profile[`company_brief_${locale}`],
      logoUrl: profile.logo_url ?? '',
      website: profile.website,
      location: profile[`country_${locale}`],
      sector: profile[`sector_${locale}`],
      countryCode: profile.country_code,
      stage: '',
      foundedYear: profile.founded_year ?? 0,
      traction: profile[`traction_${locale}`] ? { text: profile[`traction_${locale}`] as string, sourceUrl: profile.traction_source_url ?? undefined } : undefined,
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

/** Read-only source snapshot for profile pages when the public API is unavailable. */
export function getSpotlightApiProfile(slug: string, locale: 'ar' | 'en') {
  const profile = profiles.find(item => item.slug === slug)
  if (!profile) return null
  return {
    id: 0, slug: profile.slug, name: profile[`founder_name_${locale}`], position: profile[`role_${locale}`],
    tagline: profile[`role_${locale}`], bio: profile[`founder_brief_${locale}`],
    location: profile[`country_${locale}`], country_code: profile.country_code, sector: profile[`sector_${locale}`],
    avatar_url: profile.portrait_url, is_verified: false, is_featured: false,
    activation_status: 'unclaimed' as const, can_communicate: false,
    source_urls: profile.source_urls, source_reviewed_at: profile.reviewed_at,
    linkedin_url: profile.founder_socials.find(link => link.label === 'LinkedIn')?.url,
    twitter_url: profile.founder_socials.find(link => link.label === 'X')?.url,
    companies: [{ id: 0, slug: profile.company_key, name: profile[`company_name_${locale}`],
      description: profile[`company_brief_${locale}`], logo_url: profile.logo_url, website: profile.website,
      sector: profile[`sector_${locale}`], location: profile[`country_${locale}`], country_code: profile.country_code,
      founded_year: profile.founded_year ?? null,
      traction: profile[`traction_${locale}`] ? { text: profile[`traction_${locale}`] as string, source_url: profile.traction_source_url } : null,
      is_hiring: false, is_fundraising: false, is_collaborating: false,
      pivot: { role: profile[`role_${locale}`], is_primary: true } }],
  }
}
