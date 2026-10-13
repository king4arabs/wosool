"use client"

import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FaqExplorer } from "@/components/sections/FaqExplorer"
import { PageHero, heroSecondary } from "@/components/sections/PageHero"
import { FAQS } from "@/data/faq"
import { useLocale } from "@/lib/locale"

export default function FaqPage() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  return <PublicLayout><div dir={direction} lang={locale} className="min-h-screen bg-[var(--page-bg)]">
    <PageHero
      eyebrow={ar ? "مركز المساعدة" : "Help centre"}
      title={ar ? "الأسئلة الشائعة" : "Questions and answers"}
      description={ar ? "إجابات مباشرة عن العضوية، والحساب، والخصوصية، والتعارف بين المؤسسين، والفعاليات، ومصادر الأخبار." : "Straight answers about membership, your account, privacy, introductions, events and where our news comes from."}
      actions={<Link href="/eoa/faq" className={heroSecondary}>{ar ? "أسئلة مسرّعة EO الرياض" : "EO Riyadh Accelerator FAQ"}</Link>}
    />
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <FaqExplorer items={FAQS} />
    </section>
  </div></PublicLayout>
}
