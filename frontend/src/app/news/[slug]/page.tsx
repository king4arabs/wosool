import { cache } from "react"
import { notFound } from "next/navigation"
import { readPublicNews } from "@/lib/public-records"
import { pageMetadata } from "@/lib/seo"
import { env } from "@/lib/env"
import NewsArticleView from "./NewsArticleView"

const getNews = cache((slug: string) => readPublicNews(slug, env.apiUrl))
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { item, unavailable } = await getNews((await params).slug)
  if (!item && !unavailable) notFound()
  if (!item) return { title: "Story unavailable", robots: { index: false, follow: true } }
  const metadata = pageMetadata(item.title, item.excerpt)
  return { ...metadata, robots: unavailable ? { index: false, follow: true } : undefined, openGraph: { ...metadata.openGraph, type: "article" as const, publishedTime: item.publishedAt } }
}
export default async function NewsPage({ params }: Props) {
  const { item, unavailable } = await getNews((await params).slug)
  if (!item && !unavailable) notFound()
  // An outage snapshot stays readable, but is not presented as currently verified to search engines.
  const data = item && !unavailable ? { "@context": "https://schema.org", "@type": "NewsArticle", headline: item.title, description: item.excerpt, datePublished: item.publishedAt, author: { "@type": "Organization", name: item.author }, publisher: { "@type": "Organization", name: "Wosool" }, mainEntityOfPage: new URL(`/news/${item.slug}`, env.siteUrl).href, citation: item.sourceUrl } : null
  return <>{data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />}<NewsArticleView item={item} /></>
}
