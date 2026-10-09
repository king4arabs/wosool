'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import {
  errorText,
  statusLabel,
  type Milestone,
  type Participant,
} from '@/lib/eoa'
import { Field, Notice, useEoaProgram } from './Shared'

export function ParticipantWorkspace({
  participant: p,
  reload,
}: {
  participant: Participant
  reload: () => Promise<void>
}) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [goals, setGoals] = useState<Milestone[]>(p.progress?.milestones ?? [])
  const [assessment, setAssessment] = useState(
    p.progress?.self_assessment ?? '',
  )
  async function act(fn: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
      await reload()
      setNotice(ar ? 'تم الحفظ.' : 'Saved.')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="eoa-space">
      <div className="eoa-section-head">
        <h2>{ar ? 'مساحة المشارك' : 'Participant workspace'}</h2>
        <span className="eoa-badge">{statusLabel(p.status, ar)}</span>
      </div>
      {p.track && <p><strong>{ar ? 'مسارك' : 'Your track'}:</strong> {ar ? p.track.name_ar : p.track.name_en}</p>}
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <div className="eoa-two-grid">
        <form
          className="eoa-card"
          onSubmit={(e) => {
            e.preventDefault()
            void act(() =>
              api.post('/eoa/onboarding', {
                participation_agreed: true,
                profile_confirmed: true,
              }),
            )
          }}
        >
          <h3>{ar ? 'قائمة الانضمام' : 'Onboarding checklist'}</h3>
          <p className="eoa-preserve">
            {ar
              ? program?.participation_terms_ar
              : program?.participation_terms_en}
          </p>
          {p.onboarding.completed_at ? (
            <p>
              {ar
                ? '✓ اكتملت قائمة الانضمام'
                : '✓ Onboarding checklist completed'}
            </p>
          ) : (
            <>
              <label className="eoa-check">
                <input type="checkbox" required />
                {ar
                  ? 'راجعت بياناتي وأؤكد اكتمالها.'
                  : 'I have reviewed and confirmed my profile.'}
              </label>
              <label className="eoa-check">
                <input type="checkbox" required />
                {ar
                  ? 'ألتزم بأيام التعلم ومجموعات المساءلة والسرية.'
                  : 'I commit to learning days, accountability groups and confidentiality.'}
              </label>
              <button className="eoa-btn" disabled={busy}>
                {ar ? 'تأكيد' : 'Confirm checklist'}
              </button>
            </>
          )}
        </form>
        <div className="eoa-card">
          <h3>{ar ? 'التسجيل والرسوم' : 'Enrollment & fees'}</h3>
          <p>
            {ar ? 'حالة الرسوم' : 'Fee status'}:{' '}
            {statusLabel(p.finance.fee_status ?? 'pending', ar)}
          </p>
          <p>
            {p.finance.global_confirmed
              ? ar
                ? '✓ تم تسجيل التأكيد الرسمي بواسطة الإدارة.'
                : '✓ Leadership has recorded official enrollment confirmation.'
              : ar
                ? 'بانتظار التأكيد الرسمي من الإدارة.'
                : 'Awaiting official enrollment confirmation from leadership.'}
          </p>
          <p className="eoa-muted">
            {ar
              ? 'لا يعالج وصول مدفوعات EO مباشرة. تُوثق الإدارة السداد أو الرعاية والتسجيل الرسمي.'
              : 'Wosool does not process EO payments. Leadership records payment or sponsorship and official enrollment confirmation.'}
          </p>
        </div>
      </div>
      {p.status === 'enrolled' && (
        <>
          <div className="eoa-two-grid eoa-space">
            <div className="eoa-card">
              <h3>{ar ? 'مجموعتك ومدربك' : 'Your group & coach'}</h3>
              {p.group ? (
                <>
                  <p>{p.group.name}</p>
                  <p>{p.group.coach_name}</p>
                  {p.group.meeting_link && (
                    <a
                      href={p.group.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eoa-text-link"
                    >
                      {ar ? 'رابط اللقاء' : 'Meeting link'} ↗
                    </a>
                  )}
                </>
              ) : (
                <p>
                  {ar
                    ? 'سيتم تعيين مجموعتك قريباً.'
                    : 'Your group assignment will appear here.'}
                </p>
              )}
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'إعلانات البرنامج' : 'Program announcements'}</h3>
              {p.announcements.length ? (
                p.announcements.map((a) => (
                  <article key={a.id}>
                    <h4>{a.subject}</h4>
                    <p className="eoa-preserve">{a.body}</p>
                  </article>
                ))
              ) : (
                <p>{ar ? 'لا توجد إعلانات بعد.' : 'No announcements yet.'}</p>
              )}
            </div>
          </div>
          <section className="eoa-space">
            <h2>{ar ? 'التقويم والتسجيل' : 'Calendar & registration'}</h2>
            <div className="eoa-three-grid">
              {p.sessions.map((s) => (
                <article className="eoa-card" key={s.id}>
                  <span className="eoa-eyebrow">
                    {new Date(s.starts_at).toLocaleString(
                      ar ? 'ar-SA' : 'en-GB',
                      { timeZone: 'Asia/Riyadh' },
                    )}{' '}
                    (Riyadh)
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <p>{s.location}</p>
                  {s.online_link && (
                    <a
                      href={s.online_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eoa-text-link"
                    >
                      {ar ? 'رابط الجلسة' : 'Session link'} ↗
                    </a>
                  )}
                  <button
                    className="eoa-btn"
                    disabled={
                      busy ||
                      p.registrations.includes(s.id) ||
                      new Date(s.starts_at) < new Date()
                    }
                    onClick={() =>
                      void act(() => api.post(`/eoa/sessions/${s.id}/register`))
                    }
                  >
                    {p.registrations.includes(s.id)
                      ? ar
                        ? 'مسجل'
                        : 'Registered'
                      : ar
                        ? 'سجل في الجلسة'
                        : 'Register'}
                  </button>
                </article>
              ))}
            </div>
            {!p.sessions.length && (
              <p>
                {ar
                  ? 'لم تُنشر جلسات لدفعتك بعد.'
                  : 'No sessions have been published for your cohort yet.'}
              </p>
            )}
          </section>
          <div className="eoa-two-grid eoa-space">
            <form
              className="eoa-card"
              onSubmit={(e) => {
                e.preventDefault()
                void act(() =>
                  api.put('/eoa/progress', {
                    milestones: goals,
                    self_assessment: assessment,
                  }),
                )
              }}
            >
              <h3>{ar ? 'الأهداف ومراحل الإنجاز' : 'Goals & milestones'}</h3>
              {goals.map((g, i) => (
                <div className="eoa-goal" key={i}>
                  <Field label={ar ? 'الهدف' : 'Goal'}>
                    <input
                      required
                      value={g.title}
                      maxLength={255}
                      onChange={(e) =>
                        setGoals((rows) =>
                          rows.map((r, n) =>
                            n === i ? { ...r, title: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label={ar ? 'الموعد المستهدف' : 'Target date'}>
                    <input
                      type="date"
                      value={g.due_date ?? ''}
                      onChange={(e) =>
                        setGoals((rows) =>
                          rows.map((r, n) =>
                            n === i ? { ...r, due_date: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </Field>
                  <label className="eoa-check">
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={(e) =>
                        setGoals((rows) =>
                          rows.map((r, n) =>
                            n === i ? { ...r, completed: e.target.checked } : r,
                          ),
                        )
                      }
                    />
                    {ar ? 'مكتمل' : 'Complete'}
                  </label>
                  <button
                    type="button"
                    className="eoa-text-link"
                    onClick={() =>
                      setGoals((rows) => rows.filter((_, n) => n !== i))
                    }
                  >
                    {ar ? 'حذف الهدف' : 'Remove goal'}
                  </button>
                </div>
              ))}
              <button
                className="eoa-text-link"
                type="button"
                disabled={goals.length >= 20}
                onClick={() =>
                  setGoals((rows) => [...rows, { title: '', completed: false }])
                }
              >
                + {ar ? 'أضف هدفاً' : 'Add a goal'}
              </button>
              <Field label={ar ? 'تحديث التقدم' : 'Progress reflection'}>
                <textarea
                  maxLength={4000}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                />
              </Field>
              <button className="eoa-btn" disabled={busy}>
                {ar ? 'حفظ التقدم' : 'Save progress'}
              </button>
              {p.progress?.mentor_feedback && (
                <Notice>{p.progress.mentor_feedback}</Notice>
              )}
            </form>
            <div>
              <section className="eoa-card">
                <h3>{ar ? 'مواد التعلم' : 'Learning materials'}</h3>
                {p.resources.length ? (
                  p.resources.map((r) => (
                    <p key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eoa-text-link"
                      >
                        {r.title} ↗
                      </a>
                    </p>
                  ))
                ) : (
                  <p>
                    {ar
                      ? 'لا توجد مواد منشورة بعد.'
                      : 'No materials published yet.'}
                  </p>
                )}
              </section>
              <section className="eoa-card eoa-space">
                <h3>{ar ? 'سجل الحضور' : 'Attendance history'}</h3>
                {p.attendance.length ? (
                  p.attendance.map((a, i) => (
                    <p key={i}>
                      {a.title} — {statusLabel(a.status, ar)}
                    </p>
                  ))
                ) : (
                  <p>
                    {ar
                      ? 'سيظهر حضورك بعد توثيق الجلسات.'
                      : 'Attendance appears after sessions are recorded.'}
                  </p>
                )}
              </section>
            </div>
          </div>
          <form
            className="eoa-card eoa-space"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              void act(() =>
                api.post('/eoa/feedback', {
                  satisfaction_score: Number(f.get('score')),
                  what_improved: f.get('improved'),
                  what_missing: f.get('missing'),
                }),
              )
            }}
          >
            <h3>
              {ar
                ? 'ملاحظاتك تطور البرنامج'
                : 'Your feedback improves the program'}
            </h3>
            <div className="eoa-three-grid">
              <Field label={ar ? 'الرضا (1–5)' : 'Satisfaction (1–5)'}>
                <select name="score">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? 'ما الذي تحسن؟' : 'What improved?'}>
                <textarea name="improved" maxLength={2000} />
              </Field>
              <Field label={ar ? 'ما الذي تحتاجه؟' : 'What is missing?'}>
                <textarea name="missing" maxLength={2000} />
              </Field>
            </div>
            <button className="eoa-btn" disabled={busy}>
              {ar ? 'إرسال الملاحظات' : 'Submit feedback'}
            </button>
          </form>
        </>
      )}
      <section className="eoa-card eoa-space">
        <h3>{ar ? 'الجاهزية لعضوية EO' : 'EO membership readiness'}</h3>
        <p>
          {ar
            ? 'عند وصول الإيراد السنوي إلى مليون دولار، تواصل مع قيادة الفرع لمراجعة متطلبات عضوية EO واستكمال التقديم الرسمي. لا يحدث الانتقال تلقائياً.'
            : 'When annual revenue reaches US$1 million, contact chapter leadership to review EO membership requirements and complete the official application. Graduation is not automatic.'}
        </p>
        <Link className="eoa-text-link" href="/EOA/contact">
          {ar ? 'تواصل مع البرنامج' : 'Contact the program'} ↗
        </Link>
      </section>
    </div>
  )
}
