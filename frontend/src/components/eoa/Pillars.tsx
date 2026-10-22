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
      summary: "Know when cash comes in, when it goes out and what growth will cost.",
      topics: ["Cash flow and liquidity", "Profitability and margins", "Forecasting and controls", "Working capital decisions"],
      outcome: "A clearer picture of your cash needs before the next big decision.",
    },
    ar: {
      title: "النقد",
      summary: "اعرف متى يدخل النقد ويخرج، وما تكلفة خطوتك التالية.",
      topics: ["التدفقات النقدية والسيولة", "الربحية والهوامش", "التنبؤ والضوابط المالية", "قرارات رأس المال العامل"],
      outcome: "صورة أوضح لاحتياجاتك النقدية قبل القرار التالي.",
    },
  },
  {
    key: "strategy",
    icon: Compass,
    en: {
      title: "Strategy",
      summary: "Decide which customers and opportunities deserve your attention.",
      topics: ["Market positioning", "Value proposition", "Competitive advantage", "Growth priorities"],
      outcome: "A direction your team can explain and put to the test.",
    },
    ar: {
      title: "الاستراتيجية",
      summary: "حدّد العملاء والفرص التي تستحق وقت فريقك.",
      topics: ["التموضع في السوق", "عرض القيمة", "الميزة التنافسية", "أولويات النمو"],
      outcome: "اتجاه يستطيع فريقك شرحه واختباره في السوق.",
    },
  },
  {
    key: "people",
    icon: UsersRound,
    en: {
      title: "People",
      summary: "Work out who owns each decision as your team grows.",
      topics: ["Leadership systems", "Hiring and talent", "Culture and accountability", "Organization design"],
      outcome: "Clearer roles and fewer decisions left waiting on the founder.",
    },
    ar: {
      title: "الأفراد",
      summary: "اعرف من يتخذ كل قرار مع توسّع فريقك.",
      topics: ["أنظمة القيادة", "التوظيف والمواهب", "الثقافة والمساءلة", "التصميم التنظيمي"],
      outcome: "أدوار أوضح وقرارات لا تتوقف كلها عند المؤسس.",
    },
  },
  {
    key: "execution",
    icon: Gauge,
    en: {
      title: "Execution",
      summary: "Choose what to do this week and how to check the results.",
      topics: ["Operating cadence", "KPIs and priorities", "Decision routines", "Continuous improvement"],
      outcome: "A regular check on priorities, results and what needs to change.",
    },
    ar: {
      title: "التنفيذ",
      summary: "اختر ما ستنجزه هذا الأسبوع وكيف ستراجع نتائجه.",
      topics: ["إيقاع التشغيل", "المؤشرات والأولويات", "روتين اتخاذ القرار", "التحسين المستمر"],
      outcome: "مراجعة منتظمة للأولويات والنتائج وما يحتاج إلى تعديل.",
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
            <span className="eoa-eyebrow">{ar ? "ما الذي ستناقشه؟" : "WHAT YOU’LL DISCUSS"}</span>
            <h2 id="eoa-pillars-title">{ar ? "أربع زوايا للنظر في شركتك." : "Four ways to look at your business."}</h2>
          </div>
          <p>{ar ? "افتح كل محور لترى الأسئلة التي ستعمل عليها. يحدد فريق البرنامج تفاصيل الجلسات لكل دفعة مع ميسّريها المعتمدين." : "Open each area to see the questions you’ll work through. The program team sets session details with each cohort’s approved facilitators."}</p>
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
