import type { Founder } from '../types'

export type FounderRegion = 'saudi' | 'gcc' | 'mena' | 'other'
export type FounderRegionFilter = FounderRegion | 'all'
type FilterableFounder = Pick<Founder, 'name' | 'companyName' | 'position' | 'bio' | 'location' | 'sector' | 'countryCode'> & {
  primaryCompany?: Pick<NonNullable<Founder['primaryCompany']>, 'name' | 'sector'>
}

const gccCountryCodes = new Set(['AE', 'BH', 'KW', 'OM', 'QA'])
const menaCountryCodes = new Set(['EG', 'JO', 'LB', 'IQ', 'MA', 'TN', 'DZ', 'LY', 'PS', 'SY', 'YE', 'SD'])
const regionLabels: Record<FounderRegion, { ar: string; en: string }> = {
  saudi: { ar: 'السعودية', en: 'Saudi Arabia' },
  gcc: { ar: 'الخليج', en: 'GCC' },
  mena: { ar: 'الشرق الأوسط وشمال أفريقيا', en: 'MENA' },
  other: { ar: 'دول أخرى', en: 'Other' },
}

export function founderRegion(founder: Pick<FilterableFounder, 'countryCode'>): FounderRegion {
  const country = founder.countryCode?.toUpperCase()
  if (country === 'SA') return 'saudi'
  if (country && gccCountryCodes.has(country)) return 'gcc'
  if (country && menaCountryCodes.has(country)) return 'mena'
  return 'other'
}

function founderSector(founder: FilterableFounder) {
  return founder.primaryCompany?.sector || founder.sector
}

/** Region chips with counts. The active region stays listed even when other filters leave it empty. */
export function regionOptions(founders: FilterableFounder[], active: FounderRegionFilter, locale: 'ar' | 'en') {
  return (Object.keys(regionLabels) as FounderRegion[])
    .map(key => ({ key, label: regionLabels[key][locale], count: founders.filter(founder => founderRegion(founder) === key).length }))
    .filter(item => item.count > 0 || item.key === active)
}

/** Sectors offered in the dropdown: only those that exist within the selected region. */
export function sectorOptions(founders: FilterableFounder[], region: FounderRegionFilter, locale: 'ar' | 'en') {
  return [...new Set(founders
    .filter(founder => region === 'all' || founderRegion(founder) === region)
    .map(founderSector)
    .filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, locale))
}

export function filterFounders<T extends FilterableFounder>(founders: T[], filters: { search: string; sector: string; region: FounderRegionFilter }, locale: 'ar' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase(locale)
  return founders.filter(founder => {
    if (filters.sector && founderSector(founder) !== filters.sector) return false
    if (filters.region !== 'all' && founderRegion(founder) !== filters.region) return false
    if (!query) return true
    const company = founder.primaryCompany
    return [founder.name, founder.companyName, company?.name, founder.position, founder.bio, founder.location, founder.sector, company?.sector]
      .filter(Boolean).join(' ').toLocaleLowerCase(locale).includes(query)
  })
}

/**
 * Arabic noun form for "profile" after a written number: 1 ملف واحد, 2 ملفان (ملفين after a preposition),
 * 3–10 ملفات, 11–99 ملفًا; hundreds follow the last two digits (100 ملف, 103 ملفات, 144 ملفًا).
 */
export function arabicProfileCount(count: number, { genitive = false } = {}) {
  if (count === 1) return 'ملف واحد'
  if (count === 2) return genitive ? 'ملفين' : 'ملفان'
  const lastTwo = count % 100
  if (lastTwo >= 3 && lastTwo <= 10) return `${count} ملفات`
  if (lastTwo >= 11) return `${count} ملفًا`
  return `${count} ملف`
}
