import type { Metadata } from "next"
import { pageMetadata } from "./seo"

export type DetailKind = "events" | "programs" | "ecosystem"
export type PublicDetail = {
  id: number; slug: string; title: string; name: string; starts_at: string;
  description?: string; short_description?: string; full_description?: string;
  ends_at?: string; location?: string; city?: string; country?: string;
  type?: string; category?: string; mode?: string; format?: string;
  status?: string; status_flow?: string; visibility?: string;
  registration_deadline?: string; requires_rsvp?: boolean; rsvp_required?: boolean;
  program_type?: string; duration?: string; language?: string; city_region?: string;
  objective?: string; who_it_is_for?: string; expected_outcomes?: string;
  application_deadline?: string; is_open?: boolean;
}
export type DetailResult = { item: PublicDetail | null; missing: boolean }

export function plainText(value: unknown, limit = 180): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, limit) : ""
}

/** Anonymous, uncached reads; only explicit public fields may cross into HTML. */
export async function readPublicDetail(kind: DetailKind, slug: string, apiUrl: string, request: typeof fetch = fetch): Promise<DetailResult> {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return { item: null, missing: true }
  try {
    const response = await request(`${apiUrl.replace(/\/+$/, "")}/api/v1/${kind}/${slug}`, {
      cache: "no-store", credentials: "omit", redirect: "error", signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json", "X-Locale": "ar" },
    })
    if ([401, 403, 404, 410].includes(response.status)) return { item: null, missing: true }
    if (!response.ok) return { item: null, missing: false }
    const { data } = await response.json()
    if (!data || data.slug !== slug || !Number.isInteger(data.id)) return { item: null, missing: false }
    // Member-only programs can retain their existing client experience, but are never indexed.
    if (kind === "programs" && (data.visibility !== "public" || !["published", "applications_open", "applications_closed", "active", "completed", "cancelled"].includes(data.status_flow))) return { item: null, missing: false }
    if (kind === "events" && (data.is_public !== true || (data.visibility != null && data.visibility !== "public") || !["published", "registration_closed", "live_now", "completed", "upcoming", "live"].includes(data.status_flow ?? data.status))) return { item: null, missing: true }
    if (kind === "ecosystem" && !["verified", "expired"].includes(data.verification_status)) return { item: null, missing: true }
    const title = plainText(data.title || data.name_ar || data.name || data.name_en, 150)
    if (!title) return { item: null, missing: false }
    const item: PublicDetail = { id: data.id, slug, title, name: plainText(data.name || title, 150), starts_at: typeof data.starts_at === "string" ? data.starts_at : "" }
    const textFields = ["description", "short_description", "full_description", "ends_at", "location", "city", "country", "type", "category", "mode", "format", "status", "status_flow", "visibility", "registration_deadline", "program_type", "duration", "language", "city_region", "objective", "who_it_is_for", "expected_outcomes", "application_deadline"] as const
    for (const key of textFields) if (typeof data[key] === "string") item[key] = data[key].slice(0, 20000)
    for (const key of ["requires_rsvp", "rsvp_required", "is_open"] as const) if (typeof data[key] === "boolean") item[key] = data[key]
    if (kind === "ecosystem") item.description = plainText(data.description_ar || data.description_en, 1000)
    return { item, missing: false }
  } catch { return { item: null, missing: false } }
}

export function detailMetadata(result: DetailResult, path: string, fallbackTitle: string): Metadata {
  if (!result.item) return {
    ...pageMetadata(fallbackTitle, "تعرّف على برامج وفعاليات وفرص وصول للمؤسسين.", path),
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  }
  return pageMetadata(result.item.title, plainText(result.item.short_description || result.item.description || result.item.full_description) || result.item.title, path)
}
