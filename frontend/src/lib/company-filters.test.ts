import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { companyOptions, filterCompanies, matchesCompanySearch } from "./company-filters"
import { companiesPageCopy } from "../data/localized-seed"

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")

const company = (overrides: Partial<Parameters<typeof matchesCompanySearch>[0]> = {}) => ({
  name: "Example Pay",
  description: "Payments for small shops",
  location: "Riyadh, Saudi Arabia",
  sector: "Fintech",
  stage: "Seed",
  founders: [{ name: "Sara Example" }],
  ...overrides,
})

test("the search box finds a company by sector, as its placeholder promises", () => {
  assert.equal(matchesCompanySearch(company(), "fintech", "en"), true)
  assert.equal(matchesCompanySearch(company({ sector: "التقنية المالية" }), "التقنية المالية", "ar"), true)
})

test("search words need not be adjacent and can match founder names", () => {
  assert.equal(matchesCompanySearch(company(), "pay riyadh", "en"), true)
  assert.equal(matchesCompanySearch(company(), "sara", "en"), true)
  assert.equal(matchesCompanySearch(company(), "pay jeddah", "en"), false)
})

test("Arabic search folds hamza, alef maqsura and ta marbuta variants", () => {
  const arabic = company({ name: "شركة الإتصالات", location: "الرياض", description: "منصة" })
  assert.equal(matchesCompanySearch(arabic, "الاتصالات", "ar"), true)
  assert.equal(matchesCompanySearch(arabic, "شركه", "ar"), true)
})

test("sector and stage filters combine with search", () => {
  const items = [company(), company({ name: "Cargo Co", sector: "Logistics", stage: "Series A" })]
  assert.deepEqual(filterCompanies(items, { search: "", sector: "Logistics", stage: "" }).map(item => item.name), ["Cargo Co"])
  assert.deepEqual(filterCompanies(items, { search: "cargo", sector: "", stage: "Seed" }).map(item => item.name), [])
  assert.equal(filterCompanies(items, { search: "  ", sector: "", stage: "" }).length, 2)
})

test("dropdown options are distinct, trimmed, non-empty and sorted", () => {
  const items = [company({ sector: "Logistics " }), company({ sector: "Fintech" }), company({ sector: "Logistics" }), company({ sector: "" })]
  assert.deepEqual(companyOptions(items, "sector", "en"), ["Fintech", "Logistics"])
  assert.equal(filterCompanies(items, { search: "", sector: "Logistics", stage: "" }).length, 2)
})

test("each companies filter has its own accessible name in both languages", () => {
  for (const locale of ["ar", "en"] as const) {
    const copy = companiesPageCopy[locale]
    assert.equal(new Set([copy.searchAria, copy.sectorLabel, copy.stageLabel]).size, 3, locale)
  }
  const page = source("../app/founders/companies/page.tsx")
  assert.equal(page.match(/aria-label=\{copy\.searchAria\}/g)?.length, 1)
  assert.match(page, /aria-label=\{copy\.sectorLabel\}/)
  assert.match(page, /aria-label=\{copy\.stageLabel\}/)
  assert.match(page, /filterCompanies\(/)
})

test("the companies search icon and padding follow the reading direction", () => {
  const page = source("../app/founders/companies/page.tsx")
  assert.doesNotMatch(page, /\b(left|right)-3\b|\bpl-10\b|\bpr-4\b/)
  assert.match(page, /\bstart-3\b/)
  assert.match(page, /\bps-10\b/)
})
