import test from "node:test"
import assert from "node:assert/strict"
import { readPublicNews, readSitemapRecords, sitemapDate, isIndexableRecord } from "./public-records"
import { curatedNews } from "./news-feed"
const api = "https://api.example.test"
const response = (body: unknown, status = 200) => (async () => Response.json(body, { status })) as typeof fetch

test("unpublished or withdrawn stories never reappear from the snapshot", async () => {
  const slug = curatedNews[0].slug
  for (const status of [401, 403, 404, 410]) {
    assert.deepEqual(await readPublicNews(slug, api, response({}, status)), { item: null, unavailable: false })
  }
  for (const data of [{ slug, status: "draft", is_public: true }, { slug, status: "published", is_public: false }]) {
    assert.equal((await readPublicNews(slug, api, response({ data }))).item, null)
  }
})
test("outage snapshots are explicitly unavailable; unknown slugs do not invent content", async () => {
  assert.equal((await readPublicNews(curatedNews[0].slug, api, response({}, 503))).unavailable, true)
  assert.equal((await readPublicNews(curatedNews[0].slug, api, response({}, 503))).item?.slug, curatedNews[0].slug)
  assert.equal((await readPublicNews("unknown-story", api, response({}, 503))).item, null)
})
test("sitemap paginates live records, deduplicates and rejects unsafe route segments", async () => {
  let calls = 0
  const request = (async () => { calls++; return Response.json({ data: [`story-${calls}`, "duplicate", "../admin"].map(slug => ({ slug, status: "published", is_public: true, published_at: "2026-01-01" })), meta: { last_page: 2 } }) }) as typeof fetch
  assert.deepEqual((await readSitemapRecords("news", api, request)).map(item => item.slug), ["story-1", "duplicate", "story-2"])
  assert.equal(calls, 2)
  assert.deepEqual(await readSitemapRecords("news", api, response({}, 503)), [])
})


test("sitemap excludes private, draft, scheduled and withdrawn records", async () => {
  const valid = { slug: "public", status: "active", is_public: true, updated_at: "2026-01-01" }
  for (const kind of ["founders", "companies"] as const) {
    const data = [valid, { ...valid, slug: "private", is_public: false }, { ...valid, slug: "inactive", status: "inactive" }, { slug: "missing-state" }, null]
    assert.deepEqual(await readSitemapRecords(kind, api, response({ data })), [{ slug: "public", updated_at: "2026-01-01T00:00:00.000Z" }])
  }
  assert.equal(isIndexableRecord("news", { is_public: true, status: "published", published_at: "2099-01-01" }), false)
  assert.equal(isIndexableRecord("news", { is_public: true, status: "published", published_at: "invalid" }), false)
  assert.equal(isIndexableRecord("programs", { visibility: "members_only", status_flow: "published" }), false)
  assert.equal(isIndexableRecord("programs", { visibility: "public", status_flow: "draft" }), false)
  assert.equal(isIndexableRecord("events", { is_public: true, visibility: "invite_only", status_flow: "published" }), false)
  assert.equal(isIndexableRecord("ecosystem", { verification_status: "archived" }), false)
})

test("sitemap handles ecosystem pagination and never invents modification dates", async () => {
  let calls = 0
  const request = (async (_url, options) => {
    calls++
    assert.equal(options?.credentials, "omit")
    assert.equal(options?.redirect, "error")
    return Response.json({ data: [{ slug: `opportunity-${calls}`, verification_status: "verified", updated_at: "future" }], last_page: 2 })
  }) as typeof fetch
  assert.equal((await readSitemapRecords("ecosystem", api, request)).length, 2)
  for (const value of [undefined, "invalid", "2099-01-01", "2"]) assert.equal(sitemapDate(value), undefined)
  assert.equal(sitemapDate("2026-01-01"), "2026-01-01T00:00:00.000Z")
})
