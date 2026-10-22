import assert from 'node:assert/strict'
import test from 'node:test'
import { formatEoaDate, programAvailability, reviewTransitions, type EoaProgram } from './eoa'

test('intake availability distinguishes loading, outages and confirmed closure', () => {
  const program = { applications_open: true } as EoaProgram
  assert.equal(programAvailability(null, false), 'loading')
  assert.equal(programAvailability(null, true), 'unavailable')
  assert.equal(programAvailability(program, true), 'unavailable')
  assert.equal(programAvailability(program, false), 'open')
  assert.equal(programAvailability({ ...program, applications_open: false }, false), 'closed')
})

test('review actions match lifecycle and leadership decision boundaries', () => {
  assert.deepEqual(reviewTransitions('under_review', false), ['information_requested', 'interview'])
  assert.deepEqual(reviewTransitions('information_requested', true), ['under_review', 'interview', 'rejected'])
  assert.ok(reviewTransitions('submitted', true).includes('accepted'))
  assert.ok(!reviewTransitions('interview', false).includes('interview'))
  for (const status of ['accepted', 'rejected', 'draft', 'unknown']) {
    assert.deepEqual(reviewTransitions(status, true), [])
  }
})

test('EOA dates use Gregorian Riyadh dates and tolerate missing or invalid values', () => {
  assert.equal(formatEoaDate('2026-10-09', false), '9 October 2026')
  assert.equal(formatEoaDate('2026-10-08T22:30:00Z', false), '9 October 2026')
  for (const value of [null, undefined, '', 'invalid']) {
    assert.equal(formatEoaDate(value, false), '—')
  }
  assert.ok(formatEoaDate('2026-10-09', true).includes('٢٠٢٦'))
})
