"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { ScoreInsightPanel } from "@/components/dashboard/ScoreInsightPanel"

type ScorecardPayload = {
  id: number
  aggregate_score: number
  latest_update_text?: string | null
  momentum_score?: number | null
  fundraising_score?: number | null
  growth_score?: number | null
  support_need_score?: number | null
  tracking?: {
    momentum?: number | null
    readiness?: number | null
    growth?: number | null
    support_delta?: number | null
  } | null
  insights?: {
    automated_action_suggestions?: Array<{ key: string; label: string; priority: "high" | "medium" | "normal" }>
  } | null
}

type ScorecardResponse = { data: ScorecardPayload }

function clampPercent(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export default function ScorecardPage() {
  const { locale } = useLocale()
  const isAr = locale === "ar"
  const [scorecard, setScorecard] = useState<ScorecardPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updateText, setUpdateText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  async function loadScorecard() {
    try {
      const response = await api.get<ScorecardResponse>("/member/scorecard")
      setScorecard(response.data)
    } catch (err) {
      const e = err as Error & { status?: number }
      if (typeof e.status === "number" && e.status === 404) {
        setScorecard({
          id: 0,
          aggregate_score: 0,
          latest_update_text: null,
          momentum_score: 0,
          fundraising_score: 0,
          growth_score: 0,
          support_need_score: 0,
          tracking: { momentum: 0, readiness: 0, growth: 0, support_delta: 0 },
          insights: { automated_action_suggestions: [] },
        })
        return
      }
      setError(e.message)
    }
  }

  useEffect(() => {
    loadScorecard()
  }, [])

  const computed = useMemo(() => {
    const momentum = clampPercent(scorecard?.momentum_score ?? scorecard?.tracking?.momentum ?? 0)
    const fundraising = clampPercent(scorecard?.fundraising_score ?? scorecard?.tracking?.readiness ?? 0)
    const growth = clampPercent(scorecard?.growth_score ?? scorecard?.tracking?.growth ?? 0)
    const supportNeed = clampPercent(scorecard?.support_need_score ?? scorecard?.tracking?.support_delta ?? 0)
    return { momentum, fundraising, growth, supportNeed }
  }, [scorecard])

  async function submitMilestone(event: FormEvent) {
    event.preventDefault()
    if (!updateText.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post<ScorecardResponse>("/member/scorecard/updates", {
        update_text: updateText.trim(),
        priority: "normal",
      })
      setScorecard(res.data)
      setUpdateText("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال التحديث")
    } finally {
      setSubmitting(false)
    }
  }

  async function shareInvestorProfile() {
    setActionLoading(true)
    try {
      await api.post("/member/scorecard/actions/share-investor-profile")
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء")
    } finally {
      setActionLoading(false)
    }
  }

  if (error) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
  }
  if (!scorecard) {
    return <div className="text-sm text-slate-500">{isAr ? "جاري تحميل بطاقة الأداء…" : "Loading performance card…"}</div>
  }

  const latestUpdateText = (scorecard.latest_update_text || "").trim()
  const milestonePlaceholder = isAr
    ? "لا يوجد تحديث تشغيلي بعد. أضف أول تحديث لشركتك ليتم تحليل بطاقة الأداء تلقائيًا."
    : "No milestone update yet. Submit your first company update to auto-generate your performance insights."

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">{isAr ? "لوحة التحكم الإستراتيجية" : "Strategic Control Panel"}</span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{isAr ? "بطاقة أداء شركتي الناشئة (Scorecard)" : "My Startup Performance Card (Scorecard)"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isAr ? "تحليل ديناميكي فوري يعكس مؤشرات الزخم والجهوزية بناءً على آخر تحديثاتك التشغيلية." : "Live dynamic analysis of momentum and readiness based on your latest operational updates."}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <form onSubmit={submitMilestone} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-slate-800">{isAr ? "توثيق الإنجاز الحالي (Milestone Entry)" : "Current Milestone Entry"}</h2>
              </div>
              <textarea readOnly value={latestUpdateText || milestonePlaceholder} className="h-36 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700" />
              <textarea value={updateText} onChange={(e) => setUpdateText(e.target.value)} className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700" placeholder={isAr ? "اكتب تحديثًا تشغيليًا جديدًا..." : "Write a new operational update..."} />
              <button type="submit" disabled={submitting} className="w-full rounded-md border border-slate-200 bg-[#3B52D4] px-4 py-2 text-center text-xs font-semibold text-white disabled:opacity-60">
                {submitting ? (isAr ? "جارٍ التحديث..." : "Updating...") : (isAr ? "إرسال التحديث وتحديث المؤشرات" : "Submit update and refresh metrics")}
              </button>
            </form>

            <ScoreInsightPanel
              title={isAr ? "تحليل المحرك الذكي:" : "AI Engine Analysis:"}
              items={[
                `${isAr ? "• الزخم الحالي:" : "• Current momentum:"} ${computed.momentum}%`,
                `${isAr ? "• الجهوزية للتمويل:" : "• Fundraising readiness:"} ${computed.fundraising}%`,
                `${isAr ? "• مستوى الحاجة للدعم:" : "• Support need level:"} ${computed.supportNeed}%`,
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
            <MetricCard title={isAr ? "زخم الشركة الناشئة (Momentum)" : "Startup Momentum"} description={isAr ? "يقيس سرعة تنفيذ وإطلاق الميزات والحلول في السوق." : "Measures execution speed and shipping cadence."} value={computed.momentum} valueClass="text-emerald-600" barClass="bg-emerald-500" trend={isAr ? "قراءة مباشرة من نشاط التنفيذ" : "Live reading from execution activity"} trendClass="text-emerald-600" />
            <MetricCard title={isAr ? "الجهوزية للتمويل (Fundraising Readiness)" : "Fundraising Readiness"} description={isAr ? "مدى اكتمال جاهزية البيانات والمواد للمستثمرين." : "Measures data room and investor-material readiness."} value={computed.fundraising} valueClass="text-amber-600" barClass="bg-amber-500" trend={isAr ? "مربوط بمؤشرات الجاهزية الحالية" : "Mapped from current readiness indicators"} trendClass="text-amber-600" />
            <MetricCard title={isAr ? "مؤشر النمو الرقمي (Growth Score)" : "Growth Score"} description={isAr ? "يراقب مسار النمو وفق الإشارات التشغيلية." : "Tracks growth trajectory from operational signals."} value={computed.growth} valueClass="text-blue-600" barClass="bg-blue-500" trend={isAr ? "نمو ضمن المسار المستهدف" : "Growth within target trajectory"} trendClass="text-slate-500" />
            <MetricCard title={isAr ? "مستوى الاحتياج للدعم (Support Need)" : "Support Need"} description={isAr ? "يرصد العقبات التي تحتاج دعمًا من الشبكة." : "Reflects blockers that require ecosystem support."} value={computed.supportNeed} valueClass="text-rose-600" barClass="bg-rose-500" trend={isAr ? "انخفاض القيمة يعني حاجة دعم أقل" : "Lower value indicates reduced support demand"} trendClass="text-rose-600" />

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300 shadow-md md:col-span-2">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] font-bold text-emerald-400">{isAr ? "إجراء ذكي" : "Smart Action"}</span>
                  <p>{isAr ? "مشاركة ملف الشركة الاستثماري مع مستثمرين معتمدين." : "Share investment profile with vetted investors."}</p>
                </div>
                <button onClick={shareInvestorProfile} disabled={actionLoading} className="w-full whitespace-nowrap rounded-md bg-amber-500 px-4 py-2 text-center text-[11px] font-semibold text-slate-950 transition-colors hover:bg-amber-600 md:w-auto disabled:opacity-60">
                  {actionLoading ? (isAr ? "جارٍ التنفيذ..." : "Processing...") : (isAr ? "مشاركة البيانات الاستثمارية" : "Share investment profile")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
