import { cache } from "react"
import { notFound } from "next/navigation"
import { readPublicDetail, detailMetadata } from "@/lib/public-detail"
import { breadcrumbData, jsonLd } from "@/lib/seo"
import { env } from "@/lib/env"
import ProgramDetailView from "./ProgramDetailView"

const getDetail = cache((slug: string) => readPublicDetail("programs", slug, env.apiUrl))
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const result = await getDetail(slug)
  return detailMetadata(result, `/programs/${slug}`, "البرامج | Programs")
}
export default async function Page({ params }: Props) {
  const { slug } = await params
  const result = await getDetail(slug)
  if (result.missing) notFound()
  const crumbs = result.item ? breadcrumbData([{ name: "وصول", path: "/" }, { name: "البرامج | Programs", path: "/programs" }, { name: result.item.title, path: `/programs/${slug}` }], env.siteUrl) : null
  return <>{crumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />}<ProgramDetailView initialRecord={result.item} /></>
}
