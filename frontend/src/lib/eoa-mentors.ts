export type MentorSource = { label: string; url?: string | null; note?: string | null }

export type EoaMentor = {
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
  bio_en: string | null
  bio_ar: string | null
  expertise_en: string[]
  expertise_ar: string[]
  company_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  portrait_path: string | null
  portrait_alt_en: string | null
  portrait_alt_ar: string | null
  portrait_position: string | null
  display_order: number
  is_active: boolean
  publication_status: 'draft' | 'published'
  version?: number
  appointment_status?: 'draft' | 'confirmed'
  appointment_reference?: string | null
  public_consent?: boolean
  consent_reference?: string | null
  coach_user_id?: number | null
  source_references?: MentorSource[] | null
  verified_at?: string | null
}

export function mentorText(ar: boolean, arabic: string | null | undefined, english: string | null | undefined) {
  return (ar ? arabic?.trim() || english?.trim() : english?.trim() || arabic?.trim()) || ''
}

export function mentorExternalUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

export function mentorPortraitUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const path = value.trim()
  if (/^\/(?:storage\/)?eoa\/mentors\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/i.test(path)) return path
  return mentorExternalUrl(path)
}

export function publicMentors(mentors: EoaMentor[]) {
  const unique = new Map<number, EoaMentor>()
  for (const mentor of mentors) {
    if (mentor.is_active && mentor.publication_status === 'published' && mentor.appointment_status !== 'draft' && mentor.public_consent !== false) unique.set(mentor.id, mentor)
  }
  return [...unique.values()].sort((a, b) => a.display_order - b.display_order || a.id - b.id)
}

export function mentorExpertise(mentor: EoaMentor, ar: boolean) {
  const preferred = ar ? mentor.expertise_ar : mentor.expertise_en
  return preferred?.length ? preferred : (ar ? mentor.expertise_en : mentor.expertise_ar) ?? []
}

export function filterMentors(mentors: EoaMentor[], query: string, expertise: string) {
  const normalized = query.trim().toLocaleLowerCase()
  return mentors.filter((mentor) => {
    const subjects = [...(mentor.expertise_en ?? []), ...(mentor.expertise_ar ?? [])]
    if (expertise && !subjects.includes(expertise)) return false
    if (!normalized) return true
    return [mentor.name_en, mentor.name_ar, mentor.position_en, mentor.position_ar, mentor.company_name_en, mentor.company_name_ar, mentor.bio_en, mentor.bio_ar, ...subjects]
      .some((value) => value?.toLocaleLowerCase().includes(normalized))
  })
}
