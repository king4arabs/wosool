/** Only allow redirects to an internal route after authentication. */
export function safeRedirect(value: string | null, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback
  try {
    const url = new URL(value, "https://wosool.org")
    if (url.origin !== "https://wosool.org" || /^\/(login|register|forgot-password|reset-password)(\/|$)/.test(url.pathname)) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
