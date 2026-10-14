"use client"

import Link from "next/link"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"
import { wikiArticles } from "@/lib/wiki"

export function KnowledgeView({ slug }: { slug?: string }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const article = wikiArticles.find(item => item.slug === slug)
  return <PublicLayout><div className="bg-[var(--page-bg)] pb-16">
    <header className="bg-[var(--surface-inverse)] px-5 py-14 text-[var(--on-dark)]"><div className="mx-auto max-w-5xl">
      <Link href="/wiki" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"><BookOpen size={20} />{ar ? "مركز المعرفة" : "Knowledge hub"}</Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">{article ? article.title[locale] : ar ? "معرفة تساعدك على النمو" : "Knowledge for your next step"}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--on-dark-muted)]">{article ? article.summary[locale] : ar ? "أدلة عملية للمؤسسين: الملفات والشركات والمسرّعة ومصادر المعلومات." : "Practical guides to founder profiles, company evidence, the Accelerator and reliable information."}</p>
    </div></header>
    <div className="mx-auto max-w-5xl px-5 py-10">{article ? <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-10">
      <p className="mb-6 text-sm text-[var(--text-muted)]">{ar ? "آخر تحديث: " : "Updated: "}<time dateTime={article.updatedAt}>{article.updatedAt}</time></p>
      <div className="space-y-6 text-lg leading-9">{article.sections.map((section, index) => <p key={index}>{section[locale]}</p>)}</div>
      <nav aria-label={ar ? "الخطوات التالية" : "Next steps"} className="mt-8 flex flex-wrap gap-3">{article.links.map(link => <Link key={link.href} href={link.href} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-5 py-3 font-bold text-[var(--action-fg)]">{link[locale]}<ArrowUpRight size={18} /></Link>)}</nav>
    </article> : <div className="grid gap-5 sm:grid-cols-2">{wikiArticles.map(item => <Link href={`/wiki/${item.slug}`} key={item.slug} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-7 transition hover:border-[var(--action-bg)]"><h2 className="text-xl font-bold">{item.title[locale]}</h2><p className="mt-3 leading-7 text-[var(--text-muted)]">{item.summary[locale]}</p><span className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--link)]">{ar ? "اقرأ الدليل" : "Read guide"}<ArrowUpRight size={18} /></span></Link>)}</div>}
      <Link href={article ? "/wiki" : "/api"} className="mt-8 inline-flex min-h-11 items-center text-[var(--link)] underline">{article ? ar ? "جميع الأدلة" : "All guides" : ar ? "دليل المطورين وواجهة البيانات" : "Developer & API reference"}</Link>
    </div>
  </div></PublicLayout>
}
