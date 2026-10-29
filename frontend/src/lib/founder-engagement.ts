import type { Founder } from '../types'

type EngagementProfile = Pick<Founder, 'slug' | 'activationStatus' | 'communityEngagementScore'>

/** A seeded starting value stays consistent across visits, locales and hydration. */
export function defaultCommunityEngagement(slug: string): number {
  let hash = 2166136261
  for (const character of `wosool-community-start:${slug}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  }
  return 65 + (hash >>> 0) % 28
}

/** Activated profiles use the live participation score as soon as it is available. */
export function communityEngagement(founder: EngagementProfile): number {
  const score = founder.communityEngagementScore
  return founder.activationStatus === 'active' && typeof score === 'number' && Number.isInteger(score) && score >= 50 && score <= 100
    ? score
    : defaultCommunityEngagement(founder.slug)
}
