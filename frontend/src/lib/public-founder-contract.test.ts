import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePublicResponse } from '../../scripts/lib/public-contract'

const founder = () => ({
  id: 1, position: null, slug: 'fixture', display_name: null, legal_name: 'fixture',
  skills_tags: [], skills: [], tagline: null, bio: null, location: null, country_code: null,
  sector: null, stage: null, linkedin_url: null, twitter_url: null, website_url: null,
  needs: [], offers: [], is_verified: false, is_featured: false, is_public: true,
  status: 'active', avatar_url: null, name: null, activation_status: 'unclaimed',
  can_communicate: false, source_urls: [], source_reviewed_at: null, claimed_at: null,
  user: null, primary_company_name: null, companies: [], scorecard: null,
  created_at: '2026-10-19T00:00:00Z', updated_at: '2026-10-19T00:00:00Z',
})
const detail = (data: unknown) => validatePublicResponse('/api/v1/founders/{slug}', 200, { data })

test('anonymous founder contract accepts unclaimed, nullable and associative profile fields', () => {
  const result = detail(founder())
  assert.equal(result.valid, true, JSON.stringify(result.errors))
  assert.equal(detail({ ...founder(), skills: { primary: 'Engineering' }, needs: { first: 'Mentoring' }, user: { id: 2, name: 'Member', email: null }, activation_status: 'active', can_communicate: true }).valid, true)
})

test('anonymous founder contract rejects drift, hidden status and contact fields without mutation', () => {
  for (const changes of [
    { id: '1' }, { is_public: false }, { status: 'suspended' }, { activation_status: 'suspended' },
    { user: { id: 2, name: 'Member', email: 'private@example.test' } },
    { invitation: { email: 'private@example.test' } }, { user_id: 2 },
    { source_reviewed_at: '2026-02-30' }, { claimed_at: 'yesterday' }, { skills: [12] },
  ]) {
    const body = { ...founder(), ...changes }
    const before = structuredClone(body)
    assert.equal(detail(body).valid, false, JSON.stringify(changes))
    assert.deepEqual(body, before)
  }
  const missing: Partial<ReturnType<typeof founder>> = founder()
  delete missing.companies
  assert.equal(detail(missing).valid, false)
})

test('founder scorecard contract types computed fields while retaining legacy JSON logs', () => {
  const scorecard = {
    id: 1, founder_profile_id: 1, aggregate_score: 60, momentum_score: 60,
    fundraising_score: 70, growth_score: 65, support_need_score: 20, latest_update_text: null,
    tracking: { momentum: 60, growth: 65, readiness: 70, support_delta: 20 },
    trends: { score_direction: 'up', momentum_direction: 'flat', growth_direction: 'up', readiness_direction: 'down', support_delta_direction: 'up' },
    insights: { dynamic_alerts: [], automated_action_suggestions: [{ key: 'maintain_consistency', label: 'Maintain cadence', priority: 'normal' }] },
    historical_logs: [], created_at: null, updated_at: null,
  }
  for (const historical_logs of [[], [{ aggregate_score: 50, notes: 'Fixture note' }], { previous: { aggregate_score: 50 } }]) {
    assert.equal(detail({ ...founder(), scorecard: { ...scorecard, historical_logs } }).valid, true)
  }
  assert.equal(detail({ ...founder(), scorecard: { ...scorecard, aggregate_score: '60' } }).valid, false)
  assert.equal(detail({ ...founder(), scorecard: { ...scorecard, invitation_token: 'unexpected' } }).valid, false)
  assert.equal(detail({ ...founder(), scorecard: { ...scorecard, trends: { ...scorecard.trends, score_direction: 'unknown' } } }).valid, false)
})

test('founder pagination supports 100 records and 404s without promising malformed-query 422s', () => {
  const body = { data: [], links: { first: '/founders?page=1', last: '/founders?page=1', prev: null, next: null }, meta: {
    current_page: 8, from: null, last_page: 1, links: [], path: '/api/v1/founders', per_page: 100, to: null, total: 0,
  } }
  assert.equal(validatePublicResponse('/api/v1/founders', 200, body).valid, true)
  assert.equal(validatePublicResponse('/api/v1/founders', 200, { ...body, meta: { ...body.meta, per_page: 101 } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/founders/{slug}', 404, { message: 'Not found' }).valid, true)
  assert.throws(() => validatePublicResponse('/api/v1/founders', 422, {}), /No JSON response schema/)
})
