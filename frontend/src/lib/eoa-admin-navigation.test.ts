import assert from 'node:assert/strict'
import test from 'node:test'
import { eoaAdminTab } from './eoa-admin-navigation'

test('Accelerator deep links are limited to the available capabilities', () => {
  assert.equal(eoaAdminTab('applications', { lead: false }, false), 'applications')
  assert.equal(eoaAdminTab('board', { lead: false }, true), 'board')
  assert.equal(eoaAdminTab('editorial', { lead: false }, true), 'overview')
  assert.equal(eoaAdminTab('editorial', { lead: true }, true), 'editorial')
  assert.equal(eoaAdminTab('accounts', { lead: true }, true), 'overview')
  assert.equal(eoaAdminTab('accounts', { lead: false, manage_roles: true }, false), 'accounts')
  assert.equal(eoaAdminTab('program', { lead: true }, false), 'overview')
  assert.equal(eoaAdminTab('unknown', { lead: true, manage_roles: true }, true), 'overview')
})
