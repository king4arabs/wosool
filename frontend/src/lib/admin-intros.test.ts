import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import {
  adminIntrosCopy,
  introActions,
  introDate,
  introFilterCount,
  introQuery,
  introStatusLabel,
  introStatusVariant,
  introStatuses,
} from "./admin-intros"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/intros/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/IntroductionController.php", import.meta.url), "utf8")

test("admin introductions copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminIntrosCopy.ar).sort(), Object.keys(adminIntrosCopy.en).sort())
  for (const [key, value] of Object.entries(adminIntrosCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminIntrosCopy.en)) assert.doesNotMatch(value, arabic, key)
  for (const status of introStatuses) {
    assert.match(introStatusLabel("ar", status), arabic, status)
    assert.doesNotMatch(introStatusLabel("en", status), arabic, status)
    assert.notEqual(introStatusLabel("en", status), status, `${status} is shown as a raw code`)
  }
  assert.equal(introStatusLabel("en", "SOMETHING_NEW"), "SOMETHING_NEW")
})

test("status codes match the values the API accepts", () => {
  const accepted = backend.match(/'routing_status' => \['required', 'in:([^']+)'\]/)?.[1].split(",")
  assert.deepEqual(accepted, [...introStatuses])
})

test("only pending and approved requests can change, and never back to approved", () => {
  assert.deepEqual(introActions("INTRO_PENDING"), ["INTRO_APPROVED", "DECLINED", "ROUTE_EXPIRED"])
  assert.deepEqual(introActions("INTRO_APPROVED"), ["ROUTE_EXPIRED"])
  assert.deepEqual(introActions("DECLINED"), [])
  assert.deepEqual(introActions("ROUTE_EXPIRED"), [])
  assert.equal(introStatusVariant("DECLINED"), "destructive")
  assert.equal(introStatusVariant("INTRO_PENDING"), "warning")
})

test("filters ask the API for one status and count from the per-status totals", () => {
  assert.equal(introQuery("all", 1), "/admin/intros?page=1")
  assert.equal(introQuery("DECLINED", 2), "/admin/intros?page=2&status=DECLINED")
  // `total` is the size of the current filter; "all" must not reuse it.
  const meta = { total: 2, pending: 2, approved: 3, expired: 1, declined: 4 }
  assert.equal(introFilterCount(meta, "all"), 10)
  assert.equal(introFilterCount(meta, "INTRO_PENDING"), 2)
  assert.equal(introFilterCount(null, "all"), null)
})

test("dates are written in the page language in Riyadh time", () => {
  assert.equal(introDate("en", "2026-11-07T22:30:00Z"), "8 Nov 2026")
  assert.match(introDate("ar", "2026-11-07T22:30:00Z") ?? "", /8 نوفمبر 2026/)
  assert.equal(introDate("en", null), null)
  assert.equal(introDate("en", "not a date"), null)
})

test("the page follows the admin's language and does not show raw codes or API text", () => {
  assert.doesNotMatch(page, arabic, "page has fixed Arabic text")
  assert.match(page, /adminIntros\(locale\)/)
  assert.match(page, /introStatusLabel\(locale, item\.routing_status\)/)
  assert.doesNotMatch(page, /\{item\.routing_status\}/, "status codes must be labelled")
  assert.doesNotMatch(page, /e\.message|err\.message/, "raw API text must not replace page copy")
  assert.doesNotMatch(page, />(?:Approve|Decline|Expire|Intros|Route Ledger)</, "fixed English labels")
  assert.match(page, /introActions\(item\.routing_status\)/, "actions depend on the current status")
  assert.match(page, /disabled=\{busy\}/, "a request cannot be changed twice while saving")
  assert.match(page, /links\?\.next/, "requests beyond the first page are reachable")
  assert.match(page, /currentFilter\.current/, "reloads load the filter shown now")
})
