/**
 * Isolated production-browser accessibility gate (CI).
 *
 * Starts the built frontend, blocks every network request outside it (the API is
 * unreachable, so pages show their bundled outage content), and runs axe-core on each
 * public page in Arabic and English at 390px and 1366px. Fails on serious or critical
 * WCAG 2.1 A/AA violations. No live API, accounts or data writes.
 *
 * Usage (after `npm run build`): npm run test:a11y:browser
 *   A11Y_ROUTES=/,/about   check only these routes
 */
import { spawn } from "node:child_process"
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { createRequire } from "node:module"
import { join, relative, sep } from "node:path"
import { chromium } from "playwright"

const origin = "http://127.0.0.1:18081"
const APP_DIR = new URL("../src/app", import.meta.url).pathname
const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8")
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]

function routes(dir = APP_DIR) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...routes(full))
    else if (entry === "page.tsx") {
      const route = "/" + relative(APP_DIR, dir).split(sep).filter(Boolean).join("/")
      if (!route.includes("[")) found.push(route)
    }
  }
  return found.sort()
}
const isPrivate = route => /^\/(admin|dashboard|review)(\/|$)|^\/eoa\/(admin|coach|account)(\/|$)/.test(route)
const targets = process.env.A11Y_ROUTES?.split(",").filter(Boolean) ?? routes().filter(route => !isPrivate(route))

const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "18081"], { stdio: ["ignore", "pipe", "pipe"] })
let log = ""
app.stdout.on("data", data => { log = (log + data).slice(-10000) })
app.stderr.on("data", data => { log = (log + data).slice(-10000) })
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let browser
const failures = []
let visits = 0
try {
  for (let i = 0; i < 200 && !log.includes("Ready"); i++) await delay(50)
  if (!log.includes("Ready")) throw new Error(`Frontend did not start:\n${log}`)
  browser = await chromium.launch(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {})
  for (const locale of ["ar", "en"]) for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" })
    await context.addInitScript(value => { try { localStorage.setItem("wosool-locale", value) } catch {} }, locale)
    await context.route(url => !url.href.startsWith(origin) || url.pathname.startsWith("/api/"), route => route.abort())
    const page = await context.newPage()
    for (const route of targets) {
      await page.goto(origin + route, { waitUntil: "load", timeout: 30000 })
      await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {})
      await page.waitForFunction(value => document.documentElement.lang === value, locale, { timeout: 5000 }).catch(() => {})
      if (!(await page.evaluate(() => typeof window.axe === "object"))) await page.addScriptTag({ content: AXE })
      const violations = await page.evaluate(async tags => (await window.axe.run(document, { runOnly: tags, resultTypes: ["violations"] })).violations
        .filter(violation => violation.impact === "serious" || violation.impact === "critical")
        .map(violation => `${violation.id} (${violation.nodes.length}): ${violation.help}\n      ${violation.nodes.slice(0, 2).map(node => node.html.slice(0, 160)).join("\n      ")}`), TAGS)
      visits++
      if (violations.length) failures.push(`✗ [${locale} ${width}px] ${route}\n    ${violations.join("\n    ")}`)
    }
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill()
}
for (const failure of failures) console.log(failure)
console.log(`\nAccessibility: ${visits} page visits, ${failures.length} with serious or critical WCAG 2.1 A/AA violations.`)
process.exit(failures.length ? 1 : 0)
