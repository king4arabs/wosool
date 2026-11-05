import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { eoaOrganizationLogo } from './eoa-organizations'

test('all existing EOA organizations have local logo artwork even on an older API', () => {
  const organizations = JSON.parse(readFileSync(new URL('../../../backend/database/data/eoa-organizations.json', import.meta.url), 'utf8'))
  for (const organization of organizations) {
    const logo = eoaOrganizationLogo(organization)
    assert.ok(logo, organization.name_en)
    assert.ok(existsSync(new URL(`../../public${logo}`, import.meta.url)), logo)
  }
})

test('logo resolution preserves uploaded artwork and distinguishes CODE from the ministry', () => {
  assert.equal(eoaOrganizationLogo({ website: 'https://mcit.gov.sa/code', logo_path: '' }), '/partners/code.png')
  assert.equal(eoaOrganizationLogo({ website: 'https://www.mcit.gov.sa/' }), '/partner-ecosystem/mcit.svg')
  assert.equal(eoaOrganizationLogo({ website: 'https://www.monshaat.gov.sa' }), '/partner-ecosystem/monshaat-official.png')
  assert.equal(eoaOrganizationLogo({ website: 'https://ntdp.mcit.gov.sa' }), '/partners/ntdp.svg')
  assert.equal(eoaOrganizationLogo({ website: 'https://www.monshaat.gov.sa', logo_path: '/storage/custom-logo.png' }), '/storage/custom-logo.png')
  assert.equal(eoaOrganizationLogo({ website: 'https://monshaat.gov.sa.example.com' }), undefined)
})
