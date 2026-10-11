import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/accelerator/apply",
        "/review",
        "/verify-email",
        "/eoa/account",
        "/eoa/apply",
        "/eoa/admin",
        "/eoa/coach",
        "/eoa/forgot-password",
        "/eoa/reset-password",
      ],
    },
    sitemap: new URL("/sitemap.xml", env.siteUrl).toString(),
  }
}
