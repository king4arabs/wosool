import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { adminGroups, adminLabels, adminServiceDescriptions, adminRouteActive, filterAdminServices } from './admin-navigation'

test('every admin service has a working route and bilingual labels and descriptions', () => {
  const items = adminGroups.flatMap(group => group.items)
  assert.equal(new Set(items.map(item => item.href)).size, items.length)
  for (const { href } of items) {
    assert.ok(existsSync(new URL(`../app${href}/page.tsx`, import.meta.url)), href)
    assert.ok(adminLabels.ar.nav[href] && adminLabels.en.nav[href])
    assert.equal(adminServiceDescriptions[href]?.length, 2, href)
  }
})

test('admin service search works across languages and nested routes keep their current section', () => {
  assert.equal(filterAdminServices('CRM', 'ar')[0].items[0].href, '/admin/crm')
  assert.equal(filterAdminServices('ادارة العلاقات', 'en')[0].items[0].href, '/admin/crm')
  assert.deepEqual(filterAdminServices('no-such-service-123', 'en'), [])
  assert.ok(adminRouteActive('/admin/events/12', '/admin/events'))
  assert.equal(adminRouteActive('/admin/events', '/admin'), false)
  assert.ok(filterAdminServices('', 'ar').flatMap(group => group.items).some(item => item.href === '/eoa/admin'))
})
