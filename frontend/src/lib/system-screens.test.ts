import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { errorDigest, systemScreens, systemScreensCopy } from "./system-screens"

const arabic = /[؀-ۿ]/
const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")

test("404, error, loading and toast copy has the same keys in Arabic and English", () => {
  assert.deepEqual(Object.keys(systemScreensCopy.ar).sort(), Object.keys(systemScreensCopy.en).sort())
  for (const [key, value] of Object.entries(systemScreensCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(systemScreensCopy.en)) assert.doesNotMatch(value, arabic, key)
})

test("the error screen does not claim that anyone was notified", () => {
  for (const locale of ["ar", "en"] as const) {
    const body = systemScreens(locale).errorBody
    assert.doesNotMatch(body, /notified|team has been|تم إبلاغ|أُبلغ/i)
  }
})

test("only a non-empty string digest is shown as an error ID", () => {
  assert.equal(errorDigest(Object.assign(new Error("x"), { digest: "123456" })), "123456")
  assert.equal(errorDigest(new Error("x")), null)
  assert.equal(errorDigest({ digest: 42 }), null)
  assert.equal(errorDigest({ digest: "  " }), null)
  assert.equal(errorDigest("boom"), null)
  assert.equal(errorDigest(null), null)
})

test("system screens render from the dictionary, not fixed English or Arabic text", () => {
  const notFound = source("../app/not-found.tsx")
  const error = source("../app/error.tsx")
  const loading = source("../app/loading.tsx")
  const toast = source("../components/ui/toast.tsx")

  assert.doesNotMatch(notFound, arabic)
  assert.doesNotMatch(error, />\s*(Something went wrong|Try Again|Go Home)\s*</)
  assert.doesNotMatch(loading, /Loading…<|aria-label="Loading"/)
  assert.doesNotMatch(toast, /aria-label="(Notifications|Dismiss notification)"/)
  for (const file of [notFound, error, loading, toast]) assert.match(file, /systemScreens\(locale\)/)
})

test("the error screen re-fetches with retry() and uses RTL-safe icon spacing", () => {
  const error = source("../app/error.tsx")
  assert.match(error, /retry\(\)/)
  assert.doesNotMatch(error, /\breset\b/)
  for (const file of [error, source("../app/not-found.tsx")]) assert.doesNotMatch(file, /\b(ml|mr)-2\b/)
})
