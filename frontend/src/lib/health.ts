import { sanitizedRuntimeError } from "./runtime-diagnostics"

type HealthEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string
  NEXT_PUBLIC_API_URL?: string
  NEXT_PUBLIC_ENABLE_DEMO_CONTENT?: string
}

function origin(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

/** Opt-in readiness: the ordinary /health probe stays independent of Laravel. */
export async function dependencyHealth(env: HealthEnvironment, fetchImpl = fetch) {
  const site = origin(env.NEXT_PUBLIC_SITE_URL)
  const api = origin(env.NEXT_PUBLIC_API_URL)
  const checks = {
    configuration: site && api && site !== api && env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT === "false"
      ? "ready" : "invalid",
    backend: "not_checked",
  }
  if (checks.configuration === "ready" && api) {
    try {
      const response = await fetchImpl(`${api}/api/ready`, {
        cache: "no-store",
        redirect: "error",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      })
      checks.backend = response.ok && (await response.json())?.status === "ready"
        ? "ready" : "unavailable"
    } catch (error) {
      checks.backend = "unavailable"
      console.error(JSON.stringify(sanitizedRuntimeError(error, "HEALTH_DEPENDENCY_FAILED")))
    }
  }
  const ready = checks.configuration === "ready" && checks.backend === "ready"
  return Response.json(
    { status: ready ? "ready" : "degraded", service: "wosool-frontend", checks },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" },
    },
  )
}
