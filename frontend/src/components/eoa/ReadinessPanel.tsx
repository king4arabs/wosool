'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { errorText } from '@/lib/eoa'
import { Field, Notice } from './Shared'

type Board = {
  role: string
  name_en: string
  name_ar: string
  reference: string
}
type Coach = {
  user_id: number
  eo_membership_reference: string
  training_reference: string
  trained_at: string
  term_start: string
  term_end: string
}
type RecordData = {
  version: number
  board: Board[]
  coaches: Coach[]
  delivery_ready: boolean
  chapter_approval: string
  regional_approval: string
  manager: string
  trainer_confirmation: string
  mail_delivery_verified: string
  bookkeeping: string
  annual_plan: string
}
export function ReadinessPanel({
  ar,
  people,
}: {
  ar: boolean
  people: { id: number; name: string; roles: string[] }[]
}) {
  const [data, setData] = useState<RecordData | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false)
  useEffect(() => {
    let active = true
    api
      .get<{ data: RecordData }>('/eoa/operations/readiness')
      .then((r) => {
        if (active) setData(r.data)
      })
      .catch((e) => {
        if (active) setError(errorText(e))
      })
    return () => {
      active = false
    }
  }, [])
  if (!data)
    return (
      <Notice error={!!error}>
        {error || (ar ? 'جارٍ التحميل…' : 'Loading…')}
      </Notice>
    )
  const change = (key: string, value: unknown) => {
    setSaved(false)
    setData({ ...data, [key]: value })
  }
  const boardRoles = [
    ['chair', 'الرئيس والمساءلة', 'Chair & accountability'],
    ['learning', 'التعلم', 'Learning'],
    [
      'membership',
      'الاستقطاب والعضوية والتواصل',
      'Recruitment, membership & communication',
    ],
  ]
  const coachUsers = people.filter((p) => p.roles.includes('eoa_coach'))
  return (
    <form
      className="eoa-card eoa-space"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        setSaved(false)
        try {
          const r = await api.put<{ version: number }>(
            '/eoa/operations/readiness',
            data,
          )
          setData({ ...data, version: r.version })
          setSaved(true)
        } catch (e) {
          setError(errorText(e))
        } finally {
          setBusy(false)
        }
      }}
    >
      <h2>
        {ar ? 'جاهزية الإطلاق والتعيينات' : 'Launch readiness & appointments'}
      </h2>
      <p>
        {ar
          ? 'هذه مساحة قيادة داخلية. لا تنشر أسماء أعضاء المجلس إلا مع مرجع تعيين مؤكد. لا يؤدي الحفظ إلى منح صلاحيات حسابات أو فتح القبول.'
          : 'Internal leadership workspace. Board names publish only with a confirmed appointment reference. Saving does not grant account roles or open intake.'}
      </p>
      {error && <Notice error>{error}</Notice>}
      {saved && <Notice>{ar ? 'تم الحفظ.' : 'Saved.'}</Notice>}
      <fieldset disabled={busy}>
        <h3>{ar ? 'مجلس EOA' : 'EOA Board'}</h3>
        <div className="eoa-three-grid">
          {boardRoles.map(([role, arabic, english]) => {
            const row = data.board.find((b) => b.role === role) ?? {
              role,
              name_en: '',
              name_ar: '',
              reference: '',
            }
            return (
              <div className="eoa-card" key={role}>
                <h4>{ar ? arabic : english}</h4>
                {[
                  ['name_ar', 'الاسم بالعربية', 'Arabic name'],
                  ['name_en', 'الاسم بالإنجليزية', 'English name'],
                  [
                    'reference',
                    'مرجع التعيين الداخلي',
                    'Internal appointment reference',
                  ],
                ].map(([key, a, en]) => (
                  <Field key={key} label={ar ? a : en}>
                    <input
                      maxLength={key === 'reference' ? 500 : 200}
                      value={row[key as keyof Board]}
                      onChange={(e) =>
                        change('board', [
                          ...data.board.filter((b) => b.role !== role),
                          { ...row, [key]: e.target.value },
                        ])
                      }
                    />
                  </Field>
                ))}
              </div>
            )
          })}
        </div>
        <h3>{ar ? 'مدربو المساءلة' : 'Accountability coaches'}</h3>
        <p>
          {ar
            ? 'تدريب قبل بدء المهام، وعضوية EO سارية، ومدة تكليف 12 شهراً؛ يجري التحقق قبل إسناد مجموعة.'
            : 'Verify active EO membership, training before service and a 12-month term. These records are checked before group assignment.'}
        </p>
        {coachUsers.map((person) => {
          const row = data.coaches.find((c) => c.user_id === person.id) ?? {
            user_id: person.id,
            eo_membership_reference: '',
            training_reference: '',
            trained_at: '',
            term_start: '',
            term_end: '',
          }
          return (
            <div className="eoa-card eoa-space" key={person.id}>
              <h4>{person.name}</h4>
              <div className="eoa-three-grid">
                {[
                  [
                    'eo_membership_reference',
                    'مرجع عضوية EO',
                    'EO membership reference',
                    'text',
                  ],
                  [
                    'training_reference',
                    'مرجع التدريب',
                    'Training reference',
                    'text',
                  ],
                  ['trained_at', 'تاريخ التدريب', 'Training date', 'date'],
                  ['term_start', 'بداية التكليف', 'Term start', 'date'],
                  ['term_end', 'نهاية التكليف', 'Term end', 'date'],
                ].map(([key, a, en, type]) => (
                  <Field key={key} label={ar ? a : en}>
                    <input
                      type={type}
                      maxLength={500}
                      value={String(row[key as keyof Coach])}
                      onChange={(e) =>
                        change('coaches', [
                          ...data.coaches.filter(
                            (c) => c.user_id !== person.id,
                          ),
                          { ...row, [key]: e.target.value },
                        ])
                      }
                    />
                  </Field>
                ))}
              </div>
            </div>
          )
        })}
        {!coachUsers.length && (
          <p>
            {ar
              ? 'أضف حسابات المدربين الموثقة من إدارة صلاحيات الفريق أولاً.'
              : 'Add verified coach accounts through Team access first.'}
          </p>
        )}
        <h3>{ar ? 'المتطلبات التشغيلية' : 'Operating requirements'}</h3>
        <div className="eoa-two-grid">
          {[
            ['chapter_approval', 'اعتماد الفرع', 'Chapter approval'],
            [
              'regional_approval',
              'اعتماد المجلس الإقليمي',
              'Regional approval',
            ],
            ['manager', 'مدير البرنامج', 'Program manager'],
            [
              'trainer_confirmation',
              'تأكيد المدرب والموعد',
              'Trainer and date confirmation',
            ],
            [
              'mail_delivery_verified',
              'دليل وصول البريد التجريبي',
              'Verified test-email delivery',
            ],
            [
              'bookkeeping',
              'الحساب المستقل أو سجل EOA',
              'Separate EOA account or bookkeeping',
            ],
            [
              'annual_plan',
              'مرجع خطة العامين والتقويم السنوي',
              'Two-year growth plan and annual calendar',
            ],
          ].map(([key, a, en]) => (
            <Field key={key} label={ar ? a : en}>
              <input
                maxLength={key === 'annual_plan' ? 1000 : 500}
                value={String(data[key as keyof RecordData] ?? '')}
                onChange={(e) => change(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
        <label className="eoa-check">
          <input
            type="checkbox"
            checked={data.delivery_ready}
            onChange={(e) => change('delivery_ready', e.target.checked)}
          />
          {ar
            ? 'تأكدت القيادة من جاهزية تقديم قيمة فورية للمشاركين.'
            : 'Leadership has confirmed readiness to deliver immediate participant value.'}
        </label>
        <button className="eoa-btn" disabled={busy}>
          {ar ? 'حفظ الجاهزية' : 'Save readiness'}
        </button>
      </fieldset>
    </form>
  )
}

export function PrivateFinancePanel({ ar }: { ar: boolean }) {
  const [data, setData] = useState<Record<
      string,
      string | number | null
    > | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false)
  const load = () =>
    api
      .get<{ data: Record<string, string | number | null> }>(
        '/eoa/operations/finance',
      )
      .then((r) => setData(r.data))
  useEffect(() => {
    let active = true
    api
      .get<{ data: Record<string, string | number | null> }>(
        '/eoa/operations/finance',
      )
      .then((r) => {
        if (active) setData(r.data)
      })
      .catch((e) => {
        if (active) setError(errorText(e))
      })
    return () => {
      active = false
    }
  }, [])
  if (!data)
    return (
      <Notice error={!!error}>
        {error || (ar ? 'جارٍ التحميل…' : 'Loading…')}
      </Notice>
    )
  const fields = [
    [
      'global_dues_new',
      'الرسوم العالمية المحصلة للجدد',
      'Global dues collected — new participants',
    ],
    [
      'global_dues_renewed',
      'الرسوم العالمية المحصلة للتجديد',
      'Global dues collected — renewals',
    ],
    ['sponsorship_received', 'الرعايات المحصلة', 'Sponsorship received'],
    ['local_dues_received', 'الرسوم المحلية المحصلة', 'Local dues received'],
    ['grant_received', 'المنحة المستلمة', 'Grant received'],
    ['payback_received', 'المبلغ المرتجع المستلم', 'Dues return received'],
    ['expenses_budget', 'المصروفات المعتمدة', 'Budgeted expenses'],
    ['expenses_actual', 'المصروفات الفعلية', 'Actual expenses'],
  ]
  return (
    <form
      className="eoa-card eoa-space"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        setSaved(false)
        try {
          const body = Object.fromEntries(
            fields.map(([k]) => [k, Number(data[k] ?? 0)]),
          )
          await api.put('/eoa/operations/finance', {
            ...body,
            version: data.version,
            hub_created_on: data.hub_created_on || null,
            reference: data.reference,
          })
          await load()
          setSaved(true)
        } catch (e) {
          setError(errorText(e))
        } finally {
          setBusy(false)
        }
      }}
    >
      <h2>{ar ? 'مالية EOA الداخلية' : 'Internal EOA finance'}</h2>
      <p>
        {ar
          ? 'للقائد ومدير المنصة فقط. لا تظهر هذه البيانات أو المنح في الموقع العام أو حسابات المشاركين. التقديرات ليست تأكيد صرف.'
          : 'For program leadership and platform administrators only. These records and grants are excluded from public pages and participant accounts. Estimates do not confirm disbursement.'}
      </p>
      {error && <Notice error>{error}</Notice>}
      {saved && <Notice>{ar ? 'تم الحفظ.' : 'Saved.'}</Notice>}
      <div className="eoa-three-grid">
        {[
          [
            'potential_grant',
            'الاستحقاق المحتمل وفق الشروط',
            'Potential grant subject to conditions',
          ],
          [
            'expected_payback_new',
            'المرتجع المتوقع للجدد — ربع سنوي',
            'Expected new-participant return — quarterly',
          ],
          [
            'expected_payback_renewed',
            'المرتجع المتوقع للتجديد — سنوي',
            'Expected renewal return — annually',
          ],
          ['budget_variance', 'فرق الميزانية', 'Budget variance'],
        ].map(([k, a, en]) => (
          <div className="eoa-card" key={k}>
            <h3>{ar ? a : en}</h3>
            <strong>
              <bdi>US${Number(data[k] ?? 0).toLocaleString('en-US')}</bdi>
            </strong>
          </div>
        ))}
      </div>
      <fieldset disabled={busy}>
        <Field
          label={
            ar
              ? 'تاريخ إنشاء البرنامج على EO Hub'
              : 'EO Hub program creation date'
          }
        >
          <input
            type="date"
            value={String(data.hub_created_on ?? '')}
            onChange={(e) =>
              setData({ ...data, hub_created_on: e.target.value })
            }
          />
        </Field>
        <div className="eoa-two-grid">
          {fields.map(([k, a, en]) => (
            <Field key={k} label={ar ? a : en}>
              <input
                type="number"
                min="0"
                max="100000000"
                step="0.01"
                value={Number(data[k] ?? 0)}
                onChange={(e) =>
                  setData({ ...data, [k]: Number(e.target.value) })
                }
              />
            </Field>
          ))}
        </div>
        <Field
          label={
            ar ? 'مرجع الفترة والمطابقة' : 'Period and reconciliation reference'
          }
        >
          <input
            required
            maxLength={1000}
            value={String(data.reference ?? '')}
            onChange={(e) => setData({ ...data, reference: e.target.value })}
          />
        </Field>
        <button className="eoa-btn" disabled={busy}>
          {ar ? 'حفظ السجل الداخلي' : 'Save internal record'}
        </button>
      </fieldset>
    </form>
  )
}
