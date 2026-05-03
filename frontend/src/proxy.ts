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

  // Check for Laravel session cookie (set by Sanctum)
  const hasSession =
    request.cookies.has("laravel_session") ||
    request.cookies.has("wosool_session")

  // Protected paths
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from login/register
  const isAuthPage = pathname === "/login" || pathname === "/register"
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
}
