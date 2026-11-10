"use client"

import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FaqExplorer } from "@/components/sections/FaqExplorer"
import styles from "./page.module.css"
import { FAQS } from "@/data/faq"
import { useLocale } from "@/lib/locale"

export default function FaqPage() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  return <PublicLayout><div dir={direction} lang={locale} className="min-h-screen bg-[var(--page-bg)]">
    <header className={styles.header}>
      <span>{ar ? "مركز المساعدة" : "Help centre"}</span>
      <h1>{ar ? "الأسئلة الشائعة" : "Frequently asked questions"}</h1>
      <p>{ar ? "كل ما تحتاج معرفته عن وصول، في مكان واحد." : "Everything you need to know about Wosool, in one place."}</p>
      <Link href="/eoa/faq">{ar ? "تبحث عن مسرّعة EO الرياض؟" : "Looking for EO Riyadh Accelerator?"} <span aria-hidden="true">↗</span></Link>
    </header>
    <section className={styles.content}>
      <FaqExplorer items={FAQS} />
    </section>
  </div></PublicLayout>
}
