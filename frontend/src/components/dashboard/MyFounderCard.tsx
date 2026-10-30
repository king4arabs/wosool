"use client"

import Link from "next/link"
import { ArrowUpRight, Eye, EyeOff, Pencil, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FounderCard } from "@/components/sections/FounderCard"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { founderCardLinks } from "@/lib/founder-card-links"
import { getInitials } from "@/lib/utils"

export type FounderCardState = "checking" | "published" | "hidden" | "unavailable" | "missing"

export function MyFounderCard({
  profile,
  publicProfile,
  state,
  locale,
}: {
  profile: ApiFounder | null
  publicProfile: ApiFounder | null
  state: FounderCardState
  locale: "ar" | "en"
}) {
  const ar = locale === "ar"
  const visible = state === "published" && publicProfile
  const publicFounder = visible ? mapFounder(visible) : null
  const links = publicFounder ? founderCardLinks(publicFounder.slug) : null
  const name = profile?.name || (ar ? "ملف المؤسس" : "Founder profile")
  const status = {
    published: ar ? "ظاهرة في دليل المؤسسين" : "Published in the founder directory",
    hidden: ar ? "غير ظاهرة للعامة" : "Not publicly listed",
    unavailable: ar ? "تعذر التحقق من الظهور العام" : "Public visibility could not be confirmed",
    checking: ar ? "جارٍ التحقق من البطاقة العامة" : "Checking public card",
    missing: ar ? "لم تنشئ ملف المؤسس بعد" : "No founder profile yet",
  }[state]
  return (
    <section aria-labelledby="linked-founder-card-heading" className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{ar ? "حسابك وبطاقتك" : "YOUR ACCOUNT & FOUNDER CARD"}</p>
          <h2 id="linked-founder-card-heading" className="mt-2 text-xl font-extrabold text-slate-950">{ar ? "بطاقتك في شبكة المؤسسين" : "Your card in the founder network"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{ar ? "تُعرض بيانات بطاقتك من ملف حسابك نفسه، وتنعكس التحديثات المنشورة في الصفحة الرئيسية ودليل المؤسسين." : "Your card uses your account's founder profile. Published changes appear on the homepage and in the founder directory."}</p>
        </div>
        <span role="status" className={visible ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800" : "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"}>
          {visible ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}{status}
        </span>
      </div>

      <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 rounded-2xl bg-slate-50 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-14 w-14 shrink-0 border border-slate-200">
              <AvatarImage src={profile?.avatar_url ?? ""} alt={name} />
              <AvatarFallback className="bg-indigo-100 text-indigo-900">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-slate-900">{name}</h3>
              {profile?.position && <p className="mt-1 text-xs leading-5 text-slate-500">{profile.position}</p>}
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{state === "missing"
            ? (ar ? "أكمل ملفك لتجهيز بطاقتك في المجتمع." : "Complete your profile to prepare your founder card.")
            : state === "hidden"
            ? (ar ? "يمكنك تعديل ملفك وإعدادات الظهور؛ الملفات المخفية أو غير النشطة لا تظهر في الصفحات العامة." : "You can edit your profile and visibility. Hidden or inactive profiles are never shown publicly.")
            : state === "unavailable"
            ? (ar ? "احتفظنا ببيانات حسابك؛ حاول التحديث لاحقاً قبل مشاركة أي رابط عام." : "Your account data is unchanged. Refresh before sharing a public link.")
            : (ar ? "عدّل بياناتك مرة واحدة وسيبقى الرابط العام مرتبطاً بالملف نفسه." : "Edit your profile once; the public link stays connected to that same record.")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/dashboard/profile" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700"><Pencil size={16} aria-hidden="true" />{ar ? "إدارة بطاقتي" : "Edit my card"}</Link>
            {links && <Link href={links.profile} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-indigo-300"><UserRound size={16} aria-hidden="true" />{ar ? "الملف العام" : "Public profile"}</Link>}
          </div>
          {links && <div className="mt-5 grid gap-2">
            <Link href={links.home} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-50">{ar ? "ابحث عن بطاقتي في الرئيسية" : "Find my card on the homepage"}<ArrowUpRight size={17} aria-hidden="true" /></Link>
            <Link href={links.directory} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-50">{ar ? "ابحث عن بطاقتي في دليل المؤسسين" : "Find my card in the founder directory"}<ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>}
        </div>
        <div className="min-w-0">
          {publicFounder
            ? <div className="mx-auto max-w-lg"><FounderCard founder={publicFounder} layout="grid" /></div>
            : <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <UserRound size={30} className="text-slate-400" aria-hidden="true" />
                <p className="mt-3 max-w-sm text-sm font-semibold leading-7 text-slate-600">{ar ? "تظهر هنا نسخة البطاقة العامة بعد إتاحتها والتحقق منها." : "The live public card preview appears here once it is available and verified."}</p>
              </div>}
        </div>
      </div>
    </section>
  )
}
