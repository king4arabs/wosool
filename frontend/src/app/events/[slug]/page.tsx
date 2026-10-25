import { cache } from "react"
import { notFound } from "next/navigation"
import { readPublicDetail, detailMetadata } from "@/lib/public-detail"
import { breadcrumbData, jsonLd } from "@/lib/seo"
import { env } from "@/lib/env"
import EventDetailView from "./EventDetailView"

const getDetail = cache((slug: string) => readPublicDetail("events", slug, env.apiUrl))
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const result = await getDetail(slug)
  return detailMetadata(result, `/events/${slug}`, "الفعاليات | Events")
}
export default async function Page({ params }: Props) {
  const { slug } = await params
  const result = await getDetail(slug)
  if (result.missing) notFound()
  const crumbs = result.item ? breadcrumbData([{ name: "وصول", path: "/" }, { name: "الفعاليات | Events", path: "/events" }, { name: result.item.title, path: `/events/${slug}` }], env.siteUrl) : null
  return <>{crumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />}<EventDetailView initialRecord={result.item} /></>
}
