import assert from "node:assert/strict"
import { test } from "node:test"
import { founderCardLinks, isFounderProfileEligibleForPublicCard } from "./founder-card-links"

test("a founder card deep link uses the same slug on home, directory and detail pages", () => {
  assert.deepEqual(founderCardLinks("founder-one"), {
    home: "/?founder=founder-one#founder-community",
    directory: "/founders?founder=founder-one#founder-directory",
    profile: "/founders/founder-one",
  })
  assert.equal(founderCardLinks("name with spaces").directory, "/founders?founder=name%20with%20spaces#founder-directory")
})

test("only claimed, active and public profiles can advertise a public card", () => {
  const claimed = { slug: "founder-one", status: "active", is_public: true, activation_status: "active" as const }
  assert.equal(isFounderProfileEligibleForPublicCard(claimed), true)
  assert.equal(isFounderProfileEligibleForPublicCard({ ...claimed, is_public: false }), false)
  assert.equal(isFounderProfileEligibleForPublicCard({ ...claimed, status: "suspended" }), false)
  assert.equal(isFounderProfileEligibleForPublicCard({ ...claimed, activation_status: "unclaimed" }), false)
  assert.equal(isFounderProfileEligibleForPublicCard(null), false)
})
