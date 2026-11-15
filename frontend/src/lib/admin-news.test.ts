import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminNewsItem } from "./admin"
import {
  adminNewsCopy,
  fromRiyadhInput,
  isScheduled,
  newsFieldErrors,
  newsFieldId,
  newsFields,
  newsLimits,
  newsPayload,
  newsPublishTime,
  newsRegions,
  newsStatusLabel,
  newsStatuses,
  listValue,
  splitList,
  toNewsForm,
  toRiyadhInput,
  validateNewsForm,
} from "./admin-news"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/news/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/NewsController.php", import.meta.url), "utf8")
const publicApi = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/NewsController.php", import.meta.url), "utf8")

const stored: AdminNewsItem = {
  id: 4,
  title: "Example raises a seed round",
  slug: "example-raises-a-seed-round",
  excerpt: "Example announced a seed round.",
  content: null,
  category: "Funding",
  image_url: null,
  author_name: "Wosool Team",
  is_featured: false,
  is_public: true,
  status: "published",
  tags: ["seed", "fintech"],
  published_at: "2026-11-14T06:00:00+00:00",
  source_url: "https://example.com/news/seed",
  source_name: "Example News",
  image_credit: null,
  companies: ["Example"],
  region: "saudi",
  key_facts: ["Seed round", "Riyadh"],
}

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("admin news copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminNewsCopy.ar).sort(), Object.keys(adminNewsCopy.en).sort())
  assert.deepEqual(Object.keys(adminNewsCopy.ar.statuses).sort(), [...newsStatuses].sort())
  assert.deepEqual(Object.keys(adminNewsCopy.en.regions).sort(), [...newsRegions].sort())
  for (const value of strings(adminNewsCopy.ar)) assert.match(value, arabic, value)
  for (const value of strings(adminNewsCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the page follows the admin's language and labels every field", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, />\s*(News &amp; Content|New Article|Refresh|Search|Cancel|Save|Featured|Public|Title|Status)\s*</, "page still has fixed English text")
  assert.doesNotMatch(page, /placeholder="/, "placeholders are not labels")
  assert.doesNotMatch(page, /Seeded editorial content/, "internal development notes are not shown")
  assert.match(page, /adminNews\(locale\)/)
  assert.match(page, /copy\.publicNote/)
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d|text-left|text-right/, "use logical spacing so RTL and LTR both work")
  for (const name of newsFields) {
    assert.match(page, new RegExp(`(?:field|choice)\\("${name}"`), `${name} has no labelled field`)
  }
  assert.match(page, /update\("is_public", event\.target\.checked\)/)
  assert.match(page, /update\("is_featured", event\.target\.checked\)/)
  assert.doesNotMatch(page, /toast\(err\.message|toast\(\w+\.message|\.catch\(\(err: Error\)/, "raw API errors are not shown")
})

test("the form rules match the API's validation and the newsroom's visibility rule", () => {
  const rules = backend.slice(backend.indexOf("private function validated"))
  const rule = (field: string) => rules.match(new RegExp(`'${field}' => \\[(.+)\\],`))?.[1] ?? ""
  for (const field of [...newsFields, "is_featured", "is_public"]) assert.ok(rule(field), `${field} is not validated by the API`)
  for (const field of ["title", "excerpt", "category", "author_name", "status"]) assert.match(rule(field), /'required'/, field)
  for (const field of ["title", "excerpt", "category", "author_name", "image_url", "source_url", "source_name", "image_credit"] as const) {
    assert.match(rule(field), new RegExp(`'max:${newsLimits[field]}'`), field)
  }
  assert.match(rule("source_url"), /'url:https'/)
  assert.match(rule("status"), new RegExp(`Rule::in\\(\\[${newsStatuses.map((value) => `'${value}'`).join(", ")}\\]\\)`))
  assert.match(rule("region"), new RegExp(`Rule::in\\(\\[${newsRegions.map((value) => `'${value}'`).join(", ")}\\]\\)`))
  assert.match(rule("companies"), new RegExp(`'max:${newsLimits.companies.count}'`))
  assert.match(rule("companies\\.\\*"), new RegExp(`'max:${newsLimits.companies.each}', 'distinct'`))
  assert.match(rule("tags\\.\\*"), new RegExp(`'max:${newsLimits.tags.each}'`))
  assert.match(rule("key_facts"), new RegExp(`'max:${newsLimits.key_facts.count}'`))
  assert.match(rule("key_facts\\.\\*"), new RegExp(`'max:${newsLimits.key_facts.each}'`))
  assert.doesNotMatch(rules, /'translations'/, "the form must not overwrite the Arabic translations")
  assert.match(publicApi, /where\('status', 'published'\)->where\('is_public', true\)/)
  assert.match(publicApi, /orWhere\('published_at', '<=', now\(\)\)/)
})

test("invalid values are caught before sending, in the admin's language", () => {
  const form = {
    ...toNewsForm(stored),
    title: " ",
    source_url: "http://example.com/story",
    image_url: "example.com/image.png",
    status: "live",
    companies: "Example, Sample, Example",
    key_facts: Array.from({ length: 9 }, (_, index) => `Fact ${index}`).join("\n"),
    published_at: "2026-13-40T99:00",
  }
  const en = validateNewsForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), ["companies", "image_url", "key_facts", "published_at", "source_url", "status", "title"])
  assert.equal(en.source_url, "The source URL must start with https://")
  assert.equal(en.companies, "“Example” is listed twice.")
  assert.equal(en.key_facts, "Use at most 8.")
  assert.match(validateNewsForm("ar", form).title ?? "", arabic)
  assert.deepEqual(validateNewsForm("en", toNewsForm(stored)), {})
  assert.deepEqual(validateNewsForm("en", { ...toNewsForm(), title: "New", excerpt: "Summary", category: "Funding" }), {})
  assert.ok(validateNewsForm("en", { ...toNewsForm(stored), tags: "a".repeat(51) }).tags)
  assert.ok(validateNewsForm("en", { ...toNewsForm(stored), excerpt: "a".repeat(1001) }).excerpt)
  // Laravel counts characters: 99 letters and one emoji is 100.
  assert.equal(validateNewsForm("en", { ...toNewsForm(stored), category: "a".repeat(99) + "🚀" }).category, undefined)
})

test("publish times are entered in Riyadh time and saved in UTC without moving", () => {
  assert.equal(toRiyadhInput(stored.published_at), "2026-11-14T09:00")
  assert.equal(fromRiyadhInput("2026-11-14T09:00"), "2026-11-14T06:00:00.000Z")
  assert.equal(toRiyadhInput(null), "")
  assert.equal(fromRiyadhInput(""), null)
  const payload = newsPayload(toNewsForm(stored))
  assert.equal(new Date(payload.published_at ?? "").getTime(), new Date(stored.published_at ?? "").getTime())
  assert.equal(newsPublishTime("en", stored.published_at), "14 Nov 2026, 09:00")
  assert.match(newsPublishTime("ar", stored.published_at) ?? "", /^14 .+ 2026/)
  assert.equal(newsPublishTime("en", null), null)
})

test("saving keeps every stored value and sends blanks as null", () => {
  const payload = newsPayload(toNewsForm(stored))
  assert.deepEqual(payload.tags, ["seed", "fintech"])
  assert.deepEqual(payload.companies, ["Example"])
  assert.deepEqual(payload.key_facts, ["Seed round", "Riyadh"])
  assert.equal(payload.region, "saudi")
  assert.equal(payload.content, null)
  assert.equal(payload.image_url, null)
  assert.equal(payload.is_public, true)
  assert.ok(!("translations" in payload))
  assert.deepEqual(splitList("Riyadh, Jeddah,"), ["Riyadh", "Jeddah"])
  // A stored tag or company containing a comma survives an unrelated edit unchanged.
  const lists = { ...stored, tags: ["تقنية، مالية", "seed"], companies: ["Example, Inc."] }
  const kept = newsPayload({ ...toNewsForm(lists), title: "Edited title" }, lists)
  assert.deepEqual(kept.tags, ["تقنية، مالية", "seed"])
  assert.deepEqual(kept.companies, ["Example, Inc."])
  assert.deepEqual(validateNewsForm("en", toNewsForm(lists), lists), {})
  assert.deepEqual(listValue("seed, fintech", ["seed"]), ["seed", "fintech"])
  assert.deepEqual(listValue("", null), [])
  const blank = newsPayload({ ...toNewsForm(), title: " New ", region: "", published_at: "" })
  assert.equal(blank.title, "New")
  assert.equal(blank.region, null)
  assert.equal(blank.published_at, null)
  assert.equal(blank.status, "draft")
})

test("labels, scheduling and API errors", () => {
  assert.equal(newsStatusLabel("ar", "published"), "منشور")
  assert.equal(newsStatusLabel("en", "legacy"), "legacy")
  const now = new Date("2026-11-14T05:00:00Z").getTime()
  assert.equal(isScheduled(stored, now), true)
  assert.equal(isScheduled(stored, now + 2 * 60 * 60 * 1000), false)
  assert.equal(isScheduled({ ...stored, status: "draft" }, now), false)
  assert.deepEqual(newsFieldErrors("en", { source_url: ["The source url has already been taken."], "companies.1": ["x"], slug: ["taken"] }), {
    source_url: "Another story already uses this link.",
    companies: "The server did not accept this value.",
  })
  assert.deepEqual(newsFieldErrors("en", undefined), {})
  assert.equal(newsFieldId("source_url"), "news-source-url")
})
