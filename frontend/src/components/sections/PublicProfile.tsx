"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ApiError, api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { publicWebsite } from "@/lib/community-display"
import { type ApiFounder, type ApiCompany, mapCompany, mapFounder } from "@/lib/content-api"
import { useAuth } from "@/lib/auth"
import { getSpotlightApiProfile } from "@/lib/founder-spotlight"
import { getInitials } from "@/lib/utils"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CompanyCard } from "./CompanyCard"

type PublicCompany = ApiCompany & { founders?: ApiFounder[] }

export function PublicProfile({ kind }: { kind: "founder" | "company" }) {
  const { slug } = useParams<{ slug: string }>()
  const { locale } = useLocale()
  const { user } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState(false)
  const ar = locale === "ar"
  const [data, setData] = useState<ApiFounder | PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(null); setData(null); setSnapshot(false)
    api.get<{ data: ApiFounder | PublicCompany }>(`/${kind === "founder" ? "founders" : "companies"}/${encodeURIComponent(slug)}`, { signal: controller.signal, headers: { "X-Locale": locale } }).then(response => { if (!controller.signal.aborted) setData(response.data) }).catch(error => {
      const fallback = kind === 'founder' && (!(error instanceof ApiError) || error.status >= 500) ? getSpotlightApiProfile(slug, locale) : null
      if (!controller.signal.aborted && fallback) { setData(fallback); setSnapshot(true); return }
      if (!controller.signal.aborted) setError(error instanceof ApiError && error.status === 404 ? (ar ? "هذا الملف غير متاح للعرض العام." : "This profile is not publicly available.") : error instanceof Error ? error.message : "Unable to load profile")
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [slug, kind, locale, ar, attempt])
  const founder = data && kind === "founder" ? mapFounder(data as ApiFounder) : null
  const company = data && kind === "company" ? mapCompany(data as PublicCompany) : null
  const name = founder?.name || company?.name || ""
  const website = publicWebsite(company?.website || founder?.websiteUrl || founder?.primaryCompany?.website)
  async function connect() {
    if (!founder || connecting) return
    if (!user) { router.push(`/login?redirect=${encodeURIComponent(`/founders/${slug}`)}`); return }
    setConnecting(true); setConnectionError(null)
    try {
      const response = await api.post<{data: {room_id: number}}>(`/member/founders/${founder.id}/connect`)
      router.push(`/dashboard/messages?room=${response.data.room_id}`)
    } catch (error) { setConnectionError(error instanceof Error ? error.message : 'Unable to start conversation.') }
    finally { setConnecting(false) }
  }
  return <PublicLayout><section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
    <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[#3B52D4]" href={kind === "founder" ? "/founders" : "/founders/companies"}>{ar ? "العودة إلى الدليل" : "Back to directory"}</Link>
    {loading && <p role="status" className="mt-6">{ar ? "جارٍ تحميل الملف…" : "Loading profile…"}</p>}
    {error && <div role="alert" className="mt-6 rounded-xl border bg-white p-6"><p>{error}</p><Button className="mt-4" onClick={() => setAttempt(value => value + 1)}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {data && <article className="mt-5 rounded-3xl border bg-white p-6 sm:p-10">
      <header className="flex flex-wrap items-center gap-5"><Avatar className="h-24 w-24"><AvatarImage src={founder?.avatarUrl || company?.logoUrl || ""} alt={name} className={company ? "object-contain" : "object-cover"} /><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h1 className="text-3xl font-bold sm:text-4xl">{name}</h1><p className="mt-3 text-slate-600">{founder?.tagline || company?.sector}</p></div></header>
      {founder && <div className="mt-5 rounded-2xl bg-indigo-50 p-5">
        <p className="font-semibold text-indigo-900">{snapshot ? ar ? 'نسخة عامة من الملف' : 'Public profile snapshot' : founder.canCommunicate ? ar ? 'عضو نشط في وصول' : 'Active Wosool member' : ar ? 'بانتظار تفعيل المؤسس' : 'Awaiting founder activation'}</p>
        {!founder.canCommunicate && <p className="mt-2 text-sm leading-7 text-slate-600">{ar ? 'يمكن لصاحب الملف تفعيله عبر دعوة وصول، ثم مراجعة بياناته والتواصل مع المجتمع.' : 'The founder can activate this profile through a Wosool invitation, review their information, and connect with the community.'}</p>}
        {snapshot && <p className="mt-2 text-sm text-slate-600">{ar ? 'حالة العضوية المباشرة غير متاحة حالياً.' : 'Live membership status is temporarily unavailable.'}</p>}
      </div>}
      <p className="my-6 whitespace-pre-wrap text-base leading-loose text-slate-700">{founder?.bio || company?.description}</p>
      <dl className="grid gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">{[[ar ? "الموقع" : "Location", founder?.location || company?.location], [ar ? "القطاع" : "Sector", founder?.sector || company?.sector], [ar ? "المرحلة" : "Stage", founder?.stage || company?.stage]].map(([label, value]) => value && <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
      {website && <Button asChild className="mt-6"><a href={website} target="_blank" rel="noopener noreferrer">{ar ? "زيارة موقع الشركة" : "Visit company website"}</a></Button>}
      {founder && <>
        <div className="my-6 grid gap-6 sm:grid-cols-2">{[[ar ? "يبحث عن" : "Looking for", founder.needs], [ar ? "يقدم" : "Can offer", founder.offers]].map(([label, items]) => Array.isArray(items) && items.length > 0 && <section key={String(label)}><h2 className="text-lg font-bold">{label}</h2><ul className="mt-3 list-inside list-disc text-slate-600">{items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
        <div className="flex flex-wrap items-center gap-3">
          {founder.canCommunicate && String(user?.id) !== String(founder.userId) ? <Button disabled={connecting} onClick={connect}>{connecting ? ar ? 'جارٍ فتح المحادثة…' : 'Opening conversation…' : ar ? 'تواصل مع المؤسس' : 'Message founder'}</Button> : String(user?.id) === String(founder.userId) && founder.userId ? <Button asChild><Link href="/dashboard/profile">{ar ? 'تعديل ملفي' : 'Edit my profile'}</Link></Button> : <Button variant="outline" asChild><Link href={`/contact?subject=${encodeURIComponent(`Founder profile activation: ${founder.name}`)}`}>{ar ? 'هل هذا ملفك؟ اطلب التفعيل' : 'Is this your profile? Request activation'}</Link></Button>}
          {[["LinkedIn", founder.linkedinUrl], ["X", founder.twitterUrl]].map(([label, url]) => publicWebsite(url) && <a key={label} href={publicWebsite(url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-indigo-600 underline">{label}</a>)}
        </div>
        {connectionError && <p role="alert" className="mt-3 text-sm text-red-700">{connectionError}</p>}
        {!!founder.sourceUrls?.length && <details className="mt-7 rounded-xl border p-4"><summary className="cursor-pointer font-semibold">{ar ? 'المصادر وتاريخ المراجعة' : 'Sources and review date'}</summary><ul className="mt-3 space-y-2">{founder.sourceUrls.filter(url => publicWebsite(url)).map((url, index) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 underline">{ar ? 'المصدر' : 'Source'} {index + 1} · {new URL(url).hostname}</a></li>)}</ul><p className="mt-3 text-sm text-slate-500">{founder.sourceReviewedAt}</p></details>}
        {((data as ApiFounder).companies?.length ?? 0) > 0 && <section className="mt-10"><h2 className="mb-5 text-2xl font-bold">{ar ? "الشركات" : "Companies"}</h2><div className="grid gap-5 sm:grid-cols-2">{(data as ApiFounder).companies?.map(item => <CompanyCard key={item.id} company={mapCompany(item)} linkToProfile={!snapshot} />)}</div></section>}
      </>}
      {company && ((data as PublicCompany).founders?.length ?? 0) > 0 && <section className="mt-8"><h2 className="text-xl font-bold">{ar ? "المؤسسون" : "Founders"}</h2><ul className="mt-3 space-y-2">{(data as PublicCompany).founders?.map(item => <li key={item.id}><Link className="inline-flex min-h-11 items-center text-[#3B52D4] underline" href={`/founders/${encodeURIComponent(item.slug)}`}>{mapFounder(item).name}</Link></li>)}</ul></section>}
    </article>}
  </section></PublicLayout>
}
