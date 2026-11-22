import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  adminUsersCopy,
  blockerText,
  fill,
  shouldReloadReview,
  signalLabel,
  verifyBlockers,
  verifyPayload,
  type IdentityReview,
} from "./admin-users"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/users/page.tsx", import.meta.url), "utf8")
const controller = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/UserController.php", import.meta.url), "utf8")
const identity = readFileSync(new URL("../../../backend/app/Services/FounderIdentityService.php", import.meta.url), "utf8")

const registration = (overrides: Partial<IdentityReview> = {}): IdentityReview => ({
  user: { email_verified: true },
  profile: null,
  application: { onboarding_data: { bio: "Builds logistics software" } },
  candidates: [{ id: 7 }, { id: 9 }],
  ...overrides,
})

test("admin users copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminUsersCopy.ar).sort(), Object.keys(adminUsersCopy.en).sort())
  for (const [key, value] of Object.entries(adminUsersCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminUsersCopy.en)) assert.doesNotMatch(value, arabic, key)
  assert.equal(fill(adminUsersCopy.en.inviteQueued, { queued: 3, skipped: 1 }), "3 invitations queued; 1 ineligible or already processing records skipped.")
  assert.equal(signalLabel("ar", "company_name"), "اسم الشركة")
  assert.equal(signalLabel("en", "linkedin"), "LinkedIn")
  assert.equal(signalLabel("en", "future_signal"), "future_signal")
  for (const signal of ["name", "linkedin", "verified_contact_email", "company_website", "company_name"]) {
    assert.match(identity, new RegExp(`'${signal}'`), `${signal} is still produced by FounderIdentityService`)
  }
})

test("the refusals the helper explains are the ones the API makes", () => {
  assert.match(controller, /abort_unless\(\$user->hasVerifiedEmail\(\), 409, __\('identity\.email'\)\)/)
  assert.match(controller, /'identity_verified' => 'accepted'/)
  assert.match(controller, /if \(\$application\?->onboarding_data\)/)
  assert.match(controller, /abort_unless\(\$profile, 409, __\('identity\.complete'\)\)/)
  assert.match(identity, /abort_if\(\$candidates && ! \$id && ! \$createNew, 409, __\('identity\.match'\)\)/)
  assert.match(identity, /, 409, __\('identity\.stale'\)\)/)
})

test("every reason the approve button is unavailable is named, in the page language", () => {
  assert.deepEqual(verifyBlockers(registration(), "", false), ["choice", "confirm"])
  assert.deepEqual(verifyBlockers(registration(), "7", true), [])
  assert.deepEqual(verifyBlockers(registration(), "new", true), [])
  // A candidate id that is not in the list (for example after a reload) is not a valid choice.
  assert.deepEqual(verifyBlockers(registration(), "8", true), ["choice"])
  assert.deepEqual(verifyBlockers(registration({ user: { email_verified: false } }), "7", true), ["email"])
  assert.deepEqual(verifyBlockers(registration({ application: null }), "", true), ["complete"])
  assert.deepEqual(verifyBlockers(registration({ application: { onboarding_data: null } }), "new", false), ["complete", "confirm"])
  // An account that already has its canonical profile needs no matching choice or registration details.
  assert.deepEqual(verifyBlockers(registration({ profile: { id: 3 }, application: null }), "", true), [])
  for (const blocker of ["email", "complete", "choice", "confirm"] as const) {
    assert.match(blockerText("ar", blocker), arabic, blocker)
    assert.doesNotMatch(blockerText("en", blocker), arabic, blocker)
  }
})

test("the verify request carries only a listed choice and never asks to create a second profile", () => {
  assert.deepEqual(verifyPayload(registration(), "9"), { identity_verified: true, matched_founder_id: 9, create_new_profile: false })
  assert.deepEqual(verifyPayload(registration(), "new"), { identity_verified: true, matched_founder_id: null, create_new_profile: true })
  assert.deepEqual(verifyPayload(registration(), "8"), { identity_verified: true, matched_founder_id: null, create_new_profile: false })
  assert.deepEqual(verifyPayload(registration({ profile: { id: 3 }, candidates: [] }), "new"), { identity_verified: true, matched_founder_id: null, create_new_profile: false })
})

test("a 409 while choosing among matches reloads them instead of leaving a dead end", () => {
  assert.equal(shouldReloadReview(409, registration()), true)
  assert.equal(shouldReloadReview(422, registration()), false)
  assert.equal(shouldReloadReview(409, registration({ profile: { id: 3 } })), false)
  assert.equal(shouldReloadReview(409, registration({ user: { email_verified: false } })), false)
  assert.equal(shouldReloadReview(undefined, registration()), false)
})

test("the page uses the shared copy, explains a disabled approve button and keeps dialog errors in the dialog", () => {
  assert.match(page, /from '@\/lib\/admin-users'/)
  assert.doesNotMatch(page, /t\('[^']*', '[^']*'\)/, "inline Arabic/English pairs belong in admin-users.ts")
  assert.match(page, /verifyBlockers\(review, choice, confirmed\)/)
  assert.match(page, /disabled=\{busy \|\| blockers\.length > 0\}/)
  assert.match(page, /aria-describedby=\{blockers\.length \? 'verify-blockers' : undefined\}/)
  assert.match(page, /verifyPayload\(review, choice\)/)
  assert.match(page, /shouldReloadReview\(status, review\)/)
  assert.match(page, /dialogError/)
  assert.doesNotMatch(page, /<h2 className="font-bold">\{review\.user\.name\}/, "the dialog title is the heading; the member name is below it")
})
