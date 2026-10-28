import type { NewsItem } from "../types"
import { mapNewsItem, type ApiNewsItem } from "./content-api"
import { curatedNews } from "./news-feed"
import { isDirectoryRecordVisible } from './directory-geography'

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
export type SitemapKind = "news" | "founders" | "companies" | "events" | "programs" | "ecosystem"

export function isIndexableRecord(kind: SitemapKind, record: Record<string, unknown>): boolean {
  if ((kind === 'founders' || kind === 'companies') && !isDirectoryRecordVisible(record)) return false
  if (kind === "ecosystem") return ["verified", "expired"].includes(String(record.verification_status))
  if (kind === "programs") return record.visibility === "public" && ["published", "applications_open", "applications_closed", "active", "completed", "cancelled"].includes(String(record.status_flow))
  if (record.is_public !== true) return false
  if (kind === "events") return (record.visibility == null || record.visibility === "public") && ["published", "registration_closed", "live_now", "completed", "upcoming", "live"].includes(String(record.status_flow ?? record.status))
  if (kind === "news") return record.status === "published" && typeof record.published_at === "string" && Number.isFinite(Date.parse(record.published_at)) && Date.parse(record.published_at) <= Date.now()
  return record.status === "active"
}

export function sitemapDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return undefined
  const time = Date.parse(value)
  return Number.isFinite(time) && time <= Date.now() ? new Date(time).toISOString() : undefined
}
/** Bounded pagination. Unreachable APIs contribute no possibly withdrawn snapshot URLs. */
export async function readSitemapRecords(kind: SitemapKind, apiUrl: string, request: typeof fetch = fetch): Promise<PublicRecord[]> {
  const records: PublicRecord[] = []
  const budget = AbortSignal.timeout(8000)
  for (let page = 1; page <= 20; page++) {
    try {
      const response = await request(`${apiUrl.replace(/\/+$/, "")}/api/v1/${kind}?per_page=50&page=${page}`, { cache: "no-store", credentials: "omit", redirect: "error", signal: AbortSignal.any([budget, AbortSignal.timeout(3000)]), headers: { Accept: "application/json" } })
      if (!response.ok) break
      const body = await response.json()
      if (!Array.isArray(body.data)) break
      for (const record of body.data) {
        if (record && typeof record.slug === "string" && /^[a-zA-Z0-9_-]+$/.test(record.slug) && isIndexableRecord(kind, record)) records.push({ slug: record.slug, updated_at: sitemapDate(record.updated_at) })
      }
      const lastPage = body.meta?.last_page ?? body.last_page
      if (!Number.isInteger(lastPage) || page >= lastPage || body.data.length === 0 || budget.aborted) break
    } catch { break }
  }
  return [...new Map(records.map(record => [record.slug, record])).values()]
}
