import test from "node:test"
import assert from "node:assert/strict"
import { readPublicNews, readSitemapRecords } from "./public-records"
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
  const request = (async () => { calls++; return Response.json({ data: [{ slug: `story-${calls}` }, { slug: "duplicate" }, { slug: "../admin" }], meta: { last_page: 2 } }) }) as typeof fetch
  assert.deepEqual((await readSitemapRecords("news", api, request)).map(item => item.slug), ["story-1", "duplicate", "story-2"])
  assert.equal(calls, 2)
  assert.deepEqual(await readSitemapRecords("news", api, response({}, 503)), [])
})
