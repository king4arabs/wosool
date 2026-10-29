/** Isolated directory visits, bilingual API/fallback search and physical carousel movement. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18090'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18090'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
async function eventually(check) {
  for (let i = 0; i < 150; i++) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 100)) }
  throw new Error(`Directory state did not settle. ${log.slice(-2000)}`)
}
const queries = ['Ahmad Ali', 'أحمد العلي', 'Growth Labs', 'شركة النماء', 'Second Venture', 'المشروع الثاني', 'Ahmad النماء']
const record = (id, locale) => ({ id, slug: `fixture-${id}`, name: id === 1 ? locale === 'ar' ? 'أحمد العلي' : 'Ahmad Ali' : `Founder ${id}`, country_code: id === 24 ? 'AE' : 'SA', position: 'Founder', is_public: true, status: 'active', is_featured: false, is_verified: false,
  companies: [{ id, slug: `company-${id}`, name: id === 1 ? locale === 'ar' ? 'شركة النماء' : 'Growth Labs' : `Company ${id}`, country_code: id === 24 ? 'AE' : 'SA', pivot: { is_primary: true } }] })
let browser
try {
  await eventually(() => log.includes('Ready'))
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar', 'en']) for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage(); const errors = []; const requests = []
    let outage = false
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/')) return route.continue()
      if (url.pathname === '/api/v1/founders') {
        if (outage) return route.fulfill({ status: 503, json: { message: 'Fixture outage' } })
        assert.equal(url.searchParams.get('per_page'), '24', 'Keep anti-scraping pagination')
        const language = route.request().headers()['x-locale'] || locale
        const search = url.searchParams.get('search') || ''
        requests.push(search)
        // Search is exercised by real backend tests; this fixture deliberately returns
        // matches whose searched name is absent from the localized primary card.
        let data = search ? queries.includes(search) ? [record(1, language)] : [] : Array.from({ length: 24 }, (_, i) => record(i + 1, language))
        const country = url.searchParams.get('country')
        if (country) data = data.filter(item => item.country_code === country)
        return route.fulfill({ json: { data, meta: { total: data.length, last_page: 1 } } })
      }
      return route.fulfill({ json: { data: [], meta: { last_page: 1 } } })
    })
    await page.goto(origin + '/founders', { waitUntil: 'networkidle' })
    const directory = page.locator('#founder-directory')
    const rail = directory.locator('[aria-roledescription]')
    const ids = () => rail.locator('h3 a').evaluateAll(links => links.map(link => link.getAttribute('href')))
    await directory.locator('[data-visit-ready="true"]').waitFor()
    await eventually(async () => (await ids()).length === 24)
    const original = await ids()
    assert.equal(new Set(original).size, 24)
    const search = directory.getByRole('searchbox')
    for (const query of queries) {
      const before = requests.length
      await search.fill(query)
      await eventually(async () => requests.length > before && (await ids()).length === 1)
      assert.deepEqual(await ids(), ['/founders/fixture-1'], `${locale}: ${query}`)
    }
    await search.fill('no-matching-founder')
    await directory.getByText(locale === 'ar' ? 'لا توجد ملفات مطابقة. جرّب اسمًا أو قطاعًا أو منطقة أخرى.' : 'No matching profiles. Try another name, sector or region.').waitFor()
    assert.equal(await rail.count(), 0)
    await search.fill('')
    await eventually(async () => (await ids()).length === 24)
    assert.deepEqual(await ids(), original, 'Clearing search preserves the visit order')
    await directory.getByRole('button', { name: locale === 'ar' ? 'عرض جميع المؤسسين' : 'View all founders', exact: true }).click()
    const grid = directory.locator('section[id]')
    assert.deepEqual(await grid.locator('h3 a').evaluateAll(links => links.map(link => link.getAttribute('href'))), original.slice(0, 6), 'Expanded grid uses the same shuffled order')
    await grid.getByRole('button', { name: locale === 'ar' ? 'إغلاق الشبكة' : 'Close grid', exact: true }).click()

    await rail.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const beforeMove = await rail.evaluate(el => el.scrollLeft)
    assert.ok(beforeMove > 0)
    await eventually(async () => await rail.evaluate(el => el.scrollLeft) < beforeMove - 10)
    // Smaller scrollLeft on this LTR rail moves the card artwork physically right.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(600)
    const stopped = await rail.evaluate(el => el.scrollLeft)
    await page.waitForTimeout(3200)
    assert.equal(await rail.evaluate(el => el.scrollLeft), stopped, 'Reduced motion prevents automatic advancement')
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    if (width < 1024) await page.getByRole('button', { name: locale === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation menu', exact: true }).click()
    await page.locator('header select:visible').selectOption(nextLocale)
    // The directory resets translated filters by remounting its layout, which
    // also closes the mobile menu. Verify the resulting state before continuing.
    if (width < 1024) await page.getByRole('button', { name: nextLocale === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation menu', exact: true }).waitFor()
    await eventually(async () => (await ids()).length === 24)
    assert.deepEqual(await ids(), original, 'Changing language preserves the visit order')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    await page.reload({ waitUntil: 'networkidle' })
    await eventually(async () => (await ids()).length === 24)
    const reloaded = await ids()
    assert.notDeepEqual(reloaded, original, 'Reload creates a fresh shuffle')
    await page.locator('a[href="/contact"]:visible').first().click()
    await page.waitForURL('**/contact')
    await page.locator('a[href="/founders"]:visible').first().click()
    await page.waitForURL('**/founders')
    await eventually(async () => (await ids()).length === 24)
    assert.notDeepEqual(await ids(), reloaded, 'Returning by client navigation creates a fresh shuffle')

    outage = true
    await page.reload({ waitUntil: 'networkidle' })
    for (const query of ['Ahmed Hamdan', 'احمد حمدان', 'Unifonic', 'يونيفونيك']) {
      await directory.getByRole('searchbox').fill(query)
      await eventually(async () => (await ids()).includes('/founders/unifonic'))
    }
    assert.deepEqual(errors, [])
    console.log(`PASS directory ${locale}/${width}: visit shuffle, stable grid and language, bilingual founder/company search, secondary company, fallback search, automatic rightward movement, reduced motion`)
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
