"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"

type Founder = {
  id: number
  name?: string | null
  city?: string | null
  sector?: string | null
  stage?: string | null
  tagline?: string | null
  companies?: Array<{ name: string }>
}

type Match = {
  id: number
  match_score: number
  match_reasons: string[]
  status: "suggested" | "accepted" | "connected" | "declined" | string
  founder_a?: Founder
  founder_b?: Founder
  created_at?: string
}

function getOtherFounder(match: Match): Founder | undefined {
  return match.founder_b || match.founder_a
}

function scoreTone(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200/60"
  if (score >= 80) return "bg-blue-50 text-blue-700 border-blue-200/60"
  return "bg-amber-50 text-amber-700 border-amber-200/60"
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [creditRemaining, setCreditRemaining] = useState(3)

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await api.get<{ data: Match[]; meta?: { credits?: { remaining?: number } } }>("/member/matches")
      setMatches(response.data || [])
      setCreditRemaining(response.meta?.credits?.remaining ?? 3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل التوافق حالياً")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const requestIntro = async (id: number) => {
    setBusyId(id)
    try {
      await api.post(`/member/matches/${id}/accept`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال الطلب")
    } finally {
      setBusyId(null)
    }
  }

  const activeIntroductions = useMemo(
    () => matches.filter((m) => m.status === "accepted" || m.status === "connected"),
    [matches]
  )

  const suggestedMatches = useMemo(
    () => matches.filter((m) => m.status === "suggested"),
    [matches]
  )

  return (
    <div dir="rtl" className="bg-slate-50 text-slate-900 min-h-screen antialiased">
      <main className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">نظام الربط الخوارزمي المباشر</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">المطابقة الموجهة وتقصي الأقران</h1>
            <p className="text-xs text-slate-500 mt-0.5">يقوم الـ AI بمسح مستمر لثغرات بطاقة الأداء الخاصة بك ويطابقها مع خبرات المؤسسين المناسبين.</p>
          </div>
          <div className="bg-slate-950 text-slate-400 font-mono text-[11px] px-3 py-1.5 rounded-lg border border-slate-800 text-center shrink-0">
            الرصيد المتاح: <span className="text-amber-400 font-bold">{creditRemaining} طلبات تقديم/الشهر</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>مسار الاتصالات النشطة</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[10px]">{activeIntroductions.length} معلق</span>
          </h2>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 shadow-sm">جاري تحميل الاتصالات النشطة...</div>
          ) : activeIntroductions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 shadow-sm">لا توجد طلبات تقديم نشطة حالياً. ابدأ بطلب تقديم مباشر من التوصيات أدناه.</div>
          ) : (
            activeIntroductions.slice(0, 1).map((match) => {
              const founder = getOtherFounder(match)
              return (
                <div key={match.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-[11px] font-bold text-slate-600">
                      {(founder?.name || "م").charAt(0)}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">طلب تقديم معلق مع: <span className="text-slate-700 font-semibold">{founder?.name || "مؤسس"} ({founder?.companies?.[0]?.name || "شركة ناشئة"})</span></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">الموضوع: تواصل مباشر بين مؤسسين • الحالة: {match.status}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-200/60 uppercase whitespace-nowrap">
                    بانتظار موافقة الطرف الآخر
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">توصيات المطابقة المتاحة لك الآن (بناءً على تحديثك الأخير)</h2>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500 shadow-sm">جاري تحميل التوصيات...</div>
          ) : suggestedMatches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500 shadow-sm">لا توجد توصيات جديدة الآن. حدّث بطاقة الأداء أو نشاط المجتمع للحصول على مطابقات أدق.</div>
          ) : (
            <div className="space-y-4">
              {suggestedMatches.map((match) => {
                const founder = getOtherFounder(match)
                const score = Math.round(match.match_score || 0)
                return (
                  <div key={match.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full border-2 border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {(founder?.name || "م").charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{founder?.name || "مؤسس"}</h3>
                            <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] px-1.5 py-0.2 rounded font-mono">{founder?.companies?.[0]?.name || "شركة ناشئة"}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{founder?.stage || "مؤسس"} • {founder?.city || "المملكة العربية السعودية"}</p>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border font-mono ${scoreTone(score)}`}>
                          توافق بنسبة {score}%
                        </span>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">تحليل الـ AI</span>
                        <p className="text-slate-800 font-semibold">لماذا تم اقتراح هذا الاتصال؟</p>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {(match.match_reasons && match.match_reasons.length > 0)
                          ? match.match_reasons.join("، ")
                          : (founder?.tagline || "تم اقتراح هذا الاتصال بناءً على تقاطع الاحتياج التشغيلي والخبرة ذات الصلة داخل الشبكة.")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">يمكنه مساعدتك في:</span>
                        <p className="text-slate-700 font-medium">{founder?.sector ? `خبرات ضمن قطاع ${founder.sector}` : "إرشاد مؤسس-لمؤسس بحسب مراحل النمو والتشغيل."}</p>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">يبحث حالياً عن:</span>
                        <p className="text-slate-700 font-medium">تعاونات استراتيجية واتصالات ذات قيمة داخل المجتمع.</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs gap-3">
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        متاح للاستشارة التشغيلية هذا الأسبوع
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 border border-slate-200 rounded-lg text-[11px] transition-colors"
                        >
                          معاينة ملف الربط
                        </button>
                        <button
                          type="button"
                          onClick={() => requestIntro(match.id)}
                          disabled={busyId === match.id}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-[11px] transition-colors shadow-sm"
                        >
                          {busyId === match.id ? "جاري الإرسال..." : "طلب تقديم مُنسَّق"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
