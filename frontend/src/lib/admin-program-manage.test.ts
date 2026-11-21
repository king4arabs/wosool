import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  applicationActions,
  applicationStatuses,
  applicationUpdateError,
  codeLabel,
  cohortLimits,
  cohortPayload,
  cohortStatuses,
  emptyCohortForm,
  emptySessionForm,
  isLocalDateTime,
  programManage,
  programManageCopy,
  riyadhDate,
  riyadhDateTime,
  riyadhDateTimeLabel,
  saveErrors,
  sessionFieldOrder,
  sessionLimits,
  sessionPayload,
  sessionTypes,
  validateCohort,
  validateSession,
} from "./admin-program-manage"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/programs/[id]/page.tsx", import.meta.url), "utf8")
const controller = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/ProgramManagementController.php", import.meta.url), "utf8")

test("program management copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(programManageCopy.ar).sort(), Object.keys(programManageCopy.en).sort())
  for (const [key, value] of Object.entries(programManageCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(programManageCopy.en)) assert.doesNotMatch(value, arabic, key)
  const kinds = [["application", applicationStatuses], ["action", applicationActions], ["cohort", cohortStatuses], ["session", sessionTypes]] as const
  for (const [kind, codes] of kinds) {
    for (const code of codes) {
      assert.match(codeLabel("ar", kind, code), arabic, `${kind}.${code}`)
      assert.notEqual(codeLabel("en", kind, code), code, `${kind}.${code} is shown as a raw code`)
    }
  }
  assert.equal(codeLabel("en", "application", "something_new"), "something_new")
})

test("lists and limits match ProgramManagementController", () => {
  assert.match(controller, new RegExp(`'status' => \\['required', 'in:${cohortStatuses.join(",")}'\\]`))
  assert.match(controller, new RegExp(`'session_type' => \\['required', 'in:${sessionTypes.join(",")}'\\]`))
  assert.match(controller, new RegExp(`'name' => \\['required', 'string', 'max:${cohortLimits.name}'\\]`))
  assert.match(controller, new RegExp(`'code' => \\['nullable', 'string', 'max:${cohortLimits.code}'\\]`))
  assert.match(controller, /'capacity' => \['nullable', 'integer', 'min:1'\]/)
  assert.match(controller, new RegExp(`'title' => \\['required', 'string', 'max:${sessionLimits.title}'\\]`))
  assert.match(controller, new RegExp(`'duration_minutes' => \\['nullable', 'integer', 'min:${sessionLimits.minDuration}'\\]`))
  assert.match(controller, /'starts_at' => \['required', 'date'\]/)
  const actions = /'action' => \['required', 'in:([^']+)'\]/.exec(controller)?.[1].split(",") ?? []
  for (const action of applicationActions) assert.ok(actions.includes(action), action)
  // Every status updateApplication can write has a label.
  for (const status of controller.matchAll(/=> '(accepted|rejected|waitlisted|pending_review|withdrawn|enrolled)'/g)) {
    assert.ok((applicationStatuses as readonly string[]).includes(status[1]), status[1])
  }
})

test("a typed session time is sent as Riyadh time, not read as UTC", () => {
  assert.equal(riyadhDateTime("2027-01-10T10:00"), "2027-01-10T10:00:00+03:00")
  assert.equal(new Date(riyadhDateTime("2027-01-10T10:00")).toISOString(), "2027-01-10T07:00:00.000Z")
  const payload = sessionPayload({ ...emptySessionForm, title: "  Kickoff ", starts_at: "2027-01-10T10:00", duration_minutes: " 90 ", description: "  " })
  assert.deepEqual(payload, { title: "Kickoff", session_type: "workshop", starts_at: "2027-01-10T10:00:00+03:00", duration_minutes: 90, description: null })
  // What the API returns (UTC) is shown at the time that was typed.
  assert.match(riyadhDateTimeLabel("en", "2027-01-10T07:00:00+00:00") ?? "", /10:00/)
  assert.equal(riyadhDate("en", "2027-02-01T00:00:00+00:00"), "1 Feb 2027")
  assert.equal(riyadhDate("en", "not a date"), null)
  assert.ok(isLocalDateTime("2027-01-10T10:00"))
  assert.ok(!isLocalDateTime("2027-02-30T10:00"))
  assert.ok(!isLocalDateTime("2027-01-10T24:00"))
})

test("cohort and session forms are checked before sending", () => {
  const copy = programManage("ar")
  assert.deepEqual(validateCohort("ar", emptyCohortForm), { name: copy.errorNameRequired })
  const cohort = validateCohort("en", { name: "x".repeat(256), code: "c".repeat(81), status: "archived", capacity: "0", starts_at: "2027-13-01" })
  assert.deepEqual(Object.keys(cohort).sort(), ["capacity", "code", "name", "starts_at", "status"])
  assert.equal(validateCohort("en", { ...emptyCohortForm, name: "A", capacity: "2.5" }).capacity, programManage("en").errorCapacity)
  assert.deepEqual(validateCohort("en", { name: "Cohort 1", code: "C1", status: "open", capacity: "20", starts_at: "2027-02-01" }), {})
  assert.deepEqual(cohortPayload({ name: " Cohort 1 ", code: " ", status: "open", capacity: "", starts_at: "" }), { name: "Cohort 1", code: null, status: "open", capacity: null, starts_at: null })

  const session = validateSession("en", { ...emptySessionForm, duration_minutes: "10" })
  assert.deepEqual(Object.keys(session).sort(), ["duration_minutes", "starts_at", "title"])
  assert.match(session.duration_minutes ?? "", /15/)
  assert.deepEqual(validateSession("en", { ...emptySessionForm, title: "Kickoff", starts_at: "2027-01-10T10:00" }), {})
})

test("API refusals map to fields or page messages in the page language", () => {
  const copy = programManage("en")
  const result = saveErrors("en", 422, { errors: { starts_at: ["The starts at field must be a valid date."], mentor_user_id: ["x"] } }, sessionFieldOrder, copy.sessionFailed)
  assert.deepEqual(result, { fields: { starts_at: copy.errorRejected }, message: copy.saveInvalid })
  assert.deepEqual(saveErrors("en", 500, {}, sessionFieldOrder, copy.sessionFailed), { fields: {}, message: copy.sessionFailed })
  assert.equal(applicationUpdateError("ar", 409), programManage("ar").workspaceOnly)
  assert.equal(applicationUpdateError("en", 500), copy.applicationFailed)
  assert.match(controller, /abort_if\(\$program->slug === AcceleratorGateway::SLUG, 409/)
})

test("the page uses visible labels, the Riyadh offset and no raw codes or API text", () => {
  assert.doesNotMatch(page, /placeholder=/)
  assert.doesNotMatch(page, /e\.message|error\.message/)
  assert.doesNotMatch(page, /\{a\.status\}|\{c\.status\}|\{s\.session_type\}/)
  assert.match(page, /sessionPayload\(sessionForm\)/)
  assert.match(page, /id="cohort-starts_at"/, "the cohort start date has an input")
  assert.match(page, /<Label htmlFor=\{id\}>/)
  assert.match(page, /aria-describedby/)
  assert.match(page, /focusFirst\(/)
  assert.doesNotMatch(page, /<h2 className="font-bold">/, "card headings sit below the page h2")
})
