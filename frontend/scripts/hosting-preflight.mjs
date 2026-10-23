import { pathToFileURL } from "node:url"

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"])

// Run with the real hosting environment before publishing; never print secrets.
function httpsOrigin(env, name, errors) {
  const raw = env[name]
  if (!raw) {
    errors.push(name + " must be configured")
    return null
  }
  try {
    const url = new URL(raw)
    if (
      url.protocol !== "https:" || !url.hostname || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      loopbackHosts.has(url.hostname) || url.hostname.endsWith(".localhost") ||
      url.hostname === "0.0.0.0" || url.hostname === "[::]" || /^127\./.test(url.hostname)
    ) {
      errors.push(name + " must be a clean HTTPS origin (no path or credentials)")
      return null
    }
    return url.origin
  } catch {
    errors.push(name + " must be a valid HTTPS origin")
    return null
  }
}

export function checkLocalBuildEnvironment(env = process.env) {
  const origins = []
  // An explicit local build must never silently embed a production backend.
  for (const name of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_API_URL"]) {
    let url
    try { url = new URL(env[name]) } catch {}
    if (!url || !loopbackHosts.has(url.hostname) || !["http:", "https:"].includes(url.protocol) ||
        url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error(name + " must be an explicit loopback origin for build:local")
    }
    origins.push(url.origin)
  }
  if (origins[0] === origins[1]) {
    throw new Error("Local website and API must use different origins")
  }
}

export function checkDeploymentEnvironment(env = process.env) {
  const errors = []
  const siteOrigin = httpsOrigin(env, "NEXT_PUBLIC_SITE_URL", errors)
  const apiOrigin = httpsOrigin(env, "NEXT_PUBLIC_API_URL", errors)
  if (siteOrigin && apiOrigin && siteOrigin === apiOrigin) {
    errors.push("The website and API must use different origins")
  }
  if (env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT !== "false") {
    errors.push("NEXT_PUBLIC_ENABLE_DEMO_CONTENT must be explicitly false")
  }
  if (errors.length) throw new Error("Frontend release preflight failed:\n- " + errors.join("\n- "))
  return { siteOrigin, apiOrigin }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    checkDeploymentEnvironment()
    console.log("Frontend production/staging environment preflight passed")
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
