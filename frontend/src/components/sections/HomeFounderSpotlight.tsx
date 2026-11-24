"use client"

import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { mapFounder, type ApiFounder } from "@/lib/content-api"
import { isDirectoryRecordVisible } from "@/lib/directory-geography"
import { useLocale } from "@/lib/locale"
import { FounderShowcase } from "./CommunityShowcase"

export function HomeFounderSpotlight() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const visit = useRef("")
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; rows: ApiFounder[]; failed: boolean }>()
  const key = locale + ":" + attempt
  useEffect(() => {
    const controller = new AbortController()
    visit.current ||= crypto.randomUUID()
    api.get<{data: ApiFounder[]}>("/founders/discover/cards", { params: { start: visit.current }, headers: { "X-Locale": locale }, signal: controller.signal, cache: "no-store" })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Invalid discovery response")
        if (!controller.signal.aborted) setResult({ key, rows: data.filter(row => row.is_public === true && row.status === "active" && isDirectoryRecordVisible(row)), failed: false })
      }).catch(() => { if (!controller.signal.aborted) setResult({ key, rows: [], failed: true }) })
    return () => controller.abort()
  }, [key, locale])
  const current = result?.key === key ? result : undefined
  return <div id="founder-spotlight">
    {!current && <p role="status">{ar ? "جارٍ تحميل المؤسسين…" : "Loading founders…"}</p>}
    {current?.failed && <div role="status">{ar ? "تعذر تحميل المؤسسين." : "Founders are temporarily unavailable."} <button type="button" className="min-h-11 px-2 underline" onClick={() => setAttempt(n => n + 1)}>{ar ? "إعادة المحاولة" : "Try again"}</button></div>}
    {current && !current.failed && !current.rows.length && <p role="status">{ar ? "لا توجد ملفات عامة حالياً." : "No public profiles yet."}</p>}
    <div hidden={!current?.rows.length}><FounderShowcase founders={(current?.rows ?? []).map(mapFounder)} randomize /></div>
  </div>
}
