import { test } from "node:test"
import assert from "node:assert/strict"
import {
  programApplyAction,
  programDate,
  programDetailCopy,
  programFormatLabel,
  programLanguageLabel,
  programSessionTypeLabel,
  programStatusFlowLabel,
  programTypeLabel,
} from "./program-detail"

const arabic = /[؀-ۿ]/
const latinWord = /[A-Za-z]{3,}/
const open = { slug: "growth-sprint", is_open: true, status_flow: "applications_open", visibility: "public", application_deadline: "2026-12-01T00:00:00Z" }
const now = Date.parse("2026-10-23T00:00:00Z")

test("page copy has the same keys in Arabic and English, and each side is in its own language", () => {
  assert.deepEqual(Object.keys(programDetailCopy.ar).sort(), Object.keys(programDetailCopy.en).sort())
  for (const [key, value] of Object.entries(programDetailCopy.ar)) {
    assert.match(value, arabic, `ar.${key}`)
    assert.doesNotMatch(value.replace(/EO/g, ""), latinWord, `ar.${key} has no English words`)
  }
  for (const [key, value] of Object.entries(programDetailCopy.en)) assert.doesNotMatch(value, arabic, `en.${key}`)
})

test("admin codes for lifecycle, format, session type and language read as words in both languages", () => {
  for (const code of ["draft", "applications_open", "applications_closed", "active", "completed", "cancelled", "archived"]) {
    assert.match(programStatusFlowLabel(code, "ar") ?? "", arabic, code)
    assert.doesNotMatch(programStatusFlowLabel(code, "en") ?? "", /_|^[a-z]/, code)
  }
  for (const code of ["online", "in-person", "hybrid", "self-paced", "cohort-based"]) {
    assert.match(programFormatLabel(code, "ar") ?? "", arabic, code)
    assert.doesNotMatch(programFormatLabel(code, "en") ?? "", /^[a-z]/, code)
  }
  for (const code of ["workshop", "office_hour", "mentorship", "lecture", "roundtable", "demo", "review", "check_in"]) {
    assert.match(programSessionTypeLabel(code, "ar"), arabic, code)
    assert.doesNotMatch(programSessionTypeLabel(code, "en"), /_|^[a-z]/, code)
  }
  assert.equal(programFormatLabel("cohort-based", "en"), "Cohort-based")
  assert.equal(programSessionTypeLabel(undefined, "en"), "Session")
  assert.equal(programLanguageLabel("ar", "en"), "In Arabic")
  assert.equal(programLanguageLabel("en", "ar"), "بالإنجليزية")
  assert.equal(programTypeLabel("circles", "ar"), "دوائر المؤسسين", "same words as the /programs filter chips")
  assert.equal(programTypeLabel(null, "en"), "Program")
  assert.equal(programStatusFlowLabel(null, "ar"), null, "no badge instead of a dash")
  assert.equal(programFormatLabel("Evenings in Riyadh", "ar"), "Evenings in Riyadh", "admin free text is shown as written")
})

test("dates are Gregorian in Riyadh time with Western digits", () => {
  assert.equal(programDate("2026-11-05T21:30:00Z", "en"), "6 November 2026")
  assert.equal(programDate("2026-11-05T21:30:00Z", "ar"), "6 نوفمبر 2026")
  assert.equal(programDate("not a date", "ar"), null)
  assert.equal(programDate(null, "en"), null)
})

test("visitors are sent to sign in and brought back to the program", () => {
  const action = programApplyAction(open, null, false, "en", now)
  assert.equal(action.kind, "link")
  assert.equal(action.kind === "link" && action.href, "/login?redirect=%2Fprograms%2Fgrowth-sprint")
  assert.equal(action.label, "Apply now")
  assert.deepEqual(programApplyAction(open, null, true, "ar", now), { kind: "apply", label: "قدّم الآن" })
})

test("the join button follows the API's rules: one application, open program, before the deadline", () => {
  assert.equal(programApplyAction(open, "pending_review", true, "en", now).kind, "disabled")
  assert.equal(programApplyAction(open, "pending_review", true, "en", now).label, "Under review")
  // The API refuses a second application even after a withdrawal or rejection.
  assert.equal(programApplyAction(open, "withdrawn", true, "ar", now).kind, "disabled")
  assert.equal(programApplyAction(open, "rejected", true, "en", now).label, "Not accepted")
  assert.equal(programApplyAction({ ...open, is_open: false }, null, true, "en", now).label, "Applications closed")
  assert.equal(programApplyAction({ ...open, status_flow: "archived" }, null, true, "en", now).kind, "disabled")
  assert.equal(programApplyAction({ ...open, status_flow: "completed" }, null, false, "ar", now).label, "انتهى البرنامج")
  assert.equal(programApplyAction({ ...open, application_deadline: "2026-10-01T00:00:00Z" }, null, true, "en", now).kind, "disabled")
  assert.equal(programApplyAction({ ...open, visibility: "invite_only" }, null, true, "en", now).label, "Request an invitation")
})

test("the EO Riyadh Accelerator points to its own application journey", () => {
  const action = programApplyAction({ ...open, slug: "eo-riyadh-accelerator", is_open: false }, null, true, "ar", now)
  assert.equal(action.kind, "link")
  assert.equal(action.kind === "link" && action.href, "/eoa/apply")
  assert.match(action.label, arabic)
})
