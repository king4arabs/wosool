import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import roster from '../data/partner-ecosystem.json'
import { acceleratorPartnerLogos } from './partner-logos'
import { eoaOrganizationIdentity, eoaOrganizationsForDiscovery, filterEoaOrganizations } from './eoa-partner-discovery'

test('the EOA carousel catalog contains every ecosystem logo and curated EOA logo', () => {
  const items = eoaOrganizationsForDiscovery()
  const keys = items.map(eoaOrganizationIdentity)
  assert.equal(new Set(keys).size, items.length, 'no duplicate organizations')
  for (const original of [...roster, ...acceleratorPartnerLogos]) {
    const displayed = items.find(item => eoaOrganizationIdentity(item) === eoaOrganizationIdentity(original))
    assert.ok(displayed, `missing organization: ${original.id}`)
    assert.ok(displayed.logo_path, `missing logo: ${original.id}`)
  }
  assert.ok(items.length >= roster.length)
  for (const item of items) {
    assert.match(item.website ?? '', /^https:\/\//, `untrusted website for ${item.id}`)
    if (item.logo_path?.startsWith('/')) {
      const file = path.join(process.cwd(), 'public', item.logo_path.slice(1))
      assert.ok(existsSync(file), `logo asset missing: ${item.logo_path}`)
    }
  }
})

test('CODE is separate from the MCIT ministry, but repeated official organizations dedupe', () => {
  const items = eoaOrganizationsForDiscovery()
  const mcit = items.find(item => item.id === 'mcit')
  const code = items.find(item => item.id === 'code')
  assert.ok(mcit)
  assert.ok(code)
  assert.notEqual(eoaOrganizationIdentity(mcit), eoaOrganizationIdentity(code))
  const extra = eoaOrganizationsForDiscovery([], [
    { id: 42, name_ar: 'منشآت', name_en: 'Monshaat', website: 'https://www.monshaat.gov.sa/en', logo_path: '/partners/eo-riyadh.png' },
  ])
  assert.equal(extra.length, items.length)
  assert.equal(extra.filter(item => eoaOrganizationIdentity(item) === eoaOrganizationIdentity({ id: 'monshaat', website: 'https://monshaat.gov.sa' })).length, 1)
})

test('category, geography and bilingual name filtering retain predictable results', () => {
  const items = eoaOrganizationsForDiscovery()
  assert.equal(filterEoaOrganizations(items, { category: 'bank', region: 'saudi' }).length, 10)
  assert.equal(filterEoaOrganizations(items, { category: 'government', region: 'saudi' }).length, 10)
  assert.ok(filterEoaOrganizations(items, { region: 'world' }).length >= 4)
  assert.equal(filterEoaOrganizations(items, { query: 'monshaat' }).length, 1)
  assert.equal(filterEoaOrganizations(items, { query: 'منشآت' }).length, 1)
  assert.deepEqual(filterEoaOrganizations(items, { query: 'zzz-not-an-organization' }), [])
})

test('public API directory records join the logo slider without inventing a confirmed status', () => {
  const original = eoaOrganizationsForDiscovery()
  const withDirectory = eoaOrganizationsForDiscovery([{
    id: 921, name_ar: 'جهة اختبار', name_en: 'Test Organization',
    website: 'https://example.org', logo_path: '/partners/kaust.svg',
    support_ar: 'خدمات', support_en: 'Services', source_url: 'https://example.org',
    verified_at: '2026-11-01', relationship_status: 'prospect',
  }])
  assert.equal(withDirectory.length, original.length + 1)
  assert.ok(withDirectory.some(item => item.id === 921 && item.support_en === 'Services'))
})
