import test from "node:test"
import assert from "node:assert/strict"
import { buildProbes, formatResponseDiagnostics, probeEndpoint, validateOrigin } from "./production-smoke.mjs"

test("covers website, direct Laravel endpoints, and the frontend proxy", () => {
  const probes = buildProbes("https://wosool.org", "https://api.wosool.org")
  assert.equal(probes.length, 16)
  assert.ok(probes.some((p) => p.url === "https://wosool.org/api/health"))
  assert.ok(probes.some((p) => p.url === "https://api.wosool.org/api/ready"))
})

test("newsletter probes detect stale routes without submitting an address or consent", async () => {
  const probes = buildProbes("https://wosool.org", "https://api.wosool.org").filter(probe => probe.kind === "validation" && !probe.fields)
  assert.equal(probes.length, 2)
  for (const spec of probes) {
    await probeEndpoint(spec, async (_url, options) => {
      assert.equal(options.method, "POST")
      assert.equal(options.body, "{}")
      assert.equal(options.redirect, "manual")
      return Response.json({ errors: { email: ["Required"], locale: ["Required"], consent: ["Required"] } }, { status: 422 })
    })
    await assert.rejects(() => probeEndpoint(spec, async () => Response.json({ message: "Route not found" }, { status: 404 })), /Expected HTTP 422; got HTTP 404/)
    await assert.rejects(() => probeEndpoint(spec, async () => Response.json({ message: "Wrong validator" }, { status: 422 })), /newsletter validation/)
    await assert.rejects(() => probeEndpoint(spec, async () => Response.json({ message: "Accepted" }, { status: 202 })), /got HTTP 202/)
  }
})

test("requires safe origins", () => {
  assert.equal(validateOrigin("https://wosool.org/"), "https://wosool.org")
  assert.throws(() => validateOrigin("http://wosool.org"), /HTTPS origin/)
  assert.throws(() => validateOrigin("https://api.wosool.org/api"), /HTTPS origin/)
  assert.equal(validateOrigin("http://localhost:3000", true), "http://localhost:3000")
})

test("accepts a valid JSON health response", async () => {
  const spec = { url: "https://wosool.org/health", kind: "json", status: "healthy", service: "wosool-frontend" }
  const fetcher = async () => new Response('{"status":"healthy","service":"wosool-frontend"}', { headers: { "content-type": "application/json" } })
  await assert.doesNotReject(() => probeEndpoint(spec, fetcher))
})

test("rejects server errors, wrong types, and unhealthy dependencies", async () => {
  const spec = { url: "https://api.wosool.org/api/ready", kind: "json", status: "ready" }
  await assert.rejects(() => probeEndpoint(spec, async () => new Response("bad", { status: 503 })), /HTTP 503/)
  await assert.rejects(() => probeEndpoint(spec, async () => new Response("<html />", { headers: { "content-type": "text/html" } })), /JSON/)
  await assert.rejects(() => probeEndpoint(spec, async () => new Response('{"status":"unavailable"}', { headers: { "content-type": "application/json" } })), /health status/)
})

test("reports safe Hostinger request diagnostics without logging response bodies", async () => {
  const response = new Response("private failure details", {
    status: 500,
    headers: {
      "x-hcdn-request-id": "abc-123",
      "x-hcdn-cache-status": "DYNAMIC",
    },
  })
  assert.equal(
    formatResponseDiagnostics(response),
    " [x-hcdn-request-id=abc-123; x-hcdn-cache-status=DYNAMIC]",
  )
  await assert.rejects(
    () => probeEndpoint({ url: "https://wosool.org/", kind: "html" }, async () => response),
    (error) => error.message.includes("HTTP 500") && error.message.includes("abc-123") && !error.message.includes("private"),
  )
})

test("drops malformed diagnostic headers instead of allowing log injection", () => {
  const response = { headers: { get: () => "request\nforged-log" } }
  assert.equal(formatResponseDiagnostics(response), "")
})

test("rejects an empty or placeholder homepage", async () => {
  const spec = { url: "https://wosool.org/", kind: "html", contains: /Wosool|وصول/i }
  await assert.rejects(() => probeEndpoint(spec, async () => new Response("Maintenance", { headers: { "content-type": "text/html" } })), /homepage/)
  await assert.doesNotReject(() => probeEndpoint(spec, async () => new Response("<title>Wosool</title>", { headers: { "content-type": "text/html" } })))
})

 test("registration monitoring rejects missing OTP routes and pre-OTP registration versions", async () => {
  const probes = buildProbes("https://wosool.org", "https://api.wosool.org")
  for (const spec of probes.filter(p => p.kind === "protected")) {
    await probeEndpoint(spec, async (_url, options) => {
      assert.equal(options.headers.Cookie, undefined)
      assert.equal(options.headers.Origin, undefined)
      return Response.json({ message: "Unauthenticated." }, { status: 401 })
    })
    await assert.rejects(probeEndpoint(spec, async () => Response.json({ message: "Not found" }, { status: 404 })), /got HTTP 404/)
  }
  for (const spec of probes.filter(p => p.fields)) {
    await assert.rejects(probeEndpoint(spec, async () => Response.json({ errors: { name: ["Required"], email: ["Required"], password: ["Required"] } }, { status: 422 })), /current registration/)
    await probeEndpoint(spec, async (_url, options) => {
      assert.equal(options.body, "{}")
      return Response.json({ errors: Object.fromEntries(spec.fields.map(field => [field, ["Required"]])) }, { status: 422 })
    })
  }
})
