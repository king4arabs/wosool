/** EO profile discovery: real local artwork, stable in-visit order and fresh revisits. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
const origin = 'http://127.0.0.1:18096'
const roster = JSON.parse(readFileSync(new URL('../src/data/eo-global-network.json', import.meta.url), 'utf8'))
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18096'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', value => { log = (log + value).slice(-5000) }); app.stderr.on('data', value => { log = (log + value).slice(-5000) })
let browser
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar', 'en']) for (const width of [390, 1440]) {
    const ar = locale === 'ar'
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 401, json: { message: 'Unauthenticated' } })
      return route.continue()
    })
    const page = await context.newPage(); const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin + '/eoa/mentors', { waitUntil: 'networkidle' })
    const section = page.locator('#eo-global-network')
    await page.locator('#eo-global-network[data-visit-ready="true"]').waitFor()
    const ids = async () => {
      const result = await section.locator('[data-profile]').evaluateAll(cards => cards.map(card => card.dataset.profile))
      return await section.locator('[data-view]').getAttribute('data-view') === 'carousel' ? result.reverse() : result
    }
    const original = await ids()
    assert.equal(original.length, roster.length)
    assert.equal(new Set(original).size, roster.length)
    assert.ok(roster.length >= 56)
    await section.getByRole('button', { name: ar ? 'عرض جميع البطاقات' : 'View all cards', exact: true }).click()
    assert.deepEqual(await ids(), original, 'Grid keeps the same discovery order')
    for (const image of await section.locator('article img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate(img => img.decode())
    }
    assert.ok(await section.locator('article img').evaluateAll(images => images.every(img => img.naturalWidth > 0)))
    await section.getByRole('searchbox').fill('Franziska')
    assert.deepEqual(await ids(), ['franziska-trautmann'])
    await section.getByRole('searchbox').fill('')
    assert.deepEqual(await ids(), original, 'Clearing search restores the visit order')
    await section.locator('select').nth(1).selectOption('Sustainability')
    assert.deepEqual(await ids(), ['franziska-trautmann'])
    await section.locator('select').nth(1).selectOption('all')
    assert.deepEqual(await ids(), original)
    const next = ar ? 'en' : 'ar'
    if (width < 1024) await page.getByRole('button', { name: ar ? 'فتح قائمة التنقل' : 'Open navigation menu', exact: true }).click()
    await page.locator('header select:visible').selectOption(next)
    if (width < 1024) await page.getByRole('button', { name: next === 'ar' ? 'إغلاق قائمة التنقل' : 'Close navigation menu', exact: true }).click()
    await section.getByRole('heading', { name: next === 'ar' ? 'تعرّف على أصحاب الخبرة في شبكة EO' : 'Meet people across the EO network', exact: true }).waitFor()
    assert.deepEqual(await ids(), original, 'Language changes preserve the visit order')
    assert.equal(await section.locator('[data-view]').getAttribute('data-view'), 'grid')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(v => ['critical', 'serious'].includes(v.impact)).map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))
    assert.deepEqual(violations, [], 'Accessible network cards and controls')
    await section.locator('h2').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `/tmp/eo-network-${locale}-${width}.png` })
    await page.reload({ waitUntil: 'networkidle' })
    await page.locator('#eo-global-network[data-visit-ready="true"]').waitFor()
    const second = await ids()
    assert.notDeepEqual(second, original, 'Reload starts a fresh shuffle')
    await page.locator('a[href="/eoa/about"]:visible').first().click()
    await page.waitForURL('**/eoa/about')
    await page.locator('a[href="/eoa/mentors"]:visible').first().click()
    await page.waitForURL('**/eoa/mentors')
    await page.locator('#eo-global-network[data-visit-ready="true"]').waitFor()
    assert.notDeepEqual(await ids(), second, 'Returning by client navigation starts a fresh shuffle')
    assert.deepEqual(errors, [], 'No hydration or runtime errors')
    console.log(`PASS EO network ${locale}/${width}: ${roster.length} profiles, local portraits, fresh visits, stable filters/view/language, accessibility`)
    await context.close()
  }
} finally { await browser?.close(); app.kill('SIGTERM') }
