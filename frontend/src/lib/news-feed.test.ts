import test from "node:test"
import assert from "node:assert/strict"
import { relatedNews, curatedNews, mergeNews, companyMatches, companyAliases, newsFounders, safeNewsUrl, newsDate } from "./news-feed"
import { getLocalizedNewsContent } from "./news-content"
import type { NewsItem } from "../types"

const story: NewsItem = { id: "n1", slug: "real-story", title: "Real reporting", excerpt: "Real details", content: "First paragraph.\n\nSecond paragraph.", category: "Funding", publishedAt: "2026-09-01", author: "Publisher", tags: [], companies: ["Foodics"] }

test("published content is never replaced with legacy invented demo news", () => {
  const localized = getLocalizedNewsContent(story, "ar")
  assert.equal(localized.title, story.title)
  assert.deepEqual(localized.body, ["First paragraph.", "Second paragraph."])
})

test("source merge deduplicates, prefers live corrections and sorts by publication", () => {
  const sourceUrl = "https://www.wamda.com/example"
  const snapshot = { ...story, sourceUrl }
  const correction = { ...snapshot, id: "100", title: "Corrected reporting" }
  const older = { ...story, slug: "older", publishedAt: "2025-01-01" }
  assert.deepEqual(mergeNews([correction, older], [snapshot]).map(item => item.title), ["Corrected reporting", "Real reporting"])
})

test("RSS duplicates preserve the independent brief and its offline-readable route", () => {
  const snapshot = { ...story, sourceUrl: "https://www.microsoft.com/story" }
  const rss = { ...snapshot, slug: "rss-generated-hash", content: "", excerpt: "Publisher excerpt" }
  assert.deepEqual(mergeNews([rss], [snapshot]), [snapshot])
})

test("profile news uses exact company associations, not incidental mentions", () => {
  assert.equal(companyMatches(story, ["foodics"]), true)
  assert.equal(companyMatches(story, ["Food"]), false)
  assert.equal(companyMatches({ ...story, companies: [] }, ["Real reporting"]), false)
  assert.equal(companyMatches({ ...story, companies: [], tags: ["Foodics"] }, ["foodics"]), true)
  assert.equal(newsFounders(story)[0]?.slug, "foodics")
  assert.ok(companyAliases(["فودكس", "foodics"]).includes("Foodics"))
})

test("external news URLs reject executable, insecure and credentialed links", () => {
  for (const value of ["javascript:alert(1)", "http://example.com", "//example.com", `https://${"reader"}@example.com`]) assert.equal(safeNewsUrl(value), undefined)
  assert.equal(safeNewsUrl("https://www.wamda.com/story"), "https://www.wamda.com/story")
  assert.equal(newsDate("", "en"), "Date unavailable")
})

test("curated newsroom has unique, dated, sourced stories with credited images when present", () => {
  assert.ok(curatedNews.length >= 30)
  assert.equal(new Set(curatedNews.map(item => item.slug)).size, curatedNews.length)
  assert.equal(new Set(curatedNews.map(item => item.sourceUrl)).size, curatedNews.length)
  for (const item of curatedNews) {
    assert.ok(safeNewsUrl(item.sourceUrl))
    // Stories without a verified publisher image render a branded source tile instead.
    if (item.imageUrl) assert.ok((safeNewsUrl(item.imageUrl) || item.imageUrl.startsWith("/")) && item.imageCredit, item.slug)
    assert.ok(item.sourceName && item.content && item.translations?.ar.body.length)
    assert.ok(Date.parse(item.publishedAt) <= Date.parse("2026-10-12T23:59:59Z"))
  }
})

test("Saudi and GCC coverage carries region, key facts and Arabic key facts", () => {
  const regional = curatedNews.filter(item => item.region && item.region !== "global")
  assert.ok(regional.filter(item => item.region === "saudi").length >= 8)
  for (const item of regional) {
    assert.ok((item.keyFacts?.length ?? 0) >= 3, item.slug)
    assert.equal(item.translations?.ar.keyFacts?.length, item.keyFacts?.length, item.slug)
  }
})

test("related news prefers the same company, then the same region", () => {
  const barq = curatedNews.find(item => item.slug === "barq-329-million-series-a-unicorn")!
  const related = relatedNews(barq, curatedNews)
  assert.ok(related.length > 0)
  assert.ok(related.every(item => item.slug !== barq.slug))
  assert.ok(related[0].companies?.includes("Barq"))
})
