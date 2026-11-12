"use client"

import { useState } from "react"
import styles from "./RegionalHeroMetrics.module.css"
import { regionalHeroValues } from "@/lib/regional-hero-metrics"

const regions = ["Saudi Arabia", "GCC", "MENA", "World"]
const arabic = ["السعودية", "الخليج", "الشرق الأوسط وشمال أفريقيا", "العالم"]
export function RegionalHeroMetrics({ ar }: { ar: boolean }) {
  const [region, setRegion] = useState(0)
  const labels = ar ? [region === 3 ? "المنظومات الريادية" : "المؤسسون", "الشركات", region === 2 ? "نمو المبيعات" : "نمو الإيرادات", "نمو عدد صفقات التمويل"] : [region === 3 ? "Startup ecosystems" : "Founders", "Companies", region === 2 ? "Sales growth" : "Revenue growth", "Funding deal growth"]
  const values = regionalHeroValues[region]
  const periods = region === 1 ? ["Crunchbase · 2026-11-01", "Crunchbase · 2026-11-01", "Q4 2025 / Q4 2024", "2025 / 2024"] : ["Crunchbase · 2026-11-01", "Crunchbase · 2026-11-01", "2024 / 2023", "9M 2026 / 9M 2025"]
  const sources = region === 1 ? ["https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.kamcoinvest.com/sites/default/files/research/pdf/GCC%20Corporate%20Earnings%20Report%20-%20Q4-2025.pdf", "https://lucidityinsights.com/infobytes/gcc-investors-double-down-scale-2025"] : ["https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175", "https://www.magnitt.com/research/ksa-venture-capital-the-q3-2026-update-51062"]
  const cb = "https://www.crunchbase.com/hub/middle-east-and-north-africa-startups"
  const genome = "https://startupgenome.com/report/the-global-startup-ecosystem-report-2026/methodology"
  const aws = "https://press.aboutamazon.com/2026/6/aws-global-startup-trends-report-reveals-ai-native-startups-are-reaching-billion-dollar-valuations-in-half-the-time"
  const extra = region === 2 ? {
    scopes: ar ? ["ضمن قاعدة Crunchbase", "ضمن قاعدة Crunchbase", "أكبر 100 شركة مدرجة بالمنطقة · نمو المبيعات", "الاستثمار الجريء · سنوي"] : ["Founders tracked by Crunchbase", "For-profit companies tracked", "Top 100 MENA listed companies · sales growth", "Venture capital · year over year"],
    periods: ["Oct 2026", "Oct 2026", "2024 / 2023", "9M 2026 / 9M 2025"],
    sources: [cb, cb, "https://www.forbesmiddleeast.com/lists/top-100-listed-companies-2025/", "https://www.magnitt.com/research/Q3-2026-MENA-VC-Update-51060"],
    names: ["Crunchbase", "Crunchbase", "Forbes Middle East", "MAGNiTT"],
  } : region === 3 ? {
    scopes: ar ? ["منظومات ريادية شملها تقرير Startup Genome", "تغطية قاعدة Startup Genome", "متوسط استطلاع الشركات الناشئة", "الاستثمار الجريء · سنوي"] : ["Entrepreneurial ecosystems analyzed by Startup Genome", "Startup Genome dataset coverage", "Startup survey average", "Venture capital · year over year"],
    periods: ["GSER 2026", "GSER 2026", "AWS · 2026 survey", "2025 / 2024"],
    sources: [genome, genome, aws, "https://www.bvkap.de/files/content/Studien/Studien%20Archiv/20260126_BVK%20Global%20Venture%20Capital%20report%202025_FINAL.pdf"],
    names: ["Startup Genome", "Startup Genome", "AWS", "BVK / CB Insights"],
  } : null
  return <aside className={styles.panel} dir={ar ? "rtl" : "ltr"} aria-label={ar ? "مؤشرات المنظومة" : "Ecosystem indicators"}>
    <p className={styles.heading}>{ar ? "نبض المنظومة" : "ECOSYSTEM PULSE"}</p>
    <div className={styles.regions} aria-label={ar ? "المنطقة" : "Region"}>{regions.map((name, i) => <button type="button" key={name} aria-pressed={region === i} onClick={() => setRegion(i)}>{ar ? arabic[i] : name}</button>)}</div>
    <div className={styles.grid} key={region}>{labels.map((label, i) => <article key={label} className={styles.card}>
      <h2>{label}</h2><strong aria-label={values[i] === null ? (ar ? "غير متاح" : "Unavailable") : undefined}>{values[i] === null ? "—" : `${i > 1 && values[i]! > 0 ? "+" : ""}${new Intl.NumberFormat(ar ? "ar-u-nu-latn" : "en", region === 3 && i < 2 ? { notation: "compact", maximumFractionDigits: 1 } : {}).format(values[i]!)}${i > 1 ? "%" : region === 3 && i < 2 ? "+" : ""}`}</strong>
      {values[i] === null ? null : extra ? <><p>{extra.scopes[i]}</p><p dir="ltr">{extra.periods[i]}</p><a href={extra.sources[i]} target="_blank" rel="noopener noreferrer">{extra.names[i]} ↗</a></> : values[i] === null ? null : <><p>{i < 2 ? ar ? (i === 0 ? "مؤسسون ضمن Crunchbase" : "شركات ربحية ضمن Crunchbase") : (i === 0 ? "Founders tracked by Crunchbase" : "For-profit companies tracked") : region === 1 && i === 2 ? ar ? "الشركات الخليجية المدرجة · سنوي" : "GCC listed companies · year over year" : i === 2 ? ar ? "المنشآت الصغيرة والمتوسطة · سنوي" : "SMEs · year over year" : region === 1 ? ar ? "جولات التمويل · سنوي" : "Funding rounds · year over year" : ar ? "الاستثمار الجريء · سنوي" : "Venture capital · year over year"}</p><p dir="ltr">{periods[i]}</p><a href={sources[i]} target="_blank" rel="noopener noreferrer">{i < 2 ? "Crunchbase" : i === 2 ? region === 1 ? "Kamco Invest" : ar ? "المصدر: الإحصاء" : "Source: GASTAT" : region === 1 ? "Lucidity Insights" : "MAGNiTT"} ↗</a></>}
    </article>)}</div>
  </aside>
}
