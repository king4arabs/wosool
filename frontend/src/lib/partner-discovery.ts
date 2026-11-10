import { normalizeSearch } from './faq-search'

/** One seed per mounted visit; optionally renew it when a browser restores the page. */
export function createPartnerVisitStore(randomSeed: () => number = () => {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0]
}, restoreTarget?: () => EventTarget | undefined) {
  let seed = 0
  let target: EventTarget | undefined
  const listeners = new Set<() => void>()
  const renew = () => {
    const next = (randomSeed() >>> 0) || 1
    seed = next === seed ? ((next + 1) >>> 0) || 1 : next
    listeners.forEach(listener => listener())
  }
  const restore = (event: Event) => {
    if ((event as PageTransitionEvent).persisted) renew()
  }
  return {
    getSnapshot: () => seed,
    getServerSnapshot: () => 0,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      if (listeners.size === 1) {
        target = restoreTarget?.()
        target?.addEventListener('pageshow', restore)
      }
      if (!seed) renew()
      return () => {
        listeners.delete(listener)
        if (!listeners.size) {
          target?.removeEventListener('pageshow', restore)
          target = undefined
        }
      }
    },
  }
}

/** Identity-based random ranks keep the visit's order across filters, locales and API updates. */
export function partnerDiscoveryOrder<T extends { id: string | number }>(partners: readonly T[], seed: number): T[] {
  if (!seed) return [...partners]
  const rank = (id: string | number) => {
    let hash = (seed ^ 2166136261) >>> 0
    for (const char of String(id)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
    hash ^= hash >>> 16
    hash = Math.imul(hash, 0x85ebca6b) >>> 0
    hash ^= hash >>> 13
    hash = Math.imul(hash, 0xc2b2ae35) >>> 0
    return (hash ^ (hash >>> 16)) >>> 0
  }
  return [...partners].sort((a, b) => rank(a.id) - rank(b.id) || String(a.id).localeCompare(String(b.id)))
}

export function filterPartnerOrganizations<T extends { name_ar: string; name_en: string; category: string; website: string }>(
  partners: readonly T[], category: string, query: string,
): T[] {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  return partners.filter(partner => {
    if (category !== 'all' && partner.category !== category) return false
    const name = normalizeSearch(`${partner.name_ar} ${partner.name_en} ${partner.website}`)
    return terms.every(term => name.includes(term))
  })
}
