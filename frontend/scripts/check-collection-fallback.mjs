/** Isolated production-browser checks. No live API, accounts or data writes. */
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { chromium } from "playwright"

const origin = "http://127.0.0.1:18080"
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "18080"], { stdio: ["ignore", "pipe", "pipe"] })
let log = ""
app.stdout.on("data", data => { log = (log + data).slice(-10000) })
app.stderr.on("data", data => { log = (log + data).slice(-10000) })
let browser
let checks = 0
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function eventually(check) {
  for (let i = 0; i < 100; i++) { if (await check()) return; await delay(50) }
  throw new Error("Expected collection state did not render")
}
try {
  await eventually(() => log.includes("Ready"))
  browser = await chromium.launch()
  for (const locale of ["ar", "en"]) for (const width of [390, 1366]) {
    for (const path of ["/founders", "/news", "/founders/fixture-founder"]) {
      for (const status of [200, 401, 403, 404, 410, 429, 503]) {
        console.log(`Checking ${locale} ${width}px ${path}: HTTP ${status}`)
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" })
        await context.addInitScript(value => localStorage.setItem("wosool-locale", value), locale)
        const page = await context.newPage()
        const errors = []
        page.on("pageerror", error => errors.push(error.message))
        let responseStatus = status
        let requests = 0
        let release
        const gate = new Promise(resolve => { release = resolve })
        await context.route("**/*", async route => {
          const url = new URL(route.request().url())
          if (url.origin !== origin) return route.abort()
          if (!url.pathname.startsWith("/api/")) return route.continue()
          // SiFi has associated briefs in the reviewed snapshot; Unifonic has none.
          if (url.pathname === "/api/v1/founders/fixture-founder") return route.fulfill({ json: { data: { id: 1, slug: "fixture-founder", name: "Fixture founder", bio: "Fixture biography", status: "active", is_public: true, companies: [{ id: 1, slug: "sifi", name: "SiFi" }] } } })
          if (["/api/v1/news", "/api/v1/founders"].includes(url.pathname)) {
            await gate
            requests++
            return route.fulfill({ status: responseStatus, json: responseStatus === 200 ? { data: [], meta: { total: 0, last_page: 1 } } : { message: "Fixture unavailable" } })
          }
          return route.fulfill({ status: 401, json: { message: "Unauthenticated" } })
        })
        await page.goto(origin + path, { waitUntil: "domcontentloaded" })
        await eventually(() => page.evaluate(value => document.documentElement.lang === value, locale))
        const selector = path === "/founders" ? '#founder-directory a[href^="/founders/"]' : path === "/news" ? "article" : "#profile-news article"
        if (path === "/founders") {
          // Next may briefly retain a hidden prerender tree during hydration.
          await page.getByText(locale === "ar" ? "جارٍ تحميل الملفات العامة…" : "Loading public profiles…", { exact: true }).filter({ visible: true }).first().waitFor()
          assert.equal(await page.locator(selector).count(), 0, "No founder snapshot during loading")
        }
        release()
        await eventually(() => requests > 0)
        if (status === 503) await eventually(async () => await page.locator(selector).count() > 0)
        else {
          if (path !== "/founders/fixture-founder" && status !== 200) await page.getByRole("button", { name: locale === "ar" ? "إعادة المحاولة" : path === "/news" ? "Retry live updates" : "Try again", exact: true }).filter({ visible: true }).first().waitFor()
          await delay(100)
          assert.equal(await page.locator(selector).count(), 0, `${path}: ${status} must not restore snapshots`)
        }
        // A denial after an outage removes the snapshot; a later outage cannot restore it.
        if (status === 503 && path !== "/founders/fixture-founder") {
          const retry = page.getByRole("button", { name: locale === "ar" ? "إعادة المحاولة" : path === "/news" ? "Retry live updates" : "Try again", exact: true }).filter({ visible: true }).first()
          for (const next of [403, 503]) {
            const before = requests
            responseStatus = next
            await retry.click()
            await eventually(() => requests > before)
            await eventually(async () => await page.locator(selector).count() === 0)
            await retry.waitFor()
          }
        }
        assert.deepEqual(errors, [], `${path}: no browser exceptions`)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path}: no horizontal overflow`)
        await context.close()
        checks++
      }
    }
  }
  console.log(`${checks} collection browser scenarios passed (Arabic/English, mobile/desktop).`)
} finally {
  await browser?.close()
  if (app.exitCode === null) { app.kill("SIGTERM"); await once(app, "exit") }
}
