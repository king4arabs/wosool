import assert from 'node:assert/strict'
import test from 'node:test'
import { loadPartnerPages } from './partner-pages'
import { acceleratorPartnerLogos, communityPartnerLogos, uniquePartnerLogos } from './partner-logos'
import type { ApiPartner } from './content-api'

const partner = (id: number): ApiPartner => ({ id, name: `Partner ${id}`, slug: `partner-${id}`, status: 'confirmed', type: 'ecosystem' })

test('the homepage loads every partner page, retaining order and removing repeated records', async () => {
  const calls: number[] = []
  const result = await loadPartnerPages(async page => {
    calls.push(page)
    return { data: page === 1 ? Array.from({ length: 12 }, (_, i) => partner(i + 1)) : [partner(12), partner(13)], meta: { last_page: 2 } }
  })
  assert.deepEqual(calls, [1, 2])
  assert.deepEqual(result.data.map(item => item.id), Array.from({ length: 13 }, (_, i) => i + 1))
})

test('a later failed page is reported, never mistaken for a complete partner collection', async () => {
  await assert.rejects(loadPartnerPages(async page => {
    if (page === 2) throw new Error('API unavailable')
    return { data: [partner(1)], meta: { last_page: 2 } }
  }), /API unavailable/)
  assert.deepEqual(await loadPartnerPages(async () => ({ data: [] })), { data: [] })
})

test('unsafe partner links cannot render and official hotlinks deduplicate against local artwork', () => {
  const items = uniquePartnerLogos([
    { id: 1, name_en: 'The Garage', name_ar: 'الكراج', logo_path: '/partners/the-garage.png' },
    { id: 2, name_en: 'The Garage', name_ar: 'الكراج', logo_path: 'https://thegarage.sa/assets/images/logo/logo.png' },
    { id: 3, name_en: 'CODE', name_ar: 'كود', website: 'javascript:alert(1)' },
  ])
  assert.equal(items.length, 2)
  assert.equal(items[0].logo_path, '/partners/the-garage.png')
  assert.equal(items[1].website, undefined)
})

test('the homepage and EOA snapshots include the supplied Cipher artwork and local RDIA logo', () => {
  for (const partners of [communityPartnerLogos, acceleratorPartnerLogos]) {
    const logos = uniquePartnerLogos(partners)
    assert.equal(logos.find(partner => partner.id === 'cipher-ventures')?.logo_path, 'https://github.com/user-attachments/assets/b9cb90be-b844-4ec2-b8a7-8612ae762ea9')
    assert.equal(logos.find(partner => partner.id === 'rdia')?.logo_path, '/partners/rdia.svg')
  }
})
