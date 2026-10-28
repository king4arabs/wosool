"use client"

import { useState } from "react"
import styles from "./RegionalHeroMetrics.module.css"

const regions = ["Saudi Arabia", "GCC", "MENA", "World"]
const arabic = ["السعودية", "الخليج", "الشرق الأوسط وشمال أفريقيا", "العالم"]
export function RegionalHeroMetrics({ ar }: { ar: boolean }) {
  const [region, setRegion] = useState(0)
  const labels = ar ? ["المؤسسون", "الشركات", "نمو الإيرادات", "نمو عدد صفقات التمويل"] : ["Founders", "Companies", "Revenue growth", "Funding deal growth"]
  const values = region === 0 ? [781, 705, 7, 31] : region === 1 ? [2977, 2430, Number((7 * 1.12).toFixed(2)), -33.3] : region === 2 ? [10307, 7722, 12, 6] : [7300000, 5500000, 65, -17]
  const periods = region === 1 ? ["Crunchbase · Oct 2026", "Crunchbase · Oct 2026", "2024 baseline", "2025 / 2024"] : ["Crunchbase · Oct 2026", "Crunchbase · Oct 2026", "2024 / 2023", "H1 2025 / H1 2024"]
  const sources = region === 1 ? ["https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175", "https://lucidityinsights.com/infobytes/gcc-investors-double-down-scale-2025"] : ["https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175", "https://my.gov.sa/saml.authn/news/842568"]
  const cb = "https://www.crunchbase.com/hub/middle-east-and-north-africa-startups"
  const genome = "https://startupgenome.com/report/the-global-startup-ecosystem-report-2026/methodology"
  const pwc = "https://www.pwc.com/m1/en/ceo-survey/29th-ceo-survey-middle-east-findings-2026.html"
  const aws = "https://press.aboutamazon.com/2026/6/aws-global-startup-trends-report-reveals-ai-native-startups-are-reaching-billion-dollar-valuations-in-half-the-time"
  const extra = region === 2 ? {
    scopes: ar ? ["ضمن قاعدة Crunchbase", "ضمن قاعدة Crunchbase", "معيار الشرق الأوسط · استطلاع الرؤساء", "الاستثمار الجريء · سنوي"] : ["Tracked by Crunchbase", "Tracked by Crunchbase", "Middle East CEO benchmark", "Venture capital · year over year"],
    periods: ["Oct 2026", "Oct 2026", "PwC · 2026 survey", "2025 / 2024"],
    sources: [cb, cb, pwc, "https://argaamplus.s3.amazonaws.com/fd0c5a5a-f457-482d-aad1-ca5d30e13733.pdf"],
    names: ["Crunchbase", "Crunchbase", "PwC", "MAGNiTT"],
  } : region === 3 ? {
    scopes: ar ? ["تقدير نموذجي · نحو 7.3 مليون", "تغطية قاعدة Startup Genome", "متوسط استطلاع الشركات الناشئة", "الاستثمار الجريء · سنوي"] : ["Modeled estimate · ~7.3M", "Startup Genome dataset coverage", "Startup survey average", "Venture capital · year over year"],
    periods: ["2026 model", "GSER 2026", "AWS · 2026 survey", "2025 / 2024"],
    sources: [genome, genome, aws, "https://www.bvkap.de/files/content/Studien/Studien%20Archiv/20260126_BVK%20Global%20Venture%20Capital%20report%202025_FINAL.pdf"],
    names: ["Startup Genome", "Startup Genome", "AWS", "BVK / CB Insights"],
  } : null
  return <aside className={styles.panel} dir={ar ? "rtl" : "ltr"} aria-label={ar ? "مؤشرات المنظومة" : "Ecosystem indicators"}>
    <p className={styles.heading}>{ar ? "نبض المنظومة" : "ECOSYSTEM PULSE"}</p>
    <div className={styles.regions} aria-label={ar ? "المنطقة" : "Region"}>{regions.map((name, i) => <button type="button" key={name} aria-pressed={region === i} onClick={() => setRegion(i)}>{ar ? arabic[i] : name}</button>)}</div>
    <div className={styles.grid} key={region}>{labels.map((label, i) => <article key={label} className={styles.card}>
      <h2>{region === 1 && i === 2 ? <abbr tabIndex={0} title={ar ? "تقدير افتراضي: نمو إيرادات السعودية 7% × 1.12 = 7.84%؛ ليس قياسًا فعليًا للخليج." : "Modeled estimate: Saudi revenue growth 7% × 1.12 = 7.84%; not measured GCC growth."}>{ar ? "نمو الإيرادات التقديري" : "Estimated revenue growth"}</abbr> : region === 3 && i === 0 ? (ar ? "المؤسسون التقديريون" : "Estimated founders") : label}</h2><strong title={region === 3 && i === 0 ? (ar ? "5.5 مليون شركة × نسبة المؤسسين إلى الشركات في عينة MENA من Crunchbase (10307 ÷ 7722)، مقربة. تقدير نموذجي وليس تعدادًا عالميًا." : "5.5M companies × MENA Crunchbase founder/company ratio (10,307 / 7,722), rounded. Modeled estimate, not a global census.") : undefined}>{values[i] === null ? "—" : `${i > 1 && values[i]! > 0 ? "+" : ""}${new Intl.NumberFormat(ar ? "ar-u-nu-latn" : "en", region === 3 && i < 2 ? { notation: "compact", maximumFractionDigits: 1 } : {}).format(values[i]!)}${i > 1 ? "%" : ""}`}</strong>
      {extra ? <><p>{extra.scopes[i]}</p><p dir="ltr">{extra.periods[i]}</p><a href={extra.sources[i]} target="_blank" rel="noopener noreferrer">{extra.names[i]} ↗</a>{region === 3 && i === 0 && <a href={cb} target="_blank" rel="noopener noreferrer">Crunchbase ↗</a>}</> : values[i] === null ? null : <><p>{i < 2 ? ar ? "ضمن قاعدة Crunchbase" : "Tracked by Crunchbase" : region === 1 && i === 2 ? ar ? "تقدير مبني على السعودية" : "Saudi-based estimate" : i === 2 ? ar ? "المنشآت الصغيرة والمتوسطة · سنوي" : "SMEs · year over year" : region === 1 ? ar ? "جولات التمويل · سنوي" : "Funding rounds · year over year" : ar ? "الاستثمار الجريء · سنوي" : "Venture capital · year over year"}</p><p dir="ltr">{periods[i]}</p><a href={sources[i]} target="_blank" rel="noopener noreferrer">{i < 2 ? "Crunchbase" : i === 2 ? ar ? "المصدر: الإحصاء" : "Source: GASTAT" : region === 1 ? "Lucidity Insights" : ar ? "المصدر: منشآت / واس" : "Source: Monsha’at / SPA"} ↗</a></>}
    </article>)}</div>
  </aside>
}
