import assert from "node:assert/strict"
import test from "node:test"
import { safeRedirect, workspacePath } from "./navigation"

test("authentication only redirects to local application routes", () => {
  assert.equal(safeRedirect("/dashboard/events?view=upcoming#bookings"), "/dashboard/events?view=upcoming#bookings")
  for (const path of [null, "https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "/login", "/login?redirect=/dashboard", "/\n/evil.com"]) {
    assert.equal(safeRedirect(path), "/dashboard", String(path))
  }
})

test('all Accelerator accounts return to the canonical workspace without granting admin access', () => {
  for (const role of ['eoa_applicant', 'eoa_lead', 'eoa_staff', 'eoa_reviewer', 'eoa_coach', 'accelerator-reviewer']) {
    assert.equal(workspacePath({ roles: [role] }), '/EOA/account')
  }
  assert.equal(workspacePath({ is_accelerator_applicant: true }), '/EOA/account')
  assert.equal(workspacePath({ roles: ['member'] }), '/dashboard')
  assert.equal(workspacePath({ roles: ['admin', 'eoa_applicant'] }), '/admin')
  assert.equal(safeRedirect('//evil.test', workspacePath({ roles: ['eoa_applicant'] })), '/EOA/account')
})
