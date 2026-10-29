'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { type AdminAnalyticsResponse } from '@/lib/admin'
import { useLocale } from '@/lib/locale'
import { dateLocale } from '@/lib/date-locale'
import { reportCsv, periodChange } from '@/lib/admin-report'
import { Button } from '@/components/ui/button'

const metrics = [
  ['signups', 'تسجيلات جديدة', 'New accounts'], ['applications', 'طلبات العضوية', 'Membership applications'],
  ['approved_applications', 'طلبات مقبولة من الفترة', 'Approved from this period'], ['approval_rate', 'نسبة قبول طلبات الفترة', 'Period application approval rate'],
  ['rsvps', 'تسجيلات الفعاليات', 'Event registrations'], ['messages', 'رسائل واردة', 'Incoming messages'],
  ['relationships', 'سجلات علاقات جديدة', 'New relationship records'],
] as const

export default function AdminAnalyticsPage() {
  const { locale } = useLocale(); const ar = locale === 'ar'
  const [days, setDays] = useState(30); const [analytics, setAnalytics] = useState<AdminAnalyticsResponse['data'] | null>(null)
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('')
    try { const response = await api.get<AdminAnalyticsResponse>('/admin/analytics', { params: { days }, signal }); if (!signal?.aborted) setAnalytics(response.data) }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Unable to load analytics.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [days])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  const current = analytics?.comparison?.current; const previous = analytics?.comparison?.previous
  const maxTrend = Math.max(...(analytics?.trend ?? []).flatMap(row => [row.signups, row.applications]), 1)
  const maxSector = Math.max(...(analytics?.sector_distribution ?? []).map(row => row.count), 1)
  const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString(dateLocale(ar))
  function exportReport() {
    if (!analytics || !current || !previous) return
    const rows: Array<Array<string | number | null>> = [
      [ar ? 'بداية الفترة' : 'Period start', analytics.period.start], [ar ? 'نهاية الفترة' : 'Period end', analytics.period.end],
      ['Timezone', analytics.period.timezone], [], [ar ? 'المؤشر' : 'Metric', ar ? 'الفترة الحالية' : 'Current period', ar ? 'الفترة السابقة' : 'Previous period'],
      ...metrics.map(([key, arabic, english]) => [ar ? arabic : english, current[key], previous[key]]),
      [], [ar ? 'التاريخ' : 'Date', ar ? 'تسجيلات جديدة' : 'New accounts', ar ? 'طلبات العضوية' : 'Applications'],
      ...analytics.trend.map(row => [row.date, row.signups, row.applications]),
    ]
    const url = URL.createObjectURL(new Blob([reportCsv(rows)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = `wosool-analytics-${analytics.period.start}-${analytics.period.end}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold text-slate-950">{ar ? 'تحليلات المجتمع والأداء' : 'Community & performance analytics'}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{ar ? 'قارن النمو والطلبات والتفاعل بالفترة السابقة، ثم صدّر المؤشرات للمتابعة.' : 'Compare growth, applications and engagement with the previous period, then export the results.'}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={loading} onClick={() => void load()}><RefreshCw size={16} aria-hidden="true" />{ar ? 'تحديث' : 'Refresh'}</Button><Button disabled={loading || Boolean(error) || !current} onClick={exportReport}><Download size={16} aria-hidden="true" />{ar ? 'تصدير CSV' : 'Export CSV'}</Button></div></header>
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><label htmlFor="analytics-period" className="text-sm font-bold">{ar ? 'الفترة' : 'Period'}</label><select id="analytics-period" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3" value={days} onChange={event => { setAnalytics(null); setDays(Number(event.target.value)) }}>{[7, 30, 90].map(value => <option key={value} value={value}>{ar ? `آخر ${value} يومًا` : `Last ${value} days`}</option>)}</select>{analytics?.period && <p className="text-xs text-slate-500">{analytics.period.start} — {analytics.period.end} · {analytics.period.timezone}</p>}</div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading && <p role="status">{ar ? 'جارٍ تحميل التحليلات…' : 'Loading analytics…'}</p>}
    {analytics && !loading && current && previous && <>
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label={ar ? 'مقارنة المؤشرات' : 'Metric comparison'}>{metrics.map(([key, arabic, english]) => {
        const change = periodChange(current[key], previous[key]); const rate = key === 'approval_rate'
        return <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-sm leading-6 text-slate-600">{ar ? arabic : english}</h3><p className="mt-3 text-3xl font-extrabold text-slate-950">{number(current[key])}{rate && current[key] != null ? '%' : ''}</p><p className="mt-3 text-xs leading-6 text-slate-500">{change === null ? ar ? 'لا توجد طلبات للمقارنة' : 'No applications to compare' : `${change > 0 ? '+' : ''}${number(change)}${rate ? ar ? ' نقطة' : ' pts' : ''} ${ar ? 'عن الفترة السابقة' : 'vs previous period'}`}</p></article>
      })}</section>
      <p className="text-xs leading-6 text-slate-500">{ar ? 'القبول محسوب من الطلبات التي أُرسلت في الفترة المختارة وحالتها الحالية مقبولة؛ وقد تتغير النسبة مع مراجعة الطلبات. المقارنة مع فترة سابقة مساوية في المدة. تسجيلات الحسابات تشمل جميع الأدوار.' : 'Approval counts applications submitted in the selected period that are currently approved; it can change as reviews progress. Comparison uses the preceding equal-length period. Account registrations include all roles.'}</p>
      <div className="grid gap-6 xl:grid-cols-3"><section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2" aria-labelledby="growth-trend"><h3 id="growth-trend" className="font-bold">{ar ? 'اتجاه التسجيل والطلبات' : 'Registration & application trend'}</h3><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600"><span><span className="me-2 inline-block h-3 w-3 rounded-sm bg-indigo-600" />{ar ? 'تسجيلات جديدة' : 'New accounts'}</span><span><span className="me-2 inline-block h-3 w-3 rounded-sm bg-pink-500" />{ar ? 'طلبات العضوية' : 'Applications'}</span></div><div className="mt-6 flex h-44 items-end gap-px border-b border-slate-200" aria-hidden="true">{analytics.trend.map(row => <div key={row.date} className="flex h-full min-w-0 flex-1 items-end gap-px" title={`${row.date}: ${row.signups} / ${row.applications}`}><div className="flex-1 rounded-t-sm bg-indigo-600" style={{ height: `${row.signups / maxTrend * 100}%` }} /><div className="flex-1 rounded-t-sm bg-pink-500" style={{ height: `${row.applications / maxTrend * 100}%` }} /></div>)}</div><div className="mt-2 flex justify-between gap-3 text-xs text-slate-500"><span>{analytics.period.start}</span><span>{analytics.period.end}</span></div><details className="mt-5"><summary className="cursor-pointer py-3 text-sm font-bold text-indigo-700">{ar ? 'عرض البيانات اليومية' : 'View daily data'}</summary><div className="max-h-72 overflow-auto"><table className="w-full text-start text-sm"><thead><tr><th className="p-2 text-start">{ar ? 'التاريخ' : 'Date'}</th><th className="p-2 text-start">{ar ? 'الحسابات' : 'Accounts'}</th><th className="p-2 text-start">{ar ? 'الطلبات' : 'Applications'}</th></tr></thead><tbody>{analytics.trend.map(row => <tr key={row.date} className="border-t border-slate-100"><td className="p-2">{row.date}</td><td className="p-2">{number(row.signups)}</td><td className="p-2">{number(row.applications)}</td></tr>)}</tbody></table></div></details></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-bold">{ar ? 'قطاعات المؤسسين النشطين' : 'Active member founder sectors'}</h3><p className="mt-2 text-xs text-slate-500">{ar ? 'الوضع الحالي · أبرز 6 قطاعات' : 'Current snapshot · Top 6 sectors'}</p><div className="mt-6 space-y-5">{analytics.sector_distribution.map(row => <div key={row.sector}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{row.sector}</span><strong>{number(row.count)}</strong></div><div className="h-2 rounded-full bg-slate-100" aria-hidden="true"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${row.count / maxSector * 100}%` }} /></div></div>)}{!analytics.sector_distribution.length && <p className="text-sm text-slate-500">{ar ? 'لا توجد بيانات بعد.' : 'No data yet.'}</p>}</div></section></div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-bold">{ar ? 'الوضع التشغيلي الحالي' : 'Current operating snapshot'}</h3><div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{[[ar ? 'أعضاء ظاهرون في الدليل' : 'Members visible in directory', analytics.operations.public_members], [ar ? 'رسائل دون رد' : 'Unanswered messages', analytics.operations.open_messages], [ar ? 'متابعات CRM مستحقة' : 'CRM follow-ups due', analytics.operations.crm_due], [ar ? 'متابعات إعلامية مستحقة' : 'PR follow-ups due', analytics.operations.pr_due]].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-600">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></div>)}</div></section>
    </>}
  </div>
}
