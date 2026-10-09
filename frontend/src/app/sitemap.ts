import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  // Only stable public routes; never publish member/admin or token-bearing URLs.
  return ["/", "/EOA", "/EOA/about", "/EOA/program", "/EOA/eligibility", "/EOA/learning", "/EOA/leadership", "/EOA/partners", "/EOA/faq", "/EOA/contact", "/EOA/privacy", "/opportunities", "/about", "/programs", "/founders", "/founders/companies", "/events", "/partners", "/sponsors", "/news", "/apply", "/contact", "/privacy", "/terms"]
    .map((path) => ({ url: new URL(path, env.siteUrl).toString() }))
}
