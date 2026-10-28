import geography from '../data/directory-geography.json'

type LocationRecord = { countryCode?: string | null; country_code?: string | null; location?: string | null; translations?: { ar?: { location?: string | null } } }
type DirectoryRecord = LocationRecord & { primaryCompany?: LocationRecord; companies?: LocationRecord[] | null }
export type DirectoryRegion = 'saudi' | 'gcc' | 'mena' | 'other'
const countries = new Set(geography.country_codes)

export function countryCode(value?: string | null): string | undefined {
  const code = value?.trim().toUpperCase()
  return code && countries.has(code) ? code : undefined
}

/** Public directory coverage; never infer geography from a person's name. */
export function isDirectoryRecordVisible(record: DirectoryRecord): boolean {
  const locations = [record, record.primaryCompany, ...(record.companies ?? [])].filter((item): item is LocationRecord => Boolean(item))
  return locations.every(item => {
    const code = (item.countryCode ?? item.country_code)?.trim().toUpperCase()
    const location = `${item.location ?? ''} ${item.translations?.ar?.location ?? ''}`.toLowerCase()
    return !geography.excluded_codes.includes(code ?? '') && !geography.excluded_location_terms.some(term => location.includes(term))
  })
}

export function founderCountry(record: DirectoryRecord): string | undefined {
  return countryCode(record.countryCode ?? record.country_code)
    ?? countryCode(record.primaryCompany?.countryCode ?? record.primaryCompany?.country_code)
    ?? record.companies?.map(item => countryCode(item.countryCode ?? item.country_code)).find(Boolean)
}

export function countryRegion(code?: string): DirectoryRegion {
  if (code === 'SA') return 'saudi'
  if (code && geography.gcc.includes(code)) return 'gcc'
  if (code && geography.mena.includes(code)) return 'mena'
  return 'other'
}

export function countryName(code: string, locale: 'ar' | 'en'): string {
  return (geography.country_names[locale] as Record<string, string>)[code] ?? code
}

/** Full coverage, including countries with no published profiles yet. */
export function directoryCountryGroups(locale: 'ar' | 'en') {
  return (['saudi', 'gcc', 'mena', 'other'] as const).map(region => ({
    region,
    label: ({ saudi: ['السعودية', 'Saudi Arabia'], gcc: ['دول الخليج', 'GCC countries'], mena: ['الشرق الأوسط وشمال أفريقيا', 'MENA countries'], other: ['دول العالم', 'World'] } as const)[region][locale === 'ar' ? 0 : 1],
    // Snapshot labels/order avoid server/browser ICU differences during hydration.
    countries: geography.country_order[locale].filter(code => countryRegion(code) === region)
      .map(code => ({ code, label: countryName(code, locale) })),
  }))
}
