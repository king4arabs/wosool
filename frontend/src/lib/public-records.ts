import type { NewsItem } from "../types"
import { mapNewsItem, type ApiNewsItem } from "./content-api"
import { curatedNews } from "./news-feed"

/** Never restore a snapshot after an authoritative 404/410 or access denial. */
export async function readPublicNews(slug: string, apiUrl: string, request: typeof fetch = fetch): Promise<{ item: NewsItem | null; unavailable: boolean }> {
  try {
    const response = await request(`${apiUrl.replace(/\/+$/, "")}/api/v1/news/${encodeURIComponent(slug)}`, { cache: "no-store", signal: AbortSignal.timeout(5000), headers: { Accept: "application/json" } })
    if ([401, 403, 404, 410].includes(response.status)) return { item: null, unavailable: false }
    if (!response.ok) throw new Error("News API unavailable")
    const body = await response.json() as { data: ApiNewsItem }
    if (!body.data || typeof body.data.slug !== "string") throw new Error("Invalid news response")
    if (body.data.status !== "published" || !body.data.is_public || (body.data.published_at && Date.parse(body.data.published_at) > Date.now())) return { item: null, unavailable: false }
    return { item: mapNewsItem(body.data), unavailable: false }
  } catch {
    return { item: curatedNews.find(item => item.slug === slug && Date.parse(item.publishedAt) <= Date.now()) ?? null, unavailable: true }
  }
}

type PublicRecord = { slug: string; updated_at?: string }
/** Bounded pagination. Unreachable APIs contribute no possibly withdrawn snapshot URLs. */
export async function readSitemapRecords(kind: "news" | "founders" | "companies", apiUrl: string, request: typeof fetch = fetch): Promise<PublicRecord[]> {
  const records: PublicRecord[] = []
  for (let page = 1; page <= 20; page++) {
    try {
      const response = await request(`${apiUrl.replace(/\/+$/, "")}/api/v1/${kind}?per_page=50&page=${page}`, { cache: "no-store", signal: AbortSignal.timeout(3000), headers: { Accept: "application/json" } })
      if (!response.ok) break
      const body = await response.json()
      if (!Array.isArray(body.data)) break
      for (const record of body.data) {
        if (typeof record.slug === "string" && /^[a-zA-Z0-9_-]+$/.test(record.slug)) records.push({ slug: record.slug, updated_at: record.updated_at })
      }
      if (!Number.isInteger(body.meta?.last_page) || page >= body.meta.last_page) break
    } catch { break }
  }
  return [...new Map(records.map(record => [record.slug, record])).values()]
}
