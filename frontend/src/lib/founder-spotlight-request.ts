import { ApiError } from "./api"
import type { ApiFounder } from "./content-api"
import { exactLinkedFounderCards } from "./founder-card-links"

type Read = (path: string, params: Record<string, string | number>) => Promise<{ data: ApiFounder[] }>

/** A rolling deployment may briefly serve the previous Laravel router. Both reads are moderated. */
export async function readFounderSpotlight(start: string, signal: AbortSignal, read: Read, linkedSlug = "") {
  if (linkedSlug) {
    const { data } = await read("/founders", { slug: linkedSlug, per_page: 1 })
    return { data: exactLinkedFounderCards(data, linkedSlug) }
  }
  try {
    return await read("/founders/discover/cards", { start })
  } catch (error) {
    const missingRoute = error instanceof ApiError && error.status === 404 &&
      /^The route (?:api\/)?v1\/founders\/discover\/cards could not be found\.$/.test(error.message)
    if (signal.aborted || !missingRoute) throw error
    return read("/founders", { page: 1, per_page: 24 })
  }
}
