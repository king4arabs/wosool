import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  applicationTone,
  memberProgramsCopy,
  nextSessionLine,
  programCategory,
  programDate,
  programStatusLabel,
  programTitle,
  progressValue,
} from "./member-programs"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/dashboard/programs/page.tsx", import.meta.url), "utf8")

function flatten(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]]
  return Object.entries(value as Record<string, unknown>).flatMap(([key, inner]) => flatten(inner, prefix ? `${prefix}.${key}` : key))
}

test("member programs copy has the same keys in Arabic and English, each in its own language", () => {
  const ar = flatten(memberProgramsCopy.ar)
  const en = flatten(memberProgramsCopy.en)
  assert.deepEqual(ar.map(([key]) => key).sort(), en.map(([key]) => key).sort())
  for (const [key, value] of ar) assert.match(value, arabic, key)
  for (const [key, value] of en) assert.doesNotMatch(value, arabic, key)
})

test("the programs page renders from the dictionary and follows the member's language", () => {
  assert.doesNotMatch(page, arabic, "the page still has fixed Arabic text")
  assert.match(page, /memberPrograms\(locale\)/)
  assert.match(page, /resolveDashboardLocale/)
  assert.doesNotMatch(page, /ARABIC_DATE_LOCALE/, "dates must follow the page language")
  assert.doesNotMatch(page, /err\.message|error\.message/, "raw API error text must not be shown")
})

test("statuses read in the member's language and unknown codes are never shown raw", () => {
  assert.equal(programStatusLabel("en", "pending_review"), "Under review")
  assert.equal(programStatusLabel("ar", "waitlisted"), "قائمة الانتظار")
  assert.equal(programStatusLabel("en", "some_new_code"), "Not set")
  assert.equal(programStatusLabel("ar", null), "غير محدد")
  assert.equal(applicationTone("accepted"), "success")
  assert.equal(applicationTone("rejected"), "destructive")
  assert.equal(applicationTone("pending_review"), "warning")
})

test("next session line uses Riyadh time in the page language and handles missing data", () => {
  const session = { title: "Pitch review", starts_at: "2026-11-10T16:00:00Z" }
  assert.match(nextSessionLine("en", session), /^Next session: Pitch review — 10 Nov 2026, 19:00 Riyadh time$/)
  const ar = nextSessionLine("ar", session)
  assert.match(ar, /بتوقيت الرياض$/)
  assert.match(ar, /10 نوفمبر 2026/, "Arabic dates use the month name and Western digits")
  assert.equal(nextSessionLine("en", { title: "Pitch review", starts_at: "not a date" }), "Next session: Pitch review")
  assert.equal(nextSessionLine("en", null), "No session scheduled")
  assert.equal(nextSessionLine("ar", { title: "  " }), "لا توجد جلسة مجدولة")
})

test("dates, progress, names and categories", () => {
  assert.equal(programDate("en", "2026-11-05T22:30:00Z"), "6 November 2026", "the day is taken in Riyadh")
  assert.equal(programDate("en", undefined), null)
  assert.equal(progressValue(140), 100)
  assert.equal(progressValue(-3), 0)
  assert.equal(progressValue(null), 0)
  assert.equal(progressValue(42.6), 43)
  const accelerator = { id: 5, slug: "eo-riyadh-accelerator", name: "EO Riyadh Accelerator", category: "growth" }
  assert.equal(programTitle("ar", accelerator), "مسرّعة EO الرياض")
  assert.equal(programTitle("en", accelerator), "EO Riyadh Accelerator")
  assert.equal(programTitle("ar", { ...accelerator, name: "Edited name" }), "Edited name", "an administrator's edit is kept")
  assert.equal(programCategory("ar", accelerator), "النمو")
  assert.equal(programCategory("en", { ...accelerator, category: null }), "Program")
})
