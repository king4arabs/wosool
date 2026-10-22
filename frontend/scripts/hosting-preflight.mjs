import { pathToFileURL } from "node:url"

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
      url.pathname !== "/" || url.search || url.hash
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
