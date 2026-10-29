import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import historicalProfiles from '../data/founder-spotlight.json'
import additionalProfiles from '../data/founder-spotlight-expansion-2026-10-16.json'
import discoveryProfiles from '../data/founder-spotlight-expansion-2026-10-22.json'
import countryProfiles from '../data/founder-spotlight-expansion-2026-10-29.json'

const rank: Record<string, number> = { saudi: 0, gcc: 1, mena: 2, global: 3 }
const sourceProfiles = [...historicalProfiles, ...additionalProfiles, ...discoveryProfiles, ...countryProfiles]
  .sort((left, right) => (rank[left.region] ?? 4) - (rank[right.region] ?? 4))
import { getFounderSpotlights } from './founder-spotlight'

test('public spotlights stay separate from member profiles and provide supported links', () => {
  for (const locale of ['ar', 'en'] as const) {
    const profiles = getFounderSpotlights(locale)
    assert.equal(profiles.length, sourceProfiles.length)
    assert.ok(profiles.length >= 134)
    assert.equal(new Set(profiles.map(profile => profile.id)).size, profiles.length)
    for (const profile of profiles) {
      assert.equal(profile.externalProfileOnly, true)
      assert.equal(profile.isVerified, false)
      assert.equal(profile.isFeatured, false)
      assert.equal(profile.joinedAt, '')
      assert.ok(profile.name && profile.bio && profile.companyName && profile.position)
      assert.equal(new URL(profile.sourceUrl).protocol, 'https:')
      assert.equal(new URL(profile.primaryCompany!.website!).protocol, 'https:')
      assert.ok(!('email' in profile))
    }
  }
})

test('frontend source snapshots and database import share the same reviewed records', () => {
  const databaseBase = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory.json', import.meta.url), 'utf8'))
  const databaseExpansion = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-10-16.json', import.meta.url), 'utf8'))
  assert.equal(additionalProfiles.length, 100)
  assert.deepEqual(databaseBase, historicalProfiles)
  assert.deepEqual(databaseExpansion, additionalProfiles)
  const databaseDiscovery = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-10-22.json', import.meta.url), 'utf8'))
  assert.deepEqual(databaseDiscovery, discoveryProfiles)
  assert.equal(discoveryProfiles.length, 62)
  const databaseCountry = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-10-29.json', import.meta.url), 'utf8'))
  assert.deepEqual(databaseCountry, countryProfiles)
  assert.equal(countryProfiles.length, 102)
  assert.equal(new Set(countryProfiles.map(profile => profile.country_code)).size, 51)
  for (const code of new Set(countryProfiles.map(profile => profile.country_code))) assert.equal(countryProfiles.filter(profile => profile.country_code === code).length, 2, code)
  assert.equal(new Set(sourceProfiles.map(profile => profile.company_key)).size, 168)
  assert.equal(sourceProfiles.length, 308)
  assert.equal(new Set(sourceProfiles.map(profile => profile.founder_name_en.toLowerCase())).size, sourceProfiles.length)
  assert.equal(new Set(sourceProfiles.map(profile => profile.slug)).size, sourceProfiles.length)
  assert.ok(sourceProfiles.every(profile => profile.source_urls.length > 0 && profile.reviewed_at))
})

test('directory is ordered Saudi first, then GCC, MENA and global', () => {
  const order = ['saudi', 'gcc', 'mena', 'global']
  const ranks = sourceProfiles.map(profile => order.indexOf(profile.region))
  assert.ok(ranks.every(rank => rank >= 0))
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b))
  assert.ok(sourceProfiles.filter(profile => profile.region === 'saudi').length >= 70)
  assert.equal(additionalProfiles.filter(profile => profile.region === 'saudi').length, 40)
  assert.equal(additionalProfiles.filter(profile => profile.region === 'gcc').length, 35)
  assert.equal(additionalProfiles.filter(profile => profile.region === 'mena').length, 25)
})

test('every traction claim is bilingual and cites an https source listed on the profile', () => {
  const withTraction = sourceProfiles.filter(profile => profile.traction_en)
  assert.ok(withTraction.length >= 15)
  for (const profile of withTraction) {
    assert.ok(profile.traction_ar, profile.slug)
    assert.equal(new URL(profile.traction_source_url!).protocol, 'https:')
    assert.ok(profile.source_urls.includes(profile.traction_source_url!), profile.slug)
  }
  const spotlight = getFounderSpotlights('en').find(profile => profile.slug === 'hosam-arab')!
  assert.match(spotlight.primaryCompany!.traction!.text, /25M\+ users/)
  assert.equal(spotlight.primaryCompany!.foundedYear, 2019)
})

test('country founder cards have factual provenance and the latest update adds two profiles per country', () => {
  const countryCounts = new Map<string, number>()
  for (const row of sourceProfiles) countryCounts.set(row.country_code, (countryCounts.get(row.country_code) ?? 0) + 1)
  assert.equal(countryCounts.size, 51)
  assert.ok([...countryCounts.values()].every(count => count >= 2))
  const latest = discoveryProfiles.slice(-24)
  const expected = ['SA', 'AE', 'BH', 'KW', 'OM', 'QA', 'EG', 'JO', 'LB', 'US', 'AU', 'BR']
  for (const code of expected) assert.equal(latest.filter(row => row.country_code === code).length, 2, code)
  for (const row of latest) {
    assert.equal(row.reviewed_at, '2026-10-29')
    assert.ok(row.founder_name_en && row.founder_name_ar && row.company_name_en && row.company_name_ar)
    assert.ok(row.founder_brief_en && row.founder_brief_ar && row.role_en && row.role_ar)
    assert.ok(row.source_urls.includes(row.source_url))
    assert.equal(new URL(row.website).protocol, 'https:')
    assert.equal(row.portrait_url, null) // No unlicensed likenesses.
    assert.equal(row.logo_url, null) // Use existing safe brand fallback.
    assert.equal(row.traction_en, null) // Do not invent company performance.
    assert.equal(row.traction_ar, null)
    assert.equal(row.traction_source_url, null)
    assert.ok(!('isVerified' in row) && !('member' in row) && !('email' in row))
  }
})

test('reconciled worldwide source batch adds two founders in 30 new countries without duplicates or membership claims', () => {
  const additional = countryProfiles.slice(42)
  const expected = ['PK','IN','BD','JP','MY','PH','ID','SG','NG','KE','ZA',
    'GB','FR','DE','NL','SE','ES','DK','NO','FI','IE','AT','BE','GR','CH','CO','CL','MX','CA','AR']
  assert.equal(additional.length, 60)
  assert.deepEqual([...new Set(additional.map(item => item.country_code))].sort(), [...expected].sort())
  for (const code of expected) assert.equal(additional.filter(row => row.country_code === code).length, 2, code)
  const profileNames = sourceProfiles.map(row => row.founder_name_en.toLocaleLowerCase('en'))
  assert.equal(new Set(profileNames).size, profileNames.length)
  for (const item of additional) {
    assert.equal(item.reviewed_at, '2026-10-29')
    for (const field of ['founder_name_en','founder_name_ar','role_en','role_ar','founder_brief_en',
      'founder_brief_ar','company_name_en','company_name_ar','company_brief_en','company_brief_ar'] as const) {
      assert.ok(item[field], item.slug + ' ' + field)
    }
    assert.ok(item.source_urls.includes(item.source_url))
    assert.equal(new URL(item.website).protocol, 'https:')
    assert.equal(new URL(item.source_url).protocol, 'https:')
    assert.equal(item.portrait_url, null)
    assert.equal(item.logo_url, null)
    assert.equal(item.traction_en, null)
    assert.equal(item.traction_ar, null)
    assert.equal(item.traction_source_url, null)
    assert.ok(!('member' in item) && !('email' in item) && !('user_id' in item))
  }
})
