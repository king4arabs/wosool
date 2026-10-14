import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'))
const founders = await read('backend/resources/data/founder-directory.json')
const news = await read('backend/resources/data/sourced-news.json')
const problems = []
const validUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password } catch { return false } }
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value))
for (const [name, rows, snapshot] of [
  ['founders', founders, 'frontend/src/data/founder-spotlight.json'],
  ['news', news, 'frontend/src/data/startup-news.json'],
]) {
  if (!isDeepStrictEqual(rows, await read(snapshot))) problems.push(`${name}: frontend and backend snapshots differ`)
  if (new Set(rows.map(row => row.slug)).size !== rows.length) problems.push(`${name}: duplicate slugs`)
  for (const row of rows) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)) problems.push(`${name}: unsafe slug ${row.slug}`)
    if (name === 'founders') {
      if (!validUrl(row.website) || !validUrl(row.source_url) || !row.source_urls?.length || !row.source_urls.every(validUrl)) problems.push(`${row.slug}: missing/invalid website or evidence`)
      if (!validDate(row.reviewed_at) || Date.parse(row.reviewed_at) > Date.now()) problems.push(`${row.slug}: invalid review date`)
      if (!row.founder_name_en || !row.founder_name_ar || !row.founder_brief_en || !row.founder_brief_ar) problems.push(`${row.slug}: incomplete bilingual profile`)
      if (row.traction_en && (!row.traction_ar || !validUrl(row.traction_source_url) || !row.source_urls.includes(row.traction_source_url))) problems.push(`${row.slug}: unsupported traction`)
    } else {
      if (!validUrl(row.sourceUrl) || !row.sourceName || !validDate(row.publishedAt) || Date.parse(row.publishedAt) > Date.now()) problems.push(`${row.slug}: invalid source or publication date`)
      if (!row.title || !row.content || !row.translations?.ar?.body?.length) problems.push(`${row.slug}: incomplete bilingual story`)
    }
  }
}
if (new Set(news.map(row => row.sourceUrl)).size !== news.length) problems.push('news: duplicate source URL')
const now = Date.now()
const review = founders.map(row => ({ slug: row.slug, name: row.founder_name_en, company: row.company_name_en, reviewed_at: row.reviewed_at, review_due_at: validDate(row.reviewed_at) ? new Date(Date.parse(row.reviewed_at) + 30 * 86400000).toISOString().slice(0, 10) : null, sources: row.source_urls }))
const due = review.filter(row => !row.review_due_at || Date.parse(row.review_due_at) <= now)
if (process.argv.includes('--check')) {
  for (const problem of problems) console.error(problem)
  console.log(`${founders.length} founders, ${new Set(founders.map(row => row.company_key)).size} companies, ${news.length} stories; ${problems.length} integrity problems; ${due.length} founder reviews due.`)
} else {
  console.log(JSON.stringify({ generated_at: new Date().toISOString(), scope: 'Repository snapshots only; no live source verification or production database inspection.', totals: { founders: founders.length, companies: new Set(founders.map(row => row.company_key)).size, news: news.length }, problems, reviews_due: due, upcoming_reviews: review.filter(row => !due.includes(row)).sort((a,b) => a.review_due_at.localeCompare(b.review_due_at)) }, null, 2))
}
process.exitCode = problems.length ? 1 : 0
