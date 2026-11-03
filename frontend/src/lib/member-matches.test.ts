import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  founderMeta,
  joinList,
  listItems,
  matchCounterpart,
  matchReasons,
  matchStatusLabel,
  memberMatchesCopy,
  profileHref,
  splitMatches,
  type MemberMatch,
} from "./member-matches"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/dashboard/matches/page.tsx", import.meta.url), "utf8")

test("match copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(memberMatchesCopy.ar).sort(), Object.keys(memberMatchesCopy.en).sort())
  for (const [key, value] of Object.entries(memberMatchesCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(memberMatchesCopy.en)) assert.doesNotMatch(value, arabic, key)
})

test("the matches page follows the member's language and direction", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, /dir="rtl"/)
  assert.doesNotMatch(page, /\btext-(left|right)\b/)
  assert.match(page, /memberMatches\(locale\)/)
  assert.match(page, /<bdi>\{part\}<\/bdi>/, "mixed-script meta parts are isolated")
})

test("the page shows no availability, needs or location that the founder did not provide", () => {
  for (const invented of [/this week|هذا الأسبوع/, /المملكة العربية السعودية/, /شركة ناشئة/, /تعاونات استراتيجية/, /\.slice\(0, 1\)/, /\?\? 3\)/]) {
    assert.doesNotMatch(page, invented)
  }
  assert.match(page, /\/member\/matches\/\$\{id\}\/\$\{action\}/, "decline is wired to the API")
  assert.match(page, /profile_required/)
})

test("meta line uses the API's location field and skips empty values", () => {
  assert.deepEqual(founderMeta("en", { id: 1, sector: "Fintech", stage: "seed", location: "Riyadh" }), ["Fintech", "Seed", "Riyadh"])
  assert.deepEqual(founderMeta("ar", { id: 1, stage: "series-a" }), ["السلسلة A"])
  assert.deepEqual(founderMeta("en", { id: 1, sector: "  ", location: null }), [])
  assert.deepEqual(founderMeta("en", undefined), [])
})

test("lists keep only real entries and join in the reader's language", () => {
  assert.deepEqual(listItems([" Hiring ", "", "Fundraising"]), ["Hiring", "Fundraising"])
  assert.deepEqual(listItems(null), [])
  assert.equal(matchReasons("ar", ["خبرة في المدفوعات", "نفس السوق"]), "خبرة في المدفوعات، نفس السوق")
  assert.equal(matchReasons("en", ["Payments", " "]), "Payments")
  assert.equal(joinList("ar", ["توظيف", "تمويل"]), "توظيف، تمويل")
  assert.equal(joinList("en", ["Hiring", "Fundraising"]), "Hiring, Fundraising")
})

test("every requested or connected introduction is listed with its real status", () => {
  const matches = [
    { id: 1, status: "suggested" },
    { id: 2, status: "accepted" },
    { id: 3, status: "connected" },
    { id: 4, status: "declined" },
  ].map((row) => ({ ...row, match_score: 80, match_reasons: [] })) as MemberMatch[]
  const { active, suggested } = splitMatches(matches)
  assert.deepEqual(active.map((m) => m.id), [2, 3])
  assert.deepEqual(suggested.map((m) => m.id), [1])
  assert.equal(matchStatusLabel("en", "accepted"), "Waiting for their reply")
  assert.equal(matchStatusLabel("en", "connected"), "Introduced")
})

test("counterpart is the other member, and private profiles are not linked", () => {
  const match = {
    id: 1, match_score: 90, match_reasons: [], status: "suggested",
    founder_a: { id: 10, user: { id: 5 }, name: "A" },
    founder_b: { id: 11, user: { id: 6 }, name: "B", slug: "b", is_public: false },
  } as MemberMatch
  assert.equal(matchCounterpart(match, 5)?.name, "B")
  assert.equal(matchCounterpart(match, 6)?.name, "A")
  assert.equal(profileHref(match.founder_b), null)
  assert.equal(profileHref({ id: 2, slug: "nora", is_public: true }), "/founders/nora")
})
