import type { Founder } from '../types'

/** Never substitute a random value, private operating score or editorial estimate. */
export function communityEngagement(founder: Pick<Founder, 'activationStatus' | 'communityEngagementScore'>): number | null {
  const score = founder.communityEngagementScore
  return founder.activationStatus === 'active' && typeof score === 'number' && Number.isInteger(score) && score >= 50 && score <= 100 ? score : null
}
