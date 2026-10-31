import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { profileErrorId, profileFieldErrors, profileInvalidProps } from "./profile-form-errors"

const page = readFileSync(new URL("../app/dashboard/profile/page.tsx", import.meta.url), "utf8")

test("list item errors land on their field, keeping the first message", () => {
  const errors = profileFieldErrors(
    {
      "skills.1": ["Keep each skill to 100 characters or fewer."],
      "skills.3": ["Second skill message"],
      "needs.0": ["Keep each need to 255 characters or fewer."],
      country_code: ["The country code field must be 2 characters."],
    },
    "Invalid value",
  )
  assert.deepEqual(errors, {
    skills: "Keep each skill to 100 characters or fewer.",
    needs: "Keep each need to 255 characters or fewer.",
    country_code: "The country code field must be 2 characters.",
  })
})

test("an empty or missing message falls back to readable copy", () => {
  assert.deepEqual(profileFieldErrors({ bio: [], tagline: [""], stage: "Too long" }, "Check this field"), {
    bio: "Check this field",
    tagline: "Check this field",
    stage: "Too long",
  })
  assert.deepEqual(profileFieldErrors(null, "x"), {})
})

test("an invalid field points at its visible message", () => {
  assert.deepEqual(profileInvalidProps({ bio: "Too long" }, "bio"), { "aria-invalid": true, "aria-describedby": "profile-bio-error" })
  assert.deepEqual(profileInvalidProps({}, "bio"), { "aria-invalid": false })
  assert.equal(profileErrorId("linkedin_url"), "profile-linkedin_url-error")
})

test("every field the profile API validates can show its error on the page", () => {
  const request = readFileSync(new URL("../../../backend/app/Http/Requests/UpdateFounderProfileRequest.php", import.meta.url), "utf8")
  const fields = [...request.matchAll(/^\s*'([a-z_]+)' =>/gm)].map((m) => m[1]).filter((field) => field !== "is_public")
  assert.ok(fields.length >= 15, "rules were read")
  for (const field of fields) {
    assert.match(page, new RegExp(`profileInvalidProps\\(errors, ["']${field}["']\\)`), `${field} is marked invalid`)
    const message = new RegExp(`name="${field}" error=\\{errors\\.${field}\\}|profileErrorId\\("${field}"\\)`)
    assert.match(page, message, `${field} message has an id`)
  }
})

test("the page flattens API errors and moves focus to the first invalid field", () => {
  assert.match(page, /profileFieldErrors\(data\.errors/)
  assert.match(page, /\[aria-invalid="true"\]/)
  assert.doesNotMatch(page, /aria-invalid=\{Boolean\(errors\./)
  assert.doesNotMatch(page, /text-red-500/, "small red text needs red-600 for 4.5:1 contrast")
})
