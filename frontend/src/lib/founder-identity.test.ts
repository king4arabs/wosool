import assert from "node:assert/strict"
import { test } from "node:test"
import { mapFounder, type ApiFounder } from "./content-api"
import { parseScorecard } from "../types/platform"

test("one opaque founder ID maps to the public profile and private scorecard", () => {
  const founder: ApiFounder = {
    id: 9,
    founder_uid: "cbf595ea-22e8-49a5-ae16-cd42a1f79aaf",
    slug: "example-founder",
    name: "Example Founder",
    is_verified: false,
    is_featured: false,
    companies: [],
  }
  const mapped = mapFounder(founder)
  assert.equal(mapped.founderUid, founder.founder_uid)
  assert.equal(mapped.id, "9")
  const scorecard = parseScorecard({
    id: 7, founder_profile_id: founder.id, founder_uid: founder.founder_uid, aggregate_score: 0, tracking: {},
  })
  assert.equal(scorecard?.founder_uid, mapped.founderUid)
  assert.equal(scorecard?.founder_profile_id, founder.id)
})

test("older editorial snapshots without an opaque ID still render safely", () => {
  const founder: ApiFounder = {
    id: 10, slug: "editorial-founder", name: "Editorial Founder", is_verified: false, is_featured: false,
  }
  assert.equal(mapFounder(founder).founderUid, undefined)
  assert.equal(parseScorecard({id: 2, founder_profile_id: 10, tracking: {}})?.founder_uid, null)
})
