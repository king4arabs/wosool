/** Browser regression coverage for each visit's mix, search, pagination and image framing. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18108'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18108'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', value => log += value); app.stderr.on('data', value => log += value)
async function eventually(check) {
  for (let i = 0; i < 150; i++) {
    if (await check()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Newsroom did not settle. ${log.slice(-2000)}`)
}
const records = Array.from({ length: 36 }, (_, id) => ({
  id, slug: `fixture-news-${id}`, title: `Story ${id}`, excerpt: 'A company announcement.', content: 'Company news.',
  category: 'Funding', region: id % 2 ? 'saudi' : 'global', published_at: '2026-10-20',
  source_url: `https://publisher.example/story-${id}`, source_name: 'Fixture publisher',
  companies: ['Fixture'], tags: [], image_url: `${origin}/fixture-news-image.svg`,
  status: 'published', is_public: true,
  translations: { ar: { title: `خبر ${id}`, excerpt: 'إعلان شركة.', body: ['أخبار الشركة.'] } },
}))
let browser
try {
  await eventually(() => log.includes('Ready'))
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar', 'en']) for (const width of [360, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage(); const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/fixture-news-image.svg') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect width="1200" height="300" fill="#253a77"/></svg>' })
      if (url.pathname === '/api/v1/news') return route.fulfill({ json: { data: records, meta: { current_page: 1, last_page: 1, total: records.length } } })
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: [], meta: { last_page: 1 } } })
      return route.continue()
    })
    // Legacy links must not apply invisible region/topic restrictions or chronological sorting.
    await page.goto(origin + '/news?region=saudi&topic=Product&sort=oldest', { waitUntil: 'networkidle' })
    const section = page.locator('section[aria-labelledby="stories-title"]')
    const ids = () => section.locator('article h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')))
    await eventually(async () => (await ids()).length === 13)
    assert.equal(await section.getByRole('group').count(), 0)
    assert.equal(await section.getByRole('combobox').count(), 0)
    const first = await ids()
    await section.getByRole('button', { name: locale === 'ar' ? 'عرض المزيد' : 'Show more', exact: true }).click()
    await eventually(async () => (await ids()).length === 25)
    assert.deepEqual((await ids()).slice(0, 13), first)
    await section.getByRole('button', { name: locale === 'ar' ? 'عرض المزيد' : 'Show more', exact: true }).click()
    await eventually(async () => (await ids()).length === 36)
    const all = await ids()
    assert.equal(new Set(all).size, 36)
    await section.getByRole('searchbox').fill(locale === 'ar' ? 'خبر 1' : 'Story 1')
    await eventually(async () => (await ids()).length === 11)
    const expected = all.filter(href => /fixture-news-1(?:[0-9])?$/.test(href))
    assert.deepEqual(await ids(), expected)
    await section.getByRole('button', { name: locale === 'ar' ? 'مسح البحث' : 'Clear search', exact: true }).click()
    await eventually(async () => (await ids()).length === 13)
    assert.deepEqual(await ids(), first)
    const frame = await section.locator('article img').first().evaluate(img => ({ fit: getComputedStyle(img).objectFit, position: getComputedStyle(img).objectPosition, width: img.clientWidth, natural: img.naturalWidth }))
    assert.equal(frame.fit, 'contain'); assert.equal(frame.position, '50% 50%'); assert.ok(frame.width > 0 && frame.natural > 0)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await page.reload({ waitUntil: 'networkidle' })
    await eventually(async () => (await ids()).length === 13)
    assert.notDeepEqual(await ids(), first)
    assert.deepEqual(errors, [])
    await context.close()
  }
  console.log('News discovery: fresh visits, stable search/pagination, hidden filters and responsive image framing passed.')
} finally {
  if (browser) await browser.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
