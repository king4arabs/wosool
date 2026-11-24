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
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar', 'en']) for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage()
    const errors = []
    const starts = []
    let outage = false
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/')) return route.continue()
      if (url.pathname === '/api/v1/founders/discover/cards') {
        starts.push(url.searchParams.get('start'))
        if (outage) return route.fulfill({ status: 503, json: { message: 'Fixture outage' } })
        const ar = route.request().headers()['x-locale'] === 'ar'
        const rows = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1, slug: 'database-founder-' + i, name: i === 0 ? (ar ? 'مؤسس الاختبار' : 'Fixture Founder') : 'Person ' + i,
          sector: i < 3 ? (ar ? 'تقنيات السفر' : 'Travel technology') : (ar ? 'التعليم' : 'Education'),
          country_code: i < 12 ? 'SA' : i < 17 ? 'AE' : i < 20 ? 'EG' : 'US',
          is_public: true, status: 'active', can_communicate: false, companies: [],
        }))
        return route.fulfill({ json: { data: rows } })
      }
      return route.fulfill({ json: { data: [], meta: { last_page: 1, total: 0 } } })
    })
    await page.goto(origin)
    await eventually(() => page.evaluate(value => document.documentElement.lang === value, locale))
    const spotlight = page.locator('#founder-spotlight')
    const rail = spotlight.locator('[aria-roledescription]')
    await eventually(async () => await rail.locator('article').count() === 24)
    const ids = () => rail.locator('h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')))
    const first = await ids()
    assert.equal(new Set(first).size, 24)
    assert.ok(first.every(href => href.startsWith('/founders/database-founder-')), 'Only the published API fixture supplies cards')
    const shuffle = spotlight.getByRole('button', { name: locale === 'ar' ? 'اعرض مجموعة أخرى من المؤسسين' : 'Show another founder mix', exact: true })
    await shuffle.click()
    await eventually(async () => JSON.stringify(await ids()) !== JSON.stringify(first))
    const shuffled = await ids()
    const search = spotlight.getByRole('searchbox')
    await search.fill(locale === 'ar' ? 'مؤسس الاختبار' : 'Fixture Founder')
    await eventually(async () => await rail.locator('article').count() === 1)
    await search.fill('')
    await eventually(async () => await rail.locator('article').count() === 24)
    assert.deepEqual(await ids(), shuffled, 'Clearing search restores this visit’s order')
    await spotlight.getByRole('button', { name: locale === 'ar' ? 'عرض جميع المؤسسين' : 'View all founders', exact: true }).click()
    const grid = spotlight.locator('section[id]')
    await eventually(async () => await grid.locator('article').count() === 6)
    assert.deepEqual(await grid.locator('h3 a').evaluateAll(links => links.map(link => link.getAttribute('href'))), shuffled.slice(0, 6), 'The expanded grid shares the carousel visit order')
    await grid.getByRole('button', { name: locale === 'ar' ? 'التالي' : 'Next', exact: true }).click()
    assert.ok(await grid.getByRole('button', { name: locale === 'ar' ? 'الصفحة 2' : 'Page 2', exact: true }).getAttribute('aria-current') === 'page')
    const sector = spotlight.getByRole('combobox').first()
    await sector.selectOption(locale === 'ar' ? 'تقنيات السفر' : 'Travel technology')
    await eventually(async () => await rail.locator('article').count() === 3)
    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    if (width < 1024) await page.getByRole('button', { name: locale === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation menu', exact: true }).click()
    await page.locator('header select:visible').selectOption(nextLocale)
    await eventually(() => page.evaluate(value => document.documentElement.lang === value, nextLocale))
    if (width < 1024) await page.getByRole('button', { name: nextLocale === 'ar' ? 'إغلاق قائمة التنقل' : 'Close navigation menu', exact: true }).click()
    await eventually(async () => await sector.inputValue() === '' && await rail.locator('article').count() === 24)
    assert.deepEqual(await ids(), shuffled, 'Locale changes preserve the visit mix while clearing translated sector filters')
    assert.equal(await grid.getByRole('button', { name: nextLocale === 'ar' ? 'الصفحة 1' : 'Page 1', exact: true }).getAttribute('aria-current'), 'page')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale} ${width}: no page overflow`)
    assert.deepEqual(errors, [], `${locale} ${width}: no hydration/runtime errors`)
    await page.reload()
    await eventually(async () => await page.locator('#founder-spotlight [aria-roledescription] article').count() === 24)
    assert.notDeepEqual(await ids(), first, 'A new visit gets a fresh selection')
    assert.notEqual(starts.at(-1), starts[0], 'Reload requests a fresh database rotation')
    outage = true
    await page.reload()
    await spotlight.getByRole('button', { name: nextLocale === 'ar' ? 'إعادة المحاولة' : 'Try again' }).waitFor()
    assert.deepEqual(await ids(), [], 'No bundled or stale founder survives a discovery failure')
    outage = false
    await spotlight.getByRole('button').first().click()
    await eventually(async () => (await ids()).length === 24)
    await context.close()
    console.log(`Founder discovery passed: ${locale}, ${width}px, pagination, shuffle, search, grid and reload`)
  }
} finally {
  await browser?.close()
  if (app.exitCode === null) { app.kill('SIGTERM'); await once(app, 'exit') }
}
