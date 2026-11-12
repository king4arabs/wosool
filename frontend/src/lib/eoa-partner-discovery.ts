import organizations from '../data/partner-ecosystem.json'
import { brandLogoSource } from './brand-logos'
import { publicWebsite } from './community-display'
import { eoaOrganizationLogo } from './eoa-organizations'
import { acceleratorPartnerLogos, type PartnerLogo } from './partner-logos'
import { normalizeSearch } from './faq-search'
import type { EoaPartner, Organization } from './eoa'

export type EoaOrganizationCategory = 'government' | 'bank' | 'pif' | 'university' | 'vc' | 'listed' | 'additional'
export type EoaOrganizationRegion = 'saudi' | 'gcc' | 'mena' | 'world'
export type EoaOrganizationListing = PartnerLogo & {
  category: EoaOrganizationCategory
  region: EoaOrganizationRegion
  support_ar?: string
  support_en?: string
}

type CatalogOrganization = (typeof organizations)[number]

/** CODE is a separate programme on MCIT's official domain, not a duplicate of the ministry. */
export function eoaOrganizationIdentity(organization: Pick<PartnerLogo, 'id' | 'website'>) {
  const website = publicWebsite(organization.website)
  if (!website) return `id:${organization.id}`
  const url = new URL(website)
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  return host === 'mcit.gov.sa' && /^\/code\/?$/.test(url.pathname)
    ? `${host}/code`
    : host
}

/**
 * Catalog entries are leads for ecosystem discovery, NOT confirmed EO partners.
 * The programme API may add published directory entries or confirmed partner records;
 * neither changes the catalog's editorial source or relationship state.
 */
export function eoaOrganizationsForDiscovery(
  published: readonly Organization[] = [],
  confirmed: readonly EoaPartner[] = [],
): EoaOrganizationListing[] {
  const catalog = (organizations as CatalogOrganization[]).map(item => ({
    id: item.id,
    name_ar: item.name_ar,
    name_en: item.name_en,
    website: item.website,
    logo_path: item.logo_path,
    category: item.category as EoaOrganizationCategory,
    region: item.region as EoaOrganizationRegion,
  }))
  const featured = acceleratorPartnerLogos.map(item => ({
    ...item, category: 'additional' as const, region: 'saudi' as const,
  }))
  const directory = published.map(item => ({
    ...item, logo_path: eoaOrganizationLogo(item),
    category: 'additional' as const, region: 'saudi' as const,
  }))
  const approved = confirmed.map(item => ({
    ...item, logo_path: eoaOrganizationLogo(item),
    category: 'additional' as const, region: 'saudi' as const,
  }))
  const unique = new Map<string, EoaOrganizationListing>()
  for (const record of [...catalog, ...featured, ...directory, ...approved]) {
    const website = publicWebsite(record.website)
    const logo_path = brandLogoSource(record.logo_path)
    if (!website && !logo_path) continue
    const candidate = { ...record, website, logo_path }
    const key = eoaOrganizationIdentity(candidate)
    const previous = unique.get(key)
    if (previous) {
      // Prefer any official administrator artwork, but retain existing catalog
      // categorisation and geography rather than reclassifying an organization.
      unique.set(key, {
        ...previous, ...candidate,
        category: previous.category === 'additional' ? candidate.category : previous.category,
        region: previous.region,
        logo_path: logo_path || previous.logo_path,
        website: website || previous.website,
      })
    } else unique.set(key, candidate)
  }
  return [...unique.values()]
}

export function filterEoaOrganizations(
  catalog: readonly EoaOrganizationListing[],
  { category = 'all', region = 'all', query = '' }: {
    category?: EoaOrganizationCategory | 'all'
    region?: EoaOrganizationRegion | 'all'
    query?: string
  } = {},
): EoaOrganizationListing[] {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  return catalog.filter(item =>
    (category === 'all' || item.category === category) &&
    (region === 'all' || item.region === region) &&
    terms.every(term => normalizeSearch([
      item.name_ar, item.name_en, item.website || '',
      item.support_ar || '', item.support_en || '',
    ].join(' ')).includes(term)),
  )
}
