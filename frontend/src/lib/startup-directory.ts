/** Locale-aware fields for /startups cards. Older imports may lack the Arabic fields, so English is the fallback. */
export type StartupRevenueEvidence = { summary_en: string; summary_ar: string; period: string; period_ar?: string; source_url: string }
export type StartupEcosystemSource = { key: string; label: string; label_ar?: string; relationship_en: string; relationship_ar: string; url: string }

export function revenuePeriod(evidence: Pick<StartupRevenueEvidence, "period" | "period_ar">, lang: "ar" | "en") {
  return lang === "ar" && evidence.period_ar?.trim() ? evidence.period_ar : evidence.period
}

export function ecosystemSourceLabel(source: Pick<StartupEcosystemSource, "label" | "label_ar">, lang: "ar" | "en") {
  return lang === "ar" && source.label_ar?.trim() ? source.label_ar : source.label
}
