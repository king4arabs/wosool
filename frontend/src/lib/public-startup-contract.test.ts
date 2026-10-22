import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePublicResponse } from '../../scripts/lib/public-contract'

const startup = () => ({
  id: 'fixture', slug: 'fixture', company_name_en: 'Fixture', company_name_ar: 'شركة تجريبية',
  country_en: 'Saudi Arabia', country_ar: 'السعودية', country_code: 'SA', region: 'Saudi Arabia',
  sector_en: 'Software', sector_ar: 'برمجيات', founder_name_en: 'Founder', founder_name_ar: 'مؤسس',
  role_en: 'Founder & CEO', role_ar: 'مؤسس ورئيس تنفيذي', company_brief_en: 'Software company.', company_brief_ar: 'شركة برمجيات.',
  founder_brief_en: 'Founded the company.', founder_brief_ar: 'أسس الشركة.', website: 'https://example.com',
  source_url: 'https://example.com/about', logo_url: '/startup-directory/fixture.svg', portrait_url: null,
  company_socials: [{ label: 'LinkedIn', url: 'https://linkedin.com/company/fixture' }], founder_socials: [],
  reviewed_at: '2026-10-22', review_due_at: '2027-01-20', sources: ['https://example.com/about'],
  asset_sources: [{ kind: 'logo', url: 'https://example.com/logo.svg', page: 'https://example.com/brand' }],
  business_type: 'technology', focus_area_en: 'Business software', focus_area_ar: 'برمجيات الأعمال',
  website_status: 'active', website_verified_at: '2026-10-22', website_verification_method: 'official_site_content_review',
  ecosystem_sources: [{ key: 'leap', label: 'LEAP', label_ar: 'ليب', url: 'https://onegiantleap.com', relationship_en: 'Public interview', relationship_ar: 'مقابلة منشورة' }],
  revenue_status: 'reported', revenue_evidence: {
    source_url: 'https://example.com/revenue', period: 'Year ended 31 December 2025', period_ar: 'السنة المنتهية في 31 ديسمبر 2025',
    summary_en: 'The company reported revenue for the period.', summary_ar: 'أعلنت الشركة الإيرادات للفترة.', reviewed_at: '2026-10-22',
  }, review_due: false,
})

const collection = (data: unknown[]) => ({ data, meta: { current_page: 1, last_page: 1, total: data.length, sectors: [{ en: 'Software', ar: 'برمجيات' }] } })

test('startup contract accepts reported and financial-statement revenue with optional editorial notes', () => {
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, collection([startup()])).valid, true)
  const statement = { ...startup(), revenue_status: 'financial_statement', logo_tone: 'dark', review_note: 'Statement source reviewed; no audit claim.' }
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, collection([statement])).valid, true)
})

test('startup contract rejects eligibility drift, missing periods and unexpected private fields', () => {
  for (const changes of [
    { revenue_status: 'pending' }, { website_status: 'pending' }, { business_type: 'hybrid' },
    { revenue_evidence: { ...startup().revenue_evidence, period: null } },
    { owner_email: 'private@example.test' }, { sources: ['http://example.com'] },
  ]) {
    const record = { ...startup(), ...changes }
    const before = structuredClone(record)
    assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, collection([record])).valid, false, JSON.stringify(changes))
    assert.deepEqual(record, before)
  }
  const missing: Partial<ReturnType<typeof startup>> = startup()
  delete missing.revenue_evidence
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, collection([missing])).valid, false)
})

test('startup collection requires typed facets and its compact pagination shape', () => {
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, collection([])).valid, true)
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, { ...collection([]), links: {} }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, { ...collection([]), meta: { ...collection([]).meta, total: '0' } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 200, { ...collection([]), meta: { ...collection([]).meta, sectors: [{ en: 'Software' }] } }).valid, false)
})

test('startup validation errors are typed while intermediary rate-limit bodies remain unspecified', () => {
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 422, { message: 'Invalid query', errors: { region: ['The selected region is invalid.'] } }).valid, true)
  assert.equal(validatePublicResponse('/api/v1/startup-directory', 422, { message: 'Invalid query', errors: { region: 'Invalid' } }).valid, false)
  assert.throws(() => validatePublicResponse('/api/v1/startup-directory', 429, {}), /No JSON response schema/)
})
