import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  adminMatchesCopy,
  characterCount,
  matchDate,
  matchPayload,
  matchReasonMax,
  matchReasonMin,
  matchSaveErrors,
  matchStatusLabel,
  matchStatuses,
  matchVisible,
  validateMatchForm,
} from "./admin-matches"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/matches/page.tsx", import.meta.url), "utf8")
const controller = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/MatchController.php", import.meta.url), "utf8")
const member = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Member/MatchController.php", import.meta.url), "utf8")

test("admin matches copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminMatchesCopy.ar).sort(), Object.keys(adminMatchesCopy.en).sort())
  for (const [key, value] of Object.entries(adminMatchesCopy.ar)) {
    if (key === "reasonCount") continue
    assert.match(value, arabic, key)
  }
  for (const [key, value] of Object.entries(adminMatchesCopy.en)) assert.doesNotMatch(value, arabic, key)
  for (const status of matchStatuses) {
    assert.match(matchStatusLabel("ar", status), arabic, status)
    assert.notEqual(matchStatusLabel("en", status), status, `${status} is shown as a raw code`)
  }
  assert.equal(matchStatusLabel("en", "something_new"), "something_new")
})

test("rules and statuses match the admin and member controllers", () => {
  assert.match(controller, new RegExp(`'reason' => \\['required', 'string', 'min:${matchReasonMin}', 'max:${matchReasonMax}'\\]`))
  assert.match(controller, /'founder_b_id' => \[[^\]]*'different:founder_a_id'/)
  assert.match(controller, /->where\('status', 'active'\)/)
  assert.match(controller, /'status' => 'suggested'/)
  assert.match(controller, /, 409, /)
  assert.match(member, /'status' => 'accepted'/)
  assert.match(member, /'status' => 'declined'/)
})

test("the form is checked before sending, in the page language", () => {
  const empty = validateMatchForm("en", { founderA: null, founderB: null, reason: "  " })
  assert.deepEqual(Object.keys(empty), ["founder_a_id", "founder_b_id", "reason"])
  assert.match(validateMatchForm("ar", { founderA: null, founderB: null, reason: "" }).reason ?? "", arabic)
  assert.equal(validateMatchForm("en", { founderA: 4, founderB: 4, reason: "A useful connection" }).founder_b_id, "Choose a different founder from the first one.")
  // The API trims input, so nine characters padded with spaces is still too short.
  assert.match(validateMatchForm("en", { founderA: 1, founderB: 2, reason: "  123456789  " }).reason ?? "", /at least 10/)
  assert.deepEqual(validateMatchForm("en", { founderA: 1, founderB: 2, reason: "تعارف مفيد جدًا" }), {})
  assert.match(validateMatchForm("en", { founderA: 1, founderB: 2, reason: "x".repeat(matchReasonMax + 1) }).reason ?? "", /longer than 2000/)
  assert.deepEqual(validateMatchForm("en", { founderA: 1, founderB: 2, reason: "x".repeat(matchReasonMax) }), {})
  assert.equal(characterCount("😀😀"), 2)
  assert.deepEqual(matchPayload({ founderA: 1, founderB: 2, reason: "  Both build logistics tools  " }), { founder_a_id: 1, founder_b_id: 2, reason: "Both build logistics tools" })
})

test("API refusals become page-language messages, never raw API text", () => {
  const duplicate = matchSaveErrors("ar", 409, { message: "An active match already exists for these founders." })
  assert.deepEqual(duplicate.fields, {})
  assert.match(duplicate.message, arabic)
  const notActivated = matchSaveErrors("en", 422, { message: "Both founders must activate their community profiles before being matched." })
  assert.deepEqual(notActivated.fields, {})
  assert.match(notActivated.message, /activated their community profile/)
  const fields = matchSaveErrors("en", 422, { message: "invalid", errors: { founder_b_id: ["The selected founder b id is invalid."], reason: ["too short"] } })
  assert.deepEqual(Object.keys(fields.fields).sort(), ["founder_b_id", "reason"])
  assert.equal(fields.message, "Check the highlighted fields.")
  assert.equal(matchSaveErrors("en", 500, null).message, "The suggestion could not be saved. Try again.")
})

test("filtering and dates", () => {
  const item = { status: "suggested", names: ["Sara Al-Qahtani", "Omar Haddad"], reasons: ["Both sell to clinics"] }
  assert.ok(matchVisible(item, "", ""))
  assert.ok(matchVisible(item, "omar clinics", "suggested"))
  assert.ok(!matchVisible(item, "omar fintech", ""))
  assert.ok(!matchVisible(item, "", "declined"))
  assert.equal(matchDate("en", "2026-11-07T22:30:00Z"), "8 Nov 2026")
  assert.equal(matchDate("en", "not a date"), null)
})

test("the page uses the shared copy and shows no raw API messages", () => {
  assert.doesNotMatch(page, /error\.message|err\.message/)
  assert.doesNotMatch(page, /"Unable to/)
  assert.doesNotMatch(page, /<h2 className="font-bold">/, "match cards sit under the page h2")
  assert.match(page, /noValidate/)
  assert.match(page, /aria-describedby/)
  assert.match(page, /validateMatchForm\(locale/)
  assert.match(page, /matchSaveErrors\(locale/)
  // The submit button is not silently disabled: problems are explained under their fields.
  assert.doesNotMatch(page, /disabled=\{!a \|\| !b/)
})
