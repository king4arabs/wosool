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
    assert.ok(Date.parse(item.publishedAt) <= Date.now())
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

test("Saudi Endeavor and TalMal sourced briefs preserve real dates and Arabic facts", () => {
  for (const [slug, date] of [
    ["endeavor-saudi-entrepreneurs-2025-revenue-october-2026", "2026-10-30"],
    ["talmal-saudi-preseed-september-2026", "2026-09-21"],
  ]) {
    const item = curatedNews.find(story => story.slug === slug)!
    assert.ok(item, slug)
    assert.equal(item.region, "saudi")
    assert.equal(item.publishedAt, date)
    assert.equal(item.keyFacts?.length, item.translations?.ar.keyFacts?.length)
    assert.ok(item.translations?.ar.body.length)
    assert.ok(safeNewsUrl(item.sourceUrl))
    assert.equal(item.imageUrl, "")
  }
})

test("3 November sourced briefs preserve verified publication dates, bilingual facts and image rights", () => {
  for (const [slug, date, region] of [
    ["pif-aramco-humain-transaction-november-2026", "2026-11-01", "saudi"],
    ["mozn-humain-strategic-investment-august-2026", "2026-08-03", "saudi"],
    ["1001-sovereign-ai-series-a-june-2026", "2026-06-30", "gcc"],
  ] as const) {
    const item = curatedNews.find(story => story.slug === slug)!
    assert.ok(item, slug)
    assert.equal(item.publishedAt, date)
    assert.equal(item.region, region)
    assert.equal(item.keyFacts?.length, 3)
    assert.equal(item.translations?.ar.keyFacts?.length, 3)
    assert.ok(item.translations?.ar.body.length)
    assert.ok(safeNewsUrl(item.sourceUrl))
    assert.equal(item.imageUrl, "")
  }
})

test('2 November verified stories retain dated Arabic and English facts without process copy', () => {
  for (const [slug, date] of [
    ['erad-22m-series-a-september-2026', '2026-09-28'],
    ['tracxn-uae-tech-nine-months-2026', '2026-10-30'],
    ['solink-over-100m-funding-october-2026', '2026-10-29'],
    ['abwab-ai-four-million-seed-september-2026', '2026-09-21'],
  ]) {
    const item = curatedNews.find(story => story.slug === slug)!
    assert.ok(item, slug)
    assert.equal(item.publishedAt, date)
    assert.ok(safeNewsUrl(item.sourceUrl))
    assert.equal(item.imageUrl, '')
    assert.equal(item.keyFacts?.length, 3)
    assert.equal(item.translations?.ar.keyFacts?.length, 3)
    assert.ok(item.content && item.translations?.ar.body[0])
  }
  const endeavor = curatedNews.find(story => story.slug === 'endeavor-saudi-entrepreneurs-2025-revenue-october-2026')!
  assert.ok(endeavor)
  assert.doesNotMatch(endeavor.content, /Wosool (?:revenue|membership)/)
  assert.doesNotMatch(endeavor.translations!.ar.body.join(' '), /إيرادات «وصول»|أرقام عضويتها/)
})

test('4 November sourced briefs retain real dates, Arabic facts and licensed-image safeguards', () => {
  for (const [slug, date, region] of [
    ['aya-seven-million-series-a-april-2026', '2026-04-16', 'saudi'],
    ['sheraa-nestle-nextgen-founders-october-2026', '2026-10-29', 'gcc'],
    ['percent-labs-syria-seed-undisclosed-november-2026', '2026-11-02', 'mena'],
  ] as const) {
    const item = curatedNews.find(story => story.slug === slug)!
    assert.ok(item, slug)
    assert.equal(item.publishedAt, date)
    assert.equal(item.region, region)
    assert.equal(item.imageUrl, '')
    assert.equal(item.keyFacts?.length, 3)
    assert.equal(item.translations?.ar.keyFacts?.length, 3)
    assert.ok(safeNewsUrl(item.sourceUrl))
    assert.ok(item.translations?.ar.body[0]?.length)
  }
})

test('RABEH sourced stories link to its founder without implying membership', () => {
  const articles = curatedNews.filter(item => item.companies?.includes('RABEH Financial'))
  assert.equal(articles.length, 3)
  for (const item of articles) {
    assert.equal(item.region, 'saudi')
    assert.equal(item.imageUrl, '/startup-directory/rabeh-logo.webp')
    assert.equal(item.imageCredit, 'RABEH')
    assert.equal(item.keyFacts?.length, item.translations?.ar.keyFacts?.length)
    assert.equal(newsFounders(item).some(founder => founder.slug === 'mohammed-alsolami-rabeh'), true)
  }
  assert.deepEqual(articles.map(item => item.publishedAt).sort(), ['2024-03-06', '2025-09-17', '2026-09-03'])
})

test('RABEH public briefs do not contain internal membership review notes', () => {
  const award = curatedNews.find(item => item.slug === 'rabeh-wins-moneysurge-seed-award-money2020-september-2025')!
  assert.ok(award)
  assert.doesNotMatch(award.content, /membership in Wosool/i)
  assert.doesNotMatch(award.translations!.ar.body.join(' '), /عضوية وصول/)
})
