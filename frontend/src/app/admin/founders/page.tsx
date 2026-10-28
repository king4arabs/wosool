"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { Mail, Search, RefreshCw, ExternalLink, Users } from "lucide-react"
import { api } from "@/lib/api"
import { type ApiFounder } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { dateLocale } from "@/lib/date-locale"
import { getInitials } from "@/lib/utils"

type Outreach = {status: string; email: string | null; evidence: string | null; source_url: string | null; attempts: number; next_attempt_at: string | null; last_error: string | null}
type Founder = ApiFounder & { outreach?: Outreach | null; status: string; is_public: boolean; invitation?: {status: string; email: string; sent_at: string | null; expires_at: string} | null }
type Meta = {total: number; current_page: number; last_page: number; unclaimed: number; claimed: number; featured: number}

export default function AdminFoundersPage() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [founders, setFounders] = useState<Founder[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activation, setActivation] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [checked, setChecked] = useState<number[]>([])
  const [allInactive, setAllInactive] = useState(false)
  const [selected, setSelected] = useState<Founder | null>(null)
  const input = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500'
  const refresh = () => setRevision(n => n + 1)

  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get('search')
    if (initialSearch) setSearch(initialSearch)
  }, [])

  useEffect(() => {
    if (selected) document.getElementById('invitation-title')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [selected])

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(null)
    api.get<{data: Founder[]; meta: Meta}>('/admin/founders', {params: {search: query, activation, page}, signal: controller.signal})
      .then(response => { if (!controller.signal.aborted) { setFounders(response.data); setMeta(response.meta) } })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, activation, page, revision])

  async function action(run: () => Promise<unknown>, message: string) {
    if (busy) return
    setBusy(true); setError(null); setNotice(null)
    try { await run(); setNotice(message); refresh() }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to complete action.') }
    finally { setBusy(false) }
  }
  async function bulk(kind: 'invite' | 'research' | 'cancel') {
    if (busy || (!allInactive && !checked.length)) return
    setBusy(true); setError(null); setNotice(null)
    try {
      const response = await api.post<{data: {queued: number; skipped: number}}>('/admin/founders/outreach', {action: kind, all_inactive: allInactive, ids: checked})
      setNotice(ar ? `تم تحديث ${response.data.queued} ملفاً، وتجاوز ${response.data.skipped} غير مؤهل أو قيد المعالجة. تابع الحالة أدناه.` : `${response.data.queued} profiles updated; ${response.data.skipped} ineligible or already processing skipped. Follow progress below.`)
      setChecked([]); setAllInactive(false); refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to complete action.') }
    finally { setBusy(false) }
  }
  const outreachLabel = (status: string) => ({
    research_queued: ar ? 'البحث مجدول' : 'Research queued', researching: ar ? 'جارٍ البحث' : 'Researching',
    retry: ar ? 'البحث مستمر دورياً' : 'Research will retry', review: ar ? 'بريد بحاجة للمراجعة' : 'Email needs review',
    ready: ar ? 'بريد معتمد' : 'Verified recipient', invite_queued: ar ? 'الدعوة مجدولة' : 'Invitation queued',
    sending: ar ? 'جارٍ الإرسال — تحقق من المزود إن طال الانتظار' : 'Sending — check provider if stalled', sent: ar ? 'قبل مزود البريد الدعوة' : 'Accepted by mail provider',
    failed: ar ? 'تعذر الإرسال' : 'Sending failed', cancelled: ar ? 'متوقف' : 'Stopped',
  }[status] ?? status)
  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const fields = new FormData(event.currentTarget)
    await action(async () => {
      await api.put(`/admin/founders/${selected.id}/recipient`, { email: fields.get('email'), recipient_evidence: fields.get('evidence'), recipient_verified: fields.get('verified') === 'on' })
      setSelected(null)
    }, ar ? 'تم اعتماد البريد. حدّد الملف وأرسل دعوة التفعيل.' : 'Recipient verified. Select this profile and send the activation invitation.')
  }

  return <div dir={ar ? 'rtl' : 'ltr'} className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-indigo-600">WOSOOL · COMMUNITY</p><h2 className="mt-2 text-3xl font-bold text-slate-950">{ar ? 'المؤسسون وتفعيل العضوية' : 'Founders and activation'}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{ar ? 'راجع الملفات والمصادر، أرسل دعوة إلى بريد موثّق، وتابع تفعيل العضوية وظهور الملفات.' : 'Review profiles and sources, invite a verified recipient, and manage activation and directory visibility.'}</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy || loading} onClick={refresh}><RefreshCw className="me-2 h-4 w-4" />{ar ? 'تحديث' : 'Refresh'}</Button><Button disabled={busy} onClick={() => action(() => api.post('/admin/founders/import'), ar ? 'اكتمل استيراد الملفات مع حفظ البيانات الحالية.' : 'Import complete. Existing records and member edits were preserved.')}><Users className="me-2 h-4 w-4" />{ar ? 'استيراد الملفات الموثقة بالمصادر' : 'Import researched profiles'}</Button></div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[[ar ? 'نتائج البحث' : 'Results', meta?.total], [ar ? 'بانتظار التفعيل' : 'Unclaimed', meta?.unclaimed], [ar ? 'ملفات مرتبطة بأعضاء' : 'Member-owned', meta?.claimed], [ar ? 'ملفات مميزة' : 'Featured', meta?.featured]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-3xl font-bold text-slate-950">{value ?? '—'}</p><p className="mt-2 text-xs text-slate-500">{label}</p></div>)}</div>
    <div className="grid gap-4 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_240px]"><label className="space-y-2 text-xs font-semibold"><span className="flex items-center gap-2"><Search className="h-4 w-4" />{ar ? 'بحث عن مؤسس' : 'Search founders'}</span><input type="search" className={input} value={search} onChange={e => setSearch(e.target.value)} placeholder={ar ? 'الاسم أو القطاع' : 'Name or sector'} /></label><label className="space-y-2 text-xs font-semibold"><span>{ar ? 'حالة التفعيل' : 'Activation status'}</span><select value={activation} onChange={e => { setActivation(e.target.value); setPage(1) }} className={input}><option value="">{ar ? 'الكل' : 'All profiles'}</option><option value="unclaimed">{ar ? 'بانتظار التفعيل' : 'Unclaimed'}</option><option value="active">{ar ? 'مرتبطة بأعضاء' : 'Member-owned'}</option></select></label></div>
    <section aria-label={ar ? 'التفعيل الجماعي' : 'Bulk activation'} className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
      <h3 className="font-bold">{ar ? 'إدارة دعوات التفعيل' : 'Manage activation invitations'}</h3>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={allInactive} disabled={busy} onChange={e => {setAllInactive(e.target.checked); setChecked([])}} className="h-5 w-5" />{ar ? `تحديد كل الملفات غير المفعّلة في الدليل (${meta?.unclaimed ?? '—'})، عبر جميع الصفحات` : `Select all inactive directory profiles (${meta?.unclaimed ?? '—'}), across all pages`}</label>
      <p className="text-sm leading-7 text-slate-600">{ar ? 'الإرسال إلى البريد المعتمد فقط. البحث مخصص للملفات بلا بريد، ويُعاد دورياً حتى العثور على مصدر أو إيقافه. راجع نتيجة البحث واعتمد البريد قبل الإرسال. الدعوات السارية لا تُرسل مرة أخرى.' : 'Send to verified recipients only. Research repeats for profiles without an email until a source is found or you stop it. Review and verify each result before sending. Valid invitations are not resent.'}</p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy || (!allInactive && !checked.length)} onClick={() => bulk('invite')}><Mail className="me-2 h-4 w-4" />{ar ? 'إرسال دعوات التفعيل للمحددين' : 'Send activation invitations to selection'}</Button>
        <Button variant="outline" disabled={busy || (!allInactive && !checked.length)} onClick={() => bulk('research')}><Search className="me-2 h-4 w-4" />{ar ? 'بدء البحث عن البريد المفقود' : 'Start missing email research'}</Button>
        <Button variant="outline" disabled={busy || (!allInactive && !checked.length)} onClick={() => bulk('cancel')}>{ar ? 'إيقاف المهام المحددة' : 'Stop selected tasks'}</Button>
      </div><p className="text-xs text-slate-500">{allInactive ? ar ? 'التحديد يشمل الدليل كاملاً بغض النظر عن البحث الحالي.' : 'Selection covers the entire directory, regardless of the current search.' : ar ? `${checked.length} ملف محدد` : `${checked.length} selected`}</p>
    </section>
    {selected && <section aria-labelledby="invitation-title" className="rounded-2xl border-2 border-indigo-200 bg-white p-5 sm:p-7"><h2 id="invitation-title" className="text-xl font-bold">{ar ? 'دعوة لتفعيل ملف' : 'Invite to activate'} · {selected.name}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{ar ? 'استخدم بريد المؤسس المؤكد فقط. لا تستخدم بريد الدعم العام أو عنواناً متوقعاً. تنتهي الدعوة خلال 7 أيام وإعادة إرسالها تلغي الرابط السابق.' : 'Use a confirmed founder email, not a general support inbox or guessed address. Invitations expire in 7 days; resending revokes the previous link.'}</p>
      <form onSubmit={invite} className="mt-5 space-y-4"><label className="block space-y-2 text-sm font-semibold"><span>{ar ? 'البريد الإلكتروني' : 'Founder email'}</span><input key={selected.id} name="email" type="email" required maxLength={255} defaultValue={selected.outreach?.email ?? selected.invitation?.email ?? ''} autoComplete="off" className={input} /></label><label className="block space-y-2 text-sm font-semibold"><span>{ar ? 'كيف تم التحقق من صاحب البريد؟' : 'How was this recipient verified?'}</span><textarea key={`evidence-${selected.id}`} defaultValue={selected.outreach?.evidence ?? ''} name="evidence" required minLength={10} maxLength={2000} rows={3} className={input} placeholder={ar ? 'رابط المصدر الرسمي أو توثيق التأكيد المباشر' : 'Official source URL or record of direct confirmation'} /></label><label className="flex gap-3 text-sm leading-7"><input name="verified" type="checkbox" required className="mt-1 h-5 w-5 shrink-0" /><span>{ar ? 'تحققت من أن هذا البريد يخص المؤسس أو ممثله المخول بإدارة الملف.' : 'I verified this address belongs to the founder or their authorized profile administrator.'}</span></label><div className="flex flex-wrap gap-3"><Button disabled={busy} type="submit"><Mail className="me-2 h-4 w-4" />{busy ? ar ? 'جارٍ الحفظ…' : 'Saving…' : ar ? 'اعتماد البريد للتفعيل' : 'Verify activation recipient'}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>{ar ? 'إلغاء' : 'Cancel'}</Button></div></form>
    </section>}
    {loading && <p role="status" className="text-sm text-slate-500">{ar ? 'جارٍ تحميل الملفات…' : 'Loading profiles…'}</p>}
    {!loading && !founders.length && !error && <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">{ar ? 'لا توجد ملفات مطابقة.' : 'No matching profiles.'}</div>}
    <div aria-busy={loading} className="grid gap-4 xl:grid-cols-2">{founders.map(founder => <article key={founder.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5"><header className="flex items-start gap-4">{founder.activation_status !== 'active' && founder.status === 'active' && <input type="checkbox" aria-label={`${ar ? 'تحديد' : 'Select'} ${founder.name ?? founder.slug}`} className="mt-3 h-5 w-5 shrink-0" disabled={busy || allInactive} checked={allInactive || checked.includes(founder.id)} onChange={e => setChecked(ids => e.target.checked ? [...ids, founder.id] : ids.filter(id => id !== founder.id))} />}<Avatar className="h-14 w-14 shrink-0"><AvatarImage src={founder.avatar_url ?? ''} alt={founder.name ?? ''} /><AvatarFallback>{getInitials(founder.name ?? founder.slug)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><Link href={`/founders/${founder.slug}`} className="text-lg font-bold text-slate-950 hover:text-indigo-600">{founder.name ?? founder.slug}</Link><p className="mt-1 text-sm text-slate-500">{founder.position} · {founder.companies?.[0]?.name}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-3 py-1">{founder.status}</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{founder.activation_status === 'active' ? ar ? 'عضو نشط' : 'Active member' : ar ? 'بانتظار التفعيل' : 'Unclaimed'}</span>{founder.invitation && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">{ar ? 'الدعوة: ' : 'Invitation: '}{founder.invitation.status}</span>}</div></div></header>
      {founder.outreach && <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{outreachLabel(founder.outreach.status)}</p>{founder.outreach.email && <p dir="ltr" className="break-all">{founder.outreach.email}</p>}{founder.outreach.source_url && /^https?:\/\//.test(founder.outreach.source_url) && <a href={founder.outreach.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-indigo-700 underline">{ar ? 'مراجعة مصدر البريد' : 'Review email source'}</a>}{founder.outreach.evidence && <p className="break-words text-xs leading-6">{founder.outreach.evidence}</p>}{founder.outreach.next_attempt_at && <p className="text-xs">{ar ? 'المحاولة القادمة: ' : 'Next attempt: '}{new Date(founder.outreach.next_attempt_at).toLocaleString(dateLocale(locale), {timeZone: 'Asia/Riyadh'})}</p>}{founder.outreach.last_error && <p className="text-xs text-amber-800">{founder.outreach.last_error}</p>}</div>}
      <p className="mt-4 text-sm leading-7 text-slate-600 line-clamp-3">{founder.bio}</p>
      {!!founder.source_urls?.length && <div className="mt-3 flex flex-wrap gap-3">{founder.source_urls.map((url, i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-xs text-indigo-600 underline">{ar ? 'المصدر' : 'Source'} {i+1}<ExternalLink className="h-3 w-3" /></a>)}<span className="self-center text-xs text-slate-400">{founder.source_reviewed_at}</span></div>}
      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">{founder.activation_status !== 'active' && founder.status === 'active' && <Button size="sm" disabled={busy} onClick={() => { setSelected(founder); setNotice(null) }}><Mail className="me-2 h-4 w-4" />{ar ? 'مراجعة البريد واعتماده' : 'Review and verify email'}</Button>}
        {founder.invitation?.status === 'sent' && <Button variant="outline" size="sm" disabled={busy} onClick={() => action(() => api.delete(`/admin/founders/${founder.id}/invitation`), ar ? 'تم إلغاء الدعوة.' : 'Invitation revoked.')}>{ar ? 'إلغاء الدعوة' : 'Revoke invite'}</Button>}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => action(() => api.patch(`/admin/founders/${founder.id}`, {is_public: !founder.is_public}), ar ? 'تم تحديث الظهور.' : 'Visibility updated.')}>{founder.is_public ? ar ? 'إخفاء الملف' : 'Hide profile' : ar ? 'إظهار الملف' : 'Publish profile'}</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => action(() => api.patch(`/admin/founders/${founder.id}`, {is_featured: !founder.is_featured}), ar ? 'تم تحديث التمييز.' : 'Featured status updated.')}>{founder.is_featured ? ar ? 'إلغاء التمييز' : 'Unfeature' : ar ? 'تمييز' : 'Feature'}</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => action(() => api.patch(`/admin/founders/${founder.id}`, {is_verified: !founder.is_verified}), ar ? 'تم تحديث التوثيق.' : 'Verification updated.')}>{founder.is_verified ? ar ? 'إلغاء التوثيق' : 'Unverify' : ar ? 'توثيق المؤسس' : 'Verify founder'}</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => action(() => api.patch(`/admin/founders/${founder.id}`, {status: founder.status === 'suspended' ? 'active' : 'suspended'}), ar ? 'تم تحديث الحالة.' : 'Profile status updated.')}>{founder.status === 'suspended' ? ar ? 'استئناف' : 'Resume' : ar ? 'تعليق' : 'Suspend'}</Button>
      </div>
    </article>)}</div>
    <nav aria-label={ar ? 'صفحات المؤسسين' : 'Founder pages'} className="flex items-center justify-between gap-3"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(n => n - 1)}>{ar ? 'السابق' : 'Previous'}</Button><span className="text-sm text-slate-500">{page} / {meta?.last_page ?? 1}</span><Button variant="outline" disabled={loading || page >= (meta?.last_page ?? 1)} onClick={() => setPage(n => n + 1)}>{ar ? 'التالي' : 'Next'}</Button></nav>
  </div>
}
