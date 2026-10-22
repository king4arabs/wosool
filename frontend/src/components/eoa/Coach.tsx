'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Circle, CircleCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import { errorText, type Milestone, type Session } from '@/lib/eoa'
import { learningSummary, pillars } from '@/lib/eoa-management'
import { Field, Notice } from './Shared'
type CoachData = {
  data: {
    participant_id: number
    name: string
    cohort_id: number | null
    progress: {
      milestones: Milestone[]
      self_assessment: string
      mentor_feedback: string
    } | null
  }[]
  sessions: Session[]
}
export function Coach() {
  const { user } = useAuth()
  return <CoachSession key={user?.id ?? 'guest'} />
}

function CoachSession() {
  const { user, isLoading } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [data, setData] = useState<CoachData | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const load = useCallback(async () => {
    if (!user?.email_verified_at) return
    try {
      setData(await api.get<CoachData>('/eoa/coach'))
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }, [user])
  useEffect(() => {
    void load()
  }, [load])
  return (
    <section className="eoa-section">
      <div className="eoa-container">
        <h1>{ar ? 'مساحة المدرب' : 'Coach workspace'}</h1>
        <p>
          {ar
            ? 'أهداف وتقدم المشاركين في مجموعاتك المخصصة.'
            : 'Goals and progress for participants in your assigned groups.'}
        </p>
        {isLoading && <Notice>{ar ? 'جارٍ التحميل…' : 'Loading…'}</Notice>}
        {(!user || !user.email_verified_at) && (
          <Link href="/eoa/account?mode=login&redirect=%2Feoa%2Fcoach" className="eoa-btn">
            {ar ? 'الدخول بحساب موثق' : 'Sign in with a verified account'}
          </Link>
        )}
        {error && <Notice error>{error} <button type="button" className="eoa-text-link" onClick={()=>void load()}>{ar?'إعادة المحاولة':'Try again'}</button></Notice>}
        {notice && <Notice>{notice}</Notice>}
        {data && <><div className="eoa-management-hero"><h2>{ar?'التعلم يتحول إلى تقدم':'Turn learning into progress'}</h2><p>{data.data.length} {ar?'مشاركاً في نطاق مسؤوليتك':'participants in your care'}</p><p>{ar?'راجع النتائج والمواعيد، اترك ملاحظات قابلة للتنفيذ، ووثق الحضور بعد الجلسة.':'Review outcomes and target dates, leave actionable feedback, and record attendance after each session.'}</p></div><Field label={ar?'البحث عن مشارك':'Find a participant'}><input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></Field></>}
        <div className="eoa-two-grid">
          {data?.data.filter(p=>p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((p) => (
            <form
              className="eoa-card"
              key={p.participant_id}
              onSubmit={async (e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                setBusy(true)
                setError('')
                try {
                  await api.patch(`/eoa/coach/${p.participant_id}`, {
                    mentor_feedback: f.get('mentor_feedback'),
                    session_id: f.get('session_id')
                      ? Number(f.get('session_id'))
                      : null,
                    ...(f.get('session_id')
                      ? { attendance: f.get('attendance') }
                      : {}),
                  })
                  await load()
                  setNotice(ar ? 'تم حفظ تحديث المدرب.' : 'Coach update saved.')
                } catch (e) {
                  setError(errorText(e))
                } finally {
                  setBusy(false)
                }
              }}
            >
              <h2>{p.name}</h2><p className="eoa-badge">{learningSummary(p.progress?.milestones ?? [], []).completed} / {p.progress?.milestones?.length ?? 0} {ar?'أهداف مكتملة':'goals completed'}</p>
              {p.progress?.milestones?.map((m, i) => (
                <p key={i} className="flex items-center gap-2">
                  {m.completed ? <CircleCheck size={16} className="shrink-0 text-[var(--success-text)]" aria-hidden="true" /> : <Circle size={16} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />} {m.title} {m.due_date} {pillars.find(([key])=>key===m.pillar)?.[ar?1:2]}
                </p>
              ))}
              <p>{p.progress?.self_assessment}</p>
              <Field
                label={ar ? 'ملاحظات للمشارك' : 'Feedback for the participant'}
              >
                <textarea
                  name="mentor_feedback"
                  maxLength={4000}
                  defaultValue={p.progress?.mentor_feedback ?? ''}
                />
              </Field>
              <Field
                label={
                  ar
                    ? 'توثيق حضور جلسة (اختياري)'
                    : 'Record session attendance (optional)'
                }
              >
                <select name="session_id">
                  <option value="">—</option>
                  {data.sessions
                    .filter(
                      (s) =>
                        s.cohort_id === null || s.cohort_id === p.cohort_id,
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label={ar ? 'الحضور' : 'Attendance'}>
                <select name="attendance">
                  <option value="attended">{ar ? 'حاضر' : 'Attended'}</option>
                  <option value="absent">{ar ? 'غائب' : 'Absent'}</option>
                  <option value="excused">{ar ? 'بعذر' : 'Excused'}</option>
                </select>
              </Field>
              <button className="eoa-btn" disabled={busy}>
                {ar ? 'حفظ' : 'Save'}
              </button>
            </form>
          ))}
        </div>
        {data && !data.data.length && (
          <Notice>
            {ar
              ? 'لم يتم تعيين مشاركين لك بعد.'
              : 'No participants have been assigned to you yet.'}
          </Notice>
        )}
      </div>
    </section>
  )
}
