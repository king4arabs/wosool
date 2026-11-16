import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminCompany } from "./admin"
import {
  adminCompaniesCopy,
  companyDisplayName,
  companyDisplayText,
  companyFieldErrors,
  companyFieldId,
  companyFields,
  companyFlags,
  companyLimits,
  companyPayload,
  companyStatusLabel,
  companyStatuses,
  isListedPublicly,
  toCompanyForm,
  validateCompanyForm,
} from "./admin-companies"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/companies/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/CompanyController.php", import.meta.url), "utf8")

const stored: AdminCompany = {
  id: 4,
  name: "Example Logistics",
  slug: "example-logistics",
  description: "Freight software.",
  website: "https://example.com",
  sector: "Logistics",
  stage: "seed",
  location: "Saudi Arabia",
  country_code: "SA",
  founded_year: 2021,
  team_size: 14,
  is_hiring: true,
  is_fundraising: false,
  is_collaborating: false,
  is_featured: false,
  is_public: true,
  status: "active",
  ar: { name: "مثال اللوجستية", description: "برمجيات شحن.", sector: "الخدمات اللوجستية", location: null },
}

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("admin companies copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminCompaniesCopy.ar).sort(), Object.keys(adminCompaniesCopy.en).sort())
  assert.deepEqual(Object.keys(adminCompaniesCopy.ar.statuses).sort(), [...companyStatuses].sort())
  assert.deepEqual(Object.keys(adminCompaniesCopy.en.flags).sort(), [...companyFlags].sort())
  for (const value of strings(adminCompaniesCopy.ar)) {
    // Example codes (SA, seed, series-a) and the URL scheme stay Latin inside Arabic sentences.
    assert.match(value, arabic, value)
  }
  for (const value of strings(adminCompaniesCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the page follows the admin's language and labels every field in both languages", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, />\s*(Companies|\+ Add Company|Refresh|Search|Cancel|Save|Hiring|Fundraising)\s*</, "page still has fixed English text")
  assert.doesNotMatch(page, /placeholder="/, "placeholders are not labels")
  assert.match(page, /adminCompanies\(locale\)/)
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d|text-left|text-right/, "use logical spacing so RTL and LTR both work")
  for (const name of companyFields.filter((field) => field !== "status")) {
    assert.match(page, new RegExp(`field\\("${name}"`), `${name} has no labelled field`)
  }
  assert.match(page, /companyFieldId\("status"\)/)
  assert.match(page, /update\(flag, event\.target\.checked\)/)
  assert.doesNotMatch(page, /toast\(err\.message|toast\(\w+\.message/, "raw API errors are not shown")
  assert.doesNotMatch(page, /\[search\]\)/, "typing in the search box must not send a request per keystroke")
})

test("the form rules and statuses match the API's validation", () => {
  const rules = backend.slice(backend.indexOf("private function validated"))
  const rule = (field: string) => rules.match(new RegExp(`'${field}' => \\[(.+)\\],`))?.[1] ?? ""
  for (const field of [...companyFields, ...companyFlags]) assert.ok(rule(field), `${field} is not validated by the API`)
  assert.match(rule("name"), new RegExp(`'required', 'string', 'max:${companyLimits.name}'`))
  assert.match(rule("name_ar"), new RegExp(`'max:${companyLimits.name}'`))
  assert.match(rule("sector"), new RegExp(`'max:${companyLimits.sector}'`))
  assert.match(rule("sector_ar"), new RegExp(`'max:${companyLimits.sector}'`))
  assert.match(rule("location_ar"), new RegExp(`'max:${companyLimits.location}'`))
  assert.match(rule("website"), new RegExp(`'url', 'max:${companyLimits.website}'`))
  assert.match(rule("country_code"), /'size:2'/)
  assert.match(rule("founded_year"), new RegExp(`'min:${companyLimits.foundedYear.min}', 'max:${companyLimits.foundedYear.max}'`))
  assert.match(rule("team_size"), new RegExp(`'min:${companyLimits.teamSize.min}', 'max:${companyLimits.teamSize.max}'`))
  assert.match(rule("status"), new RegExp(`Rule::in\\(\\[${companyStatuses.map((value) => `'${value}'`).join(", ")}\\]\\)`))
  // The editor must receive the stored English columns, never the locale-swapped public values.
  assert.match(backend, /AdminCompanyResource::collection/)
  assert.doesNotMatch(backend, /\bnew CompanyResource\(|[^n]CompanyResource::collection/)
})

test("editing keeps English and Arabic text in their own fields", () => {
  const form = toCompanyForm(stored)
  assert.equal(form.name, "Example Logistics")
  assert.equal(form.name_ar, "مثال اللوجستية")
  assert.equal(form.location_ar, "")
  assert.equal(form.founded_year, "2021")
  const payload = companyPayload({ ...form, name: " Example Logistics ", country_code: "sa", team_size: "", description_ar: "  " })
  assert.equal(payload.name, "Example Logistics")
  assert.equal(payload.name_ar, "مثال اللوجستية")
  assert.equal(payload.sector, "Logistics")
  assert.equal(payload.sector_ar, "الخدمات اللوجستية")
  assert.equal(payload.description_ar, null)
  assert.equal(payload.location_ar, null)
  assert.equal(payload.country_code, "SA")
  assert.equal(payload.team_size, null)
  assert.equal(payload.founded_year, 2021)
  assert.equal(payload.is_hiring, true)
  const blank = toCompanyForm()
  assert.equal(blank.is_public, true)
  assert.equal(blank.status, "active")
  assert.equal(toCompanyForm({ ...stored, ar: undefined }).name_ar, "")
})

test("invalid values are caught before sending, in the admin's language", () => {
  const form = {
    ...toCompanyForm(stored),
    name: "  ",
    website: "example.com",
    country_code: "SAU",
    founded_year: "1899",
    team_size: "0",
    sector_ar: "ق".repeat(101),
    status: "deleted",
  }
  const en = validateCompanyForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), ["country_code", "founded_year", "name", "sector_ar", "status", "team_size", "website"])
  assert.equal(en.founded_year, "Enter a whole number from 1900 to 2100.")
  assert.equal(en.sector_ar, "Use 100 characters or fewer.")
  assert.match(validateCompanyForm("ar", form).name ?? "", arabic)
  assert.deepEqual(validateCompanyForm("en", toCompanyForm(stored)), {})
  assert.deepEqual(validateCompanyForm("en", { ...toCompanyForm(), name: "New company" }), {})
  assert.ok(validateCompanyForm("en", { ...toCompanyForm(stored), team_size: "2.5" }).team_size)
  assert.ok(validateCompanyForm("en", { ...toCompanyForm(stored), country_code: "1A" }).country_code)
  // Laravel counts characters: 254 letters and one emoji is 255.
  assert.equal(validateCompanyForm("en", { ...toCompanyForm(stored), name: "a".repeat(254) + "🚀" }).name, undefined)
  assert.ok(validateCompanyForm("en", { ...toCompanyForm(stored), name: "a".repeat(255) + "🚀" }).name)
})

test("list labels, public listing and API errors", () => {
  assert.equal(companyDisplayName("ar", stored), "مثال اللوجستية")
  assert.equal(companyDisplayName("en", stored), "Example Logistics")
  assert.equal(companyDisplayName("ar", { ...stored, ar: null }), "Example Logistics")
  assert.equal(companyDisplayText("ar", stored, "location"), "Saudi Arabia", "falls back to English when no Arabic text")
  assert.equal(companyDisplayText("ar", stored, "sector"), "الخدمات اللوجستية")
  assert.equal(companyStatusLabel("ar", "pending"), "قيد المراجعة")
  assert.equal(companyStatusLabel("en", "legacy"), "legacy")
  assert.equal(isListedPublicly(stored), true)
  assert.equal(isListedPublicly({ ...stored, is_public: false }), false)
  assert.equal(isListedPublicly({ ...stored, status: "pending" }), false)
  assert.deepEqual(companyFieldErrors({ name_ar: ["x"], slug: ["taken"], other: ["y"] }, "Rejected"), { name_ar: "Rejected", name: "Rejected" })
  assert.equal(companyFieldId("description_ar"), "company-description-ar")
})
