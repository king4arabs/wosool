import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminProgram } from "./admin"
import {
  adminProgramsCopy,
  emptyProgramForm,
  fromRiyadhInput,
  programFieldErrors,
  programFormats,
  programOptionLabel,
  programPayload,
  programStatusFlows,
  programVisibilities,
  toProgramForm,
  toRiyadhInput,
  validateProgramForm,
} from "./admin-programs"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/programs/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/ProgramController.php", import.meta.url), "utf8")

test("admin programs copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminProgramsCopy.ar).sort(), Object.keys(adminProgramsCopy.en).sort())
  for (const [key, value] of Object.entries(adminProgramsCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminProgramsCopy.en)) assert.doesNotMatch(value, arabic, key)
  for (const [group, values] of [["visibility", programVisibilities], ["status_flow", programStatusFlows], ["format", programFormats]] as const) {
    for (const value of values) {
      assert.match(programOptionLabel("ar", group, value), arabic, `${group}.${value}`)
      assert.doesNotMatch(programOptionLabel("en", group, value), arabic, `${group}.${value}`)
    }
  }
  assert.equal(programOptionLabel("en", "format", "unknown-code"), "unknown-code")
})

test("option codes match the values the API accepts", () => {
  const accepted = (field: string) => backend.match(new RegExp(`'${field}' => \\['nullable', 'in:([^']+)'`))?.[1].split(",")
  assert.deepEqual(accepted("visibility"), [...programVisibilities])
  assert.deepEqual(accepted("status_flow"), [...programStatusFlows])
  assert.deepEqual(accepted("format"), [...programFormats])
})

test("the page follows the admin's language, labels every field and edits start and end times", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.match(page, /adminPrograms\(locale\)/)
  assert.doesNotMatch(page, /dir="rtl"|\b(?:ml|mr|pl|pr|left|right)-\d/, "use logical spacing and position so RTL and LTR both work")
  assert.doesNotMatch(page, /placeholder="/, "placeholders are not labels")
  for (const name of Object.keys(emptyProgramForm).filter((key) => !["language", "is_open"].includes(key))) {
    assert.match(page, new RegExp(`field\\("${name}"`), `${name} has no labelled field`)
  }
  assert.doesNotMatch(page, /err\.message/, "raw API text must not be shown in place of page copy")
})

test("start and end times are entered in Riyadh time and sent in UTC", () => {
  assert.equal(toRiyadhInput("2026-11-10T06:00:00+00:00"), "2026-11-10T09:00")
  assert.equal(toRiyadhInput("2026-11-30T22:30:00Z"), "2026-12-01T01:30")
  assert.equal(toRiyadhInput(null), "")
  assert.equal(toRiyadhInput("not a date"), "")
  assert.equal(fromRiyadhInput("2026-11-10T09:00"), "2026-11-10T06:00:00.000Z")
  assert.equal(fromRiyadhInput(""), null)
  assert.equal(fromRiyadhInput("2026-11-10"), null)
  for (const iso of ["2026-01-01T00:00:00.000Z", "2026-07-15T13:45:00.000Z"]) assert.equal(fromRiyadhInput(toRiyadhInput(iso)), iso)
})

test("editing and saving a program keeps its times instead of shifting or dropping them", () => {
  const program: AdminProgram = {
    id: 7,
    name: "Growth Sprint",
    slug: "growth-sprint",
    category: "growth",
    is_open: false,
    capacity: 20,
    tags: ["growth", "sales"],
    language: "en",
    application_deadline: "2026-11-20T00:00:00+00:00",
    starts_at: "2026-12-01T06:00:00+00:00",
    ends_at: "2026-12-15T14:00:00+00:00",
  }
  const form = toProgramForm(program)
  assert.equal(form.starts_at, "2026-12-01T09:00")
  assert.equal(form.application_deadline, "2026-11-20")
  const payload = programPayload(form)
  assert.equal(payload.starts_at, "2026-12-01T06:00:00.000Z")
  assert.equal(payload.ends_at, "2026-12-15T14:00:00.000Z")
  assert.equal(payload.application_deadline, "2026-11-20")
  assert.equal(payload.language, "en")
  assert.equal(payload.capacity, 20)
  assert.deepEqual(payload.tags, ["growth", "sales"])
  assert.equal(payload.is_open, false)
  assert.equal(programPayload(emptyProgramForm).starts_at, null)
})

test("invalid entries are reported on their fields in the admin's language", () => {
  const form = { ...emptyProgramForm, name: " ", category: "", capacity: "0", starts_at: "2026-12-02T09:00", ends_at: "2026-12-01T09:00" }
  const en = validateProgramForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), ["capacity", "category", "ends_at", "name"])
  assert.equal(en.name, adminProgramsCopy.en.nameRequired)
  assert.equal(validateProgramForm("ar", form).ends_at, adminProgramsCopy.ar.endsBeforeStart)
  assert.deepEqual(validateProgramForm("en", { ...emptyProgramForm, name: "Sprint", capacity: "12" }), {})

  const fromApi = programFieldErrors({ slug: ["The slug has already been taken."], "tags.1": ["Too long."], description: ["Bad."], unknown: ["x"], name: [""] }, "fallback")
  assert.deepEqual(fromApi, { slug: "The slug has already been taken.", tags: "Too long.", short_description: "Bad.", name: "fallback" })
  assert.deepEqual(programFieldErrors(null, "fallback"), {})
})
