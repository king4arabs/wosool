// URL state selects a view; the server remains responsible for authorization.
export function eoaAdminTab(requested: string | null, capabilities: { lead: boolean; manage_roles?: boolean } | undefined, operations: boolean) {
  if (requested === 'applications' || requested === 'access') return requested
  if (requested === 'accounts' && capabilities?.manage_roles) return requested
  if (!operations) return 'overview'
  if (['program', 'enrollment', 'alumni', 'partners', 'board', 'mentors', 'settings', 'inquiries', 'report'].includes(requested ?? '')) return requested!
  if (capabilities?.lead && ['tracks', 'perks', 'editorial'].includes(requested ?? '')) return requested!
  return 'overview'
}
