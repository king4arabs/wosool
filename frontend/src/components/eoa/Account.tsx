'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import {
  errorText,
  statusLabel,
  type EoaApplication,
  type Participant,
} from '@/lib/eoa'
import { Field, Notice, useEoaProgram } from './Shared'
import { ParticipantWorkspace } from './Participant'

type AccountData = {
  data: Participant | null
  notifications: { id: number; message: string; read_at: string | null }[]
}
export function Account() {
  const { user } = useAuth()
  return <AccountSession key={user?.id ?? 'guest'} />
}

function AccountSession() {
  const { user, isLoading, login, refresh, logout } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [application, setApplication] = useState<EoaApplication | null>(null)
  const [account, setAccount] = useState<AccountData | null>(null)
  const load = useCallback(async () => {
    if (!user) return
    try {
      const [a, p] = await Promise.all([
        api.get<{ data: EoaApplication | null }>('/eoa/application'),
        api.get<AccountData>('/eoa/participant'),
      ])
      setApplication(a.data)
      setAccount(p)
    } catch (e) {
      setError(errorText(e))
    }
  }, [user])
  useEffect(() => {
    void load()
  }, [load])
  async function authenticate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const f = new FormData(e.currentTarget)
    try {
      if (mode === 'login')
        await login(String(f.get('email')), String(f.get('password')))
      else {
        const r = await api.post<{ email_queued: boolean }>(
          '/eoa/auth/register',
          {
            name: f.get('name'),
            email: f.get('email'),
            password: f.get('password'),
            password_confirmation: f.get('password_confirmation'),
            privacy_consent: f.get('consent') === 'on',
            website_confirm: f.get('website_confirm'),
          },
        )
        setNotice(
          r.email_queued
            ? ar
              ? 'تحقق من بريدك لتوثيق حسابك.'
              : 'Check your email to verify your account.'
            : ar
              ? 'تم إنشاء الحساب. خدمة البريد غير مفعلة حالياً؛ تواصل مع فريق البرنامج لاستكمال التوثيق.'
              : 'Account created. Email delivery is not configured yet; contact the program team to complete verification.',
        )
        await refresh()
      }
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function resend() {
    setBusy(true)
    setError('')
    try {
      const r = await api.post<{ email_queued: boolean }>('/eoa/auth/resend')
      setNotice(
        r.email_queued
          ? ar
            ? 'تمت جدولة رسالة التوثيق.'
            : 'Verification email queued.'
          : ar
            ? 'خدمة البريد غير مفعلة حالياً.'
            : 'Email delivery is not configured yet.',
      )
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  if (isLoading)
    return (
      <div className="eoa-container eoa-section">
        <Notice>{ar ? 'جارٍ تحميل حسابك…' : 'Loading your account…'}</Notice>
      </div>
    )
  return (
    <section className="eoa-section">
      <div className="eoa-container">
        <div className="eoa-page-heading">
          <span className="eoa-eyebrow">
            {ar ? 'رحلتك نحو النمو' : 'YOUR GROWTH JOURNEY'}
          </span>
          <h1>
            {user
              ? ar
                ? `مرحباً، ${user.name}`
                : `Welcome, ${user.name}`
              : ar
                ? 'حساب EO Accelerator'
                : 'Your EO Accelerator account'}
          </h1>
        </div>
        {error && <Notice error>{error}</Notice>}
        {notice && <Notice>{notice}</Notice>}
        {!user ? (
          <div className="eoa-two-grid">
            <div>
              <h2>
                {ar ? 'خطوتك الأولى تبدأ هنا.' : 'Your next step starts here.'}
              </h2>
              <p>
                {ar
                  ? 'أنشئ حسابك، وثّق بريدك، واحفظ طلبك حتى يصبح جاهزاً للمراجعة. تبقى معلومات شركتك المالية خاصة.'
                  : 'Create an account, verify your email and save your application until it is ready for review. Your company’s financial information stays private.'}
              </p>
              <ol className="eoa-numbered">
                <li>{ar ? 'حساب موثق' : 'Verified account'}</li>
                <li>{ar ? 'طلب محفوظ' : 'Saved application'}</li>
                <li>{ar ? 'مراجعة اللجنة' : 'Committee review'}</li>
                <li>{ar ? 'الانضمام والتعلم' : 'Onboarding & learning'}</li>
              </ol>
            </div>
            <div className="eoa-card">
              <div className="eoa-tabs">
                {(['register', 'login'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={mode === m ? 'active' : ''}
                    onClick={() => {
                      setMode(m)
                      setError('')
                    }}
                  >
                    {m === 'register'
                      ? ar
                        ? 'إنشاء حساب'
                        : 'Create account'
                      : ar
                        ? 'تسجيل الدخول'
                        : 'Sign in'}
                  </button>
                ))}
              </div>
              <form onSubmit={authenticate}>
                {mode === 'register' && (
                  <Field label={ar ? 'الاسم الكامل' : 'Full name'}>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={255}
                    />
                  </Field>
                )}
                <Field label={ar ? 'البريد الإلكتروني' : 'Email'}>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    required
                  />
                </Field>
                <Field label={ar ? 'كلمة المرور' : 'Password'}>
                  <input
                    name="password"
                    type="password"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    minLength={mode === 'register' ? 12 : 1}
                    required
                  />
                </Field>
                {mode === 'register' && (
                  <>
                    <p className="eoa-muted">
                      {ar
                        ? '12 حرفاً على الأقل، مع أحرف كبيرة وصغيرة ورقم.'
                        : 'At least 12 characters, including uppercase, lowercase and a number.'}
                    </p>
                    <Field
                      label={ar ? 'تأكيد كلمة المرور' : 'Confirm password'}
                    >
                      <input
                        name="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={12}
                      />
                    </Field>
                    <div className="eoa-honeypot" aria-hidden="true">
                      <input
                        name="website_confirm"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    <label className="eoa-check">
                      <input name="consent" type="checkbox" required />
                      <span>
                        {ar
                          ? 'أوافق على معالجة بيانات طلبي وفق'
                          : 'I agree to application data processing under the'}{' '}
                        <Link href="/EOA/privacy">
                          {ar ? 'سياسة الخصوصية' : 'privacy policy'}
                        </Link>
                        .
                      </span>
                    </label>
                  </>
                )}
                {mode === 'register' &&
                  program &&
                  !program.data_collection_open && (
                    <Notice>
                      {ar
                        ? 'إنشاء الحسابات بانتظار اعتماد إشعار البيانات المحلي. يمكنك استكشاف البرنامج والتواصل مع الفريق.'
                        : 'Registration is awaiting approval of the local data notice. You can explore the program and contact the team.'}
                    </Notice>
                  )}
                <button
                  className="eoa-btn"
                  disabled={
                    busy ||
                    (mode === 'register' &&
                      program !== null &&
                      !program.data_collection_open)
                  }
                >
                  {busy
                    ? ar
                      ? 'جارٍ المتابعة…'
                      : 'Please wait…'
                    : mode === 'register'
                      ? ar
                        ? 'أنشئ حسابي'
                        : 'Create my account'
                      : ar
                        ? 'دخول'
                        : 'Sign in'}
                </button>
                {mode === 'login' && (
                  <Link href="/EOA/forgot-password" className="eoa-text-link">
                    {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </Link>
                )}
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="eoa-actions">
              <Link className="eoa-btn" href="/EOA/apply">
                {ar ? 'طلب الالتحاق' : 'My application'}
              </Link>
              {user.roles?.some((r) =>
                ['admin', 'eoa_lead', 'eoa_staff', 'eoa_reviewer'].includes(r),
              ) && (
                <Link className="eoa-btn eoa-btn-secondary" href="/EOA/admin">
                  {ar ? 'إدارة البرنامج' : 'Program administration'}
                </Link>
              )}
              {user.roles?.some((r) =>
                ['admin', 'eoa_lead', 'eoa_staff', 'eoa_coach'].includes(r),
              ) && (
                <Link className="eoa-btn eoa-btn-secondary" href="/EOA/coach">
                  {ar ? 'مساحة المدرب' : 'Coach workspace'}
                </Link>
              )}
              <button className="eoa-text-link" onClick={() => void logout()}>
                {ar ? 'تسجيل الخروج' : 'Sign out'}
              </button>
            </div>
            {!user.email_verified_at && (
              <div className="eoa-card eoa-space">
                <h3>{ar ? 'وثّق بريدك الإلكتروني' : 'Verify your email'}</h3>
                <p>
                  {ar
                    ? 'التوثيق مطلوب قبل حفظ الطلب وإرفاق المستندات.'
                    : 'Verification is required before saving an application or uploading documents.'}
                </p>
                <div className="eoa-actions">
                  <button
                    className="eoa-btn"
                    disabled={busy}
                    onClick={() => void resend()}
                  >
                    {ar
                      ? 'إعادة إرسال رابط التوثيق'
                      : 'Resend verification link'}
                  </button>
                  <button
                    className="eoa-btn eoa-btn-secondary"
                    onClick={() => void refresh()}
                  >
                    {ar ? 'لقد وثقت بريدي' : 'I have verified my email'}
                  </button>
                </div>
              </div>
            )}
            <div className="eoa-two-grid eoa-space">
              <div className="eoa-card">
                <span className="eoa-eyebrow">
                  {ar ? 'حالة الطلب' : 'APPLICATION STATUS'}
                </span>
                <h2>
                  {application
                    ? statusLabel(application.status, ar)
                    : ar
                      ? 'ابدأ طلبك'
                      : 'Start your application'}
                </h2>
                {application?.decision_reason && (
                  <p className="eoa-preserve">{application.decision_reason}</p>
                )}
                <p>
                  {ar
                    ? 'أي قرار قبول محلي يسبق التأكيد الرسمي والتسوية المالية.'
                    : 'Local acceptance precedes official enrollment and fee confirmation.'}
                </p>
              </div>
              <div className="eoa-card">
                <h3>{ar ? 'الإشعارات' : 'Notifications'}</h3>
                {!account?.notifications.length && (
                  <p>
                    {ar
                      ? 'ستظهر تحديثات طلبك هنا.'
                      : 'Application updates will appear here.'}
                  </p>
                )}
                {account?.notifications.map((n) => (
                  <div className="eoa-notification" key={n.id}>
                    <p>{n.message}</p>
                    {!n.read_at && (
                      <button
                        className="eoa-text-link"
                        onClick={async () => {
                          try {
                            await api.patch(`/eoa/notifications/${n.id}`)
                            await load()
                          } catch (e) {
                            setError(errorText(e))
                          }
                        }}
                      >
                        {ar ? 'تمت القراءة' : 'Mark read'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {account?.data && (
              <ParticipantWorkspace participant={account.data} reload={load} />
            )}
          </>
        )}
      </div>
    </section>
  )
}
