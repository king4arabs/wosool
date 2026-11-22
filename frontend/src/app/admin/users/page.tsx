"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useLocale } from '@/lib/locale'
import { ApiError } from '@/lib/api'
import { adminUsersText, blockerText, fill, shouldReloadReview, signalLabel, verifyBlockers, verifyPayload } from '@/lib/admin-users'
import { publicWebsite } from '@/lib/community-display'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Person = {key: string; origin: 'registered' | 'invited'; user_id: number | null; founder_profile_id: number | null; founder_uid: string | null; name: string; email: string | null; company: string | null; email_verified: boolean; admin_verified: boolean; application_status: string | null; invitation_status: string | null}
type Candidate = {id: number; founder_uid: string; slug: string; name: string; company: string | null; website: string | null; signals: string[]}
type Review = {user: {id: number; name: string; email: string; email_verified: boolean}; profile: {id: number; slug: string; verified: boolean} | null; application: {full_name: string; phone: string; company_name: string; company_website: string; linkedin_url: string | null; onboarding_data: {bio?: string} | null} | null; candidates: Candidate[]}
type Meta = {total: number; current_page: number; last_page: number; registered: number; invited: number}

/** Marker for a failed identity load; the message is chosen in the page language at render time. */
const REVIEW_FAILED = 'review-failed'

export default function AdminUsersPage() {
  const { locale } = useLocale()
  const t = adminUsersText(locale)
  const [people, setPeople] = useState<Person[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [notice, setNotice] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [reviewRevision, setReviewRevision] = useState(0)
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
  useEffect(() => { setDialogError('') }, [selectedId, inviteScope])
  useEffect(() => { const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); setChecked([]) }, 300); return () => clearTimeout(timer) }, [search])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setLoadFailed(false)
    api.get<{data: Person[]; meta: Meta}>('/admin/users', {params: {search: query, origin, page}, signal: controller.signal})
      .then(result => { if (!controller.signal.aborted) { setPeople(result.data); setMeta(result.meta); if (page > result.meta.last_page) setPage(Math.max(1, result.meta.last_page)) } })
      .catch(() => { if (!controller.signal.aborted) setLoadFailed(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, origin, page, revision])
  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    setReview(null); setChoice(''); setConfirmed(false)
    api.get<{data: Review}>(`/admin/users/${selectedId}/identity`, {signal: controller.signal})
      .then(result => { if (!controller.signal.aborted) { setReview(result.data); if (!result.data.candidates.length) setChoice('new') } })
      .catch(e => { if (!controller.signal.aborted) setDialogError(e instanceof ApiError && e.status < 500 && e.message ? e.message : REVIEW_FAILED) })
    return () => controller.abort()
  }, [selectedId, revision, reviewRevision])

  async function verify() {
    if (!review || busy || verifyBlockers(review, choice, confirmed).length) return
    setBusy(true); setDialogError('')
    try {
      await api.post(`/admin/users/${review.user.id}/verify`, verifyPayload(review, choice))
      setSelectedId(null); setNotice(t.approved); setRevision(n => n + 1)
    } catch (e) {
      const status = e instanceof ApiError ? e.status : undefined
      if (shouldReloadReview(status, review)) { setDialogError(t.stale); setReviewRevision(n => n + 1) }
      else setDialogError(e instanceof Error && e.message ? e.message : t.approveFailed)
    }
    finally { setBusy(false) }
  }
  async function sendInvitations() {
    if (!inviteScope || busy) return
    setBusy(true); setDialogError('')
    try {
      const result = await api.post<{data: {queued: number; skipped: number}}>('/admin/founders/outreach', {action: 'invite', all_inactive: inviteScope === 'all', ids: checked})
      setNotice(fill(t.inviteQueued, {queued: result.data.queued, skipped: result.data.skipped}))
      setChecked([]); setInviteScope(null); setRevision(n => n + 1)
    } catch (e) { setDialogError(e instanceof Error && e.message ? e.message : t.inviteFailed) }
    finally { setBusy(false) }
  }
  const invited = people.filter(person => person.origin === 'invited' && person.founder_profile_id)
  const blockers = review ? verifyBlockers(review, choice, confirmed) : []
  const allPageChecked = invited.length > 0 && invited.every(person => checked.includes(person.founder_profile_id!))

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-950">{t.title}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{t.intro}</p></div><Button variant="outline" onClick={() => setRevision(n => n + 1)}>{t.refresh}</Button></div>
    {loadFailed && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{t.loadFailed}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{[[t.registered, meta?.registered], [t.invited, meta?.invited], [t.results, meta?.total]].map(([label, count]) => <div key={label} className="rounded-2xl border bg-white p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold">{count ?? '—'}</p></div>)}</div>
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row"><input type="search" maxLength={120} className={input} aria-label={t.search} placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} /><select className={input} aria-label={t.origin} value={origin} onChange={e => { setOrigin(e.target.value); setPage(1); setChecked([]) }}><option value="">{t.allUsers}</option><option value="registered">{t.registered}</option><option value="invited">{t.invited}</option></select></div>
    <div className="flex flex-wrap items-center gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={allPageChecked} onChange={e => setChecked(e.target.checked ? invited.map(p => p.founder_profile_id!) : [])} />{t.selectPage}</label><Button variant="outline" disabled={!checked.length || busy} onClick={() => setInviteScope('selected')}>{t.inviteSelected}</Button><Button variant="outline" disabled={!meta?.invited || busy} onClick={() => setInviteScope('all')}>{t.inviteAll}</Button><Link href="/admin/founders" className="inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 underline">{t.reviewInvitations}</Link></div>
    <div className="grid gap-4 lg:grid-cols-2" aria-busy={loading}>
      {people.map(person => <article key={person.key} className="min-w-0 rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-bold text-slate-950">{person.name}</h3><p className="mt-1 text-sm text-slate-600">{person.company || '—'}</p><p className="mt-1 break-all text-xs text-slate-500"><bdi>{person.email || t.noReviewedEmail}</bdi></p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${person.origin === 'registered' ? 'bg-indigo-50 text-indigo-800' : 'bg-amber-50 text-amber-900'}`}>{person.origin === 'registered' ? t.registered : t.invited}</span></div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">{person.origin === 'registered' && <><span>{person.email_verified ? t.emailVerified : t.emailNotVerified}</span><span className={person.admin_verified ? 'text-emerald-700' : 'text-amber-800'}>{person.admin_verified ? t.verified : t.verificationPending}</span></>}</div>
        <div className="mt-4 flex flex-wrap items-center gap-3">{person.user_id ? <Button variant="outline" size="sm" onClick={() => setSelectedId(person.user_id)}>{t.reviewIdentity}</Button> : <><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={checked.includes(person.founder_profile_id!)} onChange={e => setChecked(ids => e.target.checked ? [...ids, person.founder_profile_id!] : ids.filter(id => id !== person.founder_profile_id))} />{t.selectForInvite}</label><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline" href={`/admin/founders?search=${encodeURIComponent(person.founder_uid ?? '')}`}>{t.manageInvitation}</Link></>}</div>
      </article>)}
    </div>
    {!loading && !people.length && <p className="rounded-2xl border p-6 text-center text-slate-600">{t.noResults}</p>}
    {meta && meta.last_page > 1 && <nav className="flex items-center justify-between gap-3" aria-label={t.pages}><Button variant="outline" disabled={page <= 1 || loading} onClick={() => { setPage(n => n - 1); setChecked([]) }}>{t.previous}</Button><span>{page} / {meta.last_page}</span><Button variant="outline" disabled={page >= meta.last_page || loading} onClick={() => { setPage(n => n + 1); setChecked([]) }}>{t.next}</Button></nav>}
    <Dialog open={selectedId !== null} onOpenChange={open => { if (!open && !busy) setSelectedId(null) }}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{t.dialogTitle}</DialogTitle><DialogDescription>{t.dialogDescription}</DialogDescription></DialogHeader>
      {dialogError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{dialogError === REVIEW_FAILED ? t.reviewFailed : dialogError}</p>}
      {!review ? <p role="status">{t.finding}</p> : <div className="space-y-5"><div className="rounded-xl bg-slate-50 p-4 text-sm leading-7"><h3 className="font-bold">{review.user.name}</h3><p><bdi>{review.user.email}</bdi> · {review.user.email_verified ? t.emailVerified : t.emailNotVerified}</p>{review.application && <><p>{review.application.full_name} · {review.application.company_name}</p><p><bdi>{review.application.company_website}</bdi></p><p>{review.application.onboarding_data?.bio}</p><p><bdi>{review.application.phone}</bdi></p></>}</div>
        {review.profile ? <p className="rounded-xl bg-indigo-50 p-4 text-sm font-bold">{t.hasProfile} <Link className="underline" href={`/founders/${encodeURIComponent(review.profile.slug)}`} target="_blank">{t.viewProfile}</Link>{review.profile.verified && <span className="ms-2 text-emerald-700">{t.verified}</span>}</p> : <fieldset className="space-y-3"><legend className="mb-2 font-bold">{t.matches}</legend>{review.candidates.map(candidate => <label key={candidate.id} className="block cursor-pointer rounded-xl border p-4 text-sm"><span className="flex items-start gap-3"><input type="radio" name="identity-choice" value={candidate.id} checked={choice === String(candidate.id)} onChange={e => setChoice(e.target.value)} className="mt-1" /><span className="min-w-0"><b>{candidate.name}</b> · {candidate.company}<span className="mt-1 block text-xs text-indigo-700">{candidate.signals.map(signal => signalLabel(locale, signal)).join(' · ')}</span><Link href={`/founders/${encodeURIComponent(candidate.slug)}`} target="_blank" className="me-4 inline-flex min-h-11 items-center underline">{t.publishedProfile}</Link>{publicWebsite(candidate.website ?? undefined) && <a href={publicWebsite(candidate.website ?? undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t.companyWebsite}</a>}</span></span></label>)}<label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="radio" name="identity-choice" value="new" checked={choice === 'new'} onChange={e => setChoice(e.target.value)} className="mt-1" /><span>{review.candidates.length ? t.noneMatch : t.noMatch}</span></label></fieldset>}
        <label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-2" />{t.confirm}</label>
        {blockers.length > 0 && <div id="verify-blockers" className="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"><p className="font-bold">{t.blockersTitle}</p><ul className="list-disc ps-5">{blockers.map(blocker => <li key={blocker}>{blockerText(locale, blocker)}</li>)}</ul></div>}
        <Button disabled={busy || blockers.length > 0} aria-describedby={blockers.length ? 'verify-blockers' : undefined} onClick={verify}>{busy ? t.approving : t.approve}</Button>
      </div>}
    </DialogContent></Dialog>
    <Dialog open={inviteScope !== null} onOpenChange={open => { if (!open && !busy) setInviteScope(null) }}><DialogContent><DialogHeader><DialogTitle>{t.inviteTitle}</DialogTitle><DialogDescription>{inviteScope === 'all' ? t.inviteAllScope : fill(t.inviteSelectedScope, {count: checked.length})}</DialogDescription></DialogHeader><p className="text-sm leading-7">{t.inviteRules}</p>{dialogError && <p role="alert" className="text-sm text-red-700">{dialogError}</p>}<Button disabled={busy} onClick={sendInvitations}>{t.inviteQueue}</Button></DialogContent></Dialog>
  </div>
}
