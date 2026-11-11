import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const footerSource = readFileSync(
  new URL("../components/layout/Footer.tsx", import.meta.url),
  "utf8",
)
const eoaContentSource = readFileSync(
  new URL("../components/eoa/Content.tsx", import.meta.url),
  "utf8",
)

function linkTags(source: string) {
  return source.match(/<Link\b[^>]*>/g) ?? []
}

test("footer links do not start speculative route requests when the footer enters view", () => {
  const tags = linkTags(footerSource)

  assert.ok(tags.length > 0, "The footer must retain its internal navigation")
  assert.ok(
    tags.every((tag) => tag.includes("prefetch={false}")),
    `Every footer Link must opt out of prefetching:\n${tags.filter((tag) => !tag.includes("prefetch={false}")).join("\n")}`,
  )
})

test("EOA useful links do not prefetch routes during responsive layout checks", () => {
  const sourceFooter = eoaContentSource.match(/<footer className="eoa-source">([\s\S]*?)<\/footer>/)?.[1] ?? ""
  const tags = linkTags(sourceFooter)

  assert.equal(tags.length, 4, "The EOA source footer must retain its four internal links")
  assert.ok(
    tags.every((tag) => tag.includes("prefetch={false}")),
    `Every EOA source-footer Link must opt out of prefetching:\n${tags.filter((tag) => !tag.includes("prefetch={false}")).join("\n")}`,
  )
})
