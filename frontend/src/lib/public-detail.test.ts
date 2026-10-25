import assert from "node:assert/strict"
import test from "node:test"
import { readPublicDetail, detailMetadata } from "./public-detail"
import { breadcrumbData, jsonLd, pageMetadata } from "./seo"
const origin = "https://api.example.test"
const event = { id: 1, slug: "growth-session", title: "جلسة نمو", starts_at: "2027-01-01T15:00:00Z", is_public: true, visibility: "public", status_flow: "published", description: "وصف عام" }
const response = (data: unknown, status = 200) => (async () => Response.json({ data }, { status })) as typeof fetch

test("public details render only allowed anonymous fields", async () => {
  const request = (async (url, options) => {
    assert.equal(url, `${origin}/api/v1/events/growth-session`)
    assert.equal(options?.credentials, "omit")
    assert.equal(options?.cache, "no-store")
    assert.equal(options?.redirect, "error")
    return Response.json({ data: { ...event, invites: ["private@example.test"], online_meeting_url: "SECRET", settings: { password: "SECRET" } } })
  }) as typeof fetch
  const result = await readPublicDetail("events", event.slug, origin, request)
  assert.equal(result.item?.title, event.title)
  assert.doesNotMatch(JSON.stringify(result), /SECRET|private@example|invites|settings/)
  assert.equal(detailMetadata(result, `/events/${event.slug}`, "Events").alternates?.canonical, `/events/${event.slug}`)
})

test("missing pages return a missing signal; outages fail closed without becoming permanent 404s", async () => {
  for (const status of [401, 403, 404, 410]) assert.equal((await readPublicDetail("events", event.slug, origin, response(event, status))).missing, true)
  for (const status of [429, 500, 503]) {
    const result = await readPublicDetail("events", event.slug, origin, response(event, status))
    assert.deepEqual(result, { item: null, missing: false })
    assert.deepEqual(detailMetadata(result, "/events/test", "Events").robots, { index: false, follow: true, googleBot: { index: false, follow: true } })
  }
  assert.equal((await readPublicDetail("events", event.slug, origin, response({ ...event, slug: "another" }))).item, null)
})

test("private events and draft/member-only programs cannot enter search snippets", async () => {
  for (const data of [{ ...event, is_public: false }, { ...event, visibility: "invite_only" }, { ...event, status_flow: "draft" }]) {
    assert.equal((await readPublicDetail("events", event.slug, origin, response(data))).item, null)
  }
  for (const data of [{ ...event, visibility: "members_only" }, { ...event, status_flow: "draft" }]) {
    assert.equal((await readPublicDetail("programs", event.slug, origin, response(data))).item, null)
  }
  assert.ok((await readPublicDetail("programs", event.slug, origin, response({ ...event, status_flow: "active" }))).item)
})

test("ecosystem metadata uses published Arabic content and rejects archived records", async () => {
  const record = { id: 1, slug: "fund", name_ar: "صندوق", description_ar: "فرصة", verification_status: "verified", editorial_lock: true }
  const result = await readPublicDetail("ecosystem", "fund", origin, response(record))
  assert.equal(result.item?.title, record.name_ar)
  assert.equal(result.item?.description, record.description_ar)
  assert.doesNotMatch(JSON.stringify(result), /editorial_lock/)
  assert.equal((await readPublicDetail("ecosystem", "fund", origin, response({ ...record, verification_status: "archived" }))).missing, true)
})

test("unsafe slugs never cause requests", async () => {
  const request = (async () => { throw new Error("must not fetch") }) as typeof fetch
  for (const slug of ["../admin", "", "https://other.test", "x?private=true"]) assert.equal((await readPublicDetail("events", slug, origin, request)).missing, true)
})

test("metadata uses raster previews, self canonicals and escaped structured data", () => {
  const metadata = pageMetadata("Title", "Description", "/events/test")
  assert.equal(metadata.openGraph?.url, "/events/test")
  assert.match(JSON.stringify(metadata.twitter), /opengraph-image/)
  const crumbs = breadcrumbData([{ name: "Home", path: "/" }, { name: "</script><script>alert(1)</script>", path: "/events/test" }], "https://wosool.org")
  const encoded = jsonLd(crumbs)
  assert.doesNotMatch(encoded, /<\/script>/)
  assert.deepEqual(JSON.parse(encoded), crumbs)
  assert.equal(crumbs.itemListElement[1].item, "https://wosool.org/events/test")
})
