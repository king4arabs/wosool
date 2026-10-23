import test from "node:test"
import assert from "node:assert/strict"
import { dependencyHealth } from "./health"
import { sanitizedRuntimeError } from "./runtime-diagnostics"
import { GET } from "../app/health/route"

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://site.example",
  NEXT_PUBLIC_API_URL: "https://api.example",
  NEXT_PUBLIC_ENABLE_DEMO_CONTENT: "false",
}

test("liveness returns 200 without configuration or a database", async () => {
  const response = await GET(new Request("http://localhost/health"))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: "healthy", service: "wosool-frontend" })
  assert.match(response.headers.get("cache-control")!, /no-store/)
})

test("missing and invalid configuration fails readiness without making network requests", async () => {
  for (const env of [
    {},
    { ...valid, NEXT_PUBLIC_API_URL: "" },
    { ...valid, NEXT_PUBLIC_SITE_URL: "" },
    { ...valid, NEXT_PUBLIC_ENABLE_DEMO_CONTENT: undefined },
    { ...valid, NEXT_PUBLIC_API_URL: valid.NEXT_PUBLIC_SITE_URL },
    { ...valid, NEXT_PUBLIC_API_URL: "http://localhost:8000" },
    { ...valid, NEXT_PUBLIC_API_URL: "https://api.example/api" },
    { ...valid, NEXT_PUBLIC_API_URL: "not-a-url" },
  ]) {
    const response = await dependencyHealth(env, async () => {
      assert.fail("Invalid configuration must not trigger a request")
    })
    assert.equal(response.status, 503)
    assert.deepEqual((await response.json()).checks, { configuration: "invalid", backend: "not_checked" })
  }
})

test("readiness checks Laravel readiness with a bounded non-cached request", async () => {
  const response = await dependencyHealth(valid, async (url, options) => {
    assert.equal(url, "https://api.example/api/ready")
    assert.equal(options?.redirect, "error")
    assert.equal(options?.cache, "no-store")
    assert.ok(options?.signal)
    return Response.json({ status: "ready" })
  })
  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).checks, { configuration: "ready", backend: "ready" })
})

test("unhealthy database/backend responses fail readiness without exposing their bodies", async () => {
  for (const backend of [
    Response.json({ status: "unavailable", message: "private diagnostic" }, { status: 503 }),
    Response.json({ status: "healthy" }),
    new Response("private diagnostic", { headers: { "Content-Type": "text/html" } }),
  ]) {
    const response = await dependencyHealth(valid, async () => backend)
    assert.equal(response.status, 503)
    const body = await response.json()
    assert.equal(body.checks.backend, "unavailable")
    assert.ok(!JSON.stringify(body).includes("private diagnostic"))
  }
})

test("dependency connection and timeout failures return 503 with sanitized stderr", async (t) => {
  const entries: string[] = []
  t.mock.method(console, "error", (entry: string) => entries.push(entry))
  const response = await dependencyHealth(valid, async () => {
    throw new Error("private diagnostic https://example.invalid/sensitive")
  })
  assert.equal(response.status, 503)
  assert.equal((await response.json()).checks.backend, "unavailable")
  assert.equal(entries.length, 1)
  assert.equal(JSON.parse(entries[0]).code, "HEALTH_DEPENDENCY_FAILED")
  assert.ok(!entries[0].includes("private diagnostic"))
  assert.ok(!entries[0].includes("sensitive"))
})

test("sanitized errors preserve error type and stack coordinates, not messages or paths", () => {
  const error = new TypeError("private diagnostic")
  error.stack = "TypeError: private diagnostic\n    at run (/private/path/file.js:12:34)\n    at https://example.invalid/private"
  assert.deepEqual(sanitizedRuntimeError(error, "NEXT_REQUEST_FAILED"), {
    code: "NEXT_REQUEST_FAILED", type: "TypeError", stack: ["at <redacted>:12:34"],
  })
  assert.deepEqual(sanitizedRuntimeError("private diagnostic", "NEXT_REQUEST_FAILED"), {
    code: "NEXT_REQUEST_FAILED", type: "Error", stack: [],
  })
})
