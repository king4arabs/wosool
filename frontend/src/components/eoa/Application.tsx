'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import {
  errorText,
  statusLabel,
  type ApplicationFields,
  type EoaApplication,
} from '@/lib/eoa'
import { Field, Notice, useEoaProgram } from './Shared'

export function Application() {
  const { user } = useAuth()
  return <ApplicationSession key={user?.id ?? 'guest'} />
}

function ApplicationSession() {
  const { user, isLoading } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program, failed, retry: retryProgram } = useEoaProgram()
  const trackParam = useSearchParams().get('track')
  const [application, setApplication] = useState<EoaApplication | null>(null)
  const [fields, setFields] = useState<ApplicationFields>({
    preferred_track_id: trackParam ?? '',
    country: 'Saudi Arabia',
    revenue_currency: 'USD',
    revenue_year: new Date().getFullYear() - 1,
  })
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    if (!user) return
    try {
      const r = await api.get<{ data: EoaApplication | null }>(
        '/eoa/application',
      )
      setApplication(r.data)
      if (r.data) setFields(r.data.fields)
      setDirty(false)
      setLoaded(true)
    } catch (e) {
      setError(errorText(e))
    }
  }, [user])
  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const editable =
    !application ||
    ['draft', 'information_requested'].includes(application.status)
  const change = (key: keyof ApplicationFields, value: string | boolean) => {
    setFields((f) => ({ ...f, [key]: value }))
    setDirty(true)
    setNotice('')
  }
  async function save() {
    const r = await api.put<{ data: EoaApplication }>('/eoa/application', {
      ...fields,
      locale,
      version: application?.version ?? 0,
    })
    setApplication(r.data)
    setDirty(false)
    setNotice(ar ? 'تم حفظ المسودة في حسابك.' : 'Draft saved to your account.')
    return r.data
  }
  async function act(fn: () => Promise<void>) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return
    await act(async () => {
      await save()
      const form = new FormData()
      form.append('document', file)
      const r = await api.post<{ data: EoaApplication }>('/eoa/documents', form)
      setApplication(r.data)
      setNotice(ar ? 'تم حفظ المستند بشكل خاص.' : 'Document saved privately.')
    })
  }
  const steps = ar
    ? ['المؤسس', 'الشركة والإيراد', 'الأهداف والمستندات', 'مراجعة وإرسال']
    : ['Founder', 'Company & revenue', 'Goals & documents', 'Review & submit']
  const labels: Partial<Record<keyof ApplicationFields, string>> = {
    founder_name: ar ? 'اسم المؤسس' : 'Founder name',
    phone: ar ? 'رقم الهاتف' : 'Phone',
    founder_role: ar ? 'دورك' : 'Your role',
    company_name: ar ? 'اسم الشركة' : 'Company name',
    company_website: ar ? 'الموقع الرسمي (اختياري)' : 'Website (optional)',
    city: ar ? 'المدينة' : 'City',
    country: ar ? 'الدولة' : 'Country',
    sector: ar ? 'القطاع' : 'Sector',
    stage: ar ? 'مرحلة الشركة' : 'Company maturity',
    revenue_amount: ar ? 'الإيراد السنوي الإجمالي' : 'Gross annual revenue',
    revenue_currency: ar ? 'عملة الإيراد' : 'Revenue currency',
    revenue_year: ar ? 'سنة التقرير' : 'Reporting year',
    growth_objectives: ar
      ? 'أهداف النمو (30 حرفاً على الأقل)'
      : 'Growth objectives (at least 30 characters)',
    support_needs: ar ? 'الدعم الذي تحتاجه' : 'Support needs',
  }
  const input = (key: keyof ApplicationFields, type = 'text') => (
    <Field key={key} label={labels[key] ?? key}>
      <input
        type={type}
        value={String(fields[key] ?? '')}
        onChange={(e) => change(key, e.target.value)}
        maxLength={key === 'phone' ? 40 : 255}
        {...(type === 'number'
          ? {
              min: key === 'revenue_year' ? 2000 : 0,
              max:
                key === 'revenue_year'
                  ? new Date().getFullYear()
                  : 999999999999,
              step: key === 'revenue_amount' ? '0.01' : '1',
            }
          : {})}
      />
    </Field>
  )
  return (
    <section className="eoa-section">
      <div className="eoa-container eoa-form-width">
        <div className="eoa-page-heading">
          <span className="eoa-eyebrow">EO RIYADH ACCELERATOR</span>
          <h1>{ar ? 'طلب الالتحاق' : 'Your application'}</h1>
          <p>
            {ar
              ? 'احفظ في كل خطوة، ثم عد لاستكمال طلبك من أي جهاز.'
              : 'Save each step and return to your application from any device.'}
          </p>
        </div>
        {(isLoading || (user && !loaded)) && !error && (
          <Notice>{ar ? 'جارٍ التحميل…' : 'Loading…'}</Notice>
        )}
        {!isLoading && !user && (
          <div className="eoa-card">
            <h2>{ar ? 'ابدأ بحسابك' : 'Start with your account'}</h2>
            <p>
              {ar
                ? 'أنشئ حساباً ووثّق بريدك قبل تجهيز الطلب.'
                : 'Create an account and verify your email before preparing an application.'}
            </p>
            <Link className="eoa-btn" href="/EOA/account">
              {ar ? 'إنشاء حساب أو الدخول' : 'Create account or sign in'}
            </Link>
          </div>
        )}
        {user && !user.email_verified_at && (
          <Notice>
            <Link href="/EOA/account">
              {ar
                ? 'يرجى توثيق بريدك من صفحة الحساب.'
                : 'Verify your email from your account page.'}
            </Link>
          </Notice>
        )}
        {error && (
          <Notice error>
            {error}{' '}
            <button
              className="eoa-text-link"
              type="button"
              onClick={() => void load()}
            >
              {ar
                ? 'إعادة تحميل آخر مسودة محفوظة'
                : 'Reload latest saved draft'}
            </button>
          </Notice>
        )}
        {notice && <Notice>{notice}</Notice>}
        {failed && (
          <Notice error>
            {ar
              ? 'تعذر تحميل حالة البرنامج. لا يمكن الإرسال حالياً.'
              : 'Program status could not be loaded. Submission is unavailable.'}
            <button type="button" className="eoa-text-link" onClick={retryProgram}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>
          </Notice>
        )}
        {user?.email_verified_at &&
          loaded &&
          program &&
          !program.data_collection_open && (
            <Notice>
              {ar
                ? 'التقديم غير متاح حالياً. تابع الإعلان عن فتح التسجيل أو تواصل مع فريق البرنامج.'
                : 'Applications are not available yet. Follow the intake announcement or contact the program team.'}{' '}
              <Link href="/EOA/contact" className="eoa-text-link">
                {ar ? 'تواصل معنا' : 'Contact us'}
              </Link>
            </Notice>
          )}
        {user?.email_verified_at &&
          loaded &&
          (program?.data_collection_open || !editable) && (
            <>
              {!program?.applications_open && (
                <Notice>
                  {ar
                    ? 'التقديم المحلي لم يفتح بعد. يمكنك تجهيز المسودة وحفظها؛ سيُتاح الإرسال بعد اعتماد البرنامج.'
                    : 'Local intake has not opened yet. You can prepare and save your draft; submission becomes available after program approval.'}
                </Notice>
              )}
              {application && (
                <div className="eoa-actions">
                  <span className="eoa-badge">
                    {statusLabel(application.status, ar)}
                  </span>
                  <span className="eoa-muted">
                    {ar ? 'آخر حفظ' : 'Last saved'}:{' '}
                    {new Date(application.updated_at).toLocaleString(
                      ar ? 'ar-SA' : 'en-GB',
                      { timeZone: 'Asia/Riyadh' },
                    )}
                  </span>
                </div>
              )}
              {application?.decision_reason && (
                <Notice>{application.decision_reason}</Notice>
              )}
              {!editable ? (
                <div className="eoa-card eoa-space">
                  <h2>
                    {ar
                      ? 'طلبك لدى فريق البرنامج'
                      : 'Your application is with the program team'}
                  </h2>
                  <p>
                    {ar
                      ? 'يمكنك متابعة القرارات وطلبات المعلومات في حسابك.'
                      : 'Follow decisions and information requests in your account.'}
                  </p>
                  <Link href="/EOA/account" className="eoa-btn">
                    {ar ? 'العودة إلى حسابي' : 'Back to my account'}
                  </Link>
                </div>
              ) : (
                <>
                  <ol className="eoa-stepper">
                    {steps.map((s, i) => (
                      <li
                        key={s}
                        aria-current={step === i ? 'step' : undefined}
                      >
                        <span>{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <form
                    className="eoa-card"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void act(async () => {
                        const saved = await save()
                        const r = await api.post<{ data: EoaApplication }>(
                          '/eoa/application/submit',
                          { version: saved.version },
                        )
                        setApplication(r.data)
                        setNotice(
                          ar
                            ? 'تم إرسال طلبك. تابع الحالة من حسابك.'
                            : 'Application submitted. Follow its status in your account.',
                        )
                      })
                    }}
                  >
                    <fieldset disabled={busy}>
                      <legend className="eoa-form-title">{steps[step]}</legend>
                      {step === 0 && (
                        <div className="eoa-two-grid">
                          <Field
                            label={ar ? 'المسار المفضل' : 'Preferred track'}
                          >
                            <select
                              value={fields.preferred_track_id ?? ''}
                              onChange={(e) =>
                                change('preferred_track_id', e.target.value)
                              }
                            >
                              <option value="">
                                {ar ? 'اختر المسار' : 'Select track'}
                              </option>
                              {program?.tracks?.map((track) => (
                                <option value={track.id} key={track.id}>
                                  {ar ? track.name_ar : track.name_en}
                                </option>
                              ))}
                            </select>
                          </Field>
                          {input('founder_name')}
                          {input('phone', 'tel')}
                          <Field label={labels.founder_role!}>
                            <select
                              value={fields.founder_role ?? ''}
                              onChange={(e) =>
                                change('founder_role', e.target.value)
                              }
                            >
                              <option value="">{ar ? 'اختر' : 'Select'}</option>
                              {[
                                ['founder', ar ? 'مؤسس' : 'Founder'],
                                ['cofounder', ar ? 'شريك مؤسس' : 'Co-founder'],
                                ['owner', ar ? 'مالك' : 'Owner'],
                              ].map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      )}
                      {step === 1 && (
                        <div className="eoa-two-grid">
                          {input('company_name')}
                          {input('company_website', 'url')}
                          {input('city')}
                          {input('country')}
                          {input('sector')}
                          <Field label={labels.stage!}>
                            <select
                              value={fields.stage ?? ''}
                              onChange={(e) => change('stage', e.target.value)}
                            >
                              <option value="">{ar ? 'اختر' : 'Select'}</option>
                              {[
                                ['operating', ar ? 'قائمة' : 'Operating'],
                                ['growing', ar ? 'نامية' : 'Growing'],
                                ['scaling', ar ? 'تتوسع' : 'Scaling'],
                              ].map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </Field>
                          {input('revenue_amount', 'number')}
                          <Field label={labels.revenue_currency!}>
                            <select
                              value={fields.revenue_currency ?? 'USD'}
                              onChange={(e) =>
                                change('revenue_currency', e.target.value)
                              }
                            >
                              <option>USD</option>
                              <option>SAR</option>
                            </select>
                          </Field>
                          {input('revenue_year', 'number')}
                        </div>
                      )}
                      {step === 2 && (
                        <>
                          <Field label={labels.growth_objectives!}>
                            <textarea
                              rows={4}
                              maxLength={4000}
                              value={fields.growth_objectives ?? ''}
                              onChange={(e) =>
                                change('growth_objectives', e.target.value)
                              }
                            />
                          </Field>
                          <Field label={labels.support_needs!}>
                            <textarea
                              rows={3}
                              maxLength={4000}
                              value={fields.support_needs ?? ''}
                              onChange={(e) =>
                                change('support_needs', e.target.value)
                              }
                            />
                          </Field>
                          <Field
                            label={
                              ar
                                ? 'مستند إثبات الإيراد (PDF، PNG، JPG؛ حتى 10MB)'
                                : 'Revenue evidence (PDF, PNG, JPG; up to 10MB)'
                            }
                          >
                            <input
                              type="file"
                              accept="application/pdf,image/png,image/jpeg"
                              onChange={(e) => {
                                void upload(e.target.files?.[0])
                                e.target.value = ''
                              }}
                            />
                          </Field>
                          <p className="eoa-muted">
                            {ar
                              ? 'أرفق فقط البيانات اللازمة لمراجعة الإيراد. لا ترفق كلمات مرور أو بيانات بطاقات. حتى خمسة مستندات.'
                              : 'Upload only the evidence needed for revenue review. Do not include passwords or card details. Maximum five documents.'}
                          </p>
                          {application?.documents.map((d) => (
                            <div className="eoa-document" key={d.id}>
                              <a href={`/api/v1/eoa/documents/${d.id}`}>
                                {d.name} ↧
                              </a>
                              <span>{Math.ceil(d.size / 1024)} KB</span>
                              <button
                                type="button"
                                className="eoa-text-link"
                                onClick={() =>
                                  void act(async () => {
                                    await api.delete(`/eoa/documents/${d.id}`)
                                    setApplication((a) =>
                                      a
                                        ? {
                                            ...a,
                                            documents: a.documents.filter(
                                              (x) => x.id !== d.id,
                                            ),
                                          }
                                        : a,
                                    )
                                  })
                                }
                              >
                                {ar ? 'حذف' : 'Remove'}
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <dl className="eoa-review">
                            <div>
                              <dt>
                                {ar ? 'المسار المفضل' : 'Preferred track'}
                              </dt>
                              <dd>
                                {program?.tracks?.find(
                                  (track) =>
                                    track.id ===
                                    Number(fields.preferred_track_id),
                                )?.[ar ? 'name_ar' : 'name_en'] ?? '—'}
                              </dd>
                            </div>
                            {Object.entries(labels).map(([k, label]) => (
                              <div key={k}>
                                <dt>{label}</dt>
                                <dd>
                                  {String(
                                    fields[k as keyof ApplicationFields] ?? '—',
                                  )}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          <p>
                            {ar ? 'المستندات المرفقة' : 'Supporting documents'}:{' '}
                            {application?.documents.length ?? 0}
                          </p>
                          {(
                            [
                              [
                                'privacy_consent',
                                ar
                                  ? 'أوافق على معالجة بيانات الطلب وفق سياسة الخصوصية.'
                                  : 'I consent to application data processing under the privacy policy.',
                              ],
                              [
                                'accuracy_confirmed',
                                ar
                                  ? 'أؤكد صحة البيانات وأفهم أن التقديم لا يضمن القبول أو عضوية EO.'
                                  : 'I confirm the information is accurate and understand that applying does not guarantee admission or EO membership.',
                              ],
                              [
                                'attendance_commitment',
                                ar
                                  ? 'ألتزم بالمشاركة في أيام التعلم ومجموعات المساءلة وتطبيق التعلم في شركتي.'
                                  : 'I commit to learning days, accountability meetings and applying the learning in my company.',
                              ],
                            ] as [keyof ApplicationFields, string][]
                          ).map(([k, l]) => (
                            <label className="eoa-check" key={k}>
                              <input
                                type="checkbox"
                                checked={Boolean(fields[k])}
                                onChange={(e) => change(k, e.target.checked)}
                              />
                              {l}
                            </label>
                          ))}
                          <Link href="/EOA/privacy" className="eoa-text-link">
                            {ar ? 'سياسة الخصوصية' : 'Privacy policy'}
                          </Link>
                        </>
                      )}
                    </fieldset>
                    <div className="eoa-actions eoa-space">
                      {step > 0 && (
                        <button
                          className="eoa-btn eoa-btn-secondary"
                          type="button"
                          disabled={busy}
                          onClick={() => setStep((s) => s - 1)}
                        >
                          {ar ? 'السابق' : 'Back'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="eoa-btn eoa-btn-secondary"
                        disabled={busy}
                        onClick={() =>
                          void act(async () => {
                            await save()
                          })
                        }
                      >
                        {busy
                          ? ar
                            ? 'جارٍ الحفظ…'
                            : 'Saving…'
                          : ar
                            ? 'حفظ المسودة'
                            : 'Save draft'}
                      </button>
                      {step < 3 ? (
                        <button
                          className="eoa-btn"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void act(async () => {
                              await save()
                              setStep((s) => s + 1)
                            })
                          }
                        >
                          {ar ? 'حفظ ومتابعة' : 'Save & continue'}
                        </button>
                      ) : (
                        <button
                          className="eoa-btn"
                          disabled={busy || !program?.applications_open}
                        >
                          {ar ? 'إرسال الطلب للمراجعة' : 'Submit for review'}
                        </button>
                      )}
                    </div>
                    <p className="eoa-muted" aria-live="polite">
                      {dirty
                        ? ar
                          ? 'توجد تغييرات لم تُحفظ.'
                          : 'You have unsaved changes.'
                        : ar
                          ? 'المسودة محفوظة عند آخر عملية حفظ.'
                          : 'Your latest saved draft is stored in your account.'}
                    </p>
                  </form>
                </>
              )}
            </>
          )}
      </div>
    </section>
  )
}
