import assert from 'node:assert/strict'
import test from 'node:test'
import { readRelationshipFilters, relationshipQuery, relationshipFollowUp } from './admin-relationships'

test('relationship filters survive a URL round trip including Arabic and deep links', () => {
  const filters = readRelationshipFilters(new URLSearchParams('q=شركة نمو&view=unassigned&stage=in_progress&priority=high&sort=updated&page=3&record=42'), 'crm')
  assert.deepEqual(readRelationshipFilters(new URLSearchParams(relationshipQuery(filters)), 'crm'), filters)
  assert.equal(filters.search, 'شركة نمو')
  assert.equal(filters.record, 42)
  assert.equal(readRelationshipFilters(new URLSearchParams('due=1'), 'pr').view, 'due')
})

test('invalid URL filters cannot inject unsupported API options or cross-workspace stages', () => {
  const filters = readRelationshipFilters(new URLSearchParams('view=bogus&sort=sql&page=-2&owner=NaN&record=Infinity&priority=urgent&stage=published'), 'crm')
  assert.deepEqual(filters, { search: '', stage: '', owner: '', priority: '', view: 'all', sort: 'follow_up', page: 1, record: null })
  assert.equal(relationshipQuery(filters), '')
  assert.equal(readRelationshipFilters(new URLSearchParams('q=' + 'x'.repeat(200)), 'pr').search.length, 120)
})

test('follow-up urgency uses Riyadh dates and never flags closed records as overdue', () => {
  const now = new Date('2026-11-04T21:30:00Z') // November 5 in Riyadh
  assert.equal(relationshipFollowUp({ stage: 'new', follow_up_on: '2026-11-04' }, now), 'overdue')
  assert.equal(relationshipFollowUp({ stage: 'new', follow_up_on: '2026-11-05' }, now), 'today')
  assert.equal(relationshipFollowUp({ stage: 'pitched', follow_up_on: '2026-11-06' }, now), 'scheduled')
  assert.equal(relationshipFollowUp({ stage: 'new', follow_up_on: null }, now), 'unscheduled')
  for (const stage of ['won', 'closed', 'published']) assert.equal(relationshipFollowUp({ stage, follow_up_on: '2026-01-01' }, now), 'complete')
})
