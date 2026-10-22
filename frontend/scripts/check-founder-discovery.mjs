/** Homepage discovery against isolated public API fixtures; no external requests. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18081'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18081'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
app.stdout.on('data', value => { log = (log + value).slice(-10000) })
app.stderr.on('data', value => { log = (log + value).slice(-10000) })
async function eventually(check) {
  for (let i = 0; i < 150; i++) {
    if (await check()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Homepage discovery did not settle. ${log}`)
}
let browser
try {
  await eventually(() => log.includes('Ready'))
  browser = await chromium.launch()
  for (const locale of ['ar', 'en']) for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage()
    const errors = []
    const requestedPages = []
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/')) return route.continue()
      if (url.pathname === '/api/v1/founders') {
        assert.equal(url.searchParams.get('per_page'), '100')
        const index = Number(url.searchParams.get('page'))
        requestedPages.push(index)
        return route.fulfill({ json: { data: [{ id: index, slug: index === 1 ? 'unifonic' : 'live-later', display_name: `Live founder ${index}`, name: `Live founder ${index}`, is_public: true, status: 'active', companies: [] }], meta: { last_page: 2 } } })
      }
      return route.fulfill({ json: { data: [], meta: { last_page: 1, total: 0 } } })
    })
    await page.goto(origin)
    await eventually(() => page.locator('#community-profiles-title').count())
    await eventually(() => page.evaluate(value => document.documentElement.lang === value, locale))
    assert.ok(requestedPages.includes(1) && requestedPages.includes(2))
    const spotlight = page.locator('#founder-spotlight')
    const rail = spotlight.locator('[aria-roledescription]')
    await eventually(async () => await rail.locator('article').count() === 36)
    const ids = () => rail.locator('h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')))
    const first = await ids()
    assert.equal(new Set(first).size, 36)
    assert.ok(!first.includes('/founders/unifonic'), 'No duplicated live profile in editorial spotlight')
    const shuffle = spotlight.getByRole('button', { name: locale === 'ar' ? 'اعرض مجموعة أخرى من المؤسسين' : 'Show another founder mix', exact: true })
    await shuffle.click()
    await eventually(async () => JSON.stringify(await ids()) !== JSON.stringify(first))
    const shuffled = await ids()
    const search = spotlight.getByRole('searchbox')
    await search.fill(locale === 'ar' ? 'برايان تشيسكي' : 'Brian Chesky')
    await eventually(async () => await rail.locator('article').count() === 1)
    await search.fill('')
    await eventually(async () => await rail.locator('article').count() === 36)
    assert.deepEqual(await ids(), shuffled, 'Clearing search restores this visit’s order')
    await spotlight.getByRole('button', { name: locale === 'ar' ? 'عرض جميع المؤسسين' : 'View all founders', exact: true }).click()
    const grid = spotlight.locator('section[id]')
    await eventually(async () => await grid.locator('article').count() === 6)
    await grid.getByRole('button', { name: locale === 'ar' ? 'التالي' : 'Next', exact: true }).click()
    assert.ok(await grid.getByRole('button', { name: locale === 'ar' ? 'الصفحة 2' : 'Page 2', exact: true }).getAttribute('aria-current') === 'page')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale} ${width}: no page overflow`)
    assert.deepEqual(errors, [], `${locale} ${width}: no hydration/runtime errors`)
    await page.reload()
    await eventually(async () => await page.locator('#founder-spotlight [aria-roledescription] article').count() === 36)
    await eventually(() => page.locator('#community-profiles-title').count())
    assert.notDeepEqual(await ids(), first, 'A new visit gets a fresh selection')
    await context.close()
    console.log(`Founder discovery passed: ${locale}, ${width}px, pagination, shuffle, search, grid and reload`)
  }
} finally {
  await browser?.close()
  if (app.exitCode === null) { app.kill('SIGTERM'); await once(app, 'exit') }
}
