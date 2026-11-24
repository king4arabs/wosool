import { ApiError } from "./api"
import type { ApiFounder } from "./content-api"

type Read = (path: string, params: Record<string, string | number>) => Promise<{ data: ApiFounder[] }>

/** A rolling deployment may briefly serve the previous Laravel router. Both reads are moderated. */
export async function readFounderSpotlight(start: string, signal: AbortSignal, read: Read) {
  try {
    return await read("/founders/discover/cards", { start })
  } catch (error) {
    const missingRoute = error instanceof ApiError && error.status === 404 &&
      /^The route (?:api\/)?v1\/founders\/discover\/cards could not be found\.$/.test(error.message)
    if (signal.aborted || !missingRoute) throw error
    return read("/founders", { page: 1, per_page: 24 })
  }
}
