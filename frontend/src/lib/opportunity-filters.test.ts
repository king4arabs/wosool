import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { opportunityCatalog } from "./opportunity-catalog"
import { matchesOpportunitySearch, nextRailPosition } from "./opportunity-filters"

const row = (slug: string) => {
  const found = opportunityCatalog.find(item => item.slug === slug)
  assert.ok(found, slug)
  return found
}
const directory = readFileSync(new URL("../components/accelerator/OpportunityDirectory.tsx", import.meta.url), "utf8")

test("search words need not be adjacent: the provider name and a title word together", () => {
  assert.equal(matchesOpportunitySearch(row("stv-ai-fund"), "stv ai", "en"), true)
  assert.equal(matchesOpportunitySearch(row("stv-ai-fund"), "stv gaming", "en"), false)
})

test("Arabic search folds shadda and hamza variants", () => {
  assert.equal(matchesOpportunitySearch(row("impact46-gaming"), "مول مستقبل الالعاب", "ar"), true)
  assert.equal(matchesOpportunitySearch(row("merak"), "افتح افق", "ar"), true)
})

test("apostrophes in provider names are optional", () => {
  assert.equal(matchesOpportunitySearch(row("waed"), "waed", "en"), true)
  assert.equal(matchesOpportunitySearch(row("waed"), "wa'ed", "en"), true)
})

test("the group name finds cards in that group, in either language", () => {
  const vc = row("raed")
  assert.equal(matchesOpportunitySearch(vc, "vc", "en", ["تواصل مع المستثمرين", "VC connections"]), true)
  assert.equal(matchesOpportunitySearch(vc, "المستثمرين", "ar", ["تواصل مع المستثمرين", "VC connections"]), true)
  assert.equal(matchesOpportunitySearch(vc, "", "en"), true)
})

test("the rail auto-scrolls in reading direction and returns to the start at the end", () => {
  assert.deepEqual(nextRailPosition(0, 500, 2, false), { left: 2, wrapped: false })
  assert.deepEqual(nextRailPosition(0, 500, 2, true), { left: -2, wrapped: false })
  assert.deepEqual(nextRailPosition(499.5, 500, 2, false), { left: 0, wrapped: true })
  assert.deepEqual(nextRailPosition(-499.5, 500, 2, true), { left: 0, wrapped: true })
  assert.deepEqual(nextRailPosition(0, 0, 2, false), { left: 0, wrapped: false })
})

test("the opportunities rail follows the page language instead of always running right to left", () => {
  assert.doesNotMatch(directory, /dir="rtl"/)
  assert.match(directory, /className=\{styles\.rail\}\s+dir=\{ar \? "rtl" : "ltr"\}/)
  assert.match(directory, /matchesOpportunitySearch\(/)
  assert.doesNotMatch(directory, /\.toLowerCase\(\)\s*\.includes\(search/)
})
