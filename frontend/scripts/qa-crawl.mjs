#!/usr/bin/env node
/**
 * Wosool QA crawl — the inner step of the development loop.
 *
 * Visits every page route in Arabic and English, on desktop and mobile, as a visitor
 * (and as member/admin when credentials are supplied) and fails on:
 *   - JavaScript page errors or the error boundary ("Something went wrong")
 *   - API responses with status >= 500
 *   - horizontal overflow (layout wider than the viewport)
 *   - a missing or duplicated <h1>
 *   - a static public page whose server HTML (before JavaScript) has no <h1>
 *   - a button or link squeezed so narrow that a single word breaks across lines
 *   - serious or critical WCAG 2.1 A/AA violations reported by axe-core (QA_AXE=0 skips this)
 *
 * Usage (frontend and backend running):
 *   npm run qa:crawl
 *   QA_BASE_URL=https://staging.wosool.org QA_ADMIN_EMAIL=... QA_ADMIN_PASSWORD=... npm run qa:crawl
 *   QA_ROLES=admin QA_ROUTES=/admin QA_ADMIN_EMAIL=... QA_ADMIN_PASSWORD=... npm run qa:crawl   (quick re-check)
 *
 * Writes qa-report.json next to the working directory and exits 1 when anything fails.
 */
import { chromium } from "playwright"
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { createRequire } from "node:module"

const BASE = (process.env.QA_BASE_URL || "http://localhost:3000").replace(/\/+$/, "")
const APP_DIR = new URL("../src/app", import.meta.url).pathname
const LOCALES = (process.env.QA_LOCALES || "ar,en").split(",")
const VIEWPORTS = [{ name: "desktop", width: 1366, height: 900 }, { name: "mobile", width: 390, height: 844 }]
// Sample records for dynamic routes; override with QA_DYNAMIC="/founders/x,/news/y".
const BLOCK_EXTERNAL = process.env.QA_BLOCK_EXTERNAL ? process.env.QA_BLOCK_EXTERNAL === "1" : /localhost|127\.0\.0\.1/.test(BASE)
const DYNAMIC = (process.env.QA_DYNAMIC || "/news/barq-329-million-series-a-unicorn,/founders/hosam-arab,/eoa/about,/eoa/faq,/admin/events/1,/admin/programs/1,/events/fundraising-readiness-workshop-april,/programs/founder-circles,/opportunities/stv-ai-fund").split(",").filter(Boolean)

function routes(dir = APP_DIR) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...routes(full))
    else if (entry === "page.tsx") {
      const route = "/" + relative(APP_DIR, dir).split(sep).filter(Boolean).join("/")
      if (!route.includes("[")) found.push(route === "/" ? "/" : route)
    }
  }
  return found.sort()
}

const isPrivate = route => /^\/(admin|dashboard|review)(\/|$)|^\/eoa\/(admin|coach|account)(\/|$)/.test(route)
// Account and application forms read a token or redirect from the URL, so they render on the client.
const isClientForm = route => /(^|\/)(login|register|forgot-password|reset-password|verify-email|apply)$/.test(route)
// axe-core runs in the page; only serious/critical WCAG 2.1 A/AA findings fail the crawl.
const AXE = process.env.QA_AXE === "0" ? null : readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8")
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
const ignorableConsole = text => /401 \(Unauthorized\)|403 \(Forbidden\)|404 \(Not Found\)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|net::ERR_|Failed to load resource/.test(text)

async function login(context, email, password) {
  const page = await context.newPage()
  await page.goto(`${BASE}/login`)
  await page.fill("input[name=email]", email)
  await page.fill("input[name=password]", password)
  await page.press("input[name=password]", "Enter")
  await page.waitForURL(url => !url.pathname.startsWith("/login"), { timeout: 20000 })
  await page.close()
}

const roles = [{ name: "visitor" }]
if (process.env.QA_MEMBER_EMAIL) roles.push({ name: "member", email: process.env.QA_MEMBER_EMAIL, password: process.env.QA_MEMBER_PASSWORD })
if (process.env.QA_ADMIN_EMAIL) roles.push({ name: "admin", email: process.env.QA_ADMIN_EMAIL, password: process.env.QA_ADMIN_PASSWORD })

// Optional focus for a quick re-check: QA_ROLES=admin, QA_ROUTES=/admin,/news (prefix match).
const ONLY_ROLES = process.env.QA_ROLES?.split(",").filter(Boolean)
const ONLY_ROUTES = process.env.QA_ROUTES?.split(",").filter(Boolean)
const all = [...routes(), ...DYNAMIC].filter(route => !ONLY_ROUTES || ONLY_ROUTES.some(prefix => route.startsWith(prefix)))
const browser = await chromium.launch(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {})
const failures = []
let visits = 0

// Crawlers and slow phones see the server HTML first; a page that only gets its heading
// after hydration (e.g. a whole page behind a useSearchParams Suspense boundary) shows nothing.
if (!ONLY_ROLES || ONLY_ROLES.includes("visitor")) {
  // Static routes only: record pages (/founders/[slug], /events/[slug]) load the record in the browser.
  for (const route of all.filter(route => !DYNAMIC.includes(route) && !isPrivate(route) && !isClientForm(route))) {
    const response = await fetch(BASE + route, { redirect: "manual" }).catch(error => ({ error }))
    if (response.error || response.status !== 200) continue
    if (!/<h1[\s>]/.test(await response.text())) failures.push({ role: "visitor", locale: "server-html", viewport: "-", route, final: route, problems: ["no <h1> in server HTML"] })
  }
}

for (const role of roles.filter(role => !ONLY_ROLES || ONLY_ROLES.includes(role.name))) {
  const targets = role.name === "visitor" ? all : all.filter(isPrivate)
  for (const locale of LOCALES) for (const viewport of VIEWPORTS) {
    // Private areas are checked once per role on desktop to keep the loop fast.
    if (role.name !== "visitor" && viewport.name !== "desktop") continue
    const context = await browser.newContext({ viewport })
    // On localhost, third-party assets (publisher images, fonts) only slow the crawl down.
    if (BLOCK_EXTERNAL) await context.route(url => !url.href.startsWith(BASE) && !url.href.startsWith("data:"), route => route.abort())
    await context.addInitScript(value => { try { localStorage.setItem("wosool-locale", value) } catch {} }, locale)
    if (role.email) await login(context, role.email, role.password)
    const page = await context.newPage()
    for (const route of targets) {
      const problems = []
      const onError = error => problems.push(`page error: ${String(error).slice(0, 200)}`)
      const onConsole = message => { if (message.type() === "error" && !ignorableConsole(message.text())) problems.push(`console: ${message.text().slice(0, 200)}`) }
      const onResponse = response => { if (response.url().includes("/api/") && response.status() >= 500) problems.push(`API ${response.status()} ${response.request().method()} ${response.url().replace(BASE, "")}`) }
      page.on("pageerror", onError); page.on("console", onConsole); page.on("response", onResponse)
      try {
        await page.goto(BASE + route, { waitUntil: "load", timeout: 30000 })
        await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {})
        const check = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          h1: document.querySelectorAll("main h1, h1").length,
          crashed: /Something went wrong|Application error|حدث خطأ غير متوقع/.test(document.body.innerText),
          // A button or link squeezed so narrow that a single word breaks across lines (e.g. "بحث" stacked letter by letter).
          squashed: [...document.querySelectorAll("button, a")].flatMap(element => {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              // Measure each word on its own, so "Saudi Arabia" is checked as "Saudi" and "Arabia".
              // Hyphens and slashes are normal line-break points ("two-" / "week" in a headline), so
              // each part is measured separately; a part split letter by letter is still caught.
              for (const match of node.textContent.matchAll(/[^\s\-\u2010\u2013\u2014/]{2,}/g)) {
                const range = document.createRange()
                range.setStart(node, match.index)
                range.setEnd(node, match.index + match[0].length)
                if (new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size > 1) return [match[0]]
              }
            }
            return []
          }).slice(0, 3),
        }))
        if (check.crashed) problems.push("error boundary shown")
        if (check.overflow > 1) problems.push(`horizontal overflow ${check.overflow}px`)
        if (check.squashed.length) problems.push(`word broken across lines in a button or link: ${check.squashed.join(", ")}`)
        if (check.h1 === 0 && !isPrivate(route)) problems.push("no <h1>")
        if (check.h1 > 1) problems.push(`${check.h1} <h1> elements`)
        if (AXE) {
          if (!(await page.evaluate(() => typeof window.axe === "object"))) await page.addScriptTag({ content: AXE })
          const violations = await page.evaluate(async tags => (await window.axe.run(document, { runOnly: tags, resultTypes: ["violations"] })).violations
            .filter(violation => violation.impact === "serious" || violation.impact === "critical")
            .map(violation => `a11y ${violation.id} (${violation.nodes.length}): ${violation.nodes[0].target.join(" ").slice(0, 120)}`), AXE_TAGS)
          problems.push(...violations)
        }
      } catch (error) {
        problems.push(`navigation failed: ${String(error).slice(0, 120)}`)
      }
      page.off("pageerror", onError); page.off("console", onConsole); page.off("response", onResponse)
      visits++
      if (problems.length) failures.push({ role: role.name, locale, viewport: viewport.name, route, final: new URL(page.url()).pathname, problems })
    }
    await context.close()
  }
}
await browser.close()

writeFileSync("qa-report.json", JSON.stringify({ base: BASE, visits, failures }, null, 2))
for (const failure of failures) console.log(`✗ [${failure.role}/${failure.locale}/${failure.viewport}] ${failure.route}\n    ${failure.problems.join("\n    ")}`)
console.log(`\n${visits} page visits, ${failures.length} with problems. Report: qa-report.json`)
process.exit(failures.length ? 1 : 0)
