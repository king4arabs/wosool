/** Browser geometry check for balanced EO Accelerator value and cohort cards; no production writes. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18092'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18092'], { stdio: ['ignore', 'pipe', 'pipe'] })
let serverLog = ''
app.stdout.on('data', value => { serverLog = (serverLog + value).slice(-5000) })
app.stderr.on('data', value => { serverLog = (serverLog + value).slice(-5000) })
async function eventually(fn) {
  for (let i = 0; i < 150; i++) { if (await fn()) return; await new Promise(resolve => setTimeout(resolve, 100)) }
  throw new Error('EO card layout never settled: ' + serverLog)
}
let browser
try {
  await eventually(() => serverLog.includes('Ready'))
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) })
  for (const locale of ['ar', 'en']) for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: null } })
      return route.continue()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin + '/eoa')
    await eventually(async () => await page.locator('.eoa-four-grid').count() >= 2)
    const grids = page.locator('.eoa-four-grid')
    for (let index = 0; index < 2; index++) {
      const cards = grids.nth(index).locator(':scope > .eoa-pillar')
      assert.equal(await cards.count(), 4, 'Expected four value or cohort cards')
      const geometry = await cards.evaluateAll(items => items.map(element => {
        const card = element.getBoundingClientRect()
        const heading = element.querySelector('h3, h2')?.getBoundingClientRect()
        const paragraph = element.querySelector('p')?.getBoundingClientRect()
        return {
          left: card.left, top: card.top, right: card.right, width: card.width, height: card.height,
          scrollHeight: element.scrollHeight, clientHeight: element.clientHeight,
          headingInside: !!heading && heading.left >= card.left - 1 && heading.right <= card.right + 1,
          paragraphInside: !!paragraph && paragraph.left >= card.left - 1 && paragraph.right <= card.right + 1
            && paragraph.bottom <= card.bottom + 1,
        }
      }))
      assert.ok(geometry.every(g => g.width > 0 && g.height > 0 && g.headingInside && g.paragraphInside && g.scrollHeight <= g.clientHeight + 1),
        JSON.stringify({ locale, width, index, geometry }))
      const tops = [...new Set(geometry.map(g => Math.round(g.top)))]
      const expectedRows = width <= 560 ? 4 : width <= 1000 ? 2 : 1
      assert.equal(tops.length, expectedRows, JSON.stringify({ locale, width, index, tops }))
      for (const top of tops) {
        const row = geometry.filter(g => Math.abs(g.top - top) <= 1)
        const heights = row.map(g => g.height)
        assert.ok(Math.max(...heights) - Math.min(...heights) < 2, JSON.stringify({ locale, width, index, heights }))
      }
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'EO page overflow')
    assert.deepEqual(errors, [], 'EO layout script errors')
    console.log(`PASS EO value/cohort card balance ${locale}/${width}px`)
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
