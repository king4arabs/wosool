import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { eoNetworkProfiles, filterEoNetwork } from './eo-global-network'

test('network profiles have unique identities, local portraits and traceable professional sources', () => {
  assert.equal(new Set(eoNetworkProfiles.map(p => p.id)).size, eoNetworkProfiles.length)
  for (const p of eoNetworkProfiles) {
    assert.ok(p.name && p.company && p.chapter && p.position && p.position_ar && p.bio && p.bio_ar)
    assert.match(p.linkedin, /^https:\/\/www\.linkedin\.com\/in\/[^/]+\/$/)
    assert.ok(['eonetwork.org', 'event.eonetwork.org'].includes(new URL(p.source).hostname))
    assert.match(p.image, /^\/eoa\/mentors\/global\/[a-z0-9-]+\.webp$/)
    assert.ok(existsSync(`public${p.image}`), `Missing portrait: ${p.name}`)
    assert.ok(!('appointment_status' in p), 'Public network profiles must not become program appointments')
  }
})

test('network discovery combines company, chapter, bilingual expertise and network filters', () => {
  assert.deepEqual(filterEoNetwork('  Cathcap ', 'all', 'Finance').map(p => p.name), ['Brooke Lively'])
  assert.equal(filterEoNetwork('Cathcap', 'leaders', 'all').length, 0)
  assert.deepEqual(filterEoNetwork('Chennai', 'all', 'all').map(p => p.name), ['Prabhakar Kadavasal'])
  assert.ok(filterEoNetwork('القيادة', 'speakers', 'all').length > 0)
  assert.equal(filterEoNetwork('not-a-real-profile', 'all', 'all').length, 0)
})
