import { opportunityCatalog } from "@/lib/opportunity-catalog";
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { wikiArticles } from "@/lib/wiki";
import { readSitemapRecords, type SitemapKind } from "@/lib/public-records";

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
  "/eoa/perks",
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
  const collections: { kind: SitemapKind; path: string }[] = [
    { kind: "news", path: "/news" },
    { kind: "founders", path: "/founders" },
    { kind: "companies", path: "/founders/companies" },
    { kind: "events", path: "/events" },
    { kind: "programs", path: "/programs" },
    { kind: "ecosystem", path: "/opportunities" },
  ];
  const liveEntries = (await Promise.all(collections.map(async ({ kind, path }) =>
    (await readSitemapRecords(kind, env.apiUrl)).map(record => ({
      url: new URL(`${path}/${record.slug}`, env.siteUrl).href,
      ...(record.updated_at ? { lastModified: record.updated_at } : {}),
    })),
  ))).flat();
  const entries: MetadataRoute.Sitemap = [
    ...publicRoutes.map((path) => ({ url: new URL(path, env.siteUrl).href })),
    ...opportunityCatalog.map((record) => ({
      url: new URL(`/opportunities/${record.slug}`, env.siteUrl).href,
    })),
    ...wikiArticles.map((article) => ({
      url: new URL(`/wiki/${article.slug}`, env.siteUrl).href,
      lastModified: article.updatedAt,
    })),
    ...liveEntries,
  ];
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
