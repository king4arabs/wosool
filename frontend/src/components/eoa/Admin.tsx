'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import {
  applicationFieldLabel,
  applicationFieldValue,
  errorText,
  statusLabel,
  type EoaApplication,
  type Organization,
} from '@/lib/eoa'
import { Field, Notice } from './Shared'

type Row = Record<string, string | number | boolean | null>
type Person = { id: number; name: string; email: string; roles: string[] }
type Enrollment = {
  id: number
  name: string
  status: string
  cohort_id: number | null
  group_id: number | null
  onboarding: { completed_at?: string } | null
  finance: Record<string, string | number | boolean | null> | null
}
type Inquiry = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  responded_at: string | null
}
type Operations = {
  inquiries: Inquiry[]
  program_id: number
  settings: Record<string, string | number | null>
  is_open: boolean
  starts_at: string | null
  application_deadline: string | null
  cohorts: Row[]
  sessions: Row[]
  groups: Row[]
  resources: Row[]
  announcements: Row[]
  participants: Enrollment[]
  people: Person[]
  organizations: Organization[]
  report: Record<string, number>
  audit: { id: number; action: string; created_at: string }[]
  mail_configured: boolean
  feedback: {
    id: number
    satisfaction_score: number
    what_improved: string
    what_missing: string
  }[]
}
type ReviewRow = {
  id: number
  status: string
  name: string
  email: string
  company_name: string
  submitted_at: string
}
type ReviewResponse = {
  data: { data: ReviewRow[]; current_page: number; last_page: number }
  capabilities: { lead: boolean; staff: boolean }
}
type OperationType =
  | 'cohorts'
  | 'sessions'
  | 'groups'
  | 'resources'
  | 'announcements'
function localDateInput(value: unknown) {
  if (!value) return ''
  const d = new Date(String(value))
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}
const operationTitles: Record<OperationType, [string, string]> = {
  cohorts: ['الدفعات', 'Cohorts'],
  sessions: ['الجلسات', 'Sessions'],
  groups: ['مجموعات المساءلة', 'Accountability groups'],
  resources: ['مواد التعلم', 'Learning materials'],
  announcements: ['الإعلانات', 'Announcements'],
}

export function Admin() {
  const { user } = useAuth()
  return <AdminSession key={user?.id ?? 'guest'} />
}

function AdminSession() {
  const { user, isLoading } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [ops, setOps] = useState<Operations | null>(null)
  const [selected, setSelected] = useState<EoaApplication | null>(null)
  const [tab, setTab] = useState('applications')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    if (!user?.email_verified_at) return
    try {
      const r = await api.get<ReviewResponse>('/eoa/review', {
        params: { page },
      })
      setReview(r)
      if (r.capabilities.staff) {
        const o = await api.get<{ data: Operations }>('/eoa/operations')
        setOps(o.data)
      }
    } catch (e) {
      setError(errorText(e))
    }
  }, [user, page])
  useEffect(() => {
    void load()
  }, [load])
  async function act(fn: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
      await load()
      setNotice(ar ? 'تم الحفظ.' : 'Saved.')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function open(id: number) {
    setError('')
    try {
      const r = await api.get<{ data: EoaApplication }>(`/eoa/review/${id}`)
      setSelected(r.data)
    } catch (e) {
      setError(errorText(e))
    }
  }
  if (isLoading)
    return (
      <div className="eoa-container eoa-section">
        <Notice>{ar ? 'جارٍ التحميل…' : 'Loading…'}</Notice>
      </div>
    )
  if (!user || !user.email_verified_at)
    return (
      <div className="eoa-container eoa-section">
        <Link className="eoa-btn" href="/EOA/account">
          {ar ? 'ادخل بحساب موثق' : 'Sign in with a verified account'}
        </Link>
      </div>
    )
  return (
    <section className="eoa-section">
      <div className="eoa-container">
        <div className="eoa-page-heading">
          <span className="eoa-eyebrow">EOA / OPERATIONS</span>
          <h1>{ar ? 'مساحة إدارة البرنامج' : 'Program administration'}</h1>
        </div>
        {error && <Notice error>{error}</Notice>}
        {notice && <Notice>{notice}</Notice>}
        {review && (
          <>
            <div className="eoa-tabs">
              {[
                ['applications', ar ? 'الطلبات' : 'Applications'],
                ...(ops
                  ? [
                      ['program', ar ? 'التشغيل' : 'Operations'],
                      ['enrollment', ar ? 'المشاركون' : 'Participants'],
                      ['partners', ar ? 'الشركاء' : 'Partners'],
                      ['settings', ar ? 'الإعدادات' : 'Settings'],
                      ['inquiries', ar ? 'الاستفسارات' : 'Inquiries'],
                      ['report', ar ? 'التقارير والسجل' : 'Reports & audit'],
                    ]
                  : []),
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={tab === key ? 'active' : ''}
                  onClick={() => {
                    setTab(key)
                    setSelected(null)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'applications' && (
              <div className="eoa-admin-grid">
                <div className="eoa-card">
                  <h2>{ar ? 'طلبات المراجعة' : 'Applications for review'}</h2>
                  {!review.data.data.length && (
                    <p>
                      {ar
                        ? 'لا توجد طلبات ضمن صلاحياتك بعد.'
                        : 'No applications within your access yet.'}
                    </p>
                  )}
                  {review.data.data.map((a) => (
                    <button
                      key={a.id}
                      className="eoa-app-row"
                      onClick={() => void open(a.id)}
                    >
                      <strong>{a.name}</strong>
                      <span>{a.company_name}</span>
                      <span className="eoa-badge">
                        {statusLabel(a.status, ar)}
                      </span>
                    </button>
                  ))}
                  <div className="eoa-actions">
                    <button
                      className="eoa-text-link"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {ar ? 'السابق' : 'Previous'}
                    </button>
                    <span>
                      {page} / {review.data.last_page}
                    </span>
                    <button
                      className="eoa-text-link"
                      disabled={page >= review.data.last_page}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {ar ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
                <div>
                  {selected ? (
                    <div className="eoa-card" key={selected.id}>
                      <h2>{selected.fields.company_name}</h2>
                      <span className="eoa-badge">
                        {statusLabel(selected.status, ar)}
                      </span>
                      <dl className="eoa-review">
                        {Object.entries(selected.fields).map(([key, value]) => (
                          <div key={key}>
                            <dt>{applicationFieldLabel(key, ar)}</dt>
                            <dd>{applicationFieldValue(value, ar)}</dd>
                          </div>
                        ))}
                      </dl>
                      <h3>{ar ? 'المستندات الخاصة' : 'Private documents'}</h3>
                      {selected.documents.map((d) => (
                        <p key={d.id}>
                          <a
                            className="eoa-text-link"
                            href={`/api/v1/eoa/documents/${d.id}`}
                          >
                            {d.name} ↧
                          </a>
                        </p>
                      ))}
                      {selected.decision_reason && (
                        <Notice>{selected.decision_reason}</Notice>
                      )}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const f = new FormData(e.currentTarget)
                          void act(async () => {
                            const r = await api.patch<{ data: EoaApplication }>(
                              `/eoa/review/${selected.id}`,
                              {
                                status: f.get('status'),
                                version: selected.version,
                                message: f.get('message'),
                                internal_note: f.get('internal_note'),
                                interview_at: f.get('interview_at')
                                  ? new Date(
                                      String(f.get('interview_at')),
                                    ).toISOString()
                                  : null,
                                interview_location:
                                  f.get('interview_location') || null,
                              },
                            )
                            setSelected(r.data)
                          })
                        }}
                      >
                        <Field
                          label={
                            ar
                              ? 'القرار أو الخطوة التالية'
                              : 'Decision or next step'
                          }
                        >
                          <select name="status">
                            {[
                              'under_review',
                              'information_requested',
                              'interview',
                              ...(review.capabilities.lead
                                ? ['accepted', 'waitlisted', 'rejected']
                                : []),
                            ].map((s) => (
                              <option value={s} key={s}>
                                {statusLabel(s, ar)}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field
                          label={ar ? 'رسالة للمؤسس' : 'Message to the founder'}
                        >
                          <textarea name="message" required maxLength={2000} />
                        </Field>
                        <Field label={ar ? 'ملاحظة داخلية' : 'Internal note'}>
                          <textarea
                            name="internal_note"
                            defaultValue={selected.internal_note ?? ''}
                            maxLength={4000}
                          />
                        </Field>
                        <div className="eoa-two-grid">
                          <Field
                            label={
                              ar
                                ? 'موعد المقابلة (توقيت جهازك)'
                                : 'Interview time (your device timezone)'
                            }
                          >
                            <input name="interview_at" type="datetime-local" />
                          </Field>
                          <Field
                            label={
                              ar
                                ? 'مكان أو رابط المقابلة'
                                : 'Interview location or link'
                            }
                          >
                            <input name="interview_location" maxLength={255} />
                          </Field>
                        </div>
                        <button className="eoa-btn" disabled={busy}>
                          {ar ? 'حفظ وإشعار المؤسس' : 'Save & notify founder'}
                        </button>
                      </form>
                      {ops && (
                        <form
                          className="eoa-space"
                          onSubmit={(e) => {
                            e.preventDefault()
                            const f = new FormData(e.currentTarget)
                            void act(() =>
                              api.post(`/eoa/review/${selected.id}/assign`, {
                                reviewer_id: Number(f.get('reviewer_id')),
                                remove: f.get('remove') === 'on',
                              }),
                            )
                          }}
                        >
                          <Field
                            label={ar ? 'تعيين مراجع' : 'Assign a reviewer'}
                          >
                            <select name="reviewer_id" required>
                              <option value="">{ar ? 'اختر' : 'Select'}</option>
                              {ops.people
                                .filter((p) => p.roles.includes('eoa_reviewer'))
                                .map((p) => (
                                  <option value={p.id} key={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          </Field>
                          <label className="eoa-check">
                            <input type="checkbox" name="remove" />
                            {ar
                              ? 'إلغاء تعيين هذا المراجع'
                              : 'Remove this reviewer’s assignment'}
                          </label>
                          <button
                            className="eoa-btn eoa-btn-secondary"
                            disabled={busy}
                          >
                            {ar ? 'حفظ التعيين' : 'Save assignment'}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="eoa-empty">
                      {ar
                        ? 'اختر طلباً للاطلاع والمراجعة.'
                        : 'Select an application to review.'}
                    </div>
                  )}
                </div>
              </div>
            )}
            {tab === 'program' && ops && (
              <OperationManager ops={ops} act={act} busy={busy} ar={ar} />
            )}
            {tab === 'enrollment' && ops && (
              <div className="eoa-two-grid">
                {!ops.participants.length && (
                  <p>
                    {ar
                      ? 'سيظهر المقبولون محلياً هنا.'
                      : 'Locally accepted applicants appear here.'}
                  </p>
                )}
                {ops.participants.map((p) => (
                  <form
                    className="eoa-card"
                    key={p.id}
                    onSubmit={(e) => {
                      e.preventDefault()
                      const f = new FormData(e.currentTarget)
                      void act(() =>
                        api.patch(`/eoa/operations/participants/${p.id}`, {
                          cohort_id: f.get('cohort_id')
                            ? Number(f.get('cohort_id'))
                            : null,
                          group_id: f.get('group_id')
                            ? Number(f.get('group_id'))
                            : null,
                          fee_status: f.get('fee_status'),
                          global_confirmed: f.get('global_confirmed') === 'on',
                          official_reference:
                            f.get('official_reference') || null,
                          fee_reference: f.get('fee_reference') || null,
                          participant_amount_usd:
                            f.get('participant_amount_usd') || null,
                          sponsor_amount_usd:
                            f.get('sponsor_amount_usd') || null,
                        }),
                      )
                    }}
                  >
                    <h3>{p.name}</h3>
                    <p>
                      {statusLabel(p.status, ar)} ·{' '}
                      {p.onboarding?.completed_at
                        ? ar
                          ? 'قائمة الانضمام مكتملة'
                          : 'Checklist complete'
                        : ar
                          ? 'بانتظار قائمة الانضمام'
                          : 'Checklist pending'}
                    </p>
                    <Field label={ar ? 'الدفعة' : 'Cohort'}>
                      <select name="cohort_id" defaultValue={p.cohort_id ?? ''}>
                        <option value="">—</option>
                        {ops.cohorts.map((c) => (
                          <option key={String(c.id)} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={ar ? 'المجموعة' : 'Group'}>
                      <select name="group_id" defaultValue={p.group_id ?? ''}>
                        <option value="">—</option>
                        {ops.groups.map((g) => (
                          <option key={String(g.id)} value={String(g.id)}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={ar ? 'حالة الرسوم' : 'Fee status'}>
                      <select
                        name="fee_status"
                        defaultValue={String(
                          p.finance?.fee_status ?? 'pending',
                        )}
                      >
                        {['pending', 'paid', 'sponsored'].map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s, ar)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {[
                      [
                        'official_reference',
                        ar
                          ? 'مرجع التسجيل الرسمي'
                          : 'Official enrollment reference',
                      ],
                      [
                        'fee_reference',
                        ar
                          ? 'مرجع السداد أو الرعاية'
                          : 'Payment / sponsorship reference',
                      ],
                      [
                        'participant_amount_usd',
                        ar ? 'مبلغ المشارك بالدولار' : 'Participant amount USD',
                      ],
                      [
                        'sponsor_amount_usd',
                        ar ? 'دعم الراعي بالدولار' : 'Sponsor amount USD',
                      ],
                    ].map(([key, label]) => (
                      <Field key={key} label={label}>
                        <input
                          name={key}
                          type={key.includes('amount') ? 'number' : 'text'}
                          min="0"
                          step="0.01"
                          defaultValue={String(p.finance?.[key] ?? '')}
                        />
                      </Field>
                    ))}
                    <label className="eoa-check">
                      <input
                        name="global_confirmed"
                        type="checkbox"
                        defaultChecked={Boolean(p.finance?.global_confirmed)}
                      />
                      {ar
                        ? 'أؤكد التسجيل الرسمي لدى EO وفق المرجع أعلاه.'
                        : 'I confirm official EO enrollment against the reference above.'}
                    </label>
                    {review.capabilities.lead && (
                      <button className="eoa-btn" disabled={busy}>
                        {ar ? 'حفظ التأكيد' : 'Save confirmation'}
                      </button>
                    )}
                  </form>
                ))}
              </div>
            )}
            {tab === 'partners' && ops && (
              <div className="eoa-three-grid">
                {ops.organizations.map((o) => (
                  <form
                    className="eoa-card"
                    key={o.id}
                    onSubmit={(e) => {
                      e.preventDefault()
                      const f = new FormData(e.currentTarget)
                      void act(() =>
                        api.patch(`/eoa/operations/organizations/${o.id}`, {
                          relationship_status: f.get('relationship_status'),
                          relationship_evidence: f.get('relationship_evidence'),
                        }),
                      )
                    }}
                  >
                    <h3>{ar ? o.name_ar : o.name_en}</h3>
                    <p>
                      {o.logo_path
                        ? ar
                          ? 'الأصل الرسمي جاهز'
                          : 'Official asset ready'
                        : ar
                          ? 'بانتظار أصل الشعار الرسمي'
                          : 'Official logo asset pending'}
                    </p>
                    <a
                      href={o.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eoa-text-link"
                    >
                      {ar ? 'مصدر التحقق' : 'Verification source'} ↗
                    </a>
                    <Field label={ar ? 'حالة العلاقة' : 'Relationship status'}>
                      <select
                        name="relationship_status"
                        defaultValue={o.relationship_status}
                      >
                        <option value="ecosystem">
                          {ar ? 'جهة في المنظومة' : 'Ecosystem organization'}
                        </option>
                        <option value="prospective">
                          {ar ? 'شريك محتمل' : 'Prospective partner'}
                        </option>
                        <option value="confirmed">
                          {ar ? 'شريك مؤكد' : 'Confirmed partner'}
                        </option>
                      </select>
                    </Field>
                    <Field
                      label={
                        ar
                          ? 'مرجع اعتماد الشراكة'
                          : 'Partnership approval evidence'
                      }
                    >
                      <textarea
                        name="relationship_evidence"
                        defaultValue={o.relationship_evidence ?? ''}
                        maxLength={2000}
                      />
                    </Field>
                    {review.capabilities.lead && (
                      <button className="eoa-btn" disabled={busy}>
                        {ar ? 'حفظ' : 'Save'}
                      </button>
                    )}
                  </form>
                ))}
              </div>
            )}
            {tab === 'inquiries' && ops && (
              <div className="eoa-two-grid">
                {!ops.inquiries.length && (
                  <p>{ar ? 'لا توجد استفسارات بعد.' : 'No inquiries yet.'}</p>
                )}
                {ops.inquiries.map((q) => (
                  <article className="eoa-card" key={q.id}>
                    <h3>{q.subject}</h3>
                    <p>
                      {q.name} — <a href={`mailto:${q.email}`}>{q.email}</a>
                    </p>
                    <p className="eoa-preserve">{q.message}</p>
                    <button
                      className="eoa-btn eoa-btn-secondary"
                      disabled={busy}
                      onClick={() =>
                        void act(() =>
                          api.patch(`/eoa/operations/inquiries/${q.id}`, {
                            handled: !q.responded_at,
                          }),
                        )
                      }
                    >
                      {q.responded_at
                        ? ar
                          ? 'إعادة الفتح'
                          : 'Reopen'
                        : ar
                          ? 'تسجيل المعالجة'
                          : 'Mark handled'}
                    </button>
                    <p className="eoa-muted">
                      {ar
                        ? 'هذه الخطوة تحدث الحالة فقط؛ الرد يتم عبر قناة التواصل المعتمدة.'
                        : 'This updates status only. Respond through your approved communication channel.'}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {tab === 'settings' && ops && (
              <Settings
                ops={ops}
                lead={review.capabilities.lead}
                act={act}
                busy={busy}
                ar={ar}
              />
            )}
            {tab === 'report' && ops && (
              <>
                <div className="eoa-three-grid">
                  {[
                    [
                      ar ? 'الطلبات المقدمة' : 'Submitted applications',
                      ops.report.applications,
                    ],
                    [
                      ar ? 'المشاركون المسجلون' : 'Enrolled participants',
                      ops.report.participants,
                    ],
                    [
                      ar ? 'قائمة الانتظار' : 'Waitlisted',
                      ops.report.waitlisted,
                    ],
                  ].map(([k, v]) => (
                    <div className="eoa-card" key={k}>
                      <h3>{k}</h3>
                      <strong className="eoa-metric">{v}</strong>
                    </div>
                  ))}
                </div>
                <div className="eoa-two-grid eoa-space">
                  <div className="eoa-card">
                    <h2>{ar ? 'سجل التغييرات' : 'Audit trail'}</h2>
                    {ops.audit.map((a) => (
                      <p key={a.id}>
                        {a.action}{' '}
                        <small>{new Date(a.created_at).toLocaleString()}</small>
                      </p>
                    ))}
                  </div>
                  <div className="eoa-card">
                    <h2>{ar ? 'ملاحظات المشاركين' : 'Participant feedback'}</h2>
                    {ops.feedback.map((f) => (
                      <div key={f.id}>
                        <strong>{f.satisfaction_score}/5</strong>
                        <p>{f.what_improved}</p>
                        <p>{f.what_missing}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function Settings({
  ops,
  lead,
  act,
  busy,
  ar,
}: {
  ops: Operations
  lead: boolean
  act: (fn: () => Promise<unknown>) => Promise<void>
  busy: boolean
  ar: boolean
}) {
  return (
    <form
      className="eoa-card"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const body: Record<string, unknown> = Object.fromEntries(f)
        body.is_open = f.get('is_open') === 'on'
        ;[
          'local_fee_usd',
          'sponsor_contribution_usd',
          'participant_contribution_usd',
          'starts_at',
          'application_deadline',
          'approval_reference',
          'contact_email',
        ].forEach((k) => {
          if (body[k] === '') body[k] = null
        })
        void act(() => api.put('/eoa/operations/settings', body))
      }}
    >
      <h2>{ar ? 'الاعتماد والرسوم والمحتوى' : 'Approval, fees & content'}</h2>
      {!ops.mail_configured && (
        <Notice error>
          {ar
            ? 'خدمة البريد غير مفعلة. لا يمكن فتح التقديم حتى ضبطها.'
            : 'Email delivery is not configured. Intake cannot open until it is configured.'}
        </Notice>
      )}
      <fieldset disabled={!lead || busy}>
        <div className="eoa-two-grid">
          <Field
            label={ar ? 'اعتماد البرنامج المحلي' : 'Local program approval'}
          >
            <select
              name="approval_status"
              defaultValue={String(ops.settings.approval_status)}
            >
              <option value="draft">{ar ? 'مسودة' : 'Draft'}</option>
              <option value="approved">{ar ? 'معتمد' : 'Approved'}</option>
            </select>
          </Field>
          <Field label={ar ? 'مرجع الاعتماد' : 'Approval reference'}>
            <input
              name="approval_reference"
              defaultValue={String(ops.settings.approval_reference ?? '')}
            />
          </Field>
          <Field label={ar ? 'تاريخ البداية' : 'Start date'}>
            <input
              name="starts_at"
              type="date"
              defaultValue={ops.starts_at?.slice(0, 10) ?? ''}
            />
          </Field>
          <Field label={ar ? 'آخر موعد للتقديم' : 'Application deadline'}>
            <input
              name="application_deadline"
              type="date"
              defaultValue={ops.application_deadline?.slice(0, 10) ?? ''}
            />
          </Field>
          <Field label={ar ? 'اعتماد الرسوم المحلية' : 'Local fee publication'}>
            <select
              name="local_fee_status"
              defaultValue={String(ops.settings.local_fee_status)}
            >
              <option value="draft">{ar ? 'مسودة' : 'Draft'}</option>
              <option value="approved">
                {ar ? 'معتمد للنشر' : 'Approved to publish'}
              </option>
            </select>
          </Field>
          {[
            [
              'local_fee_usd',
              ar
                ? 'الرسوم المحلية السنوية بالدولار (فوق 1,750 العالمية)'
                : 'Annual local fees USD (in addition to global US$1,750)',
            ],
            [
              'sponsor_contribution_usd',
              ar ? 'مساهمة الراعي بالدولار' : 'Sponsor contribution USD',
            ],
            [
              'participant_contribution_usd',
              ar ? 'مساهمة المشارك بالدولار' : 'Participant contribution USD',
            ],
          ].map(([key, label]) => (
            <Field label={label} key={key}>
              <input
                name={key}
                type="number"
                min="0"
                step="0.01"
                defaultValue={String(ops.settings[key] ?? '')}
              />
            </Field>
          ))}
          <Field label={ar ? 'بريد التواصل العام' : 'Public contact email'}>
            <input
              name="contact_email"
              type="email"
              defaultValue={String(ops.settings.contact_email ?? '')}
            />
          </Field>
        </div>
        <div className="eoa-two-grid">
          {[
            ['participation_terms_ar', 'شروط المشاركة العربية'],
            ['participation_terms_en', 'Participation terms in English'],
            ['public_message_ar', 'تحديث عام بالعربية'],
            ['public_message_en', 'Public update in English'],
          ].map(([k, l]) => (
            <Field key={k} label={l}>
              <textarea
                name={k}
                rows={4}
                defaultValue={String(ops.settings[k] ?? '')}
              />
            </Field>
          ))}
        </div>
        <h3>{ar ? 'إشعار البيانات المحلي' : 'Local data notice'}</h3>
        <p>
          {ar
            ? 'حدد جهة التحكم والتواصل، ومقدمي الخدمة ومواقع المعالجة، والأساس والغرض، وحقوق صاحب البيانات، وفترات الاحتفاظ والإتلاف قبل الاعتماد.'
            : 'Identify the controller and contact, processors and locations, processing grounds and purposes, data rights, and retention and deletion periods before approval.'}
        </p>
        <Field label={ar ? 'حالة الإشعار' : 'Notice status'}>
          <select
            name="privacy_status"
            defaultValue={String(ops.settings.privacy_status ?? 'draft')}
          >
            <option value="draft">{ar ? 'مسودة' : 'Draft'}</option>
            <option value="approved">{ar ? 'معتمد' : 'Approved'}</option>
          </select>
        </Field>
        {[
          [
            'privacy_approval_reference',
            ar ? 'مرجع اعتماد الإشعار' : 'Notice approval reference',
          ],
          ['privacy_notice_version', ar ? 'نسخة الإشعار' : 'Notice version'],
        ].map(([k, l]) => (
          <Field key={k} label={l}>
            <input name={k} defaultValue={String(ops.settings[k] ?? '')} />
          </Field>
        ))}
        <div className="eoa-two-grid">
          {[
            ['privacy_notice_ar', 'الإشعار المحلي باللغة العربية'],
            ['privacy_notice_en', 'Local notice in English'],
          ].map(([k, l]) => (
            <Field key={k} label={l}>
              <textarea
                name={k}
                rows={8}
                maxLength={8000}
                defaultValue={String(ops.settings[k] ?? '')}
              />
            </Field>
          ))}
        </div>
        <label className="eoa-check">
          <input type="checkbox" name="is_open" defaultChecked={ops.is_open} />
          {ar
            ? 'فتح التقديم المحلي بعد الاعتماد.'
            : 'Open local applications after approval.'}
        </label>
        <button className="eoa-btn" disabled={!lead || busy}>
          {ar ? 'حفظ الإعدادات' : 'Save settings'}
        </button>
      </fieldset>
    </form>
  )
}

function OperationManager({
  ops,
  act,
  busy,
  ar,
}: {
  ops: Operations
  act: (fn: () => Promise<unknown>) => Promise<void>
  busy: boolean
  ar: boolean
}) {
  const [type, setType] = useState<OperationType>('cohorts')
  const [row, setRow] = useState<Row | null>(null)
  const fields: Record<OperationType, [string, string, string][]> = {
    cohorts: [
      ['name', ar ? 'اسم الدفعة' : 'Cohort name', 'text'],
      ['capacity', ar ? 'السعة' : 'Capacity', 'number'],
      ['starts_at', ar ? 'البداية' : 'Start', 'date'],
      ['ends_at', ar ? 'النهاية' : 'End', 'date'],
    ],
    sessions: [
      ['title', ar ? 'عنوان الجلسة' : 'Session title', 'text'],
      ['description', ar ? 'الوصف' : 'Description', 'textarea'],
      [
        'starts_at',
        ar ? 'الموعد (توقيت جهازك)' : 'Time (your device timezone)',
        'datetime-local',
      ],
      [
        'duration_minutes',
        ar ? 'المدة بالدقائق' : 'Duration in minutes',
        'number',
      ],
      ['location', ar ? 'المكان' : 'Location', 'text'],
      ['online_link', ar ? 'رابط اللقاء' : 'Meeting link', 'url'],
    ],
    groups: [
      ['name', ar ? 'اسم المجموعة' : 'Group name', 'text'],
      ['meeting_link', ar ? 'رابط اللقاء' : 'Meeting link', 'url'],
    ],
    resources: [
      ['title', ar ? 'العنوان' : 'Title', 'text'],
      ['description', ar ? 'الوصف' : 'Description', 'textarea'],
      ['url', ar ? 'رابط آمن للمادة' : 'Secure material URL', 'url'],
      ['category', ar ? 'التصنيف' : 'Category', 'text'],
    ],
    announcements: [
      ['subject', ar ? 'الموضوع' : 'Subject', 'text'],
      ['body', ar ? 'الإعلان' : 'Announcement', 'textarea'],
    ],
  }
  const rows = ops[type]
  return (
    <>
      <div className="eoa-tabs">
        {(Object.keys(operationTitles) as OperationType[]).map((t) => (
          <button
            className={type === t ? 'active' : ''}
            key={t}
            onClick={() => {
              setType(t)
              setRow(null)
            }}
          >
            {operationTitles[t][ar ? 0 : 1]}
          </button>
        ))}
      </div>
      <div className="eoa-two-grid">
        <div className="eoa-card">
          <h2>{operationTitles[type][ar ? 0 : 1]}</h2>
          {rows.map((r) => (
            <button
              className="eoa-app-row"
              key={String(r.id)}
              onClick={() => setRow(r)}
            >
              <strong>{r.name ?? r.title ?? r.subject}</strong>
              <span>{r.status ?? r.category}</span>
            </button>
          ))}
          {!rows.length && (
            <p>{ar ? 'لا توجد عناصر بعد.' : 'No entries yet.'}</p>
          )}
          <button className="eoa-text-link" onClick={() => setRow(null)}>
            + {ar ? 'عنصر جديد' : 'New entry'}
          </button>
        </div>
        <form
          className="eoa-card"
          key={type + String(row?.id ?? 'new')}
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const body: Record<string, unknown> = {}
            for (const [k, v] of f.entries()) body[k] = v === '' ? null : v
            if (body.starts_at && type === 'sessions')
              body.starts_at = new Date(String(body.starts_at)).toISOString()
            for (const k of [
              'cohort_id',
              'coach_id',
              'capacity',
              'duration_minutes',
            ])
              if (body[k]) body[k] = Number(body[k])
            if (type === 'resources')
              body.is_archived = f.get('is_archived') === 'on'
            void act(async () => {
              if (row)
                await api.patch(
                  `/eoa/operations/update/${type}/${row.id}`,
                  body,
                )
              else await api.post(`/eoa/operations/create/${type}`, body)
              setRow(null)
            })
          }}
        >
          <h2>{row ? (ar ? 'تعديل' : 'Edit') : ar ? 'إضافة' : 'Create'}</h2>
          {fields[type].map(([key, label, inputType]) => (
            <Field key={key} label={label}>
              {inputType === 'textarea' ? (
                <textarea
                  name={key}
                  defaultValue={String(row?.[key] ?? '')}
                  maxLength={key === 'body' ? 8000 : 2000}
                />
              ) : (
                <input
                  name={key}
                  type={inputType}
                  min={inputType === 'number' ? 1 : undefined}
                  defaultValue={
                    inputType === 'datetime-local'
                      ? localDateInput(row?.[key])
                      : String(row?.[key] ?? '').slice(
                          0,
                          inputType === 'date' ? 10 : undefined,
                        )
                  }
                  required={
                    [
                      'name',
                      'title',
                      'capacity',
                      'duration_minutes',
                      'subject',
                      'url',
                    ].includes(key) ||
                    (type === 'sessions' && key === 'starts_at')
                  }
                />
              )}
            </Field>
          ))}
          {type !== 'cohorts' && (
            <Field
              label={
                ar
                  ? 'الدفعة (فارغ = كامل البرنامج)'
                  : 'Cohort (blank = whole program)'
              }
            >
              <select
                name="cohort_id"
                defaultValue={String(row?.cohort_id ?? '')}
              >
                <option value="">—</option>
                {ops.cohorts.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {type === 'sessions' && (
            <Field label={ar ? 'نوع الجلسة' : 'Session type'}>
              <select
                name="session_type"
                defaultValue={String(row?.session_type ?? 'learning_day')}
              >
                <option value="learning_day">
                  {ar ? 'يوم تعلم' : 'Learning day'}
                </option>
                <option value="accountability">
                  {ar ? 'مساءلة' : 'Accountability'}
                </option>
                <option value="mentoring">{ar ? 'إرشاد' : 'Mentoring'}</option>
              </select>
            </Field>
          )}
          {type === 'groups' && (
            <Field label={ar ? 'المدرب' : 'Coach'}>
              <select
                name="coach_id"
                defaultValue={String(row?.coach_id ?? '')}
              >
                <option value="">—</option>
                {ops.people
                  .filter((p) => p.roles.includes('eoa_coach'))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          {(type === 'cohorts' || type === 'sessions') && (
            <Field label={ar ? 'الحالة' : 'Status'}>
              <select
                name="status"
                defaultValue={String(
                  row?.status ?? (type === 'cohorts' ? 'forming' : 'scheduled'),
                )}
              >
                {(type === 'cohorts'
                  ? ['forming', 'active', 'completed', 'cancelled']
                  : ['scheduled', 'completed', 'cancelled']
                ).map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s, ar)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {type === 'resources' && (
            <label className="eoa-check">
              <input
                name="is_archived"
                type="checkbox"
                defaultChecked={Boolean(row?.is_archived)}
              />
              {ar ? 'أرشفة المادة' : 'Archive material'}
            </label>
          )}
          <button className="eoa-btn" disabled={busy}>
            {ar ? 'حفظ' : 'Save'}
          </button>
        </form>
      </div>
    </>
  )
}
