/** Keep community discovery and Accelerator intake separate. */
export function publicJourney(pathname: string) {
  const isEoa = pathname === '/EOA' || pathname.startsWith('/EOA/')
  return { isEoa, applyHref: isEoa ? '/EOA/apply' : '/apply', loginHref: isEoa ? '/EOA/account' : '/login' }
}

export function workspacePath(user: { isAdmin?: boolean; is_admin?: boolean; role_token?: string; is_accelerator_applicant?: boolean; roles?: string[] } | null | undefined): string {
  if (user?.isAdmin || user?.is_admin || user?.role_token === 'admin' || user?.roles?.includes('admin')) return '/admin'
  if (user?.is_accelerator_applicant || user?.roles?.some(role => role.startsWith('eoa_') || role === 'accelerator-reviewer')) return '/EOA/account'
  return '/dashboard'
}

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
