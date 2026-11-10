/** Isolated, fixture-backed responsive checks; never contacts the live API. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { chromium, firefox, webkit } from 'playwright'

const origin = 'http://127.0.0.1:18095'
const organizations = JSON.parse(readFileSync(new URL('../../backend/database/data/eoa-organizations.json', import.meta.url), 'utf8'))
  .map((item, index) => ({ ...item, id: index + 1 }))
const program = {
  facts: { annual_journey_usd: 4000 },
  local_fees: { local_fee_usd: 2250, sponsor_contribution_usd: 2000, participant_contribution_usd: 2000 },
  // Explicitly published fixtures exercise carousel controls without relying on unconfirmed fallbacks.
  partners: [
    { id: 21, name_ar: "الكراج", name_en: "The Garage", website: "https://thegarage.sa/", logo_path: "/partners/the-garage.png" },
    { id: 22, name_ar: "لاماركا", name_en: "LAMARKA", website: "https://www.lamarka.com/", logo_path: "/partners/lamarka.png" },
  ], ecosystem: [],
}
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18095'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
app.stdout.on('data', value => { log = (log + value).slice(-5000) })
app.stderr.on('data', value => { log = (log + value).slice(-5000) })
let browser

async function assertContained(page, selector) {
  const issues = await page.locator(selector).filter({ visible: true }).evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect()
    const parent = element.closest('.eoa-card')?.getBoundingClientRect()
    return rect.width > 0 && (element.scrollWidth > element.clientWidth + 2 || (parent && (rect.left < parent.left - 1 || rect.right > parent.right + 1 || rect.bottom > parent.bottom + 1)))
      ? [{ tag: element.tagName, text: element.textContent.slice(0, 70) }] : []
  }))
  assert.deepEqual(issues, [], 'Content must fit inside its card')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Page must not overflow horizontally')
}

async function assertRows(cards) {
  const boxes = await cards.filter({ visible: true }).evaluateAll(elements => elements.map(element => {
    const { top, bottom, width, height } = element.getBoundingClientRect()
    return { top, bottom, width, height }
  }))
  assert.ok(boxes.length > 0)
  for (const box of boxes) {
    const row = boxes.filter(other => Math.abs(other.top - box.top) < 2)
    assert.ok(row.every(other => Math.abs(other.height - box.height) < 2 && Math.abs(other.width - box.width) < 2), JSON.stringify(boxes))
  }
}

try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
    browser = await launcher.launch()
    for (const locale of ['ar', 'en']) for (const width of [320, 390, 600, 768, 900, 1024, 1440, 2560]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
      await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
      let unavailable = false
      await context.route('**/*', route => {
        const url = new URL(route.request().url())
        if (url.origin !== origin) return route.abort()
        if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ status: unavailable ? 503 : 200, json: { data: program } })
        if (url.pathname.endsWith('/eoa/directory')) return route.fulfill({ status: unavailable ? 503 : 200, json: { data: organizations } })
        if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 401, json: { message: 'Unauthenticated' } })
        return route.continue()
      })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      for (const path of ['eligibility', 'partners', 'leadership']) {
        await page.goto(`${origin}/eoa/${path}`, { waitUntil: 'networkidle' })
        await page.waitForFunction(value => document.documentElement.lang === value, locale)
        await page.evaluate(() => document.fonts.ready)
        if (path === 'eligibility') {
          await page.locator('.eoa-fee dd').first().waitFor()
          const panels = page.locator('[data-eoa-eligibility]:visible > .eoa-card')
          await assertRows(panels)
          const positions = await panels.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top))
          assert.equal(Math.abs(positions[0] - positions[1]) < 2, width > 900, 'Panels stack on tablet and phone')
          const form = page.locator('[data-eoa-eligibility]:visible form')
          await form.locator('input[type=number]').fill('300000')
          await form.locator('input[type=checkbox]').check()
          await form.locator('button[type=submit]').click()
          await form.getByRole('status').waitFor()
          const actions = await form.locator('.eoa-btn').evaluateAll(elements => elements.map(element => {
            const { left, right, top, bottom, height } = element.getBoundingClientRect()
            return { left, right, top, bottom, height }
          }))
          const [a, b] = actions
          assert.ok(actions.every(box => box.height >= 48))
          assert.ok(a.right + 10 <= b.left || b.right + 10 <= a.left || a.bottom + 10 <= b.top || b.bottom + 10 <= a.top, 'Actions need a clear gap')
          await form.getByRole('combobox', { name: locale === 'ar' ? 'العملة' : 'Currency', exact: true }).selectOption('SAR')
          await form.locator('input[type=number]').fill('1125000')
          await form.locator('button[type=submit]').click()
          await form.getByRole('status').waitFor()
          await assertContained(page, '[data-eoa-eligibility] h2, [data-eoa-eligibility] p, [data-eoa-eligibility] input, [data-eoa-eligibility] select, [data-eoa-eligibility] .eoa-btn, .eoa-fee dd')
        } else if (path === 'leadership') {
          const cards = page.locator('[data-program-leaders] > article')
          assert.equal(await cards.count(), 3, 'Program leadership includes all three requested positions')
          assert.deepEqual(await cards.locator('h2').allTextContents(), locale === 'ar'
            ? ['محمد السلمي', 'فؤاد النزّاوي', 'بشاير عبدالله']
            : ['Mohammed Alsolami', 'Fouad Alnazawi', 'Bashaier Abdullah'])
          const boxes = await cards.evaluateAll(elements => elements.map(element => {
            const { top, width, height } = element.getBoundingClientRect()
            return { top, width, height }
          }))
          assert.ok(boxes.every(box => Math.abs(box.width - boxes[0].width) < 2 && Math.abs(box.height - boxes[0].height) < 2), 'All three leadership cards have equal dimensions')
          // WebKit can reserve scrollbar space inside the requested viewport.
          // Assert against the CSS viewport that actually selects the layout.
          const viewport = await page.evaluate(() => ({ width: innerWidth, threeColumns: matchMedia('(min-width: 761px)').matches }))
          assert.equal(boxes.every(box => Math.abs(box.top - boxes[0].top) < 2), viewport.threeColumns, `Leadership shares one desktop row and stacks on small screens: ${JSON.stringify({ viewport, boxes })}`)
          for (const image of await cards.locator('img').all()) {
            await image.scrollIntoViewIfNeeded()
            await image.evaluate(element => element.decode())
          }
          for (const href of ['https://www.lamarka.com/', 'https://me.sh/profile/fouad-alnazawi', 'https://sa.linkedin.com/in/bashaier-abdullah-685190283']) {
            assert.equal(await cards.locator(`a[href="${href}"]`).count(), 1)
          }
          assert.ok(await cards.locator('a').evaluateAll(links => links.every(link => link.getBoundingClientRect().height >= 44)), 'Leadership links have accessible touch targets')
          await assertContained(page, '[data-program-leaders] h2, [data-program-leaders] p, [data-program-leaders] a')
        } else {
          await page.locator('[data-eoa-directory]:visible article').first().waitFor()
          assert.equal(await page.locator('[data-eoa-directory] [data-brand-logo]').count(), organizations.length, 'Every organization has a logo space')
          const logos = page.locator('[data-eoa-directory] img')
          for (let index = 0; index < await logos.count(); index++) {
            await logos.nth(index).scrollIntoViewIfNeeded()
            // Firefox can reject decode() for an already rendered SVG. Verify
            // actual image loading instead, including lazy off-screen images.
            await page.waitForFunction(position => {
              const image = document.querySelectorAll('[data-eoa-directory] img')[position]
              return image?.complete && image.naturalWidth > 0
            }, index, { timeout: 15000 })
          }
          await assertRows(page.locator('[data-eoa-directory]:visible article'))
          const links = await page.locator('[data-eoa-directory]:visible article').evaluateAll(elements => elements.map(element => {
            const card = element.getBoundingClientRect()
            const link = element.querySelector('a').getBoundingClientRect()
            return { top: card.top, bottom: link.bottom }
          }))
          for (const link of links) assert.ok(links.filter(other => Math.abs(other.top - link.top) < 2).every(other => Math.abs(other.bottom - link.bottom) < 2), 'Directory links align within each row')
          await assertRows(page.locator('[data-partner-carousel]:visible [data-partner]'))
          if ([390, 1440].includes(width)) {
            await page.emulateMedia({ reducedMotion: 'no-preference' })
            const carousel = page.locator('[data-partner-carousel]:visible')
            const expand = carousel.locator('button[aria-expanded]')
            await expand.waitFor()
            const controlsFit = await carousel.locator('button').evaluateAll(buttons => buttons.every(button => {
              const box = button.getBoundingClientRect()
              return box.left >= 0 && box.right <= innerWidth && box.height >= 44
            }))
            assert.ok(controlsFit, 'Carousel controls stay within the viewport')
            await expand.click()
            await assertRows(carousel.locator('[data-partner]'))
            await page.emulateMedia({ reducedMotion: 'reduce' })
          }
          await assertContained(page, '[data-eoa-directory] h3, [data-eoa-directory] p, [data-eoa-directory] a')
        }
        if ([390, 1440].includes(width)) await page.screenshot({ path: `/tmp/eoa-layout-${engine}-${locale}-${width}-${path}.png`, fullPage: true })
      }
      if (width === 320) {
        unavailable = true
        for (const path of ['eligibility', 'partners']) {
          await page.goto(`${origin}/eoa/${path}`, { waitUntil: 'networkidle' })
          await page.locator('.eoa-error').waitFor()
          await assertContained(page, '.eoa-error')
        }
      }
      assert.deepEqual(errors, [], `${engine}/${locale}/${width}: script errors`)
      console.log(`PASS EOA partners + eligibility + leadership: ${engine}/${locale}/${width}px`)
      await context.close()
    }
    await browser.close()
    browser = undefined
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
