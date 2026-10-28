/** Run against a local built frontend: HERO_ORIGIN=http://127.0.0.1:3000 node scripts/check-home-hero.mjs */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = process.env.HERO_ORIGIN || 'http://127.0.0.1:18082'
const app = process.env.HERO_ORIGIN ? null : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18082'], { stdio: ['ignore', 'pipe', 'pipe'] })
if (app) {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Frontend did not start')), 30000)
    app.stdout.on('data', value => { if (value.toString().includes('Ready')) { clearTimeout(timeout); resolve() } })
    app.once('exit', code => { clearTimeout(timeout); reject(new Error(`Frontend exited: ${code}`)) })
  })
}
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {})
try {
  for (const locale of ['ar', 'en']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: [] } })
      return route.continue()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    const hero = page.locator('section[aria-labelledby="home-title"]')
    const video = hero.locator('video')
    await page.waitForFunction(() => {
      const video = document.querySelector('section[aria-labelledby="home-title"] video')
      return video && !video.paused && video.currentTime > 0
    })
    const panel = hero.locator('aside')
    assert.equal(await panel.locator('article').count(), 4)
    await panel.getByRole('button').nth(1).click()
    await panel.locator('strong').first().filter({ hasText: '2,977' }).waitFor()
    assert.deepEqual((await panel.locator('strong').allTextContents()).map(text => text.replace(/[\u200e\u200f\u061c]/g, '')), ['2,977', '2,430', '+7.84%', '-33.3%'])
    await panel.getByRole('button').first().click()
    assert.equal(await panel.locator('article a').count(), 4)
    assert.ok((await video.locator('source').first().getAttribute('src')).endsWith(width < 720 ? 'home-journey-mobile.webm' : 'home-journey.webm'))
    assert.equal(await video.evaluate(v => v.muted && v.loop && v.playsInline), true)
    await hero.getByRole('button', { name: /background video|فيديو الخلفية/ }).click()
    assert.equal(await video.evaluate(v => v.paused), true)
    await page.locator('#founder-community').scrollIntoViewIfNeeded()
    await hero.scrollIntoViewIfNeeded()
    assert.equal(await video.evaluate(v => v.paused), true, 'Scrolling must not undo a user pause')
    await hero.getByRole('button', { name: /background video|فيديو الخلفية/ }).click()
    await page.waitForFunction(() => !document.querySelector('section[aria-labelledby="home-title"] video').paused)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: `/tmp/wosool-hero-${locale}-${width}.png` })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await video.waitFor({ state: 'detached' })
    assert.equal(await hero.getByRole('button', { name: /background video|فيديو الخلفية/ }).count(), 0)
    assert.equal(await hero.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true)
    assert.deepEqual(errors, [])
    await context.close()
  }
  for (const mode of ['reduce', 'saveData', 'failure']) {
    const context = await browser.newContext({ reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' })
    if (mode === 'saveData') await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, addEventListener() {}, removeEventListener() {} } }))
    let mediaRequests = 0
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (/\.(mp4|webm)$/.test(url.pathname)) { mediaRequests++; if (mode === 'failure') return route.abort() }
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: [] } })
      return route.continue()
    })
    const page = await context.newPage()
    await page.goto(origin)
    await page.locator('#home-title:visible').first().waitFor()
    if (mode === 'failure') {
      await page.waitForResponse(() => false, { timeout: 1000 }).catch(() => {})
      await page.waitForFunction(() => !document.querySelector('section[aria-labelledby="home-title"] video'))
      assert.ok(mediaRequests > 0)
    } else {
      // Hydration has completed once the locale control is interactive.
      await page.waitForFunction(() => document.querySelector('header select'))
      assert.equal(await page.locator('section[aria-labelledby="home-title"] video').count(), 0)
      assert.equal(mediaRequests, 0)
    }
    await context.close()
  }
  console.log('Hero: Arabic/English, desktop/mobile, playback, persistent pause, reduced motion, data saving and failure fallback passed.')
} finally {
  await browser.close()
  if (app) { app.kill('SIGTERM'); await once(app, 'exit') }
}
