import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { buildContentReport, loadContentReport, catalogs } from './lib/content-review.mjs'

const now = Date.parse('2026-10-17T05:00:00Z')
const source = 'https://example.com/source'
const founder = (slug, overrides = {}) => ({
  slug, company_key: 'shared-company', founder_name_en: 'Example', founder_name_ar: 'مثال',
  founder_brief_en: 'Example biography', founder_brief_ar: 'نبذة تجريبية',
  company_name_en: 'Example company', company_name_ar: 'شركة تجريبية',
  company_brief_en: 'Example company brief', company_brief_ar: 'نبذة الشركة',
  role_en: 'Co-founder', role_ar: 'شريك مؤسس', sector_en: 'Software', sector_ar: 'برمجيات',
  country_en: 'Saudi Arabia', country_ar: 'السعودية', country_code: 'SA', region: 'saudi',
  website: 'https://example.com/', source_url: source, source_urls: [source], reviewed_at: '2026-10-16',
  ...overrides,
})
const batch = (rows, index = 0, snapshot = structuredClone(rows)) => ({ ...catalogs[index], rows, snapshot })
const report = (...batches) => buildContentReport(batches, { now })

test('review includes both founder catalogs, deduplicates company totals and identifies origins', () => {
  const result = report(batch([founder('base')]), batch([founder('expansion')], 1))
  assert.deepEqual(result.totals, { founders: 2, companies: 1, news: 0 })
  assert.deepEqual(result.problems, [])
  assert.equal(result.upcoming_reviews.length, 2)
  assert.equal(result.upcoming_reviews[1].catalog, catalogs[1].backend)
  assert.equal(result.catalogs[1].records, 1)
})

test('expansion snapshot drift names the exact pair', () => {
  const result = report(batch([founder('expansion')], 1, [founder('expansion', { role_ar: 'مختلف' })]))
  assert.equal(result.problems.length, 1)
  assert.ok(result.problems[0].includes(catalogs[1].backend))
  assert.ok(result.problems[0].includes(catalogs[1].frontend))
})

test('duplicate slugs across separately valid catalogs fail', () => {
  const result = report(batch([founder('same')]), batch([founder('same')], 1))
  assert.deepEqual(result.problems, ['founders: duplicate slug across catalogs: same'])
})

test('expansion reviews enter the queue at the exact 30-day UTC boundary without modifying input', () => {
  const input = batch([founder('expansion')], 1)
  const before = structuredClone(input)
  const early = buildContentReport([input], { now: Date.parse('2026-11-14T23:59:59Z') })
  const due = buildContentReport([input], { now: Date.parse('2026-11-15T00:00:00Z') })
  assert.equal(early.reviews_due.length, 0)
  assert.equal(due.reviews_due[0].slug, 'expansion')
  assert.equal(due.reviews_due[0].review_due_at, '2026-11-15')
  assert.deepEqual(due.problems, []) // Staleness is an actionable queue, not a failed integrity check.
  assert.deepEqual(input, before)
})

test('invalid, impossible and future review dates fail and remain actionable', () => {
  for (const reviewed_at of [null, '', '2026-02-30', '2026-10-18', '2026-10-16 trailing', '2026-10-16T00:00:00Z']) {
    const result = report(batch([founder('expansion', { reviewed_at })], 1))
    assert.ok(result.problems.some(problem => problem.includes('invalid review date')), String(reviewed_at))
    assert.equal(result.reviews_due[0].review_due_at, null)
  }
})

test('expansion requires linked primary evidence, HTTPS and complete bilingual identity fields', () => {
  for (const overrides of [
    { source_urls: null }, { source_urls: {} }, { source_urls: [] },
    { source_url: 'https://example.com/unlisted' }, { website: 'http://example.com' },
    { source_urls: ['https://user:password@example.com/source'] },
    { role_ar: ' ' }, { company_brief_ar: null }, { company_key: '' }, { region: 'unknown' },
  ]) assert.ok(report(batch([founder('expansion', overrides)], 1)).problems.length, JSON.stringify(overrides))
})

test('partial or unsupported traction fails without dereferencing malformed sources', () => {
  for (const overrides of [
    { traction_en: 'Claim' }, { traction_ar: 'ادعاء' }, { traction_source_url: source },
    { traction_en: 'Claim', traction_ar: 'ادعاء', traction_source_url: source, source_urls: null },
  ]) assert.ok(report(batch([founder('expansion', overrides)], 1)).problems.some(problem => problem.includes('unsupported traction')))
})

test('malformed catalogs and rows produce diagnostics instead of passing or crashing', () => {
  assert.ok(report(batch({ invalid: true }, 1)).problems.some(problem => problem.includes('catalogs must be arrays')))
  const result = report(batch([null, [], 42, {}], 1))
  assert.equal(result.problems.filter(problem => problem.includes('invalid record')).length, 3)
  assert.ok(result.problems.some(problem => problem.includes('unsafe slug')))
  assert.equal(result.reviews_due.length, 1)
})

test('news parity, duplicate URL and publication guards are preserved', () => {
  const story = { slug: 'story', title: 'Example', content: 'Brief', sourceName: 'Publisher', sourceUrl: source, publishedAt: '2026-10-16T09:00:00Z', translations: { ar: { body: ['نبذة'] } } }
  assert.deepEqual(report(batch([story], 2)).problems, [])
  assert.ok(report(batch([story, { ...story, slug: 'second' }], 2)).problems.includes('news: duplicate source URL'))
  assert.ok(report(batch([story], 2, [])).problems.some(problem => problem.includes('snapshots differ')))
  for (const publishedAt of ['2026-02-30', '2026-10-18T09:00:00Z']) {
    assert.ok(report(batch([{ ...story, publishedAt }], 2)).problems.some(problem => problem.includes('publication date')))
  }
})

test('checked-in report covers the exact frontend and importer catalog paths', async () => {
  const result = await loadContentReport()
  assert.deepEqual(result.problems, [])
  assert.deepEqual(result.totals, { founders: 311, companies: 170, news: 92 })
  assert.equal(result.upcoming_reviews.length + result.reviews_due.length, 311)
  assert.equal([...result.upcoming_reviews, ...result.reviews_due].filter(row => row.catalog === catalogs[1].backend).length, 100)
  assert.equal([...result.upcoming_reviews, ...result.reviews_due].filter(row => row.catalog === catalogs[4].backend).length, 105)
  for (const [path, field, prefix] of [
    ['../frontend/src/lib/founder-spotlight.ts', 'frontend', 'founder-spotlight'],
    ['../backend/app/Services/FounderDirectoryImporter.php', 'backend', 'founder-directory'],
  ]) {
    const code = await readFile(new URL(path, import.meta.url), 'utf8')
    const references = [...code.matchAll(new RegExp(`${prefix}(?:-[a-z0-9-]+)?\\.json`, 'g'))].map(match => match[0]).sort()
    assert.deepEqual(catalogs.filter(catalog => catalog.kind === 'founders').map(catalog => catalog[field].split('/').at(-1)).sort(), references)
  }
})

test('loader rejects unregistered and missing catalog files without auto-publishing them', async t => {
  const root = await mkdtemp(join(tmpdir(), 'wosool-content-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const catalog of catalogs) {
    for (const path of [catalog.backend, catalog.frontend]) {
      await mkdir(dirname(join(root, path)), { recursive: true })
      await writeFile(join(root, path), '[]')
    }
  }
  for (const path of ['backend/resources/data/founder-directory-next.json', 'frontend/src/data/founder-spotlight-next.json']) {
    await writeFile(join(root, path), JSON.stringify([founder('unreviewed')]))
  }
  const result = await loadContentReport({ root, now })
  assert.equal(result.problems.filter(problem => problem.includes('unregistered founder catalog')).length, 2)
  assert.equal(result.totals.founders, 0)
  await mkdir(join(root, 'scripts/lib'), { recursive: true })
  for (const path of ['content-review.mjs', 'lib/content-review.mjs']) {
    await writeFile(join(root, 'scripts', path), await readFile(new URL(path, import.meta.url)))
  }
  for (const args of [[], ['--check']]) {
    const cli = spawnSync(process.execPath, [join(root, 'scripts/content-review.mjs'), ...args], { encoding: 'utf8' })
    assert.equal(cli.status, 1)
    assert.match(cli.stdout + cli.stderr, /unregistered founder catalog/)
  }
  await writeFile(join(root, catalogs[1].backend), '{broken')
  await assert.rejects(loadContentReport({ root, now }), /Cannot read backend\/resources\/data\/founder-directory-expansion/)
  const broken = spawnSync(process.execPath, [join(root, 'scripts/content-review.mjs'), '--check'], { encoding: 'utf8' })
  assert.equal(broken.status, 1)
  assert.match(broken.stderr, /Content review failed: Cannot read/)
  await rm(join(root, catalogs[1].backend))
  await assert.rejects(loadContentReport({ root, now }), /Cannot read backend\/resources\/data\/founder-directory-expansion/)
})

test('both CLI modes report full coverage from a different working directory', () => {
  const script = new URL('./content-review.mjs', import.meta.url)
  const check = spawnSync(process.execPath, [script.pathname, '--check'], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(check.status, 0, check.stderr)
  assert.match(check.stdout, /311 founders, 170 companies, 92 stories/)
  const review = spawnSync(process.execPath, [script.pathname], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(review.status, 0, review.stderr)
  assert.equal(JSON.parse(review.stdout).totals.founders, 311)
})
