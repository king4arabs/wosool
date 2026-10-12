import assert from "node:assert/strict"
import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { FAQS, FAQ_CATEGORIES } from "../data/faq"
import { matchesFaq, normalizeSearch } from "./faq-search"

const appDir = join(process.cwd(), "src/app")
const routes = new Set<string>()
const walk = (dir: string) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (entry === "page.tsx") routes.add("/" + full.slice(appDir.length + 1).split("/").slice(0, -1).join("/"))
  }
}
walk(appDir)

test("every FAQ has a unique anchor id, a known category and both languages", () => {
  const ids = new Set<string>()
  const categories = new Set(FAQ_CATEGORIES.map(category => category.id))
  for (const item of FAQS) {
    assert.match(item.id, /^[a-z0-9-]+$/, item.id)
    assert.ok(!ids.has(item.id), `duplicate id ${item.id}`)
    ids.add(item.id)
    assert.ok(categories.has(item.category), item.id)
    assert.ok(item.q.ar.trim() && item.q.en.trim(), item.id)
    assert.ok(item.a.ar.length > 0 && item.a.ar.length === item.a.en.length, `${item.id} paragraphs must pair up`)
    assert.ok(/[؀-ۿ]/.test(item.q.ar + item.a.ar.join("")), `${item.id} Arabic text`)
  }
  for (const category of categories) assert.ok(FAQS.some(item => item.category === category), `empty category ${category}`)
})

test("FAQ links point at pages that exist", () => {
  for (const item of FAQS) {
    if (!item.link) continue
    const path = item.link.href.split(/[?#]/)[0].replace(/\/$/, "") || "/"
    const exists = routes.has(path) || (path.startsWith("/eoa/") && routes.has("/eoa/[section]"))
    assert.ok(exists, `${item.id} links to missing page ${path}`)
  }
})

test("search ignores Arabic diacritics and letter variants, and works across languages", () => {
  assert.equal(normalizeSearch("أَسأل الأعضاء"), "اسال الاعضاء")
  const fees = FAQS.find(item => item.id === "membership-fees")!
  assert.ok(matchesFaq(fees, "رسوم"))
  assert.ok(matchesFaq(fees, "fees"))
  assert.ok(matchesFaq(fees, "FEES membership"))
  assert.ok(!matchesFaq(fees, "password"))
  const reset = FAQS.find(item => item.id === "reset-password")!
  assert.ok(matchesFaq(reset, "كلمه المرور"))
  // A term that only appears in the English answer is found from either view.
  assert.ok(matchesFaq(reset, "60 minutes"))
})
