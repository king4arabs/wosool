import assert from 'node:assert/strict'
import test from 'node:test'
import { createFounderMixStore, editorialFounders, founderDiscoveryOrder } from './founder-discovery'
import { getFounderSpotlights } from './founder-spotlight'
import { founderRegion } from './founder-filters'
import { loadFounderPages } from './founder-pages'
import type { ApiFounder } from './content-api'

test('each founder mix keeps every identity once, varies the preview and preserves source order', () => {
  const founders = getFounderSpotlights('en')
  const before = structuredClone(founders)
  const one = founderDiscoveryOrder(founders, 101)
  const two = founderDiscoveryOrder(founders, 202)
  assert.deepEqual(founders, before)
  assert.deepEqual([...one.map(item => item.slug)].sort(), founders.map(item => item.slug).sort())
  assert.equal(new Set(one.map(item => item.slug)).size, founders.length)
  assert.notDeepEqual(one.slice(0, 36).map(item => item.slug), two.slice(0, 36).map(item => item.slug))
  assert.deepEqual(one, founderDiscoveryOrder(founders, 101))
  assert.equal(one[0].countryCode, 'SA')
  assert.ok(one.slice(0, 8).some(item => item.countryCode === 'AE'))
  assert.ok(one.slice(0, 8).some(item => founderRegion(item) === 'other'))
})

test('locale and filters preserve visit order; empty and one-region collections terminate', () => {
  const en = founderDiscoveryOrder(getFounderSpotlights('en'), 333)
  const ar = founderDiscoveryOrder(getFounderSpotlights('ar'), 333)
  assert.deepEqual(en.map(item => item.slug), ar.map(item => item.slug))
  const saudi = getFounderSpotlights('en').filter(item => item.countryCode === 'SA')
  assert.deepEqual(founderDiscoveryOrder(saudi, 333).map(item => item.slug), en.filter(item => item.countryCode === 'SA').map(item => item.slug))
  assert.deepEqual(founderDiscoveryOrder([], 333), [])
  assert.deepEqual(founderDiscoveryOrder(saudi.slice(0, 1), 333), saudi.slice(0, 1))
})

test('shuffle store has deterministic hydration, initializes once and changes on explicit shuffle', () => {
  const store = createFounderMixStore(() => 7)
  assert.equal(store.getSnapshot(), 0)
  assert.equal(store.getServerSnapshot(), 0)
  let updates = 0
  const unsubscribe = store.subscribe(() => updates++)
  assert.equal(store.getSnapshot(), 7)
  const unsubscribeAgain = store.subscribe(() => {})
  assert.equal(updates, 1)
  store.shuffle()
  assert.equal(store.getSnapshot(), 8) // Repeated random values still change the mix.
  assert.equal(store.getServerSnapshot(), 0)
  unsubscribe()
  unsubscribeAgain()
})

test('editorial spotlight excludes matching live slugs without mixing member fields into snapshots', () => {
  const profiles = getFounderSpotlights('en')
  const selected = profiles[0]
  const result = editorialFounders(profiles, [{ slug: selected.slug }])
  assert.equal(result.length, profiles.length - 1)
  assert.ok(result.every(item => item.slug !== selected.slug && item.externalProfileOnly && item.activationStatus === 'unclaimed'))
})

test('homepage fetches all founder pages, deduplicates slugs and rejects incomplete or excessive pagination', async () => {
  const row = (slug: string) => ({ id: 1, slug } as ApiFounder)
  const requested: number[] = []
  const result = await loadFounderPages(async page => {
    requested.push(page)
    return { data: page === 1 ? [row('first')] : [row('first'), row('later')], meta: { last_page: 2 } }
  })
  assert.deepEqual(requested, [1, 2])
  assert.deepEqual(result.data.map(item => item.slug), ['first', 'later'])
  await assert.rejects(loadFounderPages(async () => ({ data: [], meta: { last_page: 21 } })), /Invalid founder pagination/)
  await assert.rejects(loadFounderPages(async page => {
    if (page === 2) throw new Error('Denied')
    return { data: [row('first')], meta: { last_page: 2 } }
  }), /Denied/)
})
