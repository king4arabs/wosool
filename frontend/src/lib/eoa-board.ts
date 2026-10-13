export type BoardSource = { label: string; url?: string | null; note?: string | null }

export type EoaBoardMember = {
  id: number
  slug: string
  name_en: string
  name_ar: string | null
  position_en: string
  position_ar: string | null
  company_name_en: string | null
  company_name_ar: string | null
  company_role_en: string | null
  company_role_ar: string | null
  company_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  portrait_path: string | null
  portrait_alt_en: string | null
  portrait_alt_ar: string | null
  portrait_position: string | null
  display_order: number
  board_term: string | null
  is_active: boolean
  publication_status: 'draft' | 'published'
  source_references?: BoardSource[] | null
  verified_at?: string | null
  version?: number
}

/** Missing or unsafe URLs never become public, clickable profile links. */
export function boardExternalUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export function boardPortraitUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const path = value.trim()
  if (path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')) return path
  return boardExternalUrl(path)
}

export function publishedBoardMembers(members: EoaBoardMember[]): EoaBoardMember[] {
  const unique = new Map<number, EoaBoardMember>()
  for (const member of members) {
    if (member.is_active && member.publication_status === 'published') unique.set(member.id, member)
  }
  return [...unique.values()].sort((a, b) => a.display_order - b.display_order || a.id - b.id)
}

/** The scroll axis is always LTR: a decreasing offset moves the cards right. */
export function boardScrollOffset(current: number, maximum: number, step: number): number {
  return Math.max(0, Math.min(Math.max(0, maximum), current - step))
}

export function boardText(ar: boolean, arabic: string | null, english: string | null): string {
  return (ar ? arabic || english : english || arabic) || ''
}

export function boardMemberName(ar: boolean, member: EoaBoardMember): string {
  if (ar && member.slug === 'mohammed-alsolami' && (!member.name_ar?.trim() || member.name_ar === member.name_en)) {
    return 'محمد السلمي'
  }
  return boardText(ar, member.name_ar, member.name_en)
}
