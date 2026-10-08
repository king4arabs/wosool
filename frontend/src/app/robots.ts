import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/dashboard", "/EOA/account", "/EOA/apply", "/EOA/admin", "/EOA/coach", "/EOA/forgot-password", "/EOA/reset-password"] },
    sitemap: new URL("/sitemap.xml", env.siteUrl).toString(),
  }
}
