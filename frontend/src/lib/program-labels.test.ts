import { test } from "node:test"
import assert from "node:assert/strict"
import { localizeApiProgram, programCategoryLabel, programCode, programDurationLabel, programStageLabel } from "./program-labels"
import type { Program } from "../types"

const arabic = /[؀-ۿ]/

test("category codes read as words in both languages and never as raw codes in Arabic", () => {
  for (const code of ["onboarding", "circles", "growth", "fundraising", "Peer Learning", "peer_learning"]) {
    assert.match(programCategoryLabel(code, "ar"), arabic, code)
    assert.doesNotMatch(programCategoryLabel(code, "en"), /[_-]|^[a-z]/, code)
  }
  assert.equal(programCategoryLabel("circles", "en"), "Founder circles")
  assert.equal(programCategoryLabel("hard_tech", "en"), "Hard tech")
  assert.equal(programCategoryLabel("التعلم النظيري", "ar"), "التعلم النظيري", "Arabic text entered in the admin stays as written")
  assert.equal(programCode(" Peer Learning "), programCode("peer_learning"))
})

test("stage codes match the application form wording", () => {
  assert.equal(programStageLabel("pre-seed", "ar"), "ما قبل البذرة")
  assert.equal(programStageLabel("series-a", "ar"), "السلسلة A")
  assert.equal(programStageLabel("series-a", "en"), "Series A")
  assert.equal(programStageLabel("Seed", "en"), "Seed")
  assert.equal(programStageLabel("pre_seed", "en"), "Pre-seed")
})

test("durations use Arabic number agreement and stay readable in RTL", () => {
  const cases: [string, string, string][] = [
    ["1 week", "أسبوع واحد", "1 week"],
    ["2 weeks", "أسبوعان", "2 weeks"],
    ["6 weeks", "6 أسابيع", "6 weeks"],
    ["3 months", "3 أشهر", "3 months"],
    ["6 months", "6 أشهر", "6 months"],
    ["12 months", "12 شهرًا", "12 months"],
    ["2 Months", "شهران", "2 months"],
    ["10 days", "10 أيام", "10 days"],
    ["1 year", "سنة واحدة", "1 year"],
  ]
  for (const [input, ar, en] of cases) {
    assert.equal(programDurationLabel(input, "ar"), ar, input)
    assert.equal(programDurationLabel(input, "en"), en, input)
  }
  assert.equal(programDurationLabel("Rolling, about a quarter", "ar"), "Rolling, about a quarter", "free text is never rewritten")
  assert.equal(programDurationLabel("ستة أشهر", "ar"), "ستة أشهر")
})

const base: Program = {
  id: "7", name: "EO Riyadh Accelerator", slug: "eo-riyadh-accelerator", description: "Wosool digital gateway for EO Riyadh Accelerator. Saudi Founders. Global Connections. Extraordinary Growth.",
  category: "growth", duration: "6 months", targetStage: ["seed", "series-a"], benefits: ["Monthly forum"], isOpen: false,
}

test("API programs: Arabic cards get Arabic stages and duration; the installed accelerator gets its Arabic name", () => {
  const ar = localizeApiProgram(base, "ar")
  assert.equal(ar.name, "مسرّعة EO الرياض")
  assert.match(ar.description, arabic)
  assert.equal(ar.duration, "6 أشهر")
  assert.deepEqual(ar.targetStage, ["البذرة", "السلسلة A"])
  assert.equal(ar.category, "growth", "category keeps its code for filtering")
  assert.deepEqual(ar.benefits, base.benefits, "admin-entered text is not invented or changed")

  const en = localizeApiProgram(base, "en")
  assert.equal(en.name, base.name)
  assert.equal(en.description, base.description)
  assert.deepEqual(en.targetStage, ["Seed", "Series A"])

  const edited = localizeApiProgram({ ...base, name: "EO Riyadh Accelerator 2027", description: "Applications open in January." }, "ar")
  assert.equal(edited.name, "EO Riyadh Accelerator 2027", "an administrator's edited title is shown")
  assert.equal(edited.description, "Applications open in January.", "an administrator's edited description is shown")

  const other = localizeApiProgram({ ...base, slug: "founder-circles", name: "Founder Circles", duration: "" }, "ar")
  assert.equal(other.name, "Founder Circles", "no Arabic name is made up for admin-created programs")
  assert.equal(other.duration, "")
})
