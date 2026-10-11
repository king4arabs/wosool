"use client"

import { Banknote, Compass, Gauge, UsersRound } from "lucide-react"
import { useLocale } from "@/lib/locale"
import styles from "./program.module.css"

const pillars = [
  {
    key: "cash",
    icon: Banknote,
    en: {
      title: "Cash",
      summary: "Build financial clarity and fund sustainable growth.",
      topics: ["Cash flow and liquidity", "Profitability and margins", "Forecasting and controls", "Working capital decisions"],
      outcome: "A stronger financial operating rhythm and clearer growth choices.",
    },
    ar: {
      title: "النقد",
      summary: "ابنِ وضوحاً مالياً يمكّن النمو المستدام.",
      topics: ["التدفقات النقدية والسيولة", "الربحية والهوامش", "التنبؤ والضوابط المالية", "قرارات رأس المال العامل"],
      outcome: "إيقاع مالي أقوى وقرارات نمو أكثر وضوحاً.",
    },
  },
  {
    key: "strategy",
    icon: Compass,
    en: {
      title: "Strategy",
      summary: "Turn ambition into a focused competitive direction.",
      topics: ["Market positioning", "Value proposition", "Competitive advantage", "Growth priorities"],
      outcome: "A strategy the team can understand, test and execute.",
    },
    ar: {
      title: "الاستراتيجية",
      summary: "حوّل الطموح إلى اتجاه تنافسي واضح ومركّز.",
      topics: ["التموضع في السوق", "عرض القيمة", "الميزة التنافسية", "أولويات النمو"],
      outcome: "استراتيجية يفهمها الفريق ويختبرها وينفذها.",
    },
  },
  {
    key: "people",
    icon: UsersRound,
    en: {
      title: "People",
      summary: "Build the leadership, culture and team your next stage needs.",
      topics: ["Leadership systems", "Hiring and talent", "Culture and accountability", "Organization design"],
      outcome: "A team structure that can grow without losing clarity or ownership.",
    },
    ar: {
      title: "الأفراد",
      summary: "ابنِ القيادة والثقافة والفريق المناسب للمرحلة القادمة.",
      topics: ["أنظمة القيادة", "التوظيف والمواهب", "الثقافة والمساءلة", "التصميم التنظيمي"],
      outcome: "هيكل فريق قادر على النمو مع وضوح المسؤولية والملكية.",
    },
  },
  {
    key: "execution",
    icon: Gauge,
    en: {
      title: "Execution",
      summary: "Translate strategy into measurable commitments and results.",
      topics: ["Operating cadence", "KPIs and priorities", "Decision routines", "Continuous improvement"],
      outcome: "A disciplined execution system that keeps growth visible and actionable.",
    },
    ar: {
      title: "التنفيذ",
      summary: "حوّل الاستراتيجية إلى التزامات ونتائج قابلة للقياس.",
      topics: ["إيقاع التشغيل", "المؤشرات والأولويات", "روتين اتخاذ القرار", "التحسين المستمر"],
      outcome: "نظام تنفيذ منضبط يجعل النمو واضحاً وقابلاً للعمل.",
    },
  },
] as const

export function EoaPillars() {
  const { locale } = useLocale()
  const ar = locale === "ar"

  return (
    <section className="eoa-section" id="pillars" aria-labelledby="eoa-pillars-title">
      <div className="eoa-container">
        <div className="eoa-section-head">
          <div>
            <span className="eoa-eyebrow">{ar ? "من التعلّم إلى التطبيق" : "LEARNING THAT MOVES THE BUSINESS"}</span>
            <h2 id="eoa-pillars-title">{ar ? "أربع ركائز. شركة أقوى." : "Four pillars. One stronger company."}</h2>
          </div>
          <p>{ar ? "افتح كل ركيزة لاستكشاف الموضوعات والنتيجة العملية المقصودة. تُكيّف التفاصيل حسب الدفعة والميسّرين المعتمدين." : "Open each pillar to explore its themes and intended practical outcome. Delivery is configured for each cohort and its approved facilitators."}</p>
        </div>

        <div className={styles.pillarGrid}>
          {pillars.map((pillar, index) => {
            const content = pillar[locale]
            const Icon = pillar.icon
            return (
              <details key={pillar.key} className={styles.pillar}>
                <summary>
                  <span className={styles.pillarNumber}>0{index + 1}</span>
                  <span className={styles.pillarIcon}><Icon aria-hidden="true" /></span>
                  <span className={styles.pillarHeading}><strong>{content.title}</strong><span>{content.summary}</span></span>
                  <span className={styles.expandLabel}>{ar ? "استكشف" : "Explore"}</span>
                </summary>
                <div className={styles.pillarBody}>
                  <ul>{content.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                  <p><strong>{ar ? "النتيجة العملية" : "Practical outcome"}</strong>{content.outcome}</p>
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </section>
  )
}
