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
  assert.equal(detail({ ...founder(), source_urls: { official: 'https://example.com' }, activation_status: 'active', can_communicate: true }).valid, true)
})

test('anonymous founder contract rejects drift, hidden status and contact fields without mutation', () => {
  for (const changes of [
    { id: '1' }, { is_public: false }, { status: 'suspended' }, { activation_status: 'suspended' },
    { user: { id: 2, name: 'Member', email: 'private@example.test' } },
    { user: { id: 2, name: 'Member', email: null } },
    { needs: ['Private investment request'] }, { linkedin_url: 'https://linkedin.com/in/fixture' },
    { claimed_at: '2026-10-19T00:00:00Z' },
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

test('anonymous founder contract excludes member scorecards and historical notes', () => {
  assert.equal(detail({ ...founder(), scorecard: { historical_logs: [{ notes: 'private' }] } }).valid, false)
  assert.equal(detail({ ...founder(), scorecard: null }).valid, true)
})

test('founder pagination caps each response at 24 records and 404s without promising malformed-query 422s', () => {
  const body = { data: [], links: { first: '/founders?page=1', last: '/founders?page=1', prev: null, next: null }, meta: {
    current_page: 8, from: null, last_page: 1, links: [], path: '/api/v1/founders', per_page: 24, to: null, total: 0,
  } }
  assert.equal(validatePublicResponse('/api/v1/founders', 200, body).valid, true)
  assert.equal(validatePublicResponse('/api/v1/founders', 200, { ...body, meta: { ...body.meta, per_page: 25 } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/founders/{slug}', 404, { message: 'Not found' }).valid, true)
  assert.throws(() => validatePublicResponse('/api/v1/founders', 422, {}), /No JSON response schema/)
})

test('nested company years accept observed database representations without coercing arbitrary strings', () => {
  const company = {
    id: 1, source_urls: [], source_reviewed_at: null, name: 'Fixture', slug: 'fixture',
    description: null, logo_url: null, website: null, sector: null, stage: null,
    location: null, country_code: null, founded_year: null, traction: null, team_size: null,
    is_hiring: false, is_fundraising: false, is_collaborating: false, is_featured: false,
    is_public: true, status: 'active', pivot: { role: null, is_primary: true },
    created_at: null, updated_at: null,
  }
  for (const founded_year of [null, 2016, '2016']) {
    const body = { ...founder(), companies: [{ ...company, founded_year }] }
    const before = structuredClone(body)
    assert.equal(detail(body).valid, true, JSON.stringify(founded_year))
    assert.deepEqual(body, before)
  }
  for (const founded_year of ['', 'unknown', '2016.5', ' 2016', '201', 2016.5, true, {}]) {
    assert.equal(detail({ ...founder(), companies: [{ ...company, founded_year }] }).valid, false, JSON.stringify(founded_year))
  }
})
