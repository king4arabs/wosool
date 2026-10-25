import { cache } from "react"
import { notFound } from "next/navigation"
import { OpportunityDirectory } from "@/components/accelerator/OpportunityDirectory"
import { opportunityCatalog } from "@/lib/opportunity-catalog"
import { readPublicDetail, detailMetadata } from "@/lib/public-detail"
import { pageMetadata, breadcrumbData, jsonLd } from "@/lib/seo"
import { env } from "@/lib/env"

const getDetail = cache((slug: string) => readPublicDetail("ecosystem", slug, env.apiUrl))
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const item = opportunityCatalog.find(item => item.slug === slug)
  if (item) return pageMetadata(`${item.title_ar} | ${item.brand}`, item.description_ar, `/opportunities/${slug}`)
  const result = await getDetail(slug)
  return detailMetadata(result, `/opportunities/${slug}`, "تفاصيل الفرصة | Opportunity")
}
export default async function Opportunity({ params }: Props) {
  const { slug } = await params
  const item = opportunityCatalog.find(item => item.slug === slug)
  const result = item ? null : await getDetail(slug)
  if (result?.missing) notFound()
  const title = item?.title_ar || result?.item?.title
  const crumbs = title ? breadcrumbData([{ name: "وصول", path: "/" }, { name: "الفرص", path: "/opportunities" }, { name: title, path: `/opportunities/${slug}` }], env.siteUrl) : null
  return <>{crumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />}<OpportunityDirectory slug={slug} /></>
}
