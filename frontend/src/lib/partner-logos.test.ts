import assert from "node:assert/strict"
import test from "node:test"
import { acceleratorPartnerLogos, communityPartnerLogos, partnersToDisplay } from "./partner-logos"

test("an empty or missing partner list falls back to the owner's logos", () => {
  assert.deepEqual(partnersToDisplay([], communityPartnerLogos), communityPartnerLogos)
  assert.deepEqual(partnersToDisplay(null, communityPartnerLogos), communityPartnerLogos)
  assert.deepEqual(partnersToDisplay(undefined, acceleratorPartnerLogos), acceleratorPartnerLogos)
  // Entries without artwork cannot fill a logo strip either.
  assert.deepEqual(partnersToDisplay([{ id: 1, name_ar: "أ", name_en: "A" }], communityPartnerLogos), communityPartnerLogos)
})

test("published partners with logos take priority", () => {
  const published = [{ id: 7, name_ar: "ب", name_en: "B", logo_path: "/partners/kaust.svg" }]
  assert.equal(partnersToDisplay(published, communityPartnerLogos), published)
})

test("every fallback logo has artwork and a website", () => {
  for (const partner of [...communityPartnerLogos, ...acceleratorPartnerLogos]) {
    assert.ok(partner.logo_path, partner.name_en)
    assert.match(partner.website ?? "", /^https:\/\//, partner.name_en)
  }
})
