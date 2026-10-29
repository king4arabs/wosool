import assert from 'node:assert/strict'
import test from 'node:test'
import roster from '../data/partner-ecosystem.json'
import { createPartnerVisitStore, filterPartnerOrganizations, partnerDiscoveryOrder } from './partner-discovery'

test('fresh partner visits vary the order without losing, duplicating or mutating organizations', () => {
  const original = structuredClone(roster)
  const one = partnerDiscoveryOrder(roster, 101)
  const two = partnerDiscoveryOrder(roster, 202)
  assert.deepEqual(roster, original)
  assert.deepEqual(one.map(item => item.id).sort(), roster.map(item => item.id).sort())
  assert.notDeepEqual(one.slice(0, 12), two.slice(0, 12))
  assert.deepEqual(one, partnerDiscoveryOrder(roster, 101))
  assert.deepEqual(partnerDiscoveryOrder([], 101), [])
  assert.deepEqual(partnerDiscoveryOrder(roster.slice(0, 1), 101), roster.slice(0, 1))
})

test('filters and later pages preserve the relative order within a visit', () => {
  const ordered = partnerDiscoveryOrder(roster, 333)
  const banks = roster.filter(item => item.category === 'bank')
  assert.deepEqual(partnerDiscoveryOrder(banks, 333), ordered.filter(item => item.category === 'bank'))
  assert.deepEqual(partnerDiscoveryOrder(roster, 0), roster)
})

test('visit seeds initialize only after hydration, survive resubscription and are not shared between visits', () => {
  let calls = 0
  const next = () => ++calls
  const visit = createPartnerVisitStore(next)
  assert.equal(visit.getSnapshot(), 0)
  const unsubscribe = visit.subscribe(() => {})
  unsubscribe()
  visit.subscribe(() => {})
  assert.equal(visit.getSnapshot(), 1)
  assert.equal(visit.getServerSnapshot(), 0)
  assert.equal(calls, 1)
  const revisit = createPartnerVisitStore(next)
  revisit.subscribe(() => {})
  assert.equal(revisit.getSnapshot(), 2)
  const zero = createPartnerVisitStore(() => 0)
  zero.subscribe(() => {})
  assert.equal(zero.getSnapshot(), 1)
})

test('organization search supports both names, Arabic variants, websites and combined category filters', () => {
  assert.ok(filterPartnerOrganizations(roster, 'all', '  neom ').some(item => item.id === 'neom'))
  assert.ok(filterPartnerOrganizations(roster, 'all', 'الانماء').some(item => item.name_ar === 'مصرف الإنماء'))
  assert.ok(filterPartnerOrganizations(roster, 'all', 'monshaat.gov.sa').some(item => item.id === 'monshaat'))
  assert.deepEqual(filterPartnerOrganizations(roster, 'bank', 'neom'), [])
  assert.deepEqual(filterPartnerOrganizations(roster, 'all', 'no-matching-organization'), [])
})
