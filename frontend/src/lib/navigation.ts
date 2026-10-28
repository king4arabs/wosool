/** Keep community discovery and Accelerator intake separate. */
export function publicJourney(pathname: string) {
  const normalizedPath = pathname.toLowerCase()
  const isEoa =
    normalizedPath === '/eoa' || normalizedPath.startsWith('/eoa/')

  return {
    isEoa,
    applyHref: isEoa ? '/eoa/apply' : '/apply',
    loginHref: isEoa ? '/eoa/account?mode=login' : '/login',
  }
}

export function workspacePath(user: {
  registration_step?: string | null
  isAdmin?: boolean
  is_admin?: boolean
  role_token?: string
  is_accelerator_applicant?: boolean
  roles?: string[]
} | null | undefined): string {
  if (
    user?.isAdmin ||
    user?.is_admin ||
    user?.role_token === 'admin' ||
    user?.roles?.includes('admin')
  ) {
    return '/admin'
  }

  if (user?.registration_step && user.registration_step !== 'active') return '/onboarding'

  if (
    user?.is_accelerator_applicant ||
    user?.roles?.some(
      (role) => role.startsWith('eoa_') || role === 'accelerator-reviewer',
    )
  ) {
    return '/dashboard/eoa'
  }

  return '/dashboard'
}

/** Only allow redirects to an internal route after authentication. */
export function safeRedirect(
  value: string | null,
  fallback = '/dashboard',
): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u0020]/.test(value)
  ) {
    return fallback
  }

  try {
    const url = new URL(value, 'https://wosool.org')
    if (
      url.origin !== 'https://wosool.org' ||
      /^\/(login|register|forgot-password|reset-password)(\/|$)/.test(
        url.pathname,
      )
    ) {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
