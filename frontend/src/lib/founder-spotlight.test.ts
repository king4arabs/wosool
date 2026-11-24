import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { reviewedCompanyLogo } from './brand-logos'
import historicalProfiles from '../data/founder-spotlight.json'
import additionalProfiles from '../data/founder-spotlight-expansion-2026-10-16.json'
import discoveryProfiles from '../data/founder-spotlight-expansion-2026-10-22.json'
import countryProfiles from '../data/founder-spotlight-expansion-2026-10-29.json'

import novemberProfiles from '../data/founder-spotlight-expansion-2026-11-10.json'
import november12Profiles from '../data/founder-spotlight-expansion-2026-11-12.json'
import november13Profiles from '../data/founder-spotlight-expansion-2026-11-13.json'
import november14Profiles from '../data/founder-spotlight-expansion-2026-11-14.json'
import november15Profiles from '../data/founder-spotlight-expansion-2026-11-15.json'
import november17Profiles from '../data/founder-spotlight-expansion-2026-11-17.json'
import november18Profiles from '../data/founder-spotlight-expansion-2026-11-18.json'
import november19Profiles from '../data/founder-spotlight-expansion-2026-11-19.json'
import november20Profiles from '../data/founder-spotlight-expansion-2026-11-20.json'
import november21Profiles from '../data/founder-spotlight-expansion-2026-11-21.json'
import november22Profiles from '../data/founder-spotlight-expansion-2026-11-22.json'
import november23Profiles from '../data/founder-spotlight-expansion-2026-11-23.json'
import november24Profiles from '../data/founder-spotlight-expansion-2026-11-24.json'

const rank: Record<string, number> = { saudi: 0, gcc: 1, mena: 2, global: 3 }
const sourceProfiles = [...historicalProfiles, ...additionalProfiles, ...discoveryProfiles, ...countryProfiles, ...novemberProfiles, ...november12Profiles, ...november13Profiles, ...november14Profiles, ...november15Profiles, ...november17Profiles, ...november18Profiles, ...november19Profiles, ...november20Profiles, ...november21Profiles, ...november22Profiles, ...november23Profiles, ...november24Profiles]
  .sort((left, right) => (rank[left.region] ?? 4) - (rank[right.region] ?? 4))
// Historical batches retain their membership when an existing profile receives new verification dates.
// Cohort boundaries are source-linked, not array positions: editorial entries can be prepended.
const originalCountryCohort = countryProfiles.filter(profile => profile.reviewed_at === '2026-10-29'
  || ['mamun-saleh-al-tamami', 'mamun-mohammed-al-tamami'].includes(profile.slug))
const october30Additions = countryProfiles.filter(profile => profile.reviewed_at === '2026-10-30')
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
  assert.equal(countryProfiles.length, 153)
  const novemberDatabase = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-10.json', import.meta.url), 'utf8'))
  assert.deepEqual(novemberDatabase, novemberProfiles)
  assert.equal(novemberProfiles.length, 19)
  const november12Database = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-12.json', import.meta.url), 'utf8'))
  assert.deepEqual(november12Database, november12Profiles)
  assert.equal(november12Profiles.length, 7)
  const november13Database = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-13.json', import.meta.url), 'utf8'))
  assert.deepEqual(november13Database, november13Profiles)
  assert.equal(november13Profiles.length, 6)
  const november14Database = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-14.json', import.meta.url), 'utf8'))
  assert.deepEqual(november14Database, november14Profiles)
  assert.equal(november14Profiles.length, 5)
  const november15Database = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-15.json', import.meta.url), 'utf8'))
  assert.deepEqual(november15Database, november15Profiles)
  assert.equal(november15Profiles.length, 12)
  const november17Database = JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-17.json', import.meta.url), 'utf8'))
  assert.deepEqual(november17Database, november17Profiles)
  assert.equal(november17Profiles.length, 3)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-18.json', import.meta.url), 'utf8')), november18Profiles)
  assert.equal(november18Profiles.length, 2)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-19.json', import.meta.url), 'utf8')), november19Profiles)
  assert.equal(november19Profiles.length, 3)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-20.json', import.meta.url), 'utf8')), november20Profiles)
  assert.equal(november20Profiles.length, 5)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-21.json', import.meta.url), 'utf8')), november21Profiles)
  assert.equal(november21Profiles.length, 1)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-22.json', import.meta.url), 'utf8')), november22Profiles)
  assert.equal(november22Profiles.length, 2)
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-23.json', import.meta.url), 'utf8')), november23Profiles)
  assert.deepEqual(november23Profiles.map(p => p.slug), ['hany-fekry-enza', 'hamish-houston-enza'])
  assert.deepEqual(JSON.parse(readFileSync(new URL('../../../backend/resources/data/founder-directory-expansion-2026-11-24.json', import.meta.url), 'utf8')), november24Profiles)
  assert.equal(november24Profiles.length, 3)
  assert.equal(originalCountryCohort.length, 102)
  assert.equal(october30Additions.length, 8)
  assert.equal(new Set(originalCountryCohort.map(profile => profile.country_code)).size, 51)
  for (const code of new Set(originalCountryCohort.map(profile => profile.country_code))) assert.equal(originalCountryCohort.filter(profile => profile.country_code === code).length, 2, code)
  assert.equal(new Set(sourceProfiles.map(profile => profile.company_key)).size, 231)
  assert.equal(sourceProfiles.length, 429)
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

test('Rewaa founders retain current roles, first-party activity evidence and source provenance', () => {
  const rewaa = historicalProfiles
    .filter(profile => profile.company_key === 'rewaa')
    .sort((left, right) => left.slug.localeCompare(right.slug))

  assert.deepEqual(rewaa.map(profile => [profile.slug, profile.role_en]), [
    ['abdullah-aljadhai', 'Co-founder & COO'],
    ['mohammed-alqasir', 'Co-founder & CEO'],
  ])

  for (const profile of rewaa) {
    assert.equal(profile.reviewed_at, '2026-11-23')
    assert.equal(profile.website, 'https://rewaa.com/')
    assert.equal(profile.traction_source_url, 'https://rewaa.com/about-us/')
    assert.ok(profile.source_urls.includes('https://www.sadu.vc/portfolio-blog/rewaa'))
    assert.ok(profile.source_urls.includes('https://graphenevc.com/portfolio/rewaa'))
    assert.match(profile.traction_en, /Rewaa reports more than 23,000 merchants/)
    assert.ok(!('member' in profile) && !('user_id' in profile) && !('is_verified' in profile))
  }

  const mohammed = rewaa.find(profile => profile.slug === 'mohammed-alqasir')!
  assert.ok(mohammed.founder_socials.every(link => mohammed.source_urls.includes(link.url)))
})

test('Jahez founder retains current governance role and financial-statement evidence', () => {
  const jahez = historicalProfiles.find(profile => profile.slug === 'jahez')!

  assert.equal(jahez.role_en, 'Co-founder, CEO & Board Member')
  assert.equal(jahez.source_url, 'https://jahezgroup.com/jahez-ar/2025/corporate-governance/')
  assert.equal(jahez.traction_source_url, 'https://jahezgroup.com/jahez-ar/2025/financial-statements/')
  assert.match(jahez.traction_en, /FY2025 consolidated financial statements report SAR 2,323\.6M revenue/)
  assert.equal(jahez.reviewed_at, '2026-11-23')
  assert.ok(jahez.source_urls.includes(jahez.source_url))
  assert.ok(jahez.source_urls.includes(jahez.traction_source_url))
  assert.ok(jahez.traction_ar)
  assert.ok(!('member' in jahez) && !('user_id' in jahez) && !('is_verified' in jahez))
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
    assert.equal(row.logo_url, reviewedCompanyLogo(row.website) ?? null)
    assert.equal(row.traction_en, null) // Do not invent company performance.
    assert.equal(row.traction_ar, null)
    assert.equal(row.traction_source_url, null)
    assert.ok(!('isVerified' in row) && !('member' in row) && !('email' in row))
  }
})

test('reconciled worldwide source batch adds two founders in 30 new countries without duplicates or membership claims', () => {
  const additional = originalCountryCohort.slice(42)
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
    assert.equal(item.logo_url, reviewedCompanyLogo(item.website) ?? null)
    assert.equal(item.traction_en, null)
    assert.equal(item.traction_ar, null)
    assert.equal(item.traction_source_url, null)
    assert.ok(!('member' in item) && !('email' in item) && !('user_id' in item))
  }
})

test('30 October sourced founder discoveries have primary evidence and retain unclaimed public-only status', () => {
  assert.deepEqual(october30Additions.map(item => item.slug).sort(), [
    'abdulaziz-almuhaydib-velents', 'ahmed-alsharif-think-ai', 'amiram-shachar-upwind',
    'ammar-enaya-think-ai', 'mithil-ajmera-sav', 'mohamed-gaber-velents',
    'mohamed-oueida-stitch', 'purvi-munot-sav',
  ])
  for (const row of october30Additions) {
    const expectedRegions: Record<string, string> = { SA: 'saudi', AE: 'gcc', US: 'global' }
    assert.equal(row.region, expectedRegions[row.country_code])
    assert.ok(row.source_urls.includes(row.source_url))
    assert.equal(row.portrait_url, null) // Never invent a likeness.
    assert.equal(row.logo_url, reviewedCompanyLogo(row.website) ?? null) // Reviewed original company artwork only.
    assert.ok(!('isVerified' in row) && !('member' in row) && !('email' in row))
  }
})

// Source-only profiles do not constitute membership or account creation.
test('31 October sourced founders retain primary evidence without membership claims', () => {
  const latest = countryProfiles.filter(profile => profile.reviewed_at === '2026-10-31')
  assert.deepEqual(latest.map(profile => profile.slug).sort(), [
    'aarif-al-otaibi-rime', 'alex-mcleod-serval', 'jake-stauch-serval', 'mohammed-almarshidi-rime',
  ])
  for (const profile of latest) {
    assert.ok(profile.source_urls.includes(profile.source_url))
    assert.equal(profile.portrait_url, null)
    assert.equal(profile.logo_url, reviewedCompanyLogo(profile.website) ?? null)
    assert.ok(!('member' in profile) && !('email' in profile) && !('user_id' in profile) && !('isVerified' in profile))
  }
})

test('1 November sourced founders retain independent evidence and no Wosool membership', () => {
  const additions = countryProfiles.filter(profile => profile.reviewed_at === '2026-11-01')
  assert.deepEqual(additions.map(profile => profile.slug).sort(), [
    'abdallah-yafi-by-venture-partners', 'ghaith-yafi-by-venture-partners', 'thamer-faisal-al-quayshish-talmal',
  ])
  for (const row of additions) {
    assert.ok(row.source_urls.includes(row.source_url))
    assert.equal(row.portrait_url, null)
    assert.equal(row.logo_url, reviewedCompanyLogo(row.website) ?? null)
    assert.equal(row.traction_en, null)
    assert.ok(!('isVerified' in row) && !('member' in row) && !('email' in row) && !('user_id' in row))
  }
})

test('3 November sourced co-founders carry evidence and no Wosool membership', () => {
  const latest = countryProfiles.filter(item => item.reviewed_at === '2026-11-03')
  assert.deepEqual(latest.map(item => item.slug).sort(), [
    'abdullah-alsaeed-mozn', 'bilal-abu-ghazaleh-1001',
    'dr-khaled-al-ghoneim-mozn', 'malik-alyousef-mozn',
  ])
  for (const item of latest) {
    assert.ok(item.source_urls.includes(item.source_url))
    assert.equal(item.region, item.country_code === 'SA' ? 'saudi' : 'gcc')
    assert.equal(item.portrait_url, null)
    assert.equal(item.logo_url, reviewedCompanyLogo(item.website) ?? null)
    assert.ok(!('member' in item) && !('email' in item) && !('user_id' in item) && !('isVerified' in item))
    if (item.traction_en) {
      assert.ok(item.traction_ar)
      assert.ok(item.source_urls.includes(item.traction_source_url!))
    }
  }
})

test('2 November sourced founders retain independently linked evidence and no membership claims', () => {
  const latest = countryProfiles.filter(profile => profile.reviewed_at === '2026-11-02')
  assert.deepEqual(latest.map(profile => profile.slug).sort(), [
    'baraa-koshak-abwab', 'erad-abdulmalik-almeheini', 'erad-youssef-said', 'mike-matta-solink',
    'mohammad-hashem-abwab',
  ])
  for (const row of latest) {
    assert.ok(row.source_urls.includes(row.source_url))
    assert.ok(row.founder_name_en && row.founder_name_ar && row.founder_brief_en && row.founder_brief_ar)
    assert.equal(row.portrait_url, null)
    assert.equal(row.traction_en, null)
    assert.equal(row.traction_ar, null)
    assert.ok(!('member' in row) && !('isVerified' in row) && !('email' in row) && !('user_id' in row))
  }
})

test('RABEH founder directory listing keeps original company imagery and never creates a membership claim', () => {
  const rabeh = countryProfiles.find(profile => profile.slug === 'mohammed-alsolami-rabeh')!
  assert.ok(rabeh)
  assert.equal(rabeh.founder_name_en, 'Mohammed Alsolami')
  assert.equal(rabeh.company_name_ar, 'رابح المالية')
  assert.equal(rabeh.website, 'https://rabeh.sa/')
  assert.equal(rabeh.region, 'saudi')
  assert.equal(rabeh.logo_url, '/startup-directory/rabeh-logo.webp')
  assert.equal(rabeh.portrait_url, '/startup-directory/mohammed-alsolami-rabeh.webp')
  assert.ok(rabeh.source_urls.includes(rabeh.source_url))
  assert.equal(rabeh.traction_en, null)
  assert.ok(!('user_id' in rabeh) && !('email' in rabeh) && !('isVerified' in rabeh) && !('member' in rabeh))
})

test('6 November founder additions are source-linked, unclaimed and do not duplicate people', () => {
  const newSlugs = ['ahmed-al-issaei-mamun', 'taoufik-el-jamali-journify', 'amine-chouki-journify',
    'omar-al-shoubaki-journify', 'paul-monasterio-kalepa', 'daniel-hillman-kalepa']
  const newRows = countryProfiles.filter(profile => newSlugs.includes(profile.slug))
  assert.equal(newRows.length, 6)
  for (const profile of newRows) {
    assert.equal(profile.reviewed_at, '2026-11-06')
    assert.ok(profile.source_urls.includes(profile.source_url))
    assert.equal(profile.portrait_url, null)
    assert.ok(!('member' in profile) && !('email' in profile) && !('user_id' in profile))
    assert.ok(!('isVerified' in profile))
  }
  const mamun = countryProfiles.find(profile => profile.slug === 'mamun-mohammed-al-tamami')!
  assert.equal(mamun.role_en, 'Co-founder & Chief Commercial Officer')
  assert.equal(mamun.reviewed_at, '2026-11-06')
})


test('16 November Saudi Rkiza founder remains unclaimed and sourced without speculative traction', () => {
  const row = november15Profiles.find(profile => profile.slug === 'fahad-alarifee-rkiza')!
  assert.ok(row)
  assert.equal(row.company_key, 'rkiza')
  assert.equal(row.reviewed_at, '2026-11-16')
  assert.equal(row.logo_url, null)
  assert.equal(row.traction_en, null)
  assert.ok(row.source_urls.includes(row.source_url))
  assert.ok(!('member' in row) && !('email' in row) && !('isVerified' in row))
})


test('17 November sourced external profiles retain accurate identity and nonmembership', () => {
  assert.deepEqual(november17Profiles.map(p => p.slug), ['paul-farhi-vision-makers', 'ibrahim-anwar-sabika', 'mohammed-darwish-sabika'])
  for (const p of november17Profiles) {
    assert.equal(p.reviewed_at, '2026-11-17')
    assert.equal(p.logo_url, null)
    assert.equal(p.portrait_url, null)
    assert.deepEqual(p.founder_socials, [])
    assert.ok(p.source_urls.includes(p.source_url))
    assert.ok(p.source_urls.includes(p.traction_source_url))
    assert.ok(!('user_id' in p) && !('email' in p) && !('isVerified' in p) && !('member' in p))
    assert.ok(!p.role_en.includes('CEO'))
  }
})


test('new iMENA and Daleela founders are unclaimed and evidence-linked', () => {
  assert.deepEqual(november18Profiles.map(p => p.slug), ['nasir-alsharif-imena', 'khaldoon-tabaza-imena'])
  assert.deepEqual(november19Profiles.map(p => p.slug), ['yousef-elsammaa-daleela', 'nour-emam-daleela', 'ahmad-abou-hashem-daleela'])
  for (const p of [...november18Profiles, ...november19Profiles, ...november20Profiles]) {
    assert.ok(p.founder_name_ar && p.founder_brief_ar)
    assert.equal(p.logo_url, null); assert.equal(p.portrait_url, null)
    assert.ok(p.source_urls.includes(p.source_url) && p.source_urls.includes(p.traction_source_url))
    assert.ok(!('email' in p) && !('user_id' in p) && !('isVerified' in p))
  }
  for (const p of november19Profiles) assert.ok(p.founder_socials.every(link => p.source_urls.includes(link.url)))
})


test('20 November Shaffra and Connect Money founder profiles stay evidence-linked and unclaimed', () => {
  assert.deepEqual(november20Profiles.map(p => p.slug), [
    'alharith-alatawi-shaffra', 'marc-wehbi-shaffra', 'ayman-essawy-connect-money',
    'marwan-kenawy-connect-money', 'momtaz-moussa-connect-money',
  ])
  for (const p of november20Profiles) {
    assert.equal(p.reviewed_at, '2026-11-20')
    assert.equal(p.logo_url, null)
    assert.equal(p.portrait_url, null)
    assert.ok(p.founder_name_ar && p.founder_brief_ar && p.company_brief_ar)
    assert.ok(p.source_urls.includes(p.source_url))
    assert.ok(p.source_urls.includes(p.traction_source_url))
    assert.ok(!('email' in p) && !('user_id' in p) && !('is_verified' in p))
  }
})


test('enza co-founders have bilingual evidence and remain unclaimed external profiles', () => {
  for (const p of november23Profiles) {
    assert.equal(p.company_key, 'enza-payments-infrastructure')
    assert.equal(p.logo_url, null)
    assert.equal(p.portrait_url, null)
    assert.equal(p.reviewed_at, '2026-11-23')
    assert.ok(p.founder_brief_en && p.founder_brief_ar && p.role_ar && p.company_brief_ar)
    assert.ok(p.source_urls.includes(p.source_url) && p.source_urls.includes(p.traction_source_url))
    assert.deepEqual(p.founder_socials, [])
    assert.ok(!('email' in p) && !('user_id' in p) && !('is_verified' in p))
  }
})


test('24 November Saudi profiles and Tamara refresh retain source-backed facts', () => {
  for (const p of november24Profiles) {
    assert.equal(p.country_code, 'SA')
    assert.equal(p.logo_url, null)
    assert.ok(p.source_urls.includes(p.traction_source_url))
    assert.ok(p.founder_brief_en && p.founder_brief_ar && p.role_ar)
  }
  const tamara = historicalProfiles.filter(p => p.company_key === 'tamara')
  assert.equal(tamara.length, 3)
  assert.ok(tamara.every(p => p.traction_en?.includes('26 million') && p.traction_ar && p.reviewed_at === '2026-11-24'))
})
