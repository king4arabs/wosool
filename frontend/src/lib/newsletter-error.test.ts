import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from './api'
import { newsletterError } from './newsletter-error'

test('deployment and network errors never expose internal routes or report subscription success', () => {
  for (const locale of ['ar', 'en'] as const) {
    for (const error of [new Error('Failed to fetch'), ...[404, 405, 419, 500, 502, 503].map(status => new ApiError(status, 'The route v1/newsletter/subscribe could not be found.'))]) {
      const message = newsletterError(error, locale)
      assert.doesNotMatch(message, /v1\/|route|success|confirmed/i)
      assert.match(message, /info@wosool.org/)
      assert.match(message, locale === 'ar' ? /غير متاحة مؤقتًا/ : /temporarily unavailable/)
    }
  }
})

test('validation and throttling retain useful retry guidance', () => {
  assert.equal(newsletterError(new ApiError(422, 'Enter a valid email address.'), 'en'), 'Enter a valid email address.')
  assert.match(newsletterError(new ApiError(429, 'Internal throttle identifier'), 'en'), /Too many attempts/)
  assert.match(newsletterError(new ApiError(429, 'Internal throttle identifier'), 'ar'), /حاول مجددًا/)
})
