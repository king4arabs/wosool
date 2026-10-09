"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ApiError, api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { publicWebsite } from "@/lib/community-display"
import { type ApiFounder, type ApiCompany, mapCompany, mapFounder } from "@/lib/content-api"
import { getInitials } from "@/lib/utils"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CompanyCard } from "./CompanyCard"

type PublicCompany = ApiCompany & { founders?: ApiFounder[] }

export function PublicProfile({ kind }: { kind: "founder" | "company" }) {
  const { slug } = useParams<{ slug: string }>()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [data, setData] = useState<ApiFounder | PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- discard the previous profile while loading a new route or language
    setLoading(true); setError(null); setData(null)
    api.get<{ data: ApiFounder | PublicCompany }>(`/${kind === "founder" ? "founders" : "companies"}/${encodeURIComponent(slug)}`, { signal: controller.signal, headers: { "X-Locale": locale } }).then(response => { if (!controller.signal.aborted) setData(response.data) }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof ApiError && error.status === 404 ? (ar ? "هذا الملف غير متاح للعرض العام." : "This profile is not publicly available.") : error instanceof Error ? error.message : "Unable to load profile")
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [slug, kind, locale, ar, attempt])
  const founder = data && kind === "founder" ? mapFounder(data as ApiFounder) : null
  const company = data && kind === "company" ? mapCompany(data as PublicCompany) : null
  const name = founder?.name || company?.name || ""
  const website = publicWebsite(company?.website)
  return <PublicLayout><section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
    <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[#3B52D4]" href={kind === "founder" ? "/founders" : "/founders/companies"}>{ar ? "العودة إلى الدليل" : "Back to directory"}</Link>
    {loading && <p role="status" className="mt-6">{ar ? "جارٍ تحميل الملف…" : "Loading profile…"}</p>}
    {error && <div role="alert" className="mt-6 rounded-xl border bg-white p-6"><p>{error}</p><Button className="mt-4" onClick={() => setAttempt(value => value + 1)}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {data && <article className="mt-5 rounded-3xl border bg-white p-6 sm:p-10">
      <header className="flex flex-wrap items-center gap-5"><Avatar className="h-24 w-24"><AvatarImage src={founder?.avatarUrl || company?.logoUrl || ""} alt={name} className={company ? "object-contain" : "object-cover"} /><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h1 className="text-3xl font-bold sm:text-4xl">{name}</h1><p className="mt-3 text-slate-600">{founder?.tagline || company?.sector}</p></div></header>
      <p className="my-6 whitespace-pre-wrap text-base leading-loose text-slate-700">{founder?.bio || company?.description}</p>
      <dl className="grid gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">{[[ar ? "الموقع" : "Location", founder?.location || company?.location], [ar ? "القطاع" : "Sector", founder?.sector || company?.sector], [ar ? "المرحلة" : "Stage", founder?.stage || company?.stage]].map(([label, value]) => value && <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
      {website && <Button asChild className="mt-6"><a href={website} target="_blank" rel="noopener noreferrer">{ar ? "زيارة موقع الشركة" : "Visit company website"}</a></Button>}
      {founder && <>
        <div className="my-6 grid gap-6 sm:grid-cols-2">{[[ar ? "يبحث عن" : "Looking for", founder.needs], [ar ? "يقدم" : "Can offer", founder.offers]].map(([label, items]) => Array.isArray(items) && items.length > 0 && <section key={String(label)}><h2 className="text-lg font-bold">{label}</h2><ul className="mt-3 list-inside list-disc text-slate-600">{items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
        <Button asChild><Link href={`/dashboard/directory?q=${encodeURIComponent(founder.name)}`}>{ar ? "طلب تعارف" : "Request introduction"}</Link></Button>
        {((data as ApiFounder).companies?.length ?? 0) > 0 && <section className="mt-10"><h2 className="mb-5 text-2xl font-bold">{ar ? "الشركات" : "Companies"}</h2><div className="grid gap-5 sm:grid-cols-2">{(data as ApiFounder).companies?.map(item => <CompanyCard key={item.id} company={mapCompany(item)} />)}</div></section>}
      </>}
      {company && ((data as PublicCompany).founders?.length ?? 0) > 0 && <section className="mt-8"><h2 className="text-xl font-bold">{ar ? "المؤسسون" : "Founders"}</h2><ul className="mt-3 space-y-2">{(data as PublicCompany).founders?.map(item => <li key={item.id}><Link className="inline-flex min-h-11 items-center text-[#3B52D4] underline" href={`/founders/${encodeURIComponent(item.slug)}`}>{mapFounder(item).name}</Link></li>)}</ul></section>}
    </article>}
  </section></PublicLayout>
}
