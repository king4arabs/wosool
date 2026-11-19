import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  adminPartnersCopy,
  partnerChecks,
  partnerFieldErrors,
  partnerFieldId,
  partnerFields,
  partnerLimits,
  partnerLogoPattern,
  partnerName,
  partnerPayload,
  partnerStatusLabel,
  partnerStatuses,
  partnerTypeLabel,
  partnerTypes,
  partnerVisibility,
  partnerVisibilityGaps,
  toPartnerForm,
  validatePartnerForm,
  type AdminPartner,
} from "./admin-partners"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/partners/page.tsx", import.meta.url), "utf8")
const adminController = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/PartnerController.php", import.meta.url), "utf8")
const publicController = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/PartnerController.php", import.meta.url), "utf8")
const migration = readFileSync(new URL("../../../backend/database/migrations/2024_01_01_000100_create_partners_sponsors_table.php", import.meta.url), "utf8")

const listed: AdminPartner = {
  id: 4,
  name: "Example Partner",
  name_ar: "شريك مثال",
  name_en: "Example Partner",
  slug: "example-partner",
  type: "knowledge",
  status: "confirmed",
  logo_url: "/partners/example.svg",
  website: "https://example.org",
  display_order: 3,
  is_public: true,
  identity_status: "verified",
  asset_status: "verified",
  designation_status: "approved",
  logo_source_url: "https://example.org/brand",
  approval_note: "Approved by the partner's communications team.",
}

function strings(value: unknown): string[] {
  return typeof value === "string" ? [value] : Object.values(value as Record<string, unknown>).flatMap(strings)
}

test("admin partners copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminPartnersCopy.ar).sort(), Object.keys(adminPartnersCopy.en).sort())
  for (const [group, keys] of [["types", partnerTypes], ["statuses", partnerStatuses], ["gaps", partnerVisibilityGaps], ["checks", partnerChecks]] as const) {
    assert.deepEqual(Object.keys(adminPartnersCopy.ar[group]).sort(), [...keys].sort(), group)
    assert.deepEqual(Object.keys(adminPartnersCopy.en[group]).sort(), [...keys].sort(), group)
  }
  for (const value of strings(adminPartnersCopy.ar)) assert.match(value, arabic, value)
  for (const value of strings(adminPartnersCopy.en)) assert.doesNotMatch(value, arabic, value)
})

test("the page uses the shared copy, labels every field and reports problems on the field", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, /placeholder=/, "placeholders are not labels")
  assert.match(page, /adminPartners\(locale\)/)
  assert.match(page, /copy\.publicNote/)
  assert.match(page, /validatePartnerForm\(locale, form\)/)
  assert.match(page, /partnerFieldErrors\(/)
  assert.match(page, /partnerVisibility\(partner\)/, "the card must use the public listing rule")
  assert.doesNotMatch(page, /gatewayError|\.message\b/, "raw API messages are not shown")
  assert.doesNotMatch(page, /\{ \.\.\.edit,|values = \{\s*\.\.\.edit/, "the whole API record is no longer echoed back")
  assert.match(page, /headingRef\.current\?\.focus\(\)/, "opening the editor moves focus to it")
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d/, "use logical spacing so RTL and LTR both work")
  for (const name of ["name_ar", "name_en", "website", "logo_url", "logo_source_url", "slug", "display_order", "approval_note"]) {
    assert.match(page, new RegExp(`field\\("${name}"`), `${name} has no labelled field`)
  }
  assert.match(page, /select\("type"/, "the organization type can now be chosen")
  assert.match(page, /select\("status"/)
  assert.match(page, /checkbox\("is_public"/)
  assert.match(page, /partnerChecks\.map/)
})

test("rules, lists and the publishing gate match the admin API", () => {
  const rules = adminController.slice(adminController.indexOf("private function validated"))
  const rule = (field: string) => rules.match(new RegExp(`'${field}' => \\[([^\\]]+(?:\\[[^\\]]*\\][^\\]]*)*)\\]`))?.[1] ?? ""
  for (const field of [...partnerFields, "name"]) assert.ok(rule(field), `${field} is not validated by the API`)
  assert.match(rule("name"), /'required'/)
  const apiStatuses = [...(rule("status").match(/Rule::in\(\[([^\]]+)/)?.[1] ?? "").matchAll(/'([^']+)'/g)].map((match) => match[1])
  assert.deepEqual(apiStatuses.sort(), [...partnerStatuses].sort())
  assert.match(rule("type"), new RegExp(`'max:${partnerLimits.typeMax}'`))
  assert.match(rule("display_order"), new RegExp(`'min:${partnerLimits.displayOrder.min}', 'max:${partnerLimits.displayOrder.max}'`))
  assert.match(rule("approval_note"), new RegExp(`'max:${partnerLimits.noteMax}'`))
  assert.match(rule("logo_source_url"), new RegExp(`'url:https', 'max:${partnerLimits.sourceMax}'`))
  assert.match(rule("identity_status"), /'in:verified,needs_review'/)
  assert.match(rule("designation_status"), /'in:approved,needs_review'/)
  // The API pattern and ours accept and reject the same logo values.
  const apiLogo = rules.match(/'logo_url' => \[.*'regex:~(.+?)~'\]/)?.[1]
  assert.ok(apiLogo)
  const apiPattern = new RegExp(apiLogo.replace(/\\s/g, "\\s"))
  for (const value of ["https://example.org/logo.png", "/partners/a-b_c.svg", "/partners/x.png", "/partners/x.jpg", "http://example.org/x.svg", "/logos/x.svg", "https://ex ample.org"]) {
    assert.equal(partnerLogoPattern.test(value), apiPattern.test(value), value)
  }
  const gate = rules.slice(rules.indexOf("if (($data['is_public']"))
  assert.match(gate, /\$data\['status'\] === 'confirmed'/)
  for (const key of ["logo_url", "logo_source_url", "approval_note", "website"]) assert.match(gate, new RegExp(`empty\\(\\$data\\['${key}'\\]\\)`), key)
  for (const type of partnerTypes) assert.match(migration, new RegExp(`\\b${type}\\b`), type)
})

test("the visibility rule matches the public partners query", () => {
  const query = publicController.slice(publicController.indexOf("public function index"), publicController.indexOf("public function sponsors"))
  for (const condition of ["'is_public', true", "'status', 'confirmed'", "'identity_status', 'verified'", "'asset_status', 'verified'", "'designation_status', 'approved'", "whereNotNull('logo_url')"]) {
    assert.ok(query.includes(condition), condition)
  }
  assert.deepEqual(partnerVisibility(listed), [])
  // Previously the card said "Ready for display" here although the public page did not list it.
  assert.deepEqual(partnerVisibility({ ...listed, status: "prospective" }), ["not_confirmed"])
  assert.deepEqual(partnerVisibility({ ...listed, logo_url: null }), ["logo"])
  assert.deepEqual(
    partnerVisibility({ ...listed, is_public: false, status: "ecosystem-aligned", identity_status: "needs_review", asset_status: "needs_review", designation_status: "needs_review", logo_url: null }),
    [...partnerVisibilityGaps],
  )
})

test("invalid values are caught before sending, in the admin's language", () => {
  const form = {
    ...toPartnerForm(listed),
    name_ar: " ",
    name_en: "",
    website: "example.org",
    logo_url: "/logos/example.jpg",
    logo_source_url: "http://example.org/brand",
    display_order: "-1",
    status: "partner",
  }
  const en = validatePartnerForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), ["display_order", "logo_source_url", "logo_url", "name_en", "status", "website"])
  assert.equal(en.display_order, "Enter a whole number from 0 to 100000.")
  assert.match(validatePartnerForm("ar", form).name_en ?? "", arabic)
  assert.deepEqual(validatePartnerForm("en", toPartnerForm(listed)), {})
  assert.deepEqual(validatePartnerForm("en", { ...toPartnerForm(), name_ar: "جهة جديدة" }), {})
  assert.ok(validatePartnerForm("en", { ...toPartnerForm(listed), display_order: "2.5" }).display_order)
  assert.ok(validatePartnerForm("en", { ...toPartnerForm(listed), approval_note: "a".repeat(2001) }).approval_note)
  // Laravel counts characters: 254 letters and one emoji is 255.
  assert.equal(validatePartnerForm("en", { ...toPartnerForm(listed), name_en: "a".repeat(254) + "🚀" }).name_en, undefined)
  assert.ok(validatePartnerForm("en", { ...toPartnerForm(listed), name_en: "a".repeat(255) + "🚀" }).name_en)
})

test("a confirmed, shown partner needs every check and source, as the API requires", () => {
  const incomplete = { ...toPartnerForm(listed), identity_status: false, logo_url: "", logo_source_url: " ", approval_note: "", website: "" }
  const errors = validatePartnerForm("en", incomplete)
  assert.deepEqual(Object.keys(errors).sort(), ["approval_note", "identity_status", "logo_source_url", "logo_url", "website"])
  assert.equal(errors.logo_url, "Required before a confirmed partner can be shown.")
  // The gate does not apply to a hidden or unconfirmed partner, so drafts can still be saved.
  assert.deepEqual(validatePartnerForm("en", { ...incomplete, is_public: false }), {})
  assert.deepEqual(validatePartnerForm("en", { ...incomplete, status: "prospective" }), {})
})

test("saving sends only editable fields and keeps names apart", () => {
  const payload = partnerPayload({ ...toPartnerForm(listed), name_en: " Example Partner ", slug: " ", display_order: "" })
  assert.deepEqual(Object.keys(payload).sort(), [
    "approval_note", "asset_status", "designation_status", "display_order", "identity_status", "is_public",
    "logo_source_url", "logo_url", "name", "name_ar", "name_en", "slug", "status", "type", "website",
  ])
  assert.equal(payload.name, "Example Partner")
  assert.equal(payload.name_ar, "شريك مثال")
  assert.equal(payload.slug, null)
  assert.equal(payload.display_order, 0)
  assert.equal(payload.identity_status, "verified")
  assert.equal(payload.designation_status, "approved")
  assert.equal(partnerPayload({ ...toPartnerForm(listed), asset_status: false }).asset_status, "needs_review")
  // A record with only a base name keeps it, and the localized API `name` is never written into a language field.
  const legacy = toPartnerForm({ ...listed, name: "Legacy Name", name_ar: null, name_en: null })
  assert.equal(legacy.stored_name, "Legacy Name")
  const legacyPayload = partnerPayload(legacy)
  assert.equal(legacyPayload.name, "Legacy Name")
  assert.equal(legacyPayload.name_en, null)
  assert.equal(toPartnerForm({ ...listed, name: "شريك مثال" }).stored_name, "")
  assert.equal(partnerPayload({ ...toPartnerForm(), name_ar: "جهة" }).name, "جهة")
})

test("labels and API errors", () => {
  assert.equal(partnerTypeLabel("en", "government"), "Government")
  assert.equal(partnerTypeLabel("ar", "legacy"), "legacy")
  assert.equal(partnerStatusLabel("ar", "confirmed"), "مؤكدة")
  assert.equal(partnerName("ar", listed), "شريك مثال")
  assert.equal(partnerName("ar", { ...listed, name_ar: null }), "Example Partner")
  assert.equal(partnerName("en", { name: "Base", name_ar: null, name_en: " " }), "Base")
  assert.deepEqual(partnerFieldErrors({ name: ["x"], approval_note: ["y"], sector: ["z"] }, "Rejected"), { name_en: "Rejected", approval_note: "Rejected" })
  assert.deepEqual(partnerFieldErrors(null, "Rejected"), {})
  assert.equal(partnerFieldId("logo_source_url"), "partner-logo-source-url")
})
