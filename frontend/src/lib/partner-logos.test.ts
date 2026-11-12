import assert from "node:assert/strict"
import test from "node:test"
import { acceleratorPartnerLogos, acceleratorPartnersToDisplay, communityPartnerLogos, monshaatPartnerLogo, partnersToDisplay } from "./partner-logos"

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

test('EOA includes the requested Monsha’at logo without publishing unrelated fallback partners', () => {
  for (const published of [undefined, null, []]) {
    assert.deepEqual(acceleratorPartnersToDisplay(published).map(partner => partner.id), ['eo-riyadh', 'monshaat'])
  }
  const other = { id: 12, name_ar: 'شريك', name_en: 'Published partner', website: 'https://example.org/', logo_path: '/partners/kaust.svg' }
  assert.deepEqual(acceleratorPartnersToDisplay([other]), [other, monshaatPartnerLogo])
})

test('EOA normalizes existing Monsha’at entries to one official, resized logo', () => {
  const old = { id: 32, name_ar: 'منشآت', name_en: 'Monshaat', website: 'https://monshaat.gov.sa/', logo_path: '/storage/old-monshaat.png' }
  assert.deepEqual(acceleratorPartnersToDisplay([old, monshaatPartnerLogo]), [monshaatPartnerLogo])
  const unrelated = { ...old, website: 'https://monshaat.gov.sa.example.com/' }
  assert.equal(acceleratorPartnersToDisplay([unrelated]).length, 2)
})
