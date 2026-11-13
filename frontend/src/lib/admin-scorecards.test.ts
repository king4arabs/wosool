import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  adminScorecardsCopy,
  emailAction,
  fieldErrors,
  founderLabel,
  founderProfileLink,
  inviteLimits,
  overrideNoteMax,
  overridePayload,
  pageCount,
  scoreFields,
  scoreRanges,
  sendErrorMessage,
  validateInvite,
  validateOverride,
  emptyOverrideForm,
  type AdminScorecard,
} from "./admin-scorecards"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/scorecards/page.tsx", import.meta.url), "utf8")
const scorecards = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/ScorecardController.php", import.meta.url), "utf8")
const founders = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/FounderController.php", import.meta.url), "utf8")

const card: AdminScorecard = {
  id: 4,
  founder_profile_id: 12,
  founder_name: null,
  founder_slug: "example-founder",
  founder_status: "active",
  founder_is_public: true,
  user_email: null,
  email_verified: false,
  aggregate_score: 60,
  momentum: 55,
  growth: 70,
  readiness: 40,
  support_delta: 10,
}

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("admin scorecards copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminScorecardsCopy.ar).sort(), Object.keys(adminScorecardsCopy.en).sort())
  assert.deepEqual(Object.keys(adminScorecardsCopy.ar.scores).sort(), [...scoreFields].sort())
  assert.deepEqual(Object.keys(adminScorecardsCopy.en.scores).sort(), [...scoreFields].sort())
  for (const value of strings(adminScorecardsCopy.ar)) assert.match(value, arabic, value)
  for (const value of strings(adminScorecardsCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the page follows the admin's language, labels every field and never shows raw API text", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, />\s*(Scorecards|Founder Scorecards|Override Panel|Apply Override|Previous|Next|View profile)\s*</, "page still has fixed English text")
  assert.doesNotMatch(page, /placeholder="/, "placeholders are not labels")
  assert.match(page, /adminScorecards\(locale\)/)
  assert.doesNotMatch(page, /\btext-left\b|\b(?:ml|mr|pl|pr|left|right)-\d/, "use logical alignment so RTL and LTR both work")
  assert.doesNotMatch(page, /instanceof Error \? \w+\.message/, "raw API errors are not shown")
  assert.match(page, /scoreFields\.map\(scoreInput\)/, "each score has a labelled input")
  for (const id of ["override_note", "email", "recipient_evidence", "recipient_verified"]) {
    assert.match(page, new RegExp(`scorecardFieldId\\("${id}"\\)`), `${id} has no labelled field`)
  }
  assert.match(page, /validateOverride\(locale, override\)/, "overrides are not checked before sending")
  assert.match(page, /overridePayload\(override\)/)
})

test("score ranges, note limit and invitation rules match the API's validation", () => {
  const rules = scorecards.slice(scorecards.indexOf("public function override"))
  for (const field of scoreFields) {
    const { min, max } = scoreRanges[field]
    assert.match(rules, new RegExp(`'${field}' => \\['nullable', 'integer', 'between:${min},${max}'\\]`), field)
  }
  assert.match(rules, new RegExp(`'override_note' => \\['required', 'string', 'max:${overrideNoteMax}'\\]`))
  const invite = founders.slice(founders.indexOf("public function invite"))
  assert.match(invite, new RegExp(`'email' => \\['required', 'email:rfc', 'max:${inviteLimits.emailMax}'\\]`))
  assert.match(invite, new RegExp(`'recipient_evidence' => \\['required', 'string', 'min:${inviteLimits.evidenceMin}', 'max:${inviteLimits.evidenceMax}'\\]`))
  assert.match(invite, /'recipient_verified' => \['accepted'\]/)
})

test("a score that is not a whole number in range is caught instead of being sent as null", () => {
  // Number("7a") is NaN and JSON.stringify(NaN) is null, which the API ignored while still logging the note.
  const errors = validateOverride("en", { ...emptyOverrideForm, momentum: "7a", growth: "0", support_delta: "0", readiness: "101", override_note: "Board review" })
  assert.equal(errors.momentum, "Enter a whole number from 1 to 100.")
  assert.equal(errors.growth, "Enter a whole number from 1 to 100.")
  assert.equal(errors.readiness, "Enter a whole number from 1 to 100.")
  assert.equal(errors.support_delta, undefined, "support gap may be 0")
  assert.equal(validateOverride("ar", { ...emptyOverrideForm, momentum: "4.5", override_note: "x" }).momentum, "أدخل عددًا صحيحًا من 1 إلى 100.")
})

test("an override needs a reason and at least one new score", () => {
  const empty = validateOverride("en", emptyOverrideForm)
  assert.equal(empty.override_note, "This field is required.")
  assert.equal(empty.form, "Enter at least one new score.")
  assert.equal(validateOverride("en", { ...emptyOverrideForm, growth: "80", override_note: "   " }).override_note, "This field is required.")
  assert.equal(validateOverride("en", { ...emptyOverrideForm, growth: "80", override_note: "é".repeat(overrideNoteMax) }).override_note, undefined)
  assert.equal(validateOverride("en", { ...emptyOverrideForm, growth: "80", override_note: "a".repeat(overrideNoteMax + 1) }).override_note, "Use 1200 characters or fewer.")
  assert.deepEqual(validateOverride("en", { ...emptyOverrideForm, growth: " 80 ", override_note: "Verified revenue" }), {})
})

test("only entered scores are sent, as integers", () => {
  assert.deepEqual(overridePayload({ ...emptyOverrideForm, growth: " 80 ", support_delta: "0", override_note: " Verified " }), {
    growth: 80,
    support_delta: 0,
    override_note: "Verified",
  })
})

test("activation invitations are checked like the API checks them", () => {
  const errors = validateInvite("en", { email: "founder@", recipient_evidence: "short", recipient_verified: false })
  assert.equal(errors.email, "Enter a valid email address.")
  assert.equal(errors.recipient_evidence, "Write 10 to 2000 characters.")
  assert.equal(errors.recipient_verified, "Confirm that you verified the address before sending.")
  assert.equal(validateInvite("ar", { email: "", recipient_evidence: "", recipient_verified: true }).email, "هذا الحقل مطلوب.")
  assert.deepEqual(validateInvite("en", { email: " founder@example.com ", recipient_evidence: "Confirmed on a call", recipient_verified: true }), {})
})

test("the panel offers the right email action for each account state", () => {
  assert.equal(emailAction(card), "invite")
  assert.equal(emailAction({ ...card, founder_status: "pending" }), "inactive")
  assert.equal(emailAction({ ...card, founder_slug: null }), "none")
  assert.equal(emailAction({ ...card, user_email: "f@example.com" }), "verify")
  assert.equal(emailAction({ ...card, user_email: "f@example.com", email_verified: true }), "none")
  assert.equal(emailAction({ ...card, user_email: "f@example.com", founder_status: "suspended" }), "inactive")
})

test("names, links, pages and send errors read correctly in both languages", () => {
  assert.equal(founderLabel("en", card), "Founder #12")
  assert.equal(founderLabel("ar", card), "مؤسس رقم 12")
  assert.equal(founderLabel("en", { ...card, founder_name: " Sara " }), "Sara")
  assert.deepEqual(founderProfileLink(card), { href: "/founders/example-founder", isPublic: true })
  assert.deepEqual(founderProfileLink({ ...card, founder_is_public: false }), { href: "/admin/founders?search=example-founder", isPublic: false })
  assert.equal(founderProfileLink({ ...card, founder_slug: null }), null)
  assert.equal(pageCount(0, 20), 1)
  assert.equal(pageCount(41, 20), 3)
  assert.equal(sendErrorMessage("en", 503), adminScorecardsCopy.en.mailUnavailable)
  assert.equal(sendErrorMessage("ar", 409), adminScorecardsCopy.ar.sendConflict)
  assert.equal(sendErrorMessage("en", null), adminScorecardsCopy.en.sendFailed)
  assert.equal(sendErrorMessage("en", 429), adminScorecardsCopy.en.waitBeforeResend)
  assert.deepEqual(fieldErrors(["email"], { email: ["bad"], other: ["x"] }, "No"), { email: "No" })
})

test("each invitation conflict gets its own explanation", () => {
  const service = readFileSync(new URL("../../../backend/app/Services/FounderInvitationService.php", import.meta.url), "utf8")
  // The messages matched here must still be the ones the service sends.
  assert.match(service, /409, 'This recipient already owns a founder profile\.'/)
  assert.match(service, /409, 'The invitation was revoked while mail was sending\./)
  assert.equal(sendErrorMessage("en", 409, "This recipient already owns a founder profile."), adminScorecardsCopy.en.recipientOwnsProfile)
  assert.equal(sendErrorMessage("ar", 409, "The invitation was revoked while mail was sending. The emailed link is inactive."), adminScorecardsCopy.ar.inviteRevoked)
  assert.equal(sendErrorMessage("en", 409, "Only unclaimed, active profiles can be invited."), adminScorecardsCopy.en.sendConflict)
  assert.equal(sendErrorMessage("en", 409, "This email is already verified."), adminScorecardsCopy.en.sendConflict)
})

test("a pending request cannot be shown against another founder, and a verified account stays visible", () => {
  assert.match(page, /const choose = \(item: AdminScorecard\) => \{\s*\/\/[^\n]*\n\s*if \(busyRef\.current\) return/)
  assert.match(page, /selected\.user_email \|\| action !== "none"/)
})
