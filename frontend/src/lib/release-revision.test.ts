import assert from "node:assert/strict"
import test from "node:test"

import { getFrontendReleaseRevision, normalizeReleaseRevision } from "./release-revision"

test("normalizes only Git-shaped release revisions", () => {
  assert.equal(normalizeReleaseRevision(" ABCDEF1234567 "), "abcdef1234567")
  assert.equal(normalizeReleaseRevision("abcdef"), null)
  assert.equal(normalizeReleaseRevision("release-main"), null)
  assert.equal(normalizeReleaseRevision(undefined), null)
})

test("prefers the explicit Hostinger build revision and falls back to GitHub SHA", () => {
  assert.equal(
    getFrontendReleaseRevision({ WOSOOL_BUILD_REVISION: "ABCDEF1234567", GITHUB_SHA: "1234567890abcdef" }),
    "abcdef1234567",
  )
  assert.equal(
    getFrontendReleaseRevision({ WOSOOL_BUILD_REVISION: "", GITHUB_SHA: "1234567890ABCDEF" }),
    "1234567890abcdef",
  )
})

test("does not replace an explicitly malformed revision with another environment value", () => {
  assert.equal(
    getFrontendReleaseRevision({ WOSOOL_BUILD_REVISION: "not-a-sha", GITHUB_SHA: "1234567890abcdef" }),
    null,
  )
})
