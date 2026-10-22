import { notFound } from "next/navigation"
import { KnowledgeView } from "@/components/knowledge/KnowledgeView"
import { findWikiArticle, wikiArticles } from "@/lib/wiki"
import { pageMetadata } from "@/lib/seo"
import { env } from "@/lib/env"

type Props = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() { return wikiArticles.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: Props) {
  const article = findWikiArticle((await params).slug)
  if (!article) notFound()
  return pageMetadata(`${article.title.en} | ${article.title.ar}`, article.summary.en)
}
export default async function WikiArticle({ params }: Props) {
  const article = findWikiArticle((await params).slug)
  if (!article) notFound()
  const data = { "@context": "https://schema.org", "@type": "Article", headline: article.title.ar, description: article.summary.ar, dateModified: article.updatedAt, inLanguage: ["ar", "en"], author: { "@type": "Organization", name: "Wosool" }, mainEntityOfPage: new URL(`/wiki/${article.slug}`, env.siteUrl).href }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} /><KnowledgeView slug={article.slug} /></>
}
