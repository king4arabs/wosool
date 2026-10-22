import assert from "node:assert/strict"
import test from "node:test"
import { founderRows, publicWebsite } from "./community-display"
import { mapFounder } from "./content-api"

test("founder rows preserve all profiles without invented or duplicated cards", () => {
  assert.deepEqual(founderRows([1,2,3,4,5]), [[1,3,5], [2,4]])
  assert.deepEqual(founderRows([]), [])
  assert.deepEqual(founderRows([1]), [[1]])
})
test("public website links only accept explicit web URLs", () => {
  assert.equal(publicWebsite("https://example.com/startup"), "https://example.com/startup")
  for (const url of [undefined, "javascript:alert(1)", "data:text/html,test", "/admin", "//evil.test", "https://user:password@example.com"]) assert.equal(publicWebsite(url), undefined)
})
test("founder cards retain the company relationship and assets from the public API", () => {
  const founder = mapFounder({ id: 1, slug: "test", name: "Test", avatar_url: "/portrait.png", is_verified: false, is_featured: false, companies: [{ id: 2, name: "Company", slug: "company", description: "Company brief", logo_url: "/logo.svg", website: "https://example.com", sector: "Technology", is_hiring: false, is_fundraising: false, is_collaborating: false }] })
  assert.equal(founder.avatarUrl, "/portrait.png")
  assert.equal(founder.primaryCompany?.description, "Company brief")
  assert.equal(founder.primaryCompany?.logoUrl, "/logo.svg")
  assert.equal(founder.primaryCompany?.website, "https://example.com")
})

test('public cards preserve social links and the primary company position', () => {
  const founder = mapFounder({ id: 8, slug: 'founder', name: 'Founder', is_verified: false, is_featured: false, linkedin_url: 'https://www.linkedin.com/in/example/', twitter_url: 'https://x.com/example', country_code: 'SA', companies: [
    {id:1,name:'Other',slug:'other',is_hiring:false,is_fundraising:false,is_collaborating:false},
    {id:2,name:'Primary',slug:'primary',is_hiring:false,is_fundraising:false,is_collaborating:false,pivot:{role:'Co-founder',is_primary:true}}
  ] })
  assert.equal(founder.companyName, 'Primary')
  assert.equal(founder.position, 'Co-founder')
  assert.equal(founder.linkedinUrl, 'https://www.linkedin.com/in/example/')
  assert.equal(founder.twitterUrl, 'https://x.com/example')
  assert.equal(founder.countryCode, 'SA')
})
