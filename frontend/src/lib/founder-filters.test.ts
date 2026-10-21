import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { arabicProfileCount, filterFounders, founderRegion, regionOptions, sectorOptions } from './founder-filters'
import { getFounderSpotlights } from './founder-spotlight'

const founder = (name: string, countryCode: string | undefined, sector: string) => ({ name, companyName: `${name} Co`, position: 'Founder', bio: '', location: '', sector, countryCode })
const sample = [
  founder('Sara', 'SA', 'Fintech'),
  founder('Omar', 'ae', 'Logistics'),
  founder('Lina', 'JO', 'Fintech'),
  founder('Ana', 'BR', 'Health'),
  founder('Noor', undefined, 'Education'),
]

test('country codes map to regions, case-insensitively, with unknown countries as other', () => {
  assert.deepEqual(sample.map(founderRegion), ['saudi', 'gcc', 'mena', 'other', 'other'])
})

test('filters combine search, sector and region', () => {
  assert.deepEqual(filterFounders(sample, { search: '', sector: 'Fintech', region: 'all' }, 'en').map(item => item.name), ['Sara', 'Lina'])
  assert.deepEqual(filterFounders(sample, { search: '', sector: 'Fintech', region: 'mena' }, 'en').map(item => item.name), ['Lina'])
  assert.deepEqual(filterFounders(sample, { search: ' omar CO ', sector: '', region: 'gcc' }, 'en').map(item => item.name), ['Omar'])
  assert.deepEqual(filterFounders(sample, { search: 'omar', sector: '', region: 'saudi' }, 'en'), [])
})

test('sector options only list sectors present in the selected region', () => {
  assert.deepEqual(sectorOptions(sample, 'all', 'en'), ['Education', 'Fintech', 'Health', 'Logistics'])
  assert.deepEqual(sectorOptions(sample, 'gcc', 'en'), ['Logistics'])
  assert.deepEqual(sectorOptions(sample, 'other', 'en'), ['Education', 'Health'])
})

test('region chips count founders and keep the active region visible when it has no matches', () => {
  assert.deepEqual(regionOptions(sample, 'all', 'en').map(item => [item.key, item.count]), [['saudi', 1], ['gcc', 1], ['mena', 1], ['other', 2]])
  const saudiOnly = sample.slice(0, 1)
  assert.deepEqual(regionOptions(saudiOnly, 'all', 'ar').map(item => item.label), ['السعودية'])
  assert.deepEqual(regionOptions(saudiOnly, 'mena', 'en').map(item => [item.key, item.count]), [['saudi', 1], ['mena', 0]])
})

test('every published spotlight has a region and every region has a sector list in both languages', () => {
  for (const locale of ['ar', 'en'] as const) {
    const profiles = getFounderSpotlights(locale)
    const regions = regionOptions(profiles, 'all', locale)
    assert.equal(regions.reduce((sum, item) => sum + item.count, 0), profiles.length)
    for (const region of regions) assert.ok(sectorOptions(profiles, region.key, locale).length > 0, `${locale} ${region.key}`)
  }
})

test('Arabic profile counts agree with the number', () => {
  assert.equal(arabicProfileCount(1), 'ملف واحد')
  assert.equal(arabicProfileCount(2), 'ملفان')
  assert.equal(arabicProfileCount(2, { genitive: true }), 'ملفين')
  assert.equal(arabicProfileCount(3), '3 ملفات')
  assert.equal(arabicProfileCount(10), '10 ملفات')
  assert.equal(arabicProfileCount(11), '11 ملفًا')
  assert.equal(arabicProfileCount(99), '99 ملفًا')
  assert.equal(arabicProfileCount(100), '100 ملف')
  assert.equal(arabicProfileCount(103), '103 ملفات')
  assert.equal(arabicProfileCount(144), '144 ملفًا')
})

test('the founder showcase uses the shared filters and clears the region with the other filters', () => {
  const showcase = readFileSync(new URL('../components/sections/CommunityShowcase.tsx', import.meta.url), 'utf8')
  assert.match(showcase, /filterFounders\(founders, \{ search, sector, region \}, locale\)/)
  assert.match(showcase, /const hasFilters = Boolean\(search \|\| sector \|\| region !== 'all'\)/)
  assert.doesNotMatch(showcase, /ملفات مؤسسين للاستكشاف/)
  const page = readFileSync(new URL('../app/founders/page.tsx', import.meta.url), 'utf8')
  assert.match(page, /region=\{region\} onRegionChange=\{setRegion\}/)
  assert.match(page, /setLocation\(''\); setRegion\('all'\)/)
})
