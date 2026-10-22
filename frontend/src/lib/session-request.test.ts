import assert from "node:assert/strict"
import test from "node:test"
import { sessionFetch } from "./session-request"

test("session writes decode the CSRF cookie, preserve headers, and do not leak it cross-origin", async () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document")
  const originalFetch = globalThis.fetch
  const documentMock = { cookie: "XSRF-TOKEN=token%2Bvalue%3D", documentElement: { lang: "en" } }
  const calls: Array<{ url: string; init?: RequestInit }> = []
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://wosool.org" } } })
  Object.defineProperty(globalThis, "document", { configurable: true, value: documentMock })
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init })
    if (String(input).endsWith("csrf-cookie")) documentMock.cookie = "XSRF-TOKEN=new%3Dtoken"
    return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
  }
  try {
    await sessionFetch("/api/v1/contact", { method: "POST", headers: { "X-Test": "preserved" } })
    const headers = new Headers(calls[0].init?.headers)
    assert.equal(headers.get("X-XSRF-TOKEN"), "token+value=")
    assert.equal(headers.get("X-Test"), "preserved")
    assert.equal(headers.get("X-Locale"), "en")
    assert.equal(calls[0].init?.credentials, "include")
    await sessionFetch("https://example.com/api", { method: "POST" })
    assert.equal(new Headers(calls[1].init?.headers).has("X-XSRF-TOKEN"), false)
    documentMock.cookie = ""
    await sessionFetch("/api/v1/auth/reset-password", { method: "POST" })
    assert.equal(calls[2].url, "/api/v1/auth/csrf-cookie")
    assert.equal(new Headers(calls[3].init?.headers).get("X-XSRF-TOKEN"), "new=token")
    documentMock.cookie = ""
    await sessionFetch("/api/v1/events")
    assert.equal(calls.length, 5)
  } finally {
    globalThis.fetch = originalFetch
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor)
    else Reflect.deleteProperty(globalThis, "window")
    if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor)
    else Reflect.deleteProperty(globalThis, "document")
  }
})

test("a stale CSRF cookie is refreshed once and failed writes are not blindly replayed", async () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document")
  const originalFetch = globalThis.fetch
  const documentMock = { cookie: "other=x;XSRF-TOKEN=expired", documentElement: { lang: "ar" } }
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://wosool.org" } } })
  Object.defineProperty(globalThis, "document", { configurable: true, value: documentMock })
  let writes = 0
  let refreshes = 0
  let status = 419
  globalThis.fetch = async (input, init) => {
    if (String(input).endsWith("csrf-cookie")) { refreshes++; documentMock.cookie = "XSRF-TOKEN=fresh"; return new Response(null, { status: 204 }) }
    writes++
    const token = new Headers(init?.headers).get("X-XSRF-TOKEN")
    return new Response("{}", { status: status === 419 && token === "fresh" ? 200 : status })
  }
  try {
    assert.equal((await sessionFetch("/api/v1/member/settings", { method: "PUT", body: "{}" })).status, 200)
    assert.equal(writes, 2); assert.equal(refreshes, 1)
    status = 500
    assert.equal((await sessionFetch("/api/v1/contact", { method: "POST" })).status, 500)
    assert.equal(writes, 3); assert.equal(refreshes, 1)
    const controller = new AbortController(); controller.abort()
    await assert.rejects(sessionFetch("/api/v1/contact", { method: "POST", signal: controller.signal }), { name: "AbortError" })
    assert.equal(writes, 3)
  } finally {
    globalThis.fetch = originalFetch
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor); else Reflect.deleteProperty(globalThis, "window")
    if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor); else Reflect.deleteProperty(globalThis, "document")
  }
})
