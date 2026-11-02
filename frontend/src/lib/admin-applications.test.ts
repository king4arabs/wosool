import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { adminApplicationsCopy, applicationAllCount, applicationPage, applicationRange, applicationStatuses, applicationStatusLabel } from "./admin-applications"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/members/page.tsx", import.meta.url), "utf8")

test("application review copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminApplicationsCopy.ar).sort(), Object.keys(adminApplicationsCopy.en).sort())
  for (const [key, value] of Object.entries(adminApplicationsCopy.ar)) if (key !== "linkedin") assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminApplicationsCopy.en)) assert.doesNotMatch(value, arabic, key)
  for (const status of applicationStatuses) {
    assert.match(applicationStatusLabel("ar", status), arabic)
    assert.doesNotMatch(applicationStatusLabel("en", status), arabic)
  }
})

test("the admin applications page follows the admin's language and direction", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.match(page, /adminApplications\(locale\)/)
  assert.doesNotMatch(page, /dir="rtl"/, "a fixed RTL direction breaks the English layout")
  assert.doesNotMatch(page, /text-right|text-left/, "table headers must use logical alignment")
})

test("every form control in the review dialog has a label tied to it", () => {
  for (const id of ["application-status", "application-invite-link", "application-admin-notes"]) {
    assert.match(page, new RegExp(`htmlFor="${id}"`))
    assert.match(page, new RegExp(`id="${id}"`))
  }
})

test("the list can reach applications past the first API page", () => {
  assert.match(page, /page,\n/, "the page number is sent to the API")
  assert.match(page, /aria-label=\{copy\.pagination\}/)
  assert.deepEqual(applicationPage({ total: 45, per_page: 20, current_page: 2, last_page: 3 }, 20), { page: 2, lastPage: 3, total: 45, from: 21, to: 40 })
  assert.deepEqual(applicationPage({ total: 45, per_page: 20, current_page: 3, last_page: 3 }, 5), { page: 3, lastPage: 3, total: 45, from: 41, to: 45 })
  // An older API without last_page still pages from total and per_page.
  assert.equal(applicationPage({ total: 41, per_page: 20, current_page: 1 }, 20).lastPage, 3)
  assert.deepEqual(applicationPage({}, 0), { page: 1, lastPage: 1, total: 0, from: 0, to: 0 })
  assert.equal(applicationRange("en", applicationPage({ total: 45, per_page: 20, current_page: 3, last_page: 3 }, 5)), "41–45 of 45")
  assert.equal(applicationRange("ar", applicationPage({ total: 45, per_page: 20, current_page: 1, last_page: 3 }, 20)), "1–20 من 45")
  assert.equal(applicationRange("en", applicationPage({ total: 0 }, 0)), "0 applications")
})

test("the overall total tile does not shrink when a status filter is applied", () => {
  assert.equal(applicationAllCount({ total: 3, all: 23 }), 23)
  assert.equal(applicationAllCount({ total: 3 }), 3)
  assert.equal(applicationAllCount(null), 0)
  assert.match(page, /applicationAllCount\(meta\)/)
})

test("stale responses cannot overwrite a newer search, filter or page", () => {
  assert.match(page, /request !== latestRequest\.current/)
})
