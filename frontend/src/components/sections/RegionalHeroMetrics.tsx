"use client"

import { useState } from "react"
import styles from "./RegionalHeroMetrics.module.css"

const regions = ["Saudi Arabia", "GCC", "MENA", "World"]
const arabic = ["السعودية", "الخليج", "الشرق الأوسط وشمال أفريقيا", "العالم"]
export function RegionalHeroMetrics({ ar }: { ar: boolean }) {
  const [region, setRegion] = useState(0)
  const labels = ar ? ["المؤسسون", "الشركات", "نمو الإيرادات", "نمو عدد صفقات التمويل"] : ["Founders", "Companies", "Revenue growth", "Funding deal growth"]
  const values = region === 0 ? [781, 705, 7, 31] : region === 1 ? [2977, 2430, Number((7 * 1.12).toFixed(2)), -33.3] : [null, null, null, null]
  const periods = region === 1 ? ["Crunchbase · Oct 2026", "Crunchbase · Oct 2026", "2024 baseline", "2025 / 2024"] : ["Crunchbase · Oct 2026", "Crunchbase · Oct 2026", "2024 / 2023", "H1 2025 / H1 2024"]
  const sources = region === 1 ? ["https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.crunchbase.com/hub/gulf-cooperation-council-startups", "https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175", "https://lucidityinsights.com/infobytes/gcc-investors-double-down-scale-2025"] : ["https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.crunchbase.com/hub/saudi-arabia-startups", "https://www.stats.gov.sa/documents/20117/2435267/SME%2B2024%2BEN.pdf/4cb50fc7-fcb2-729c-92fe-08b5790f75d8?t=1766944990175", "https://my.gov.sa/saml.authn/news/842568"]
  return <aside className={styles.panel} dir={ar ? "rtl" : "ltr"} aria-label={ar ? "مؤشرات المنظومة" : "Ecosystem indicators"}>
    <p className={styles.heading}>{ar ? "نبض المنظومة" : "ECOSYSTEM PULSE"}</p>
    <div className={styles.regions} aria-label={ar ? "المنطقة" : "Region"}>{regions.map((name, i) => <button type="button" key={name} aria-pressed={region === i} onClick={() => setRegion(i)}>{ar ? arabic[i] : name}</button>)}</div>
    <div className={styles.grid} key={region}>{labels.map((label, i) => <article key={label} className={styles.card}>
      <h2>{region === 1 && i === 2 ? <abbr tabIndex={0} title={ar ? "تقدير افتراضي: نمو إيرادات السعودية 7% × 1.12 = 7.84%؛ ليس قياسًا فعليًا للخليج." : "Modeled estimate: Saudi revenue growth 7% × 1.12 = 7.84%; not measured GCC growth."}>{ar ? "نمو الإيرادات التقديري" : "Estimated revenue growth"}</abbr> : label}</h2><strong>{values[i] === null ? "—" : `${i > 1 && values[i]! > 0 ? "+" : ""}${new Intl.NumberFormat(ar ? "ar-u-nu-latn" : "en").format(values[i]!)}${i > 1 ? "%" : ""}`}</strong>
      {values[i] === null ? null : <><p>{i < 2 ? ar ? "ضمن قاعدة Crunchbase" : "Tracked by Crunchbase" : region === 1 && i === 2 ? ar ? "تقدير مبني على السعودية" : "Saudi-based estimate" : i === 2 ? ar ? "المنشآت الصغيرة والمتوسطة · سنوي" : "SMEs · year over year" : region === 1 ? ar ? "جولات التمويل · سنوي" : "Funding rounds · year over year" : ar ? "الاستثمار الجريء · سنوي" : "Venture capital · year over year"}</p><p dir="ltr">{periods[i]}</p><a href={sources[i]} target="_blank" rel="noopener noreferrer">{i < 2 ? "Crunchbase" : i === 2 ? ar ? "المصدر: الإحصاء" : "Source: GASTAT" : region === 1 ? "Lucidity Insights" : ar ? "المصدر: منشآت / واس" : "Source: Monsha’at / SPA"} ↗</a></>}
    </article>)}</div>
  </aside>
}
