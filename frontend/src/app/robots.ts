import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/openapi.json"],
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/accelerator/apply",
        "/review",
        "/verify-email",
        "/activate-founder",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
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
