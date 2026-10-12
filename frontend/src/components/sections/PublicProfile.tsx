"use client"

import { useEffect, useState } from "react"
import { Copy, Check, MapPin, Building2, ArrowUpRight, ShieldCheck } from "lucide-react"
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
import { ProfileNews } from "./ProfileNews"

type PublicCompany = ApiCompany & { founders?: ApiFounder[] }

export function PublicProfile({ kind }: { kind: "founder" | "company" }) {
  const { slug } = useParams<{ slug: string }>()
  const { locale } = useLocale()
  const { user } = useAuth()
  const router = useRouter()
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">("idle")
  const [shareUrl, setShareUrl] = useState("")
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
  async function share() {
    const url = window.location.origin + window.location.pathname
    setShareUrl(url)
    try { await navigator.clipboard.writeText(url); setShareState('copied') }
    catch { setShareState('manual') }
  }
  const skills = (data as ApiFounder | null)?.skills ?? []
  return <PublicLayout><section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-600" href={kind === "founder" ? "/founders" : "/founders/companies"}>{ar ? "العودة إلى الدليل" : "Back to directory"}</Link>{data && <button type="button" aria-label={shareState === "copied" ? (ar ? "تم نسخ الرابط" : "Link copied") : (ar ? "مشاركة الملف" : "Share profile")} onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold text-slate-600">{shareState === 'copied' ? <Check size={16}/> : <Copy size={16}/>}<span role="status">{shareState === 'copied' ? ar ? 'تم نسخ الرابط' : 'Link copied' : ar ? 'مشاركة الملف' : 'Share profile'}</span></button>}</div>
    {shareState === 'manual' && <label className="mt-3 block text-sm text-slate-600">{ar ? 'انسخ رابط الملف' : 'Copy this profile link'}<input aria-label={ar ? 'رابط الملف' : 'Profile link'} value={shareUrl} readOnly onFocus={event => event.target.select()} className="mt-2 min-h-11 w-full rounded-xl border px-3"/></label>}
    {loading && <div role="status" className="mt-5 rounded-3xl border bg-white p-10 text-slate-500">{ar ? 'جارٍ تحميل الملف…' : 'Loading profile…'}</div>}
    {error && <div role="alert" className="mt-6 rounded-xl border bg-white p-6"><p>{error}</p><Button className="mt-4" onClick={() => setAttempt(value => value + 1)}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {data && <>
      <header className="relative mt-5 overflow-hidden rounded-3xl bg-[#101035] px-6 py-8 text-white sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -end-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"/>
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center"><Avatar className="h-24 w-24 shrink-0 border-4 border-white/20 sm:h-28 sm:w-28"><AvatarImage src={founder?.avatarUrl || company?.logoUrl || ""} alt={name} className={company ? "bg-white object-contain p-2" : "object-cover"}/><AvatarFallback className="bg-indigo-600 text-2xl text-white">{getInitials(name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="text-xs font-bold tracking-widest text-indigo-200">{founder ? ar ? 'ملف المؤسس' : 'FOUNDER PROFILE' : ar ? 'ملف الشركة' : 'COMPANY PROFILE'}</p><h1 className="mt-3 break-words text-3xl font-extrabold sm:text-4xl">{name}</h1><p className="mt-3 text-base leading-7 text-indigo-100">{founder?.position || founder?.tagline || company?.sector}{founder?.position && founder.companyName ? ` · ${founder.companyName}` : ''}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-indigo-100">{(founder?.location || company?.location) && <span className="inline-flex items-center gap-1"><MapPin size={14}/>{founder?.location || company?.location}</span>}{(founder?.sector || company?.sector) && <span className="inline-flex items-center gap-1"><Building2 size={14}/>{founder?.sector || company?.sector}</span>}{founder?.isVerified && <span className="inline-flex items-center gap-1"><ShieldCheck size={14}/>{ar?'ملف موثّق':'Verified profile'}</span>}</div></div></div>
      </header>
      <nav aria-label={ar?'أقسام الملف':'Profile sections'} className="my-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">{[['#profile-about',ar?'نبذة':'Overview'],...(founder && (data as ApiFounder).companies?.length ? [['#profile-companies',ar?'الشركات':'Companies']] : []),['#profile-connect',ar?'التواصل':'Connect']].map(([href,label])=><a key={href} href={href} className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">{label}</a>)}</nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <section id="profile-about" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-xl font-bold text-slate-950">{ar?'نبذة':'About'}</h2><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-600">{founder?.bio || company?.description || (ar?'لم تُضف نبذة بعد.':'A biography has not been added yet.')}</p>{(() => { const traction = company?.traction || founder?.primaryCompany?.traction; const year = company?.foundedYear || founder?.primaryCompany?.foundedYear; const source = publicWebsite(traction?.sourceUrl); return (traction || year) ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="text-sm font-bold text-emerald-900">{ar?'مؤشرات التشغيل والإيرادات':'Operations & traction'}</h3>{traction && <p className="mt-2 text-sm leading-7 text-slate-800">{traction.text}</p>}{!!year && <p className="mt-2 text-xs font-semibold text-slate-600">{ar?'سنة التأسيس: ':'Founded: '}{year}</p>}{source && <a href={source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-xs font-bold text-indigo-700 underline">{ar?'عرض المصدر':'View source'}</a>}</div> : null })()}{skills.length > 0 && <div className="mt-7 border-t pt-6"><h3 className="text-sm font-bold text-slate-900">{ar?'الخبرات والمهارات':'Expertise & skills'}</h3><ul className="mt-3 flex flex-wrap gap-2">{skills.map(skill=><li key={skill} className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">{skill}</li>)}</ul></div>}</section>
          {founder && (founder.needs.length > 0 || founder.offers.length > 0) && <div className="grid gap-4 sm:grid-cols-2">{[[ar?'أبحث عن':'Looking for',founder.needs],[ar?'يمكنني المساعدة في':'I can help with',founder.offers]].map(([label,items])=>Array.isArray(items) && items.length > 0 && <section key={String(label)} className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6"><h2 className="text-lg font-bold text-indigo-950">{label}</h2><ul className="mt-4 space-y-3 text-sm leading-7 text-indigo-900">{items.map(item=><li key={item} className="flex gap-2"><ArrowUpRight size={17} className="mt-1 shrink-0"/>{item}</li>)}</ul></section>)}</div>}
          {founder && ((data as ApiFounder).companies?.length ?? 0) > 0 && <section id="profile-companies" className="scroll-mt-24"><h2 className="mb-5 text-xl font-bold">{ar?'الشركات والمشاريع':'Companies & ventures'}</h2><div className="grid gap-5 sm:grid-cols-2">{(data as ApiFounder).companies?.map(item=><CompanyCard key={item.id} company={mapCompany(item)} linkToProfile={!snapshot}/>)}</div></section>}
          {company && ((data as PublicCompany).founders?.length ?? 0) > 0 && <section className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">{ar?'المؤسسون':'Founders'}</h2><ul className="mt-4 divide-y">{(data as PublicCompany).founders?.map(item=><li key={item.id}><Link className="flex min-h-14 items-center justify-between gap-3 py-3 font-semibold text-indigo-600" href={`/founders/${encodeURIComponent(item.slug)}`}>{mapFounder(item).name}<ArrowUpRight size={17}/></Link></li>)}</ul></section>}
          <ProfileNews companyNames={kind === "founder" ? ((data as ApiFounder).companies ?? []).flatMap(item => [item.name, item.slug]) : [company?.name ?? "", company?.slug ?? ""]} />
        </div>
        <aside id="profile-connect" className="min-w-0 scroll-mt-24 space-y-4 lg:sticky lg:top-24">
          <section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">{ar?'ابدأ التواصل':'Make a connection'}</h2>
            {founder && <><p className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-bold ${founder.canCommunicate ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{snapshot ? ar?'نسخة عامة من الملف':'Public profile snapshot' : founder.canCommunicate ? ar?'عضو نشط في وصول':'Active Wosool member' : ar?'بانتظار تفعيل المؤسس':'Awaiting founder activation'}</p><p className="mt-4 text-sm leading-7 text-slate-500">{snapshot ? ar?'حالة العضوية المباشرة غير متاحة حالياً.':'Live membership status is temporarily unavailable.' : founder.canCommunicate ? ar?'ابدأ محادثة خاصة وعرّف المؤسس بهدف تواصلك.':'Start a private conversation and share what you hope to achieve together.' : ar?'يمكن لصاحب الملف تفعيله عبر دعوة وصول، ثم مراجعة بياناته والتواصل مع المجتمع.':'The founder can activate this profile through a Wosool invitation, review their information, and connect with the community.'}</p>
              <div className="mt-5">{founder.canCommunicate && String(user?.id) !== String(founder.userId) ? <Button className="min-h-12 w-full" disabled={connecting} onClick={connect}>{connecting ? ar?'جارٍ فتح المحادثة…':'Opening conversation…' : ar?'تواصل مع المؤسس':'Message founder'}</Button> : String(user?.id) === String(founder.userId) && founder.userId ? <Button className="w-full" asChild><Link href="/dashboard/profile">{ar?'تعديل ملفي':'Edit my profile'}</Link></Button> : <Button className="h-auto min-h-12 w-full whitespace-normal text-center" variant="outline" asChild><Link href={`/contact?subject=${encodeURIComponent(`Founder profile activation: ${founder.name}`)}`}>{ar?'هل هذا ملفك؟ اطلب التفعيل':'Is this your profile? Request activation'}</Link></Button>}</div></>}
            {website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 text-sm font-semibold text-indigo-600">{ar?'زيارة موقع الشركة':'Visit company website'}<ArrowUpRight size={16}/></a>}
            {founder && <div className="mt-3 flex flex-wrap gap-3">{[['LinkedIn',founder.linkedinUrl],['X',founder.twitterUrl]].map(([label,url])=>publicWebsite(url) && <a key={label} href={publicWebsite(url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-indigo-600 underline">{label}</a>)}</div>}
            {connectionError && <p role="alert" className="mt-3 text-sm text-red-700">{connectionError}</p>}
          </section>
          <section className="rounded-3xl border bg-white p-6"><h2 className="text-sm font-bold">{ar?'نظرة سريعة':'At a glance'}</h2><dl className="mt-4 space-y-4">{[[ar?'الموقع':'Location',founder?.location || company?.location],[ar?'القطاع':'Sector',founder?.sector || company?.sector],[ar?'المرحلة':'Stage',founder?.stage || company?.stage]].map(([label,value])=>value && <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}</dl></section>
          {!!founder?.sourceUrls?.length && <details className="rounded-2xl border bg-slate-50 p-5"><summary className="cursor-pointer text-sm font-semibold">{ar?'المصادر وتاريخ المراجعة':'Sources and review date'}</summary><ul className="mt-3 space-y-2">{founder.sourceUrls.filter(url=>publicWebsite(url)).map((url,index)=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all text-xs text-indigo-600 underline">{ar?'المصدر':'Source'} {index+1} · {new URL(url).hostname}</a></li>)}</ul><p className="mt-3 text-xs text-slate-500">{founder.sourceReviewedAt}</p></details>}
        </aside>
      </div>
    </>}
  </section></PublicLayout>
}
