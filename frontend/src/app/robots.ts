import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/dashboard"] },
    sitemap: new URL("/sitemap.xml", env.siteUrl).toString(),
  }
}
