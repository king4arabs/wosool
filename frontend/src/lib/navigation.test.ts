import assert from "node:assert/strict"
import test from "node:test"
import { safeRedirect } from "./navigation"

test("authentication only redirects to local application routes", () => {
  assert.equal(safeRedirect("/dashboard/events?view=upcoming#bookings"), "/dashboard/events?view=upcoming#bookings")
  for (const path of [null, "https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "/login", "/login?redirect=/dashboard", "/\n/evil.com"]) {
    assert.equal(safeRedirect(path), "/dashboard", String(path))
  }
})
