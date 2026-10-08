/** Same-origin Laravel session requests, including Sanctum's CSRF header. */
export function currentLocale(): "ar" | "en" {
  if (typeof document === "undefined") return "ar"
  return document.documentElement.lang === "en" ? "en" : "ar"
}

export function readXsrfToken(): string | null {
  if (typeof document === "undefined") return null
  const cookie = document.cookie.split("; ").find((item) => item.startsWith("XSRF-TOKEN="))
  if (!cookie) return null
  try {
    return decodeURIComponent(cookie.slice("XSRF-TOKEN=".length))
  } catch {
    return null
  }
}

let csrfRequest: Promise<void> | null = null

async function ensureCsrfCookie(): Promise<void> {
  if (readXsrfToken()) return
  if (!csrfRequest) {
    csrfRequest = fetch("/api/v1/auth/csrf-cookie", {
      credentials: "include",
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      signal: AbortSignal.timeout(15000),
    }).then((response) => {
      if (!response.ok) throw new Error(currentLocale() === "ar" ? "تعذر بدء جلسة آمنة. يرجى المحاولة مجددًا." : "Unable to start a secure session. Please try again.")
    }).finally(() => { csrfRequest = null })
  }
  await csrfRequest
}

export async function sessionFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (!headers.has("Accept")) headers.set("Accept", "application/json")
  if (!headers.has("X-Locale")) headers.set("X-Locale", currentLocale())
  const isSameOrigin = typeof window !== "undefined" && new URL(input, window.location.origin).origin === window.location.origin

  if (isSameOrigin) {
    headers.set("X-Requested-With", "XMLHttpRequest")
    if (!["GET", "HEAD", "OPTIONS"].includes((init.method || "GET").toUpperCase())) {
      await ensureCsrfCookie()
      const token = readXsrfToken()
      if (token) headers.set("X-XSRF-TOKEN", token)
    }
  }

  return fetch(input, {
    credentials: "include",
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(15000),
  })
}
