import test from "node:test"
import assert from "node:assert/strict"
import { publicProfileMetadata } from "./profile-metadata"

const api = "https://api.example.test/"
const founder = { slug: "example-founder", name: "مؤسس تجريبي", bio: "سيرة عامة موثقة.", status: "active", is_public: true }
const response = (data: unknown, status = 200) => (async () => Response.json({ data }, { status })) as typeof fetch

test("founder metadata uses an anonymous fresh public response and explicit canonical", async () => {
  const request = (async (url, options) => {
    assert.equal(url, `${api}api/v1/founders/${founder.slug}`)
    assert.equal(options?.cache, "no-store")
    assert.equal(options?.credentials, "omit")
    assert.equal(options?.redirect, "error")
    assert.ok(options?.signal instanceof AbortSignal)
    assert.deepEqual(options?.headers, { Accept: "application/json", "X-Locale": "ar" })
    return Response.json({ data: { ...founder, user: { email: "private@example.test" }, scorecard: "PRIVATE", activation_status: "unclaimed" } })
  }) as typeof fetch
  const metadata = await publicProfileMetadata("founder", founder.slug, api, request)
  assert.equal(metadata.title, `${founder.name} — ملف المؤسس | Founder profile`)
  assert.equal(metadata.description, founder.bio)
  assert.deepEqual(metadata.alternates, { canonical: `/founders/${founder.slug}` })
  assert.equal(metadata.openGraph?.url, `/founders/${founder.slug}`)
  assert.equal(metadata.robots, undefined)
  assert.doesNotMatch(JSON.stringify(metadata), /private@example|PRIVATE|unclaimed|member|verified/i)
})

test("company metadata uses company endpoint, description and nested route", async () => {
  const request = (async (url) => {
    assert.equal(url, `${api}api/v1/companies/example-company`)
    return Response.json({ data: { ...founder, slug: "example-company", name: "شركة تجريبية", description: "وصف الشركة.", bio: "not a company description" } })
  }) as typeof fetch
  const metadata = await publicProfileMetadata("company", "example-company", api, request)
  assert.equal(metadata.description, "وصف الشركة.")
  assert.equal(metadata.alternates?.canonical, "/founders/companies/example-company")
  assert.equal(metadata.openGraph?.url, "/founders/companies/example-company")
})

test("denied, missing, withdrawn and failed responses never expose snapshot metadata", async () => {
  for (const kind of ["founder", "company"] as const) {
    for (const status of [401, 403, 404, 410, 429, 500, 503]) {
      const metadata = await publicProfileMetadata(kind, founder.slug, api, response(founder, status))
      assert.deepEqual(metadata.robots, { index: false, follow: true, googleBot: { index: false, follow: true } })
      assert.doesNotMatch(JSON.stringify(metadata), /مؤسس تجريبي|سيرة عامة/)
    }
  }
})

test("only matching active public records with a name can be indexed", async () => {
  for (const data of [null, [], {}, { ...founder, slug: "another-founder" }, { ...founder, status: "suspended" }, { ...founder, is_public: false }, { ...founder, is_public: "true" }, { ...founder, name: " " }]) {
    const metadata = await publicProfileMetadata("founder", founder.slug, api, response(data))
    assert.ok(metadata.robots)
    assert.doesNotMatch(JSON.stringify(metadata), /سيرة عامة/)
  }
})

test("network errors, malformed JSON and unsafe slugs fail closed", async () => {
  for (const request of [async () => { throw new Error("timeout") }, async () => new Response("not json")]) {
    assert.ok((await publicProfileMetadata("founder", founder.slug, api, request as typeof fetch)).robots)
  }
  let called = false
  const request = (async () => { called = true; return Response.json({ data: founder }) }) as typeof fetch
  for (const slug of ["../admin", "", "https://example.test", "name?private=true"]) {
    assert.ok((await publicProfileMetadata("founder", slug, api, request)).robots)
  }
  assert.equal(called, false)
})

test("summaries are bounded plain text; empty bios use tagline without membership claims", async () => {
  const metadata = await publicProfileMetadata("founder", founder.slug, api, response({ ...founder, bio: ` <p>${"a".repeat(200)}</p>` }))
  assert.equal(metadata.description, "a".repeat(160))
  const fallback = await publicProfileMetadata("founder", founder.slug, api, response({ ...founder, bio: null, tagline: "  وصف\n مختصر  " }))
  assert.equal(fallback.description, "وصف مختصر")
  const unnamed = await publicProfileMetadata("company", founder.slug, api, response({ ...founder, description: null }))
  assert.equal(unnamed.description, `${founder.name} — ملف الشركة | Company profile`)
})
