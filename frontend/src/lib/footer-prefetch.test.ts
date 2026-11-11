import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const footerSource = readFileSync(
  new URL("../components/layout/Footer.tsx", import.meta.url),
  "utf8",
)

test("footer links do not start speculative route requests when the footer enters view", () => {
  const linkTags = footerSource.match(/<Link\b[^>]*>/g) ?? []

  assert.ok(linkTags.length > 0, "The footer must retain its internal navigation")
  assert.ok(
    linkTags.every((tag) => tag.includes("prefetch={false}")),
    `Every footer Link must opt out of prefetching:\n${linkTags.filter((tag) => !tag.includes("prefetch={false}")).join("\n")}`,
  )
})
