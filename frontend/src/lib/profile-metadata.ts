import type { Metadata } from "next"
import { pageMetadata } from "./seo"

type ProfileKind = "founder" | "company"

function plainText(value: unknown, limit: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, limit)
}

/** Anonymous, uncached metadata only. Never restore withdrawn records from snapshots. */
export async function publicProfileMetadata(kind: ProfileKind, slug: string, apiUrl: string, request: typeof fetch = fetch): Promise<Metadata> {
  const label = kind === "founder" ? "ملف المؤسس | Founder profile" : "ملف الشركة | Company profile"
  const unavailable: Metadata = {
    ...pageMetadata(label, "هذا الملف غير متاح للفهرسة حالياً. This profile is currently unavailable for indexing."),
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  }
  // Slugs come from the route, never an arbitrary URL or path.
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return unavailable
  try {
    const collection = kind === "founder" ? "founders" : "companies"
    const response = await request(`${apiUrl.replace(/\/+$/, "")}/api/v1/${collection}/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json", "X-Locale": "ar" },
    })
    if (!response.ok) return unavailable
    const body = await response.json()
    const record = body?.data
    if (!record || record.slug !== slug || record.status !== "active" || record.is_public !== true) return unavailable
    const name = plainText(record.name, 120)
    if (!name) return unavailable
    // Explicit allowlist: never serialize nested user, email, scorecard or membership data.
    const summary = plainText(kind === "founder" ? record.bio : record.description, 160)
      || (kind === "founder" ? plainText(record.tagline, 160) : "")
      || `${name} — ${label}`
    const title = `${name} — ${label}`
    const path = kind === "founder" ? `/founders/${slug}` : `/founders/companies/${slug}`
    const metadata = pageMetadata(title, summary)
    return { ...metadata, alternates: { canonical: path }, openGraph: { ...metadata.openGraph, url: path } }
  } catch {
    // Outages and invalid payloads must not expose stale/private snapshot metadata.
    return unavailable
  }
}
