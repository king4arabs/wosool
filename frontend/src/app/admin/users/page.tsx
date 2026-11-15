"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useLocale } from '@/lib/locale'
import { publicWebsite } from '@/lib/community-display'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Person = {key: string; origin: 'registered' | 'invited'; user_id: number | null; founder_profile_id: number | null; founder_uid: string | null; name: string; email: string | null; company: string | null; email_verified: boolean; admin_verified: boolean; application_status: string | null; invitation_status: string | null}
type Candidate = {id: number; founder_uid: string; slug: string; name: string; company: string | null; website: string | null; signals: string[]}
type Review = {user: {id: number; name: string; email: string; email_verified: boolean}; profile: {id: number; slug: string; verified: boolean} | null; application: {full_name: string; phone: string; company_name: string; company_website: string; linkedin_url: string | null; onboarding_data: {bio?: string} | null} | null; candidates: Candidate[]}
type Meta = {total: number; current_page: number; last_page: number; registered: number; invited: number}

export default function AdminUsersPage() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const t = (arabic: string, english: string) => ar ? arabic : english
  const [people, setPeople] = useState<Person[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [choice, setChoice] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState<number[]>([])
  const [inviteScope, setInviteScope] = useState<'selected' | 'all' | null>(null)
  const input = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500'

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('user')
    if (id && /^[1-9]\d*$/.test(id)) setSelectedId(Number(id))
  }, [])
  useEffect(() => { const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); setChecked([]) }, 300); return () => clearTimeout(timer) }, [search])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    api.get<{data: Person[]; meta: Meta}>('/admin/users', {params: {search: query, origin, page}, signal: controller.signal})
      .then(result => { if (!controller.signal.aborted) { setPeople(result.data); setMeta(result.meta); if (page > result.meta.last_page) setPage(Math.max(1, result.meta.last_page)) } })
      .catch(e => { if (!controller.signal.aborted) setError(e.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, origin, page, revision])
  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    setReview(null); setChoice(''); setConfirmed(false); setError('')
    api.get<{data: Review}>(`/admin/users/${selectedId}/identity`, {signal: controller.signal})
      .then(result => { if (!controller.signal.aborted) { setReview(result.data); if (!result.data.candidates.length) setChoice('new') } })
      .catch(e => { if (!controller.signal.aborted) setError(e.message) })
    return () => controller.abort()
  }, [selectedId, revision])

  async function verify() {
    if (!review || busy || !confirmed) return
    setBusy(true); setError('')
    try {
      await api.post(`/admin/users/${review.user.id}/verify`, {identity_verified: true, matched_founder_id: choice && choice !== 'new' ? Number(choice) : null, create_new_profile: choice === 'new'})
      setSelectedId(null); setNotice(t('تم اعتماد البيانات وتوحيد الملف والتحقق من العضو.', 'The member is verified and their canonical profile is ready.')); setRevision(n => n + 1)
    } catch (e) { setError(e instanceof Error ? e.message : t('تعذر اعتماد الملف.', 'Unable to verify this profile.')) }
    finally { setBusy(false) }
  }
  async function sendInvitations() {
    if (!inviteScope || busy) return
    setBusy(true); setError('')
    try {
      const result = await api.post<{data: {queued: number; skipped: number}}>('/admin/founders/outreach', {action: 'invite', all_inactive: inviteScope === 'all', ids: checked})
      setNotice(t(`جُدولت ${result.data.queued} دعوة، وتُجاوز ${result.data.skipped} ملفًا غير مؤهل أو قيد المعالجة.`, `${result.data.queued} invitations queued; ${result.data.skipped} ineligible or already processing records skipped.`))
      setChecked([]); setInviteScope(null); setRevision(n => n + 1)
    } catch (e) { setError(e instanceof Error ? e.message : t('تعذر جدولة الدعوات.', 'Unable to queue invitations.')) }
    finally { setBusy(false) }
  }
  const signals: Record<string, string> = {name: t('الاسم', 'Name'), linkedin: 'LinkedIn', company_website: t('موقع الشركة', 'Company website'), company_name: t('اسم الشركة', 'Company name'), verified_contact_email: t('بريد تواصل معتمد', 'Reviewed contact email'), verified_invitation_email: t('بريد الدعوة', 'Invitation email')}
  const invited = people.filter(person => person.origin === 'invited' && person.founder_profile_id)
  const allPageChecked = invited.length > 0 && invited.every(person => checked.includes(person.founder_profile_id!))

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-950">{t('عرض جميع الأعضاء', 'View all users')}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{t('التسجيل والمطابقة والتحقق والدعوات في مكان واحد. تصنيف مصدر البيانات يظهر للإدارة فقط.', 'Registration, identity review, verification and invitations. Record-origin labels are visible only to administrators.')}</p></div><Button variant="outline" onClick={() => setRevision(n => n + 1)}>{t('تحديث', 'Refresh')}</Button></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{[[t('بيانات عضو مسجل', 'Registered member data'), meta?.registered], [t('بيانات عضو مدعو', 'Invited member data'), meta?.invited], [t('نتائج العرض', 'Results'), meta?.total]].map(([label, count]) => <div key={label} className="rounded-2xl border bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold">{count ?? '—'}</p></div>)}</div>
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row"><input type="search" maxLength={120} className={input} aria-label={t('ابحث بالاسم أو البريد', 'Search name or email')} placeholder={t('ابحث بالاسم أو البريد', 'Search name or email')} value={search} onChange={e => setSearch(e.target.value)} /><select className={input} aria-label={t('مصدر بيانات العضو', 'Member record origin')} value={origin} onChange={e => { setOrigin(e.target.value); setPage(1); setChecked([]) }}><option value="">{t('جميع الأعضاء', 'All users')}</option><option value="registered">{t('بيانات عضو مسجل', 'Registered member data')}</option><option value="invited">{t('بيانات عضو مدعو', 'Invited member data')}</option></select></div>
    <div className="flex flex-wrap items-center gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={allPageChecked} onChange={e => setChecked(e.target.checked ? invited.map(p => p.founder_profile_id!) : [])} />{t('تحديد مدعوي الصفحة', 'Select invited records on this page')}</label><Button variant="outline" disabled={!checked.length || busy} onClick={() => setInviteScope('selected')}>{t('دعوة المحددين', 'Invite selected')}</Button><Button variant="outline" disabled={!meta?.invited || busy} onClick={() => setInviteScope('all')}>{t('دعوة جميع المدعوين', 'Invite all invited records')}</Button><Link href="/admin/founders" className="inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 underline">{t('مراجعة عناوين الدعوات وحالتها', 'Review invitation addresses and progress')}</Link></div>
    <div className="grid gap-4 lg:grid-cols-2" aria-busy={loading}>
      {people.map(person => <article key={person.key} className="min-w-0 rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-bold text-slate-950">{person.name}</h3><p className="mt-1 text-sm text-slate-600">{person.company || '—'}</p><p className="mt-1 break-all text-xs text-slate-500"><bdi>{person.email || t('لا يوجد بريد معتمد', 'No reviewed email')}</bdi></p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${person.origin === 'registered' ? 'bg-indigo-50 text-indigo-800' : 'bg-amber-50 text-amber-900'}`}>{person.origin === 'registered' ? t('بيانات عضو مسجل', 'Registered member data') : t('بيانات عضو مدعو', 'Invited member data')}</span></div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">{person.origin === 'registered' && <><span>{person.email_verified ? t('البريد مؤكد', 'Email verified') : t('البريد غير مؤكد', 'Email not verified')}</span><span className={person.admin_verified ? 'text-emerald-700' : 'text-amber-800'}>{person.admin_verified ? t('تم التحقق', 'Verified') : t('بانتظار تحقق الإدارة', 'Administrator verification pending')}</span></>}</div>
        <div className="mt-4 flex flex-wrap items-center gap-3">{person.user_id ? <Button variant="outline" size="sm" onClick={() => setSelectedId(person.user_id)}>{t('مراجعة المطابقة والتحقق', 'Review identity & verification')}</Button> : <><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={checked.includes(person.founder_profile_id!)} onChange={e => setChecked(ids => e.target.checked ? [...ids, person.founder_profile_id!] : ids.filter(id => id !== person.founder_profile_id))} />{t('تحديد للدعوة', 'Select for invitation')}</label><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline" href={`/admin/founders?search=${encodeURIComponent(person.founder_uid ?? '')}`}>{t('إدارة الدعوة', 'Manage invitation')}</Link></>}</div>
      </article>)}
    </div>
    {!loading && !people.length && <p className="rounded-2xl border p-6 text-center text-slate-600">{t('لا توجد نتائج.', 'No results.')}</p>}
    {meta && meta.last_page > 1 && <nav className="flex items-center justify-between gap-3" aria-label={t('صفحات الأعضاء', 'User pages')}><Button variant="outline" disabled={page <= 1 || loading} onClick={() => { setPage(n => n - 1); setChecked([]) }}>{t('السابق', 'Previous')}</Button><span>{page} / {meta.last_page}</span><Button variant="outline" disabled={page >= meta.last_page || loading} onClick={() => { setPage(n => n + 1); setChecked([]) }}>{t('التالي', 'Next')}</Button></nav>}
    <Dialog open={selectedId !== null} onOpenChange={open => { if (!open && !busy) setSelectedId(null) }}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{t('مراجعة هوية العضو', 'Member identity review')}</DialogTitle><DialogDescription>{t('قارن بيانات التسجيل بالملفات المنشورة ثم اعتمد الملف الصحيح.', 'Compare registration details with published profiles and approve the correct identity.')}</DialogDescription></DialogHeader>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {!review ? <p role="status">{t('جارٍ البحث والمطابقة…', 'Finding matching profiles…')}</p> : <div className="space-y-5"><div className="rounded-xl bg-slate-50 p-4 text-sm leading-7"><h2 className="font-bold">{review.user.name}</h2><p><bdi>{review.user.email}</bdi> · {review.user.email_verified ? t('البريد مؤكد', 'Email verified') : t('البريد غير مؤكد', 'Email not verified')}</p>{review.application && <><p>{review.application.full_name} · {review.application.company_name}</p><p><bdi>{review.application.company_website}</bdi></p><p>{review.application.onboarding_data?.bio}</p><p><bdi>{review.application.phone}</bdi></p></>}</div>
        {review.profile ? <p className="rounded-xl bg-indigo-50 p-4 text-sm font-bold">{t('يوجد ملف موحد مرتبط بالحساب.', 'This account already has a canonical profile.')} <Link className="underline" href={`/founders/${encodeURIComponent(review.profile.slug)}`} target="_blank">{t('عرض الملف', 'View profile')}</Link>{review.profile.verified && <span className="ms-2 text-emerald-700">{t('تم التحقق', 'Verified')}</span>}</p> : <fieldset className="space-y-3"><legend className="mb-2 font-bold">{t('الملفات المطابقة', 'Matching profiles')}</legend>{review.candidates.map(candidate => <label key={candidate.id} className="block cursor-pointer rounded-xl border p-4 text-sm"><span className="flex items-start gap-3"><input type="radio" name="identity-choice" value={candidate.id} checked={choice === String(candidate.id)} onChange={e => setChoice(e.target.value)} className="mt-1" /><span className="min-w-0"><b>{candidate.name}</b> · {candidate.company}<span className="mt-1 block text-xs text-indigo-700">{candidate.signals.map(signal => signals[signal] ?? signal).join(' · ')}</span><Link href={`/founders/${encodeURIComponent(candidate.slug)}`} target="_blank" className="me-4 inline-flex min-h-11 items-center underline">{t('الملف المنشور', 'Published profile')}</Link>{publicWebsite(candidate.website ?? undefined) && <a href={publicWebsite(candidate.website ?? undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t('موقع الشركة', 'Company website')}</a>}</span></span></label>)}<label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="radio" name="identity-choice" value="new" checked={choice === 'new'} onChange={e => setChoice(e.target.value)} className="mt-1" /><span>{review.candidates.length ? t('راجعت النتائج ولا تخص هذا العضو؛ أنشئ ملفًا جديدًا.', 'I reviewed the results; none belongs to this member. Create a new profile.') : t('لا توجد مطابقة؛ انشر ملف العضو الجديد بعد التحقق.', 'No match found. Publish a new member profile after verification.')}</span></label></fieldset>}
        {!review.application?.onboarding_data && !review.profile && <p className="text-sm text-amber-800">{t('على العضو إكمال بيانات التسجيل قبل اعتماد الملف.', 'The member must complete registration details before approval.')}</p>}
        <label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-2" />{t('راجعت تطابق الهوية وبيانات العضو وأعتمد خطوة «تم التحقق».', 'I reviewed the identity evidence and member details and approve the Verified step.')}</label>
        <Button disabled={busy || !confirmed || !review.user.email_verified || (!review.profile && (!choice || !review.application?.onboarding_data))} onClick={verify}>{busy ? t('جارٍ الاعتماد…', 'Approving…') : t('اعتماد الملف وتم التحقق', 'Approve profile & verify')}</Button>
      </div>}
    </DialogContent></Dialog>
    <Dialog open={inviteScope !== null} onOpenChange={open => { if (!open && !busy) setInviteScope(null) }}><DialogContent><DialogHeader><DialogTitle>{t('مراجعة دعوات التسجيل', 'Review registration invitations')}</DialogTitle><DialogDescription>{inviteScope === 'all' ? t('يشمل هذا الإجراء جميع الملفات المدعوة، بصرف النظر عن البحث الحالي.', 'This action includes every invited record, regardless of the current search.') : t(`المحدد للدعوة: ${checked.length} ملفًا.`, `${checked.length} records selected.`)}</DialogDescription></DialogHeader><p className="text-sm leading-7">{t('تُرسل الدعوات الفردية للعناوين التي اعتمدتها الإدارة فقط. تُتجاوز الحسابات المسجلة والعناوين المفقودة والدعوات السارية. تستمر المطابقة وربط الملف عند التسجيل والتحقق.', 'Individual invitations use administrator-reviewed email addresses only. Registered accounts, missing addresses and active invitations are skipped. Identity matching continues during registration and verification.')}</p>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<Button disabled={busy} onClick={sendInvitations}>{t('جدولة دعوات التسجيل', 'Queue registration invitations')}</Button></DialogContent></Dialog>
  </div>
}
