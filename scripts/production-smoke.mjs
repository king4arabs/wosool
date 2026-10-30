import { pathToFileURL } from "node:url"

export function validateOrigin(value, allowLocalHttp = false) {
  const url = new URL(value)
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (
    (url.protocol !== "https:" && !(allowLocalHttp && local && url.protocol === "http:")) ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash
  ) throw new Error("Smoke-check target must be an HTTPS origin without paths or credentials")
  return url.origin
}

export function buildProbes(site, api) {
  return [
    { name: "Frontend liveness", url: site + "/health", kind: "json", status: "healthy", service: "wosool-frontend" },
    { name: "Homepage", url: site + "/", kind: "html", contains: /Wosool|وصول/i },
    { name: "Accelerator page", url: site + "/eoa", kind: "html" },
    { name: "Laravel liveness", url: api + "/api/health", kind: "json", status: "healthy" },
    { name: "Laravel readiness", url: api + "/api/ready", kind: "json", status: "ready" },
    { name: "Same-origin API proxy", url: site + "/api/health", kind: "json", status: "healthy" },
    // Detect stale API releases that ignore the exact founder slug filter even
    // when /api/ready reports healthy. No accounts or private records are read.
    ...[["Direct", api], ["Same-origin", site]].map(([label, origin]) => ({
      name: `${label} founder slug lookup`,
      url: origin + "/api/v1/founders?slug=wosool-smoke-no-founder-0000000000000000&per_page=1",
      kind: "empty-founder-list",
    })),
    ...[["Direct", api], ["Same-origin", site]].flatMap(([label, origin]) => [
      ...["verify", "resend"].map(action => ({
        name: `${label} registration ${action}`, url: origin + "/api/v1/auth/registration/" + action,
        kind: "protected", method: "POST", expectedStatus: 401,
      })),
      { name: `${label} registration application`, url: origin + "/api/v1/registration/application", kind: "protected", expectedStatus: 401 },
      { name: `${label} registration validation`, url: origin + "/api/v1/auth/register", kind: "validation", method: "POST", expectedStatus: 422,
        fields: ["name", "email", "password", "consent"] },
    ]),
    // Empty JSON must fail validation before persistence or mail delivery.
    ...[["Direct newsletter route", api], ["Same-origin newsletter route", site]].map(([name, origin]) => ({
      name, url: origin + "/api/v1/newsletter/subscribe", kind: "validation", method: "POST", expectedStatus: 422,
    })),
  ]
}

const diagnosticHeaders = ["x-hcdn-request-id", "x-hcdn-cache-status"]

export function formatResponseDiagnostics(response) {
  const values = diagnosticHeaders.flatMap((name) => {
    const value = response.headers.get(name)
    if (!value || value.length > 160 || !/^[A-Za-z0-9._: /-]+$/.test(value)) return []
    return [`${name}=${value}`]
  })
  return values.length ? ` [${values.join("; ")}]` : ""
}

export async function probeEndpoint(spec, fetchImpl = fetch) {
  const response = await fetchImpl(spec.url, {
    method: spec.method || "GET", redirect: "manual",
    headers: { Accept: spec.kind === "html" ? "text/html" : "application/json", ...(spec.kind === "validation" ? { "Content-Type": "application/json" } : {}) },
    ...(spec.kind === "validation" ? { body: "{}" } : {}),
    signal: AbortSignal.timeout(12000),
  })
  const expectedStatus = spec.expectedStatus || 200
  if (response.status !== expectedStatus) {
    throw new Error("Expected HTTP " + expectedStatus + "; got HTTP " + response.status + formatResponseDiagnostics(response))
  }
  const contentType = response.headers.get("content-type") || ""
  if (spec.kind === "validation") {
    if (!contentType.includes("application/json")) throw new Error("Expected JSON content type")
    const data = await response.json()
    if (!(spec.fields || ["email", "locale", "consent"]).every(field => Array.isArray(data?.errors?.[field]) && data.errors[field].length > 0)) {
      throw new Error(spec.fields ? "Expected current registration validation errors" : "Expected newsletter validation errors")
    }
  } else if (spec.kind === "empty-founder-list") {
    if (!contentType.includes("application/json")) throw new Error("Expected JSON public founder collection")
    const data = await response.json()
    if (!Array.isArray(data?.data) || data.data.length !== 0 || data?.meta?.total !== 0) {
      throw new Error("Founder slug filter is missing or returns unrelated profiles; deploy matching Laravel API before publishing account card links")
    }
  } else if (spec.kind === "protected") {
    if (!contentType.includes("application/json")) throw new Error("Expected JSON authentication response")
    const data = await response.json()
    if (typeof data?.message !== "string" || data.user) throw new Error("Expected unauthenticated response")
  } else if (spec.kind === "json") {
    if (!contentType.includes("application/json")) throw new Error("Expected JSON content type")
    const data = await response.json()
    if (data?.status !== spec.status || (spec.service && data?.service !== spec.service)) {
      throw new Error("Unexpected health status")
    }
  } else {
    if (!contentType.includes("text/html")) throw new Error("Expected HTML content type")
    const html = await response.text()
    if (spec.contains && !spec.contains.test(html)) throw new Error("Expected Wosool homepage content")
  }
}

export async function runSmoke(env = process.env, fetchImpl = fetch) {
  const site = validateOrigin(env.WOSOOL_SITE_ORIGIN || "https://wosool.org", env.SMOKE_ALLOW_HTTP === "1")
  const api = validateOrigin(env.WOSOOL_API_ORIGIN || "https://api.wosool.org", env.SMOKE_ALLOW_HTTP === "1")
  if (site === api) throw new Error("Site and API monitoring origins must be different")
  const probes = buildProbes(site, api)
  let failures = 0
  for (const spec of probes) {
    try {
      await probeEndpoint(spec, fetchImpl)
      console.log("PASS " + spec.name)
    } catch (error) {
      failures += 1
      // Do not log response bodies, tokens, or session data.
      console.error("FAIL " + spec.name + ": " + (error instanceof Error ? error.message : "Request failed"))
    }
  }
  console.log("Wosool production checks: " + (probes.length - failures) + "/" + probes.length + " passed")
  return failures === 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSmoke()
    .then((success) => { if (!success) process.exitCode = 1 })
    .catch((error) => {
      console.error("Production smoke checks could not start: " + error.message)
      process.exitCode = 1
    })
}
