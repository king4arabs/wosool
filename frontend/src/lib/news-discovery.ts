/** Hydration starts with a deterministic seed; each mounted newsroom gets a fresh mix. */
export function createNewsVisitStore(randomSeed: () => number = () => {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0]
}) {
  let seed = 0
  return {
    getSnapshot: () => seed,
    getServerSnapshot: () => 0,
    subscribe: (listener: () => void) => {
      if (!seed) {
        seed = (randomSeed() >>> 0) || 1
        listener()
      }
      return () => {}
    },
  }
}

/** Stable story identities preserve relative order across searches and API pagination. */
export function newsVisitOrder<T extends { slug: string; sourceUrl?: string }>(items: readonly T[], seed: number): T[] {
  if (!seed) return [...items]
  const identity = (item: T) => item.sourceUrl || item.slug
  const rank = (key: string) => {
    let hash = (seed ^ 2166136261) >>> 0
    for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
    hash ^= hash >>> 16
    hash = Math.imul(hash, 0x85ebca6b) >>> 0
    hash ^= hash >>> 13
    hash = Math.imul(hash, 0xc2b2ae35) >>> 0
    return (hash ^ (hash >>> 16)) >>> 0
  }
  return [...items].sort((a, b) => rank(identity(a)) - rank(identity(b)) || identity(a).localeCompare(identity(b)))
}
