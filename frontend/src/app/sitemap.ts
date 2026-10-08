import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  // Only stable public routes; never publish member/admin or token-bearing URLs.
  return ["/", "/about", "/programs", "/founders", "/founders/companies", "/events", "/partners", "/sponsors", "/news", "/apply", "/contact", "/privacy", "/terms"]
    .map((path) => ({ url: new URL(path, env.siteUrl).toString() }))
}
