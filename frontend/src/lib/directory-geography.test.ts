import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { countryCode, countryRegion, directoryCountryGroups, founderCountry, isDirectoryRecordVisible } from './directory-geography'
import { communityEngagement } from './founder-engagement'

test('all supported countries have local flags, bilingual labels and stable regional order', () => {
  for (const locale of ['en', 'ar'] as const) {
    const groups = directoryCountryGroups(locale)
    assert.deepEqual(groups.map(group => group.region), ['saudi', 'gcc', 'mena', 'other'])
    const countries = groups.flatMap(group => group.countries)
    assert.equal(countries.length, 247)
    assert.equal(new Set(countries.map(country => country.code)).size, 247)
    assert.equal(groups[0].countries[0].code, 'SA')
    assert.equal(groups[1].countries.length, 5)
    for (const country of countries) {
      assert.ok(country.label && country.label !== country.code)
      assert.ok(existsSync(new URL(`../../public/flags/${country.code.toLowerCase()}.svg`, import.meta.url)))
    }
    assert.ok(!countries.some(country => ['IR', 'IL'].includes(country.code)))
  }
  assert.deepEqual(JSON.parse(readFileSync(new URL('../data/directory-geography.json', import.meta.url), 'utf8')), JSON.parse(readFileSync(new URL('../../../backend/resources/data/directory-geography.json', import.meta.url), 'utf8')))
})

test('country resolution normalizes actual geography and falls back to the linked company', () => {
  assert.equal(founderCountry({ countryCode: ' sa ', primaryCompany: { countryCode: 'AE' } }), 'SA')
  assert.equal(founderCountry({ primaryCompany: { countryCode: 'AE' } }), 'AE')
  assert.equal(founderCountry({ countryCode: 'XX' }), undefined)
  assert.equal(countryCode('//'), undefined)
  assert.equal(countryRegion('MR'), 'mena')
  assert.equal(countryRegion('JP'), 'other')
})

test('public coverage applies to profiles, companies, aliases and translated locations', () => {
  for (const record of [{ countryCode: ' ir ' }, { country_code: 'IL' }, { primaryCompany: { countryCode: 'IR' } }, { companies: [{ country_code: 'IL' }] }, { location: 'Tel Aviv, Israel' }, { translations: { ar: { location: 'طهران، إيران' } } }]) assert.equal(isDirectoryRecordVisible(record), false)
  assert.equal(isDirectoryRecordVisible({ countryCode: 'SA', location: 'Riyadh' }), true)
  assert.equal(isDirectoryRecordVisible({}), true)
})

test('engagement displays only a valid measurement for an activated account', () => {
  assert.equal(communityEngagement({ activationStatus: 'unclaimed', communityEngagementScore: 92 }), null)
  assert.equal(communityEngagement({ activationStatus: 'active' }), null)
  for (const score of [NaN, Infinity, 49, 101, 62.5]) assert.equal(communityEngagement({ activationStatus: 'active', communityEngagementScore: score }), null)
  for (const score of [50, 65, 100]) assert.equal(communityEngagement({ activationStatus: 'active', communityEngagementScore: score }), score)
})
