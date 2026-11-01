/** Local production build regression: all regions, both languages and viewports. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18085'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18085'], { cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
app.stdout.on('data', value => { log += value })
app.stderr.on('data', value => { log += value })
let browser
const clean = text => text.replace(/[\u061c\u200e\u200f]/g, '')
try {
  for (let i = 0; !log.includes('Ready'); i++) {
    if (i > 150) throw new Error(log)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  browser = await chromium.launch({ headless: true })
  for (const locale of ['en', 'ar']) for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: [], meta: { last_page: 1, total: 0 } } })
      return route.continue()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    const panel = page.getByRole('complementary', { name: locale === 'ar' ? 'مؤشرات المنظومة' : 'Ecosystem indicators' })
    await panel.waitFor()
    const expected = [[808, 762, 7, -39], [2978, 2429, 3.6, -33.3], [10307, 7722, null, -33], [null, 5500000, 65, -17]]
    for (let region = 0; region < 4; region++) {
      await panel.getByRole('button').nth(region).click()
      assert.equal(await panel.getByRole('button').nth(region).getAttribute('aria-pressed'), 'true')
      const cards = panel.locator('article')
      assert.equal(await cards.count(), 4)
      for (let metric = 0; metric < 4; metric++) {
        const card = cards.nth(metric)
        const value = expected[region][metric]
        const strong = card.locator('strong')
        if (value === null) {
          assert.equal(await strong.innerText(), '—')
          assert.equal(await strong.getAttribute('aria-label'), locale === 'ar' ? 'غير متاح' : 'Unavailable')
          assert.equal(await card.locator('a').count(), 0)
        } else {
          const number = new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en', region === 3 && metric < 2 ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(value)
          assert.equal(clean(await strong.innerText()), clean(`${metric > 1 && value > 0 ? '+' : ''}${number}${metric > 1 ? '%' : region === 3 && metric === 1 ? '+' : ''}`))
          assert.ok((await card.locator('a').getAttribute('href')).startsWith('https://'))
        }
      }
      if (region === 0 || region === 2) {
        assert.ok((await cards.nth(3).innerText()).includes('9M 2026 / 9M 2025'))
        assert.ok((await cards.nth(3).locator('a').getAttribute('href')).includes('magnitt.com'))
      }
      assert.ok(!(await panel.innerText()).includes('7.3M'))
      const box = await panel.boundingBox()
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1, 'Panel fits viewport')
    }
    assert.deepEqual(errors, [])
    console.log(`PASS ${locale} ${width}px: values, source links, periods, nulls and region switching`)
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
}
