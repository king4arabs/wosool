import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const page = readFileSync(new URL("../app/newsletter/page.tsx", import.meta.url), "utf8")

// useSearchParams() makes Next.js render a Suspense boundary's fallback on the server. When the
// whole page sat inside that boundary, /newsletter reached crawlers and slow connections as "…"
// with no layout or <h1> (QA crawl: "no <h1> in server HTML").
test("the newsletter page renders its layout and heading outside the Suspense boundary", () => {
  const exported = page.slice(page.indexOf("export default function NewsletterPage"))
  assert.ok(exported.length < page.length, "default export not found")
  const heading = exported.indexOf("<h1")
  const layout = exported.indexOf("<PublicLayout")
  const boundary = exported.indexOf("<Suspense")
  assert.ok(layout >= 0 && heading > layout, "the page component must render PublicLayout and the <h1>")
  assert.ok(boundary > heading, "the <h1> must come before the Suspense boundary")
  assert.doesNotMatch(exported.slice(boundary), /<h1/, "the heading must not depend on the search params")
})

test("the search-params component no longer renders the page layout", () => {
  const action = page.slice(page.indexOf("function NewsletterAction"), page.indexOf("export default function NewsletterPage"))
  assert.match(action, /useSearchParams\(\)/)
  assert.doesNotMatch(action, /<PublicLayout|<h1/)
})
