import { cache } from "react"
import { notFound } from "next/navigation"
import { readPublicNews } from "@/lib/public-records"
import { pageMetadata, breadcrumbData, jsonLd } from "@/lib/seo"
import { env } from "@/lib/env"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { safeNewsUrl } from "@/lib/news-feed"
import NewsArticleView from "./NewsArticleView"

const getNews = cache((slug: string) => readPublicNews(slug, env.apiUrl))
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { item, unavailable } = await getNews((await params).slug)
  if (!item && !unavailable) notFound()
  if (!item) return { title: "Story unavailable", robots: { index: false, follow: true } }
  const story = getLocalizedNewsContent(item, "ar")
  const metadata = pageMetadata(story.title, story.excerpt, `/news/${item.slug}`)
  const image = safeNewsUrl(item.imageUrl)
  return { ...metadata, robots: unavailable ? { index: false, follow: true } : undefined, twitter: { ...metadata.twitter, ...(image ? { images: [image] } : {}) }, openGraph: { ...metadata.openGraph, ...(image ? { images: [{ url: image, alt: story.title }] } : {}), type: "article" as const, publishedTime: item.publishedAt } }
}
export default async function NewsPage({ params }: Props) {
  const { item, unavailable } = await getNews((await params).slug)
  if (!item && !unavailable) notFound()
  // An outage snapshot stays readable, but is not presented as currently verified to search engines.
  const story = item ? getLocalizedNewsContent(item, "ar") : null
  const data = item && story && !unavailable ? [
    { "@context": "https://schema.org", "@type": "NewsArticle", headline: story.title, description: story.excerpt, datePublished: item.publishedAt, author: { "@type": "Organization", name: item.author }, publisher: { "@id": `${env.siteUrl}/#organization` }, mainEntityOfPage: new URL(`/news/${item.slug}`, env.siteUrl).href, citation: safeNewsUrl(item.sourceUrl) || undefined, image: safeNewsUrl(item.imageUrl) || undefined },
    breadcrumbData([{ name: "وصول", path: "/" }, { name: "الأخبار", path: "/news" }, { name: story.title, path: `/news/${item.slug}` }], env.siteUrl),
  ] : null
  return <>{data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />}<NewsArticleView item={item} /></>
}
