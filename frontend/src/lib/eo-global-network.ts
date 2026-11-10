import data from '@/data/eo-global-network.json'
import { createPartnerVisitStore } from './partner-discovery'

export type EoNetworkProfile = (typeof data)[number]
export const eoNetworkProfiles: EoNetworkProfile[] = data
export const NETWORK_INTERVAL_MS = 3000

export function filterEoNetwork(query: string, group: string, topic: string) {
  const term = query.trim().toLocaleLowerCase()
  return eoNetworkProfiles.filter(p =>
    (group === 'all' || p.group === group) &&
    (topic === 'all' || p.topic === topic) &&
    (!term || [p.name, p.company, p.chapter, p.position, p.position_ar, p.bio, p.bio_ar, p.topic, p.topic_ar].join(' ').toLocaleLowerCase().includes(term)),
  )
}

/** Reload, SPA remount and back/forward-cache restoration each begin a fresh discovery visit. */
export function createEoNetworkVisitStore() {
  return createPartnerVisitStore(undefined, () => typeof window === 'undefined' ? undefined : window)
}
