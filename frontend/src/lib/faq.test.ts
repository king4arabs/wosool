import assert from "node:assert/strict"
import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { FAQS, FAQ_CATEGORIES } from "../data/faq"
import { faqIdFromHash, matchesFaq, nextFaqIndex, normalizeSearch } from "./faq-search"
import { defaultEoaFaqs, eoaFaqs, suggestedEoaFaqs } from "./eoa-editorial"

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

test("FAQ deep links tolerate malformed URLs and keyboard navigation wraps visible questions", () => {
  assert.equal(faqIdFromHash('#reset-password'), 'reset-password')
  assert.equal(faqIdFromHash('#%72eset-password'), 'reset-password')
  assert.equal(faqIdFromHash('#%E0%A4%A'), null)
  assert.equal(faqIdFromHash(''), null)
  assert.equal(nextFaqIndex('ArrowDown', 4, 5), 0)
  assert.equal(nextFaqIndex('ArrowUp', 0, 5), 4)
  assert.equal(nextFaqIndex('Home', 3, 5), 0)
  assert.equal(nextFaqIndex('End', 0, 5), 4)
  assert.equal(nextFaqIndex('Tab', 1, 5), null)
  assert.equal(nextFaqIndex('Home', 0, 0), null)
})

test("EO suggestions preserve published answers, hidden questions and the editor limit", () => {
  const hidden = { ...defaultEoaFaqs[8], visible: false }
  const custom = { ...defaultEoaFaqs[0], answer_en: 'Custom approved answer.' }
  const existing = [hidden, custom]
  const suggestions = suggestedEoaFaqs(existing)
  assert.ok(!suggestions.some(row => row.question_en === hidden.question_en || row.question_en === custom.question_en))
  assert.deepEqual(existing, [hidden, custom])
  const published = eoaFaqs({ version: 1, operator: null, faqs: existing })
  assert.ok(!published.some(row => row.question_en === hidden.question_en))
  assert.equal(published.find(row => row.question_en === custom.question_en)?.answer_en, 'Custom approved answer.')
  assert.equal(suggestedEoaFaqs(Array.from({ length: 29 }, (_, i) => ({ ...custom, question_en: `Custom ${i}`, question_ar: `سؤال ${i}` }))).length, 1)
})
