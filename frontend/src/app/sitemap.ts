import { opportunityCatalog } from "@/lib/opportunity-catalog";
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { wikiArticles } from "@/lib/wiki";
import { readSitemapRecords } from "@/lib/public-records";

export const dynamic = "force-dynamic";

const publicRoutes = [
  "/",
  "/startups",
  "/api",
  "/wiki",
  "/eoa",
  "/eoa/about",
  "/eoa/program",
  "/eoa/alumni",
  "/eoa/eligibility",
  "/eoa/learning",
  "/eoa/leadership",
  "/eoa/mentors",
  "/eoa/partners",
  "/eoa/faq",
  "/faq",
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, founders, companies] = await Promise.all([
    readSitemapRecords("news", env.apiUrl),
    readSitemapRecords("founders", env.apiUrl),
    readSitemapRecords("companies", env.apiUrl),
  ]);
  return [
    ...publicRoutes.map((path) => ({ url: new URL(path, env.siteUrl).href })),
    ...opportunityCatalog.map((record) => ({
      url: new URL(`/opportunities/${record.slug}`, env.siteUrl).href,
    })),
    ...wikiArticles.map((article) => ({
      url: new URL(`/wiki/${article.slug}`, env.siteUrl).href,
      lastModified: article.updatedAt,
    })),
    ...news.map((record) => ({
      url: new URL(`/news/${record.slug}`, env.siteUrl).href,
    })),
    ...companies.map((record) => ({
      url: new URL(`/founders/companies/${record.slug}`, env.siteUrl).href,
    })),
    ...founders.map((record) => ({
      url: new URL(`/founders/${record.slug}`, env.siteUrl).href,
    })),
  ];
}
