interface ProfileFields {
  tagline?: string | null; bio?: string | null; location?: string | null
  sector?: string | null; stage?: string | null; linkedin_url?: string | null
  website_url?: string | null; needs?: string[] | null; offers?: string[] | null
}
/** The same saved fields and draft fields produce the same completeness percentage. */
export function profileCompletion(profile: ProfileFields): number {
  const text = [profile.tagline, profile.bio, profile.location, profile.sector, profile.stage, profile.linkedin_url, profile.website_url].filter(value => value?.trim()).length
  const lists = [profile.needs, profile.offers].filter(values => values?.some(value => value.trim())).length
  return Math.round((text + lists) / 9 * 100)
}
