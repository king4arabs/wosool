/** Isolated responsive presentation and country-filter checks; no production writes. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18083'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18083'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
app.stdout.on('data', value => { log = (log + value).slice(-5000) })
app.stderr.on('data', value => { log = (log + value).slice(-5000) })
async function eventually(check) {
  for (let i = 0; i < 150; i++) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 100)) }
  throw new Error(`Presentation did not settle. ${log}`)
}
const record = (id, code, active = false) => ({ id, slug: `founder-${id}`, name: `Founder ${id}`, country_code: code, position: 'Founder', bio: 'Builds useful software.', sector: 'Software', is_public: true, status: 'active', is_verified: false, is_featured: false,
  avatar_url: id === 1 ? '/eoa/board/mazin-alrukayani-original.jpeg' : 'https://example.com/missing-portrait.jpg', activation_status: active ? 'active' : 'unclaimed', community_engagement_score: active ? 75 : 88,
  companies: [{ id, slug: `company-${id}`, name: `Company ${id}`, country_code: code ?? 'JP', logo_url: id === 1 ? '/startup-directory/salla-logo.png' : 'https://example.com/missing-logo.svg', website: 'https://example.com', location: 'Company location', sector: 'Software', description: 'A company building useful products.', pivot: { is_primary: true } }] })
const records = [record(1, 'SA', true), record(2, 'AE'), record(3, null), record(4, 'IR'), record(5, 'IL')]
let browser
try {
  await eventually(() => log.includes('Ready'))
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) })
  for (const locale of ['ar', 'en']) for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage()
    const errors = []
    const countryRequests = []
    page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`))
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/')) return route.continue()
      if (url.pathname === '/api/v1/founders') {
        const country = url.searchParams.get('country')
        if (country) countryRequests.push(country)
        const data = country ? records.filter(item => (item.country_code ?? item.companies[0].country_code) === country) : records
        return route.fulfill({ json: { data, meta: { last_page: 1, total: data.length, sectors: [{ en: 'Software', ar: 'Software' }], stages: [] } } })
      }
      return route.fulfill({ json: { data: [], meta: { last_page: 1, total: 0 } } })
    })
    await page.goto(`${origin}/founders`)
    await eventually(() => page.evaluate(value => document.documentElement.lang === value, locale))
    const directory = page.locator('#founder-directory')
    await eventually(async () => await directory.locator('article').count() === 3)
    assert.equal(await page.getByText('Founder 4', { exact: true }).count(), 0)
    assert.equal(await page.getByText('Founder 5', { exact: true }).count(), 0)
    assert.equal(await page.getByText(/بانتظار التفعيل|Awaiting activation/).count(), 0)
    assert.equal(await directory.getByText('88%', { exact: true }).count(), 0)
    assert.equal(await directory.getByText('75%', { exact: true }).count(), 1)
    const countries = page.getByRole('combobox', { name: locale === 'ar' ? 'الدولة' : 'Country', exact: true })
    assert.equal(await countries.locator('option').count(), 248)
    assert.equal(await countries.locator('option[value="IR"],option[value="IL"]').count(), 0)
    const regionGroup = page.getByRole('group', { name: locale === 'ar' ? 'تصفية المؤسسين حسب المنطقة' : 'Filter founders by region' })
    const sizes = await regionGroup.locator('button').evaluateAll(buttons => buttons.slice(1).map(button => { const r = button.getBoundingClientRect(); return [r.width, r.height] }))
    assert.ok(sizes.every(([w, h]) => Math.abs(w - sizes[0][0]) < 1 && Math.abs(h - sizes[0][1]) < 1), `${locale}/${width}: region sizes`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, `${locale}/${width}: overflow`)
    const geometry = await directory.locator('article').evaluateAll(cards => cards.map(card => {
      const flag = card.querySelector('[data-country]'); const logo = card.querySelector('[data-brand-logo]'); const portrait = card.querySelector('img[class*="portraitImage"]')
      const f = flag.getBoundingClientRect(); const l = logo.getBoundingClientRect(); const c = card.getBoundingClientRect()
      return { flagInside: f.left >= c.left && f.right <= c.right && f.top >= c.top, separated: f.right <= l.left || f.left >= l.right || f.bottom <= l.top || f.top >= l.bottom, portraitFit: !portrait || getComputedStyle(portrait).objectFit === 'cover', logoFit: !logo.querySelector('img') || getComputedStyle(logo.querySelector('img')).objectFit === 'contain' }
    }))
    assert.ok(geometry.every(card => card.flagInside && card.separated && card.portraitFit && card.logoFit), JSON.stringify({ locale, width, geometry }))
    if (process.env.PRESENTATION_SCREENSHOT_DIR && [390, 1440].includes(width)) await directory.screenshot({ path: `${process.env.PRESENTATION_SCREENSHOT_DIR}/founders-${locale}-${width}.png` })
    await countries.selectOption('JP')
    await eventually(async () => countryRequests.includes('JP') && await directory.locator('article').count() === 1)
    assert.equal(await directory.locator('[data-country="JP"]').count(), 1)
    await countries.selectOption('BR')
    await eventually(async () => countryRequests.includes('BR') && await directory.locator('article').count() === 0)
    assert.deepEqual(errors, [], `Directory hydration: ${locale}/${width}`)
    await page.goto(origin)
    const hero = page.getByRole('complementary', { name: locale === 'ar' ? 'مؤشرات المنظومة' : 'Ecosystem indicators' })
    await eventually(async () => await hero.locator('button').count() === 4)
    const heroSizes = await hero.locator('button').evaluateAll(buttons => buttons.map(button => { const r = button.getBoundingClientRect(); return [r.width, r.height] }))
    assert.ok(heroSizes.every(([w, h]) => Math.abs(w - heroSizes[0][0]) < 1 && Math.abs(h - heroSizes[0][1]) < 1), `${locale}/${width}: hero region sizes`)
    await hero.locator('button').last().click()
    assert.equal(await hero.locator('button').last().getAttribute('aria-pressed'), 'true')
    assert.deepEqual(errors, [])
    console.log(`PASS ${locale} ${width}px: country filters, coverage, flags, images, score and equal region boxes`)
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
