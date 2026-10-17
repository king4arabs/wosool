import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url))
// Explicit publication scope: unregistered files fail review instead of silently
// entering the public catalog or being omitted from freshness checks.
export const catalogs = [
  { kind: 'founders', backend: 'backend/resources/data/founder-directory.json', frontend: 'frontend/src/data/founder-spotlight.json' },
  { kind: 'founders', backend: 'backend/resources/data/founder-directory-expansion-2026-10-16.json', frontend: 'frontend/src/data/founder-spotlight-expansion-2026-10-16.json' },
  { kind: 'news', backend: 'backend/resources/data/sourced-news.json', frontend: 'frontend/src/data/startup-news.json' },
]
const hasText = value => typeof value === 'string' && value.trim().length > 0
const validUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}
const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const validPublication = value => typeof value === 'string' && validDay(value.slice(0, 10)) && Number.isFinite(Date.parse(value))
const founderFields = ['company_key', 'founder_name_en', 'founder_name_ar', 'founder_brief_en', 'founder_brief_ar',
  'company_name_en', 'company_name_ar', 'company_brief_en', 'company_brief_ar', 'role_en', 'role_ar',
  'sector_en', 'sector_ar', 'country_en', 'country_ar', 'country_code']

export function buildContentReport(batches, { now = Date.now(), problems = [] } = {}) {
  problems = [...problems]
  const founders = []
  const news = []
  const coverage = []
  for (const { kind, backend, frontend, rows, snapshot } of batches) {
    coverage.push({ kind, backend, frontend, records: Array.isArray(rows) ? rows.length : 0 })
    if (!Array.isArray(rows) || !Array.isArray(snapshot)) {
      problems.push(`${backend}: catalogs must be arrays`)
      continue
    }
    if (!isDeepStrictEqual(rows, snapshot)) problems.push(`${backend}: frontend and backend snapshots differ (${frontend})`)
    for (const [index, row] of rows.entries()) {
      const label = `${backend}[${index}]`
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        problems.push(`${label}: invalid record`)
        continue
      }
      const location = `${label} (${row.slug ?? 'missing slug'})`
      if (typeof row.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)) problems.push(`${location}: unsafe slug`)
      if (kind === 'founders') {
        founders.push({ row, catalog: backend })
        const sources = row.source_urls
        if (!validUrl(row.website) || !validUrl(row.source_url) || !Array.isArray(sources)
          || !sources.length || !sources.every(validUrl) || !sources.includes(row.source_url)) {
          problems.push(`${location}: missing/invalid website or evidence`)
        }
        if (!validDay(row.reviewed_at) || Date.parse(row.reviewed_at) > now) problems.push(`${location}: invalid review date`)
        for (const field of founderFields) {
          if (!hasText(row[field])) problems.push(`${location}: missing/invalid ${field}`)
        }
        if (!['saudi', 'gcc', 'mena', 'global'].includes(row.region)) problems.push(`${location}: invalid region`)
        if ([row.traction_en, row.traction_ar, row.traction_source_url].some(Boolean)
          && (!hasText(row.traction_en) || !hasText(row.traction_ar) || !validUrl(row.traction_source_url)
            || !Array.isArray(sources) || !sources.includes(row.traction_source_url))) problems.push(`${location}: unsupported traction`)
      } else {
        news.push(row)
        if (!validUrl(row.sourceUrl) || !hasText(row.sourceName) || !validPublication(row.publishedAt)
          || Date.parse(row.publishedAt) > now) problems.push(`${location}: invalid source or publication date`)
        if (!hasText(row.title) || !hasText(row.content) || !row.translations?.ar?.body?.length) problems.push(`${location}: incomplete bilingual story`)
      }
    }
  }
  for (const [kind, rows] of [['founders', founders.map(item => item.row)], ['news', news]]) {
    const seen = new Set()
    for (const row of rows) {
      if (seen.has(row.slug)) problems.push(`${kind}: duplicate slug across catalogs: ${row.slug}`)
      seen.add(row.slug)
    }
  }
  if (new Set(news.map(row => row.sourceUrl)).size !== news.length) problems.push('news: duplicate source URL')
  const review = founders.map(({ row, catalog }) => ({
    slug: row.slug, name: row.founder_name_en, company: row.company_name_en, catalog,
    reviewed_at: row.reviewed_at,
    review_due_at: validDay(row.reviewed_at) && Date.parse(row.reviewed_at) <= now
      ? new Date(Date.parse(row.reviewed_at) + 30 * 86400000).toISOString().slice(0, 10) : null,
    sources: row.source_urls,
  }))
  const isDue = row => !row.review_due_at || Date.parse(row.review_due_at) <= now
  const byDate = (a, b) => (a.review_due_at ?? '').localeCompare(b.review_due_at ?? '') || String(a.slug).localeCompare(String(b.slug))
  return {
    generated_at: new Date(now).toISOString(),
    scope: 'Repository snapshots only; no live source verification or production database inspection.',
    catalogs: coverage,
    totals: { founders: founders.length, companies: new Set(founders.map(({ row }) => row.company_key)).size, news: news.length },
    problems, reviews_due: review.filter(isDue).sort(byDate), upcoming_reviews: review.filter(row => !isDue(row)).sort(byDate),
  }
}

export async function loadContentReport({ root = repositoryRoot, now = Date.now() } = {}) {
  const problems = []
  for (const [directory, pattern, field] of [
    ['backend/resources/data', /^founder-directory(?:-.+)?\.json$/, 'backend'],
    ['frontend/src/data', /^founder-spotlight(?:-.+)?\.json$/, 'frontend'],
  ]) {
    for (const file of (await readdir(resolve(root, directory))).sort()) {
      const path = `${directory}/${file}`
      if (pattern.test(file) && !catalogs.some(catalog => catalog[field] === path)) problems.push(`${path}: unregistered founder catalog; add its reviewed pair to content coverage`)
    }
  }
  const read = async path => {
    try { return JSON.parse(await readFile(resolve(root, path), 'utf8')) }
    catch (error) { throw new Error(`Cannot read ${path}: ${error.message}`) }
  }
  const batches = await Promise.all(catalogs.map(async catalog => ({
    ...catalog, rows: await read(catalog.backend), snapshot: await read(catalog.frontend),
  })))
  return buildContentReport(batches, { now, problems })
}
