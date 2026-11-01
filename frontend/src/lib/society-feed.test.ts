import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { societyFeed, societyFeedCopy, societySectorLabel, societyShowing, societyTabCounts } from "./society-feed"

const arabic = /[؀-ۿ]/
const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
const files = {
  page: source("../app/dashboard/society/page.tsx"),
  filters: source("../components/dashboard/FeedFilterBar.tsx"),
  composer: source("../components/dashboard/SocietyComposerModal.tsx"),
  card: source("../components/dashboard/SocietyPostCard.tsx"),
}

test("community feed copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(societyFeedCopy.ar).sort(), Object.keys(societyFeedCopy.en).sort())
  for (const [key, value] of Object.entries(societyFeedCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(societyFeedCopy.en)) assert.doesNotMatch(value, arabic, key)
})

test("the feed page and its parts render from the dictionary, not fixed Arabic text", () => {
  for (const [name, file] of Object.entries(files)) {
    assert.doesNotMatch(file, arabic, `${name} still has fixed Arabic text`)
    assert.match(file, /societyFeed\(locale\)/, `${name} does not read the locale copy`)
  }
  assert.doesNotMatch(files.page, /Society Feed|Scorecard|Wosool Society Post/)
  assert.doesNotMatch(files.composer, /Scorecard/)
})

test("tab badges use feed-wide API totals, never the posts on the current page", () => {
  assert.deepEqual(societyTabCounts("asks", { total: 3, counts: { all: 9, asks: 3, offers: 6 } }), { all: 9, asks: 3, offers: 6 })
  // Older API without counts: only the selected tab's total is known.
  assert.deepEqual(societyTabCounts("offers", { total: 6 }), { offers: 6 })
  assert.deepEqual(societyTabCounts("all", { total: 4, counts: { all: 4, asks: "x" as unknown as number, offers: 1 } }), { all: 4 })
  assert.deepEqual(societyTabCounts("all", null), {})
  assert.doesNotMatch(files.page, /posts\.filter\(\(?p\)? => p\.post_type/)
  assert.match(files.page, /societyTabCounts\(tab, meta\)/)
})

test("post cards do not invent a company, and sector values read as names", () => {
  assert.doesNotMatch(files.card, /\?\? "(Wosool|General|Founder)"/)
  assert.equal(societySectorLabel("ar", "fintech"), "التقنية المالية")
  assert.equal(societySectorLabel("en", "AI"), "AI")
  assert.equal(societySectorLabel("en", "HealthTech"), "HealthTech")
  assert.equal(societySectorLabel("en", "  "), null)
  assert.equal(societySectorLabel("ar", null), null)
  for (const odd of ["__proto__", "constructor", "toString", "hasOwnProperty"]) assert.equal(societySectorLabel("en", odd), odd)
})

test("pagination summary and fallbacks follow the visitor's language", () => {
  assert.equal(societyShowing("en", 1, 1), "Showing 1 of 1 post")
  assert.equal(societyShowing("en", 15, 40), "Showing 15 of 40 posts")
  assert.match(societyShowing("ar", 15, 40), arabic)
  assert.equal(societyFeed("en").helpMessage, "I can help")
})

test("composer and delete confirmation are labelled, RTL-safe modal dialogs", () => {
  for (const file of [files.page, files.composer]) assert.match(file, /<DialogTitle/)
  assert.match(files.composer, /<label htmlFor=\{`\$\{id\}-title`\}/)
  assert.match(files.composer, /<label htmlFor=\{`\$\{id\}-content`\}/)
  assert.doesNotMatch(files.composer, /aria-label="/)
  assert.doesNotMatch(files.page, /fixed inset-0 z-50/)
  for (const file of Object.values(files)) assert.doesNotMatch(file, /\b(ml|mr)-\d\b/)
})

test("member pages inside the dashboard layout do not add a second main landmark", () => {
  for (const path of ["../app/dashboard/society/page.tsx", "../app/dashboard/matches/page.tsx"]) assert.doesNotMatch(source(path), /<main\b/, path)
})

test("only the newest feed request updates the page, and dialogs hand focus back", () => {
  assert.match(files.page, /request === latestRequest\.current/)
  assert.doesNotMatch(files.page, /if \(signal\?\.aborted\) return/)
  assert.match(files.page, /onCloseAutoFocus=\{restoreFocus\}/)
  assert.match(files.composer, /onCloseAutoFocus=\{onCloseAutoFocus\}/)
  assert.equal((files.page.match(/rememberFocus\(\)(?! \{)/g) ?? []).length, 2)
})
