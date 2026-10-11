import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeApplicationPipeline } from './admin-overview'
test('application totals exclude overdue subsets and include requests for information', () => {
  const result = summarizeApplicationPipeline({submitted: 10, reviewing: 7, approved: 4, rejected: 2, waitlisted: 1, request_more_info: 3, stale_submitted: 5, stale_reviewing: 2})
  assert.equal(result.total, 27)
  assert.equal(result.overdue, 7)
  assert.equal(result.entries.some(([state]) => state.startsWith('stale_')), false)
})
test('empty or invalid pipeline counts cannot create misleading negative totals', () => {
  assert.equal(summarizeApplicationPipeline().total, 0)
  assert.equal(summarizeApplicationPipeline({submitted: -2, reviewing: NaN}).total, 0)
})
