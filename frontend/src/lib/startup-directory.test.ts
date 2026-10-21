import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { ecosystemSourceLabel, revenuePeriod } from "./startup-directory"

const rows = JSON.parse(readFileSync(new URL("../../../backend/database/data/startup-directory.json", import.meta.url), "utf8"))

test("Arabic cards show the Arabic reporting period and program name", () => {
  const evidence = { period: "Year ended 31 December 2024", period_ar: "السنة المنتهية في 31 ديسمبر 2024" }
  assert.equal(revenuePeriod(evidence, "ar"), "السنة المنتهية في 31 ديسمبر 2024")
  assert.equal(revenuePeriod(evidence, "en"), "Year ended 31 December 2024")
  assert.equal(ecosystemSourceLabel({ label: "Misk", label_ar: "مسك" }, "ar"), "مسك")
  assert.equal(ecosystemSourceLabel({ label: "Misk", label_ar: "مسك" }, "en"), "Misk")
})

test("records imported before the Arabic fields existed fall back to English", () => {
  assert.equal(revenuePeriod({ period: "H1 2025" }, "ar"), "H1 2025")
  assert.equal(revenuePeriod({ period: "H1 2025", period_ar: " " }, "ar"), "H1 2025")
  assert.equal(ecosystemSourceLabel({ label: "LEAP" }, "ar"), "LEAP")
})

test("every revenue period and program name in the directory data has Arabic text", () => {
  for (const row of rows) {
    if (row.revenue_evidence) assert.match(row.revenue_evidence.period_ar ?? "", /[؀-ۿ]/, row.slug)
    for (const source of row.ecosystem_sources) assert.match(source.label_ar ?? "", /[؀-ۿ]/, row.slug)
  }
})
