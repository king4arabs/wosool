import type { Company } from '../types'
import { normalizeSearch } from './faq-search'

type FilterableCompany = Pick<Company, 'name' | 'description' | 'location' | 'sector' | 'stage'> & {
  founders?: Pick<NonNullable<Company['founders']>[number], 'name'>[]
}

export type CompanyFilters = { search: string; sector: string; stage: string }

/**
 * Every search word must appear in the company's name, sector, stage, location, description or founder names.
 * Arabic letter variants are folded, so "الاتصالات" finds "الإتصالات" and the words need not be adjacent.
 */
export function matchesCompanySearch(company: FilterableCompany, query: string, locale?: 'ar' | 'en') {
  const terms = normalizeSearch(query, locale).split(' ').filter(Boolean)
  if (!terms.length) return true
  const text = normalizeSearch([
    company.name,
    company.sector,
    company.stage,
    company.location,
    company.description,
    ...(company.founders ?? []).map(founder => founder.name),
  ].filter(Boolean).join(' '), locale)
  return terms.every(term => text.includes(term))
}

export function filterCompanies<T extends FilterableCompany>(companies: T[], filters: CompanyFilters, locale?: 'ar' | 'en') {
  return companies.filter(company =>
    (!filters.sector || company.sector?.trim() === filters.sector) &&
    (!filters.stage || company.stage?.trim() === filters.stage) &&
    matchesCompanySearch(company, filters.search, locale))
}

/** Distinct non-empty values for a dropdown, sorted for the visitor's language. */
export function companyOptions(companies: FilterableCompany[], key: 'sector' | 'stage', locale: 'ar' | 'en') {
  return [...new Set(companies.map(company => company[key]?.trim()).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, locale))
}
