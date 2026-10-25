import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/openapi.json"],
      // Auth pages remain crawlable so their noindex metadata can be processed.
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/eoa/admin",
        "/eoa/coach",
      ],
    },
    sitemap: new URL("/sitemap.xml", env.siteUrl).toString(),
  }
}
