import assert from 'node:assert/strict'
import test from 'node:test'
import { getFounderSpotlights } from './founder-spotlight'

test('public spotlights stay separate from member profiles and provide supported links', () => {
  for (const locale of ['ar', 'en'] as const) {
    const profiles = getFounderSpotlights(locale)
    assert.equal(profiles.length, 8)
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
