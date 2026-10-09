import assert from 'node:assert/strict'
import test from 'node:test'
import { eoaJourneyStage, validateApplicationStep } from './eoa-journey'

test('journey distinguishes verification, corrections, review and actual enrollment', () => {
  assert.equal(eoaJourneyStage('accepted', false), 0)
  assert.equal(eoaJourneyStage(undefined, true), 1)
  assert.equal(eoaJourneyStage('information_requested', true), 1)
  for (const status of ['submitted', 'interview', 'waitlisted', 'rejected']) assert.equal(eoaJourneyStage(status, true), 2)
  assert.equal(eoaJourneyStage('accepted', true), 3)
  assert.equal(eoaJourneyStage('accepted', true, 'onboarding'), 3)
  assert.equal(eoaJourneyStage('accepted', true, 'enrolled'), 4)
})

test('application validation catches missing fields without rejecting legitimate zero revenue', () => {
  assert.equal(Object.keys(validateApplicationStep({}, 0, false)).length, 4)
  const company = { company_name: 'Example', city: 'Riyadh', country: 'Saudi Arabia', sector: 'Technology', stage: 'growing', revenue_amount: 0, revenue_currency: 'SAR', revenue_year: 2025 }
  assert.deepEqual(validateApplicationStep(company, 1, false, 2026), {})
  assert.ok(validateApplicationStep({ ...company, revenue_year: 2027 }, 1, false, 2026).revenue_year)
  assert.ok(validateApplicationStep({ ...company, revenue_amount: 'NaN' }, 1, true, 2026).revenue_amount)
  assert.ok(validateApplicationStep({ ...company, company_website: 'http://example.com' }, 1, false, 2026).company_website)
  assert.deepEqual(validateApplicationStep({ ...company, company_website: 'https://example.com' }, 1, false, 2026), {})
})

test('growth detail and each consent must be provided before final submission', () => {
  assert.ok(validateApplicationStep({ growth_objectives: 'short', support_needs: 'Mentoring' }, 2, false).growth_objectives)
  assert.equal(Object.keys(validateApplicationStep({ privacy_consent: true, accuracy_confirmed: false }, 3, false)).length, 2)
  assert.deepEqual(validateApplicationStep({ privacy_consent: true, accuracy_confirmed: true, attendance_commitment: true }, 3, true), {})
})
