import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePublicResponse } from '../../scripts/lib/public-contract'
import { publicApiSpec } from './public-api-spec'
import { GET } from '../app/api/openapi.json/route'

const story = () => ({
  id: 1, title: 'Original brief', slug: 'original-brief', excerpt: null, content: null,
  category: 'ecosystem', image_url: null, source_url: null, source_name: null, image_credit: null,
  companies: [], region: null, key_facts: [], translations: {}, author_name: null,
  is_featured: false, is_public: true, status: 'published', tags: [], published_at: null,
  created_at: '2026-10-17T10:00:00+00:00', updated_at: '2026-10-17T10:00:00+00:00',
})
const detail = (data: unknown) => validatePublicResponse('/api/v1/news/{slug}', 200, { data })

test('news contract accepts nullable editorial fields and actual translation variants', () => {
  for (const translations of [{}, [], { ar: { title: 'خبر', body: ['نبذة'], keyFacts: ['حقيقة'] } }]) {
    const result = detail({ ...story(), translations })
    assert.equal(result.valid, true, JSON.stringify(result.errors))
  }
  assert.equal(detail({ ...story(), tags: { topic: 'funding' }, key_facts: { first: 'Fact' } }).valid, true)
})

test('news contract rejects field drift, unpublished records and private fields without coercion', () => {
  for (const changes of [
    { id: '1' }, { is_public: false }, { status: 'draft' }, { region: 'Saudi Arabia' },
    { companies: [1] }, { author_id: 42 }, { published_at: 'not-a-date' }, { published_at: '2026-02-30T00:00:00Z' },
    { translations: ['unexpected'] },
  ]) {
    const record = { ...story(), ...changes }
    const before = structuredClone(record)
    assert.equal(detail(record).valid, false, JSON.stringify(changes))
    assert.deepEqual(record, before)
  }
  const missing: Partial<ReturnType<typeof story>> = story()
  delete missing.slug
  assert.equal(detail(missing).valid, false)
})

test('collection schema requires pagination but supports empty and out-of-range pages', () => {
  const body = { data: [], links: { first: '/news?page=1', last: '/news?page=1', prev: null, next: null }, meta: {
    current_page: 9, from: null, last_page: 1, links: [{ url: null, label: 'Previous', active: false }],
    path: '/api/v1/news', per_page: 10, to: null, total: 0,
  } }
  assert.equal(validatePublicResponse('/api/v1/news', 200, body).valid, true)
  assert.equal(validatePublicResponse('/api/v1/news', 200, { ...body, meta: { ...body.meta, total: '0' } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/news', 200, { data: [] }).valid, false)
})

test('error schemas match validation and unavailable records; unspecified bodies fail closed', () => {
  assert.equal(validatePublicResponse('/api/v1/news', 422, { message: 'Invalid query', errors: { region: ['Invalid region'] } }).valid, true)
  assert.equal(validatePublicResponse('/api/v1/news', 422, { message: 'Invalid query', errors: { region: 'Invalid region' } }).valid, false)
  assert.equal(validatePublicResponse('/api/v1/news/{slug}', 404, { message: 'Not found' }).valid, true)
  assert.throws(() => validatePublicResponse('/api/v1/news', 429, {}), /No JSON response schema/)
  assert.throws(() => validatePublicResponse('/not-documented', 200, {}), /No JSON response schema/)
})

test('OpenAPI download exports the same contract and preserves operation identifiers', async () => {
  const response = GET()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.deepEqual(await response.json(), publicApiSpec)
  assert.equal(publicApiSpec.info.version, '1.6.0')
  assert.equal(Object.keys(publicApiSpec.paths).length, 9)
  assert.equal(publicApiSpec.paths['/api/v1/news'].get.operationId, 'listNews')
  assert.equal(publicApiSpec.paths['/api/v1/news/{slug}'].get.operationId, 'getNews')
  assert.equal(Object.keys(publicApiSpec.components.schemas.NewsItem.properties).length, 22)
  assert.equal(Object.keys(publicApiSpec.components.schemas.PublicFounder.properties).length, 36)
  assert.equal(publicApiSpec.paths['/api/v1/founders'].get.operationId, 'listFounders')
  assert.equal(publicApiSpec.paths['/api/v1/founders/{slug}'].get.operationId, 'getFounder')
  assert.equal(Object.keys(publicApiSpec.components.schemas.PublicCompany.properties).length, 24)
  assert.equal(Object.keys(publicApiSpec.components.schemas.PublicCompanyListItem.properties).length, 25)
  assert.equal(Object.keys(publicApiSpec.components.schemas.PublicCompanyFounder.properties).length, 34)
  assert.equal(publicApiSpec.paths['/api/v1/companies'].get.operationId, 'listCompanies')
  assert.equal(publicApiSpec.paths['/api/v1/companies/{slug}'].get.operationId, 'getCompany')
  assert.equal(Object.keys(publicApiSpec.components.schemas.PublicStartup.properties).length, 40)
  assert.equal(publicApiSpec.paths['/api/v1/startup-directory'].get.operationId, 'listStartups')
})
