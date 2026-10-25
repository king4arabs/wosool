import { notFound } from "next/navigation"
import { KnowledgeView } from "@/components/knowledge/KnowledgeView"
import { findWikiArticle, wikiArticles } from "@/lib/wiki"
import { pageMetadata, breadcrumbData, jsonLd } from "@/lib/seo"
import { env } from "@/lib/env"

type Props = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() { return wikiArticles.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: Props) {
  const article = findWikiArticle((await params).slug)
  if (!article) notFound()
  return pageMetadata(`${article.title.en} | ${article.title.ar}`, article.summary.ar, `/wiki/${article.slug}`)
}
export default async function WikiArticle({ params }: Props) {
  const article = findWikiArticle((await params).slug)
  if (!article) notFound()
  const data = { "@context": "https://schema.org", "@type": "Article", headline: article.title.ar, description: article.summary.ar, dateModified: article.updatedAt, inLanguage: ["ar", "en"], author: { "@type": "Organization", name: "Wosool" }, mainEntityOfPage: new URL(`/wiki/${article.slug}`, env.siteUrl).href }
  const crumbs = breadcrumbData([{ name: "وصول", path: "/" }, { name: "المعرفة", path: "/wiki" }, { name: article.title.ar, path: `/wiki/${article.slug}` }], env.siteUrl)
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([data, crumbs]) }} /><KnowledgeView slug={article.slug} /></>
}
