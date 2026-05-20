import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Lightweight middleware that redirects unauthenticated visitors away from
 * protected routes. The real auth check happens in the AuthProvider on the
 * client, but this gives an instant redirect for direct URL access without
 * waiting for the SPA to hydrate.
 *
 * We rely on the existence of a session cookie as a fast heuristic —
 * the backend still validates the session on every API call.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Laravel session cookie (set by Sanctum).
  // Supports default `laravel_session` and custom names like `wosool-session`.
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name)
  const hasSession = cookieNames.some((name) =>
    name === "laravel_session" ||
    name === "wosool_session" ||
    name === "wosool-session" ||
    name.endsWith("_session") ||
    name.endsWith("-session")
  )

  // Protected paths
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Do not force-redirect /login or /register based only on cookie presence.
  // Cookie can exist while backend session is already invalid, which causes
  // redirect loops (/login -> /dashboard -> /login).

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
}
