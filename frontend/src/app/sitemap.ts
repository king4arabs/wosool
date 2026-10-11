import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

const publicRoutes = [
  "/",
  "/startups",
  "/eoa",
  "/eoa/about",
  "/eoa/program",
  "/eoa/eligibility",
  "/eoa/learning",
  "/eoa/leadership",
  "/eoa/mentors",
  "/eoa/partners",
  "/eoa/faq",
  "/eoa/contact",
  "/eoa/privacy",
  "/opportunities",
  "/about",
  "/programs",
  "/founders",
  "/founders/companies",
  "/events",
  "/partners",
  "/sponsors",
  "/news",
  "/apply",
  "/contact",
  "/privacy",
  "/terms",
]

export default function sitemap(): MetadataRoute.Sitemap {
  // Only stable public routes; never publish member/admin or token-bearing URLs.
  return publicRoutes.map((path) => ({
    url: new URL(path, env.siteUrl).toString(),
  }))
}
