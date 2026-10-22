import { founderRegion } from './founder-filters'
import type { Founder } from '../types'

/** Stable per visit and across locales/filters; never mutate editorial ranking. */
export function founderDiscoveryOrder<T extends Pick<Founder, 'slug' | 'countryCode'>>(founders: T[], seed: number): T[] {
  if (!seed) return [...founders]
  function rank(slug: string) {
    let hash = (seed ^ 2166136261) >>> 0
    for (const char of slug) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
    hash ^= hash >>> 16
    hash = Math.imul(hash, 0x85ebca6b) >>> 0
    hash ^= hash >>> 13
    return hash >>> 0
  }
  const groups = { saudi: [] as T[], gcc: [] as T[], mena: [] as T[], other: [] as T[] }
  for (const founder of founders) groups[founderRegion(founder)].push(founder)
  for (const group of Object.values(groups)) group.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug))
  const mix: T[] = []
  // Saudi-first discovery while giving GCC, MENA and global founders room in every mix.
  const cadence = ['saudi', 'saudi', 'saudi', 'saudi', 'gcc', 'gcc', 'mena', 'other'] as const
  while (mix.length < founders.length) {
    for (const region of cadence) {
      const founder = groups[region].shift()
      if (founder) mix.push(founder)
    }
  }
  return mix
}

/** Initialize randomness on subscription, after hydration, never during rendering. */
export function createFounderMixStore(randomSeed: () => number = () => {
  const value = new Uint32Array(1)
  crypto.getRandomValues(value)
  return value[0]
}) {
  let seed = 0
  const listeners = new Set<() => void>()
  const shuffle = () => {
    const next = randomSeed() >>> 0
    seed = next && next !== seed ? next : ((seed + 1) >>> 0) || 1
    for (const listener of listeners) listener()
  }
  return {
    getSnapshot: () => seed,
    getServerSnapshot: () => 0,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      if (!seed) shuffle()
      return () => { listeners.delete(listener) }
    },
    shuffle,
  }
}

/** The editorial spotlight is a separate collection; avoid repeating visible API profiles. */
export function editorialFounders<T extends Pick<Founder, 'slug'>>(profiles: T[], publicFounders: Pick<Founder, 'slug'>[]): T[] {
  const visible = new Set(publicFounders.map(founder => founder.slug))
  return profiles.filter(profile => !visible.has(profile.slug))
}
