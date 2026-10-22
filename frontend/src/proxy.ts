import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Lightweight middleware that redirects unauthenticated visitors away from
 * protected routes. The backend remains the source of truth and validates
 * every authenticated request.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Canonical Accelerator URLs are lowercase. Next.js route matching is
  // case-insensitive, so legacy uppercase links are normalised here with an
  // exact, case-sensitive check (a config redirect would loop on /eoa).
  if (/^\/EOA(?=\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/EOA/, "/eoa")
    return NextResponse.redirect(url, 308)
  }

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

  const isEoaProtected = /^\/eoa\/(admin|coach)(?:\/|$)/.test(pathname)
  const isPlatformProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  if ((isEoaProtected || isPlatformProtected) && !hasSession) {
    const loginUrl = new URL(isEoaProtected ? "/eoa/account" : "/login", request.url)
    if (isEoaProtected) loginUrl.searchParams.set("mode", "login")
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  // Do not force-redirect sign-in pages based only on cookie presence. A cookie
  // can outlive its backend session and would otherwise create redirect loops.
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/EOA",
    "/EOA/:path*",
    "/eoa/admin/:path*",
    "/eoa/coach/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
}
