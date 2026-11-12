import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminSponsor } from "./admin"
import {
  adminSponsorsCopy,
  sponsorContract,
  sponsorFieldErrors,
  sponsorFieldId,
  sponsorFields,
  sponsorLimits,
  sponsorPayload,
  sponsorTierLabel,
  sponsorTiers,
  toSponsorForm,
  validateSponsorForm,
} from "./admin-sponsors"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/sponsors/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/SponsorController.php", import.meta.url), "utf8")

const stored: AdminSponsor = {
  id: 7,
  name: "Example Capital",
  slug: "example-capital",
  description: null,
  logo_url: null,
  website: "https://example.com",
  tier: "gold",
  is_active: false,
  contact_name: null,
  contact_email: "team@example.com",
  contract_start: "2026-01-01",
  contract_end: null,
  display_order: 3,
}

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("admin sponsors copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminSponsorsCopy.ar).sort(), Object.keys(adminSponsorsCopy.en).sort())
  assert.deepEqual(Object.keys(adminSponsorsCopy.ar.tiers).sort(), [...sponsorTiers].sort())
  assert.deepEqual(Object.keys(adminSponsorsCopy.en.tiers).sort(), [...sponsorTiers].sort())
  for (const value of strings(adminSponsorsCopy.ar)) assert.match(value, arabic, value)
  for (const value of strings(adminSponsorsCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the page follows the admin's language, labels every field and can hide or reorder a sponsor", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, />\s*(Sponsors|Add Sponsor|Sponsor Records|Search|Cancel|Save|Active|Inactive)\s*</, "page still has fixed English text")
  assert.doesNotMatch(page, /placeholder="/, "placeholders are not labels")
  assert.match(page, /adminSponsors\(locale\)/)
  assert.match(page, /copy\.publicNote/)
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d/, "use logical spacing so RTL and LTR both work")
  for (const name of sponsorFields.filter((field) => field !== "tier")) {
    assert.match(page, new RegExp(`field\\("${name}"`), `${name} has no labelled field`)
  }
  assert.match(page, /sponsorFieldId\("tier"\)/)
  assert.match(page, /update\("is_active", event\.target\.checked\)/, "active cannot be changed")
  assert.doesNotMatch(page, /toast\(err\.message|toast\(\w+\.message/, "raw API errors are not shown")
})

test("the form rules and tiers match the API's validation", () => {
  const rules = backend.slice(backend.indexOf("private function validated"))
  const rule = (field: string) => rules.match(new RegExp(`'${field}' => \\[(.+)\\],`))?.[1] ?? ""
  for (const field of [...sponsorFields, "is_active"]) assert.ok(rule(field), `${field} is not validated by the API`)
  assert.match(rule("name"), /'required'/)
  assert.match(rule("tier"), new RegExp(`Rule::in\\(\\[${sponsorTiers.map((tier) => `'${tier}'`).join(", ")}\\]\\)`))
  assert.match(rule("display_order"), new RegExp(`'min:${sponsorLimits.displayOrder.min}', 'max:${sponsorLimits.displayOrder.max}'`))
  assert.match(rule("contract_end"), /'after_or_equal:contract_start'/)
  for (const field of ["website", "logo_url"]) assert.match(rule(field), /'url', 'max:255'/, field)
  assert.match(rule("contact_email"), /'email', 'max:255'/)
})

test("invalid values are caught before sending, in the admin's language", () => {
  const form = {
    ...toSponsorForm(stored),
    name: "  ",
    tier: "diamond",
    website: "example.com",
    contact_email: "team at example",
    display_order: "-1",
    contract_start: "2026-06-01",
    contract_end: "2026-05-31",
  }
  const en = validateSponsorForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), ["contact_email", "contract_end", "display_order", "name", "tier", "website"])
  assert.equal(en.display_order, "Enter a whole number from 0 to 100000.")
  assert.match(validateSponsorForm("ar", form).name ?? "", arabic)
  assert.deepEqual(validateSponsorForm("en", toSponsorForm(stored)), {})
  assert.deepEqual(validateSponsorForm("en", { ...toSponsorForm(), name: "New sponsor" }), {})
  assert.ok(validateSponsorForm("en", { ...toSponsorForm(stored), display_order: "2.5" }).display_order)
})

test("saving keeps the active state and order, and sends blanks as null", () => {
  const form = toSponsorForm(stored)
  assert.equal(form.is_active, false)
  const payload = sponsorPayload({ ...form, name: " Example Capital ", display_order: "", contact_email: "  " })
  assert.equal(payload.name, "Example Capital")
  assert.equal(payload.is_active, false)
  assert.equal(payload.display_order, 0)
  assert.equal(payload.contact_email, null)
  assert.equal(payload.description, null)
  assert.equal(payload.contract_start, "2026-01-01")
  assert.equal(sponsorPayload(form).display_order, 3)
  assert.equal(toSponsorForm().is_active, true)
})

test("labels, contract dates and API errors", () => {
  assert.equal(sponsorTierLabel("ar", "gold"), "ذهبي")
  assert.equal(sponsorTierLabel("en", "legacy"), "legacy")
  assert.equal(sponsorContract("en", stored), "Contract: \u20682026-01-01\u2069 – open")
  assert.equal(sponsorContract("ar", { contract_start: null, contract_end: "2026-12-31" }), "العقد: — – \u20682026-12-31\u2069")
  assert.equal(sponsorContract("en", { contract_start: null, contract_end: null }), null)
  assert.deepEqual(sponsorFieldErrors({ contract_end: ["x"], slug: ["taken"] }, "Rejected"), { contract_end: "Rejected" })
  assert.deepEqual(sponsorFieldErrors(undefined, "Rejected"), {})
  assert.equal(sponsorFieldId("contact_email"), "sponsor-contact-email")
})
