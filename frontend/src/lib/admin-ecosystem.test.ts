import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { EcosystemRecord } from "@/components/accelerator/OpportunityDirectory"
import {
  adminEcosystemCopy,
  ecosystemApplicationStatuses,
  ecosystemFieldErrors,
  ecosystemFields,
  ecosystemLimits,
  ecosystemPayload,
  ecosystemVerificationStatuses,
  sourceLines,
  toEcosystemForm,
  utcToday,
  validateEcosystemForm,
} from "./admin-ecosystem"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/opportunities/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(
  new URL("../../../backend/app/Http/Controllers/Api/Gateway/EcosystemController.php", import.meta.url),
  "utf8",
)

const stored = {
  id: 4,
  slug: "example-fund",
  entity_type: "opportunity",
  name_ar: "صندوق مثال",
  name_en: "Example Fund",
  category: "funding",
  description_ar: "وصف بالعربية",
  description_en: "English description",
  website_url: "https://example.org",
  application_url: undefined,
  verification_status: "verified",
  application_status: "open",
  deadline: "2026-12-31T20:59:00.000000Z",
  verified_at: "2026-11-01T00:00:00.000000Z",
  source_urls: ["https://example.org/about", "https://news.example.com/fund"],
  updated_at: "2026-11-10T08:00:00.000000Z",
  details: {},
} as unknown as EcosystemRecord

const today = "2026-11-18"
const valid = () => ({ ...toEcosystemForm(stored), note: "Checked the fund page" })

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminEcosystemCopy.ar).sort(), Object.keys(adminEcosystemCopy.en).sort())
  assert.deepEqual(Object.keys(adminEcosystemCopy.ar.labels).sort(), [...ecosystemFields].sort())
  assert.deepEqual(Object.keys(adminEcosystemCopy.en.labels).sort(), [...ecosystemFields].sort())
  for (const value of strings(adminEcosystemCopy.ar)) assert.match(value, arabic, value)
  for (const value of strings(adminEcosystemCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the rules and lists match EcosystemController::adminUpdate", () => {
  const rules = backend.slice(backend.indexOf("verification_status' => 'required"))
  assert.match(rules, new RegExp(`verification_status' => 'required\\|in:${ecosystemVerificationStatuses.join(",")}'`))
  assert.match(rules, new RegExp(`application_status' => 'sometimes\\|required\\|in:${ecosystemApplicationStatuses.join(",")}'`))
  assert.match(rules, new RegExp(`'note' => 'required\\|string\\|max:${ecosystemLimits.note}'`))
  assert.match(rules, new RegExp(`name_en' => 'sometimes\\|required\\|string\\|max:${ecosystemLimits.name}'`))
  assert.match(rules, new RegExp(`description_en' => 'sometimes\\|required\\|string\\|max:${ecosystemLimits.description}'`))
  assert.match(rules, new RegExp(`'source_urls' => 'sometimes\\|required\\|array\\|min:1\\|max:${ecosystemLimits.sources}'`))
  assert.match(rules, /'source_urls\.\*' => 'required\|url:https\|max:2048'/)
  assert.match(rules, /'verified_at' => 'sometimes\|required\|date\|before_or_equal:today'/)
})

test("a stored record opens valid once a reason is given", () => {
  const form = toEcosystemForm(stored)
  assert.equal(form.deadline, "2026-12-31")
  assert.equal(form.verified_at, "2026-11-01")
  assert.equal(form.source_urls, "https://example.org/about\nhttps://news.example.com/fund")
  assert.deepEqual(Object.keys(validateEcosystemForm("en", form, today)), ["note"])
  assert.deepEqual(validateEcosystemForm("en", valid(), today), {})
})

test("bad values are caught before sending, with messages in the page language", () => {
  const form = {
    ...valid(),
    name_en: " ",
    website_url: "http://example.org",
    application_url: "example.org/apply",
    source_urls: "https://example.org/about\nnot a link",
    verified_at: "2026-11-19",
    deadline: "2026-02-30",
    verification_status: "approved",
    note: "x".repeat(ecosystemLimits.note + 1),
  }
  const en = validateEcosystemForm("en", form, today)
  assert.deepEqual(Object.keys(en).sort(), [
    "application_url",
    "deadline",
    "name_en",
    "note",
    "source_urls",
    "verification_status",
    "verified_at",
    "website_url",
  ])
  assert.match(en.source_urls ?? "", /Line 2/)
  const ar = validateEcosystemForm("ar", form, today)
  for (const message of Object.values(ar)) assert.match(message ?? "", arabic)

  assert.equal(validateEcosystemForm("en", { ...valid(), source_urls: "\n  \n" }, today).source_urls, adminEcosystemCopy.en.errors.sourcesMin)
  const sixteen = Array.from({ length: 16 }, (_, i) => `https://example.org/${i}`).join("\n")
  assert.equal(validateEcosystemForm("en", { ...valid(), source_urls: sixteen }, today).source_urls, adminEcosystemCopy.en.errors.sourcesMax)
  assert.equal(validateEcosystemForm("en", { ...valid(), verified_at: today }, today).verified_at, undefined)
})

test("source lines keep blank lines while typing and are trimmed only when sent", () => {
  assert.deepEqual(sourceLines(" https://a.example/ \r\n\r\nhttps://b.example/x\n"), ["https://a.example/", "https://b.example/x"])
  // The previous page filtered empty lines on every keystroke, so Enter could not start a new source line.
  assert.doesNotMatch(page, /split\("\\n"\)\.filter\(Boolean\)/)
  assert.match(page, /update\(name, e\.target\.value\)/)
})

test("the payload trims values and leaves an untouched deadline as stored", () => {
  const form = { ...valid(), name_en: "  Example Fund ", source_urls: "https://example.org/about \n\nhttps://x.example/" }
  const payload = ecosystemPayload(stored, form)
  assert.equal(payload.name_en, "Example Fund")
  assert.deepEqual(payload.source_urls, ["https://example.org/about", "https://x.example/"])
  assert.equal(payload.application_url, null)
  assert.equal(payload.updated_at, stored.updated_at)
  assert.equal("deadline" in payload, false)
  assert.equal(ecosystemPayload(stored, { ...form, deadline: "2027-01-15" }).deadline, "2027-01-15")
  assert.equal(ecosystemPayload(stored, { ...form, deadline: "" }).deadline, null)
})

test("API 422 errors land on their field in the page language", () => {
  const mapped = ecosystemFieldErrors("ar", { "source_urls.1": ["The source_urls.1 field must be a valid URL."], note: ["x"], other: ["y"] })
  assert.deepEqual(Object.keys(mapped).sort(), ["note", "source_urls"])
  assert.match(mapped.note ?? "", arabic)
  assert.deepEqual(ecosystemFieldErrors("en", null), {})
})

test("utcToday follows the API's UTC date", () => {
  assert.equal(utcToday(new Date("2026-11-18T22:30:00Z")), "2026-11-18")
})

test("the page follows the admin's language and labels and describes every field", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, /placeholder="/)
  assert.match(page, /adminEcosystem\(locale\)/)
  assert.match(page, /htmlFor=\{id\}/)
  assert.match(page, /aria-invalid/)
  assert.match(page, /aria-describedby/)
  assert.match(page, /copy\.loading/)
  assert.match(page, /copy\.empty/)
  assert.match(page, /copy\.retry/)
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d/)
  for (const name of ecosystemFields) {
    assert.match(page, new RegExp(`\\("${name}"`), `${name} has no field`)
  }
})
