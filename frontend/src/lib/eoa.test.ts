import assert from 'node:assert/strict'
import test from 'node:test'
import { eligibility } from './eoa'
test('EO eligibility uses USD, explicit SAR conversion and a separate membership boundary', () => {
  assert.equal(eligibility(250000, 'USD', true), 'potential')
  assert.equal(eligibility(999999, 'USD', true), 'potential')
  assert.equal(eligibility(1000000, 'USD', true), 'membership')
  assert.equal(eligibility(250000, 'SAR', true), 'review')
  assert.equal(eligibility(937500, 'SAR', true), 'potential')
  assert.equal(eligibility(3750000, 'SAR', true), 'membership')
  assert.equal(eligibility(300000, 'USD', false), 'review')
  assert.equal(eligibility(Number.NaN, 'USD', true), 'invalid')
})
