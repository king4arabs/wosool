import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePublicResponse } from '../../scripts/lib/public-contract'

const founder = () => ({
  id: 1, founder_uid: '59df6880-6b85-4f9d-a40a-a94c62b0342b', position: null, slug: 'founder', display_name: null, legal_name: 'founder',
  skills_tags: [], skills: [], tagline: null, bio: null, location: null, country_code: null,
  sector: null, stage: null, linkedin_url: null, twitter_url: null, website_url: null,
  needs: [], offers: [], is_verified: false, is_featured: false, is_public: true,
  status: 'active', avatar_url: null, name: null, activation_status: 'unclaimed',
  can_communicate: false, source_urls: [], source_reviewed_at: null, claimed_at: null,
  user: null, primary_company_name: null, created_at: null, updated_at: null,
})
const company = () => ({
  id: 1, source_urls: [], source_reviewed_at: null, name: 'Fixture', slug: 'fixture',
  description: null, logo_url: null, website: null, sector: null, stage: null,
  location: null, country_code: null, founded_year: null, traction: null, team_size: null,
  is_hiring: false, is_fundraising: false, is_collaborating: false, is_featured: false,
  is_public: true, status: 'active', founders: [], created_at: null, updated_at: null,
})
const detail = (data: unknown) => validatePublicResponse('/api/v1/companies/{slug}', 200, { data })

test('company detail accepts nullable fields and the standalone founder relationship shape', () => {
  assert.equal(detail(company()).valid, true)
  const related = { ...founder(), activation_status: 'active', can_communicate: true }
  assert.equal(detail({ ...company(), founders: [related] }).valid, true)
  assert.equal(detail({ ...company(), source_urls: { official: 'https://example.com' } }).valid, true)
})

test('company contract rejects hidden state, relationship drift and anonymous contact leaks', () => {
  for (const changes of [
    { id: '1' }, { is_public: false }, { status: 'inactive' }, { founders_count: 1 },
    { founders: [{ ...founder(), founder_uid: null }] },
    { founders: [{ ...founder(), founder_uid: '123' }] },
    { founders: [{ ...founder(), companies: [] }] },
    { founders: [{ ...founder(), scorecard: null }] },
    { founders: [{ ...founder(), user: { id: 2, name: 'Member', email: 'private@example.test' } }] },
  ]) {
    const body = { ...company(), ...changes }
    const before = structuredClone(body)
    assert.equal(detail(body).valid, false, JSON.stringify(changes))
    assert.deepEqual(body, before)
  }
  const missing: Partial<ReturnType<typeof company>> = company()
  delete missing.founders
  assert.equal(detail(missing).valid, false)
})

test('company founding years accept database representations without arbitrary coercion', () => {
  for (const founded_year of [null, 2016, '2016']) {
    assert.equal(detail({ ...company(), founded_year }).valid, true, JSON.stringify(founded_year))
  }
  for (const founded_year of ['', 'unknown', '2016.5', ' 2016', '201', 2016.5, true, {}]) {
    assert.equal(detail({ ...company(), founded_year }).valid, false, JSON.stringify(founded_year))
  }
})

test('company list requires a public-founder count, pagination and a typed 404', () => {
  const body = { data: [{ ...company(), founders_count: 0 }], links: {
    first: '/companies?page=1', last: '/companies?page=1', prev: null, next: null,
  }, meta: {
    current_page: 1, from: 1, last_page: 1, links: [], path: '/api/v1/companies', per_page: 24, to: 1, total: 1,
  } }
  assert.equal(validatePublicResponse('/api/v1/companies', 200, body).valid, true)
  assert.equal(validatePublicResponse('/api/v1/companies', 200, { ...body, data: [company()] }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/companies', 200, { ...body, meta: { ...body.meta, per_page: 25 } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/companies/{slug}', 404, { message: 'Not found' }).valid, true)
  assert.throws(() => validatePublicResponse('/api/v1/companies', 422, {}), /No JSON response schema/)
})
