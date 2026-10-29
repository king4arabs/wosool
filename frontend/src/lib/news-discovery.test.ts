import test from 'node:test'
import assert from 'node:assert/strict'
import { createNewsVisitStore, newsVisitOrder } from './news-discovery'

const stories = Array.from({ length: 36 }, (_, i) => ({ slug: `story-${i}`, sourceUrl: `https://publisher.example/story-${i}` }))

test('news visit mixes keep every story, vary by visit and never mutate the feed', () => {
  const before = [...stories]
  const first = newsVisitOrder(stories, 123)
  assert.deepEqual(stories, before)
  assert.equal(new Set(first.map(item => item.slug)).size, stories.length)
  assert.deepEqual([...first].sort((a, b) => a.slug.localeCompare(b.slug)), [...stories].sort((a, b) => a.slug.localeCompare(b.slug)))
  assert.notDeepEqual(first, newsVisitOrder(stories, 456))
  assert.deepEqual(first, newsVisitOrder(stories, 123))
})

test('search subsets, API corrections and additional pages retain the visit ordering', () => {
  const ordered = newsVisitOrder(stories, 78)
  const subset = stories.slice(0, 12)
  assert.deepEqual(newsVisitOrder(subset, 78), ordered.filter(item => subset.includes(item)))
  const changedSlug = stories.map(item => ({ ...item, slug: `new-${item.slug}` }))
  assert.deepEqual(newsVisitOrder(changedSlug, 78).map(item => item.sourceUrl), ordered.map(item => item.sourceUrl))
  assert.deepEqual(newsVisitOrder(stories, 0), stories)
})

test('a news visit starts randomness after hydration and does not change on resubscription', () => {
  let reads = 0
  const store = createNewsVisitStore(() => { reads++; return 42 })
  assert.equal(store.getServerSnapshot(), 0)
  assert.equal(store.getSnapshot(), 0)
  const unsubscribe = store.subscribe(() => {})
  unsubscribe()
  store.subscribe(() => {})()
  assert.equal(reads, 1)
  assert.equal(store.getSnapshot(), 42)
  assert.equal(store.getServerSnapshot(), 0)
  const zero = createNewsVisitStore(() => 0)
  zero.subscribe(() => {})()
  assert.equal(zero.getSnapshot(), 1)
})
