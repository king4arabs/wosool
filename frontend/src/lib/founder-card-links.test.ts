import assert from "node:assert/strict"
import { test } from "node:test"
import { exactLinkedFounderCards, founderCardLinks, isFounderProfileEligibleForPublicCard, linkedFounderSlug } from "./founder-card-links"

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

test("founder query values remain exact, decoded and bounded", () => {
  assert.equal(linkedFounderSlug("?founder=founder-one"), "founder-one")
  assert.equal(linkedFounderSlug("?founder=founder%20two"), "founder two")
  assert.equal(linkedFounderSlug("?other=founder-one"), "")
  assert.equal(linkedFounderSlug("?founder="), "")
  assert.equal(linkedFounderSlug("?founder=" + "a".repeat(256)), "")
})

test("an older API response cannot substitute an unrelated founder for a deep link", () => {
  const items = [{slug: "one"}, {slug: "two"}]
  assert.deepEqual(exactLinkedFounderCards(items, "two"), [{slug: "two"}])
  assert.deepEqual(exactLinkedFounderCards(items, "missing"), [])
  assert.deepEqual(exactLinkedFounderCards(items, ""), items)
})
