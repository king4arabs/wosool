import assert from "node:assert/strict"
import test from "node:test"
import { publicJourney, safeRedirect, workspacePath } from "./navigation"

test("authentication only redirects to local application routes", () => {
  assert.equal(safeRedirect("/dashboard/events?view=upcoming#bookings"), "/dashboard/events?view=upcoming#bookings")
  for (const path of [null, "https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "/login", "/login?redirect=/dashboard", "/\n/evil.com"]) {
    assert.equal(safeRedirect(path), "/dashboard", String(path))
  }
})

test('community and Accelerator navigation retain separate application and account paths', () => {
  for (const path of ['/', '/about', '/founders', '/events', '/EOAnother']) {
    assert.deepEqual(publicJourney(path), { isEoa: false, applyHref: '/apply', loginHref: '/login' })
  }
  for (const path of ['/EOA', '/EOA/about', '/EOA/apply', '/EOA/account']) {
    assert.deepEqual(publicJourney(path), { isEoa: true, applyHref: '/EOA/apply', loginHref: '/EOA/account' })
  }
})

test('all Accelerator accounts return to the canonical workspace without granting admin access', () => {
  for (const role of ['eoa_applicant', 'eoa_lead', 'eoa_staff', 'eoa_reviewer', 'eoa_coach', 'accelerator-reviewer']) {
    assert.equal(workspacePath({ roles: [role] }), '/dashboard/eoa')
  }
  assert.equal(workspacePath({ is_accelerator_applicant: true }), '/dashboard/eoa')
  assert.equal(workspacePath({ roles: ['member'] }), '/dashboard')
  assert.equal(workspacePath({ roles: ['admin', 'eoa_applicant'] }), '/admin')
  assert.equal(safeRedirect('//evil.test', workspacePath({ roles: ['eoa_applicant'] })), '/dashboard/eoa')
})
