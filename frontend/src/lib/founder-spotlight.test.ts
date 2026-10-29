import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import historicalProfiles from '../data/founder-spotlight.json'
import additionalProfiles from '../data/founder-spotlight-expansion-2026-10-16.json'
import discoveryProfiles from '../data/founder-spotlight-expansion-2026-10-22.json'

const rank: Record<string, number> = { saudi: 0, gcc: 1, mena: 2, global: 3 }
const sourceProfiles = [...historicalProfiles, ...additionalProfiles, ...discoveryProfiles]
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
  assert.equal(discoveryProfiles.length, 132)
  assert.equal(new Set(sourceProfiles.map(profile => profile.company_key)).size, 151)
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
  assert.equal(countryCounts.size, 47)
  assert.ok([...countryCounts.values()].every(count => count >= 2))
  const latest = discoveryProfiles.slice(38, 62)
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
