import assert from 'node:assert/strict'
import test from 'node:test'
import { communityEngagement, defaultCommunityEngagement } from './founder-engagement'

test('every founder has a stable whole-number starting value between 65 and 92 inclusive', () => {
  const values = new Set<number>()
  for (let id = 0; id < 500; id++) {
    const slug = `founder-${id}`
    const value = communityEngagement({ slug, activationStatus: 'unclaimed' })
    assert.ok(Number.isInteger(value) && value >= 65 && value <= 92)
    assert.equal(communityEngagement({ slug, activationStatus: 'unclaimed', communityEngagementScore: 100 }), value)
    assert.equal(defaultCommunityEngagement(slug), value)
    values.add(value)
  }
  assert.equal(values.size, 28)
})

test('activation replaces the default with the current valid participation measurement', () => {
  const slug = 'founder-1'
  for (const score of [50, 65, 92, 100]) {
    assert.equal(communityEngagement({ slug, activationStatus: 'active', communityEngagementScore: score }), score)
  }
  for (const score of [null, undefined, NaN, Infinity, 49, 101, 62.5]) {
    assert.equal(communityEngagement({ slug, activationStatus: 'active', communityEngagementScore: score }), defaultCommunityEngagement(slug))
  }
})
