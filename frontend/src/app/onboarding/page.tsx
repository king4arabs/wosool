"use client"

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import { directoryCountryGroups } from '@/lib/directory-geography'

type Application = { status: string; onboarding_data?: Record<string, string | number>; [key: string]: unknown }
type ApplicationResponse = { step: string; application: Application | null }
const fields = [
  ['full_name', 'الاسم الكامل', 'Full name', 'text', 255], ['phone', 'رقم الجوال', 'Phone', 'tel', 50],
  ['position', 'الدور في الشركة', 'Company role', 'text', 120], ['company_name', 'اسم الشركة', 'Company name', 'text', 255],
  ['company_website', 'موقع الشركة', 'Company website', 'url', 255], ['sector', 'القطاع', 'Sector', 'text', 100],
  ['location', 'المدينة', 'City', 'text', 255], ['founded_year', 'سنة التأسيس', 'Founded year', 'number', 4],
  ['team_size', 'عدد أعضاء الفريق', 'Team size', 'number', 8], ['linkedin_url', 'LinkedIn (اختياري)', 'LinkedIn (optional)', 'url', 255],
] as const
const paragraphs = [
  ['bio', 'نبذة مختصرة عنك', 'Brief founder biography', 1500], ['company_description', 'نبذة عن الشركة', 'Company description', 2000],
  ['motivation', 'لماذا ترغب في الانضمام؟', 'Why would you like to join?', 2000], ['what_you_offer', 'كيف يمكنك مساعدة المجتمع؟', 'How can you help the community?', 1000],
  ['what_you_need', 'ما الدعم الذي تبحث عنه؟', 'What support are you looking for?', 1000],
] as const

export default function OnboardingPage() {
  const { user, isLoading, error: authError, refresh, logout } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  const ar = locale === 'ar'
  const t = (a: string, e: string) => ar ? a : e
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [application, setApplication] = useState<Application | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [uploads, setUploads] = useState<Record<string, string>>({})
  const verified = Boolean(user?.email_verified_at || user?.emailVerifiedAt)
  const review = application && ['submitted', 'reviewing', 'waitlisted', 'approved'].includes(application.status) && application.onboarding_data
  const load = useCallback(async () => {
    setError('')
    try {
      const response = await api.get<ApplicationResponse>('/registration/application')
      setApplication(response.application); setLoaded(true)
      if (response.step === 'active') { await refresh(); router.replace('/dashboard') }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load application.') }
  }, [refresh, router])
  useEffect(() => { if (!isLoading && !authError && !user) router.replace('/login?redirect=/onboarding') }, [isLoading, authError, user, router])
  useEffect(() => { if (verified) void load() }, [verified, load])
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(cooldown - 1), 1000); return () => clearTimeout(timer) }, [cooldown])
  useEffect(() => { if (!review) return; const timer = setInterval(() => { if (!document.hidden) void load() }, 30000); return () => clearInterval(timer) }, [review, load])

  async function verify(event: FormEvent) {
    event.preventDefault(); if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await api.post('/auth/registration/verify', { code }); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : t('تعذر التحقق.', 'Verification failed.')) }
    finally { setBusy(false) }
  }
  async function resend() {
    if (busy || cooldown) return
    setBusy(true); setError('')
    try { await api.post('/auth/registration/resend', {}); setCooldown(60); setNotice(t('أرسلنا رمزًا جديدًا إلى بريدك.', 'A new code was sent to your email.')) }
    catch (e) { setError(e instanceof Error ? e.message : t('تعذر الإرسال.', 'Unable to send.')) }
    finally { setBusy(false) }
  }
  async function upload(kind: string, file?: File) {
    if (!file || busy) return
    setBusy(true); setError('')
    const body = new FormData(); body.set('kind', kind); body.set('image', file)
    try { const result = await api.post<{url: string}>('/registration/image', body); setUploads(previous => ({ ...previous, [kind]: result.url })) }
    catch (e) { setError(e instanceof Error ? e.message : t('تعذر رفع الصورة.', 'Upload failed.')) }
    finally { setBusy(false) }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return
    setBusy(true); setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    try { await api.post('/registration/application', { ...data, public_profile_consent: data.public_profile_consent === 'on' }); await refresh(); await load() }
    catch (e) { setError(e instanceof Error ? e.message : t('تعذر إرسال الطلب.', 'Unable to submit.')) }
    finally { setBusy(false) }
  }
  const value = (key: string) => String(application?.[key] ?? application?.onboarding_data?.[key] ?? (key === 'full_name' ? user?.name ?? '' : ''))
  return <PublicLayout><section className="gateway-section"><div className={`mx-auto ${verified && !review ? 'max-w-3xl' : 'max-w-lg'}`}>
    <p className="gateway-eyebrow">WOSOOL</p><h1 className="gateway-heading">{!verified ? t('أكّد بريدك الإلكتروني', 'Verify your email') : review ? t('طلبك لدى فريق وصول', 'Your application is with Wosool') : t('أكمل ملفك وطلب الانضمام', 'Complete your membership profile')}</h1>
    <ol className="my-6 grid grid-cols-3 gap-2 text-center text-xs font-bold" aria-label={t('مراحل التسجيل', 'Registration steps')}>{[t('تأكيد البريد', 'Verify email'), t('البيانات', 'Your details'), t('الموافقة', 'Approval')].map((label, index) => <li key={label} aria-current={index === (!verified ? 0 : review ? 2 : 1) ? 'step' : undefined} className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 aria-[current=step]:bg-indigo-700 aria-[current=step]:text-white">{index + 1}. {label}</li>)}</ol>
    {(error || authError) && <div role="alert" className="gateway-error mb-4"><p>{error || authError}</p>{verified && !loaded && <button type="button" onClick={() => void load()} className="min-h-11 underline">{t('إعادة المحاولة', 'Try again')}</button>}</div>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {isLoading || !user ? <p role="status">{t('جارٍ التحميل…', 'Loading…')}</p> : !verified ? <form onSubmit={verify} className="gateway-card space-y-5">
      <p className="text-sm leading-7 text-slate-600">{t('أدخل رمز التحقق المرسل إلى', 'Enter the verification code sent to')} <bdi className="font-bold">{user.email}</bdi>. {t('تحقق من البريد الوارد والرسائل غير المرغوب فيها، أو اطلب رمزًا جديدًا أدناه.', 'Check your inbox and spam folder, or request a new code below.')}</p>
      <label className="gateway-label" htmlFor="registration-code">{t('رمز التحقق', 'Verification code')}<input id="registration-code" name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required dir="ltr" value={code} onChange={e => setCode(e.target.value.replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[^0-9]/g, '').slice(0, 6))} className="gateway-input text-center text-2xl tracking-[0.4em]" /></label>
      <button disabled={busy || code.length !== 6} className="gateway-button w-full">{busy ? t('جارٍ التحقق…', 'Verifying…') : t('تأكيد البريد والمتابعة', 'Verify & continue')}</button>
      <button type="button" onClick={resend} disabled={busy || cooldown > 0} className="gateway-button-secondary w-full">{cooldown ? t(`إعادة الإرسال بعد ${cooldown} ثانية`, `Resend in ${cooldown}s`) : t('إعادة إرسال الرمز', 'Resend code')}</button>
      <button type="button" onClick={async () => { await logout(); router.replace('/register') }} className="min-h-11 text-sm underline">{t('استخدام حساب آخر', 'Use another account')}</button>
    </form> : !loaded ? <p role="status">{t('جارٍ تحميل الطلب…', 'Loading your application…')}</p> : review ? <div className="gateway-card space-y-5">
      <p className="text-sm leading-8 text-slate-600">{t('استلمنا بياناتك. سنخبرك بالبريد عند تحديث الطلب. بعد الموافقة تُفعّل عضويتك وتظهر بطاقتك في دليل المؤسسين والصفحة الرئيسية.', 'We received your details and will email you when your application changes. Approval activates your membership and publishes your card in the founder directory and homepage.')}</p>
      <p className="rounded-xl bg-indigo-50 p-4 text-sm font-bold">{t('الحالة:', 'Status:')} {({ submitted: t('تم الاستلام', 'Submitted'), reviewing: t('قيد المراجعة', 'Under review'), waitlisted: t('قائمة الانتظار', 'Waitlisted'), approved: t('تمت الموافقة', 'Approved') } as Record<string, string>)[application.status]}</p>
      <button type="button" className="gateway-button-secondary w-full" onClick={() => void load()}>{t('تحديث حالة الطلب', 'Refresh status')}</button><Link href="/" className="inline-flex min-h-11 items-center text-sm underline">{t('العودة للرئيسية', 'Back to homepage')}</Link>
    </div> : <form onSubmit={submit} className="gateway-card space-y-6" aria-busy={busy}>
      {application && ['rejected', 'request_more_info'].includes(application.status) && <p className="rounded-xl bg-amber-50 p-4 text-sm">{t('يمكنك تحديث بياناتك وإعادة إرسال الطلب للمراجعة.', 'You can update your details and resubmit for review.')}</p>}
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, arabic, english, type, max]) => <label key={key} className="gateway-label">{ar ? arabic : english}<input name={key} type={type} list={key === 'position' ? 'founder-roles' : undefined} required={key !== 'linkedin_url'} defaultValue={value(key)} maxLength={max} min={type === 'number' ? key === 'founded_year' ? 1800 : 1 : undefined} max={key === 'founded_year' ? new Date().getFullYear() : key === 'team_size' ? 10000000 : undefined} className="gateway-input" /></label>)}
      <datalist id="founder-roles"><option value={t('مؤسس', 'Founder')} /><option value={t('شريك مؤسس', 'Co-founder')} /></datalist>
      <label className="gateway-label">{t('الدولة', 'Country')}<select name="country_code" required defaultValue={value('country_code')} className="gateway-input"><option value="">{t('اختر الدولة', 'Choose country')}</option>{directoryCountryGroups(locale).map(group => <optgroup key={group.region} label={group.label}>{group.countries.map(country => <option value={country.code} key={country.code}>{country.label}</option>)}</optgroup>)}</select></label>
      <label className="gateway-label">{t('مرحلة الشركة', 'Company stage')}<select name="stage" required defaultValue={value('stage')} className="gateway-input"><option value="">{t('اختر المرحلة', 'Choose stage')}</option>{['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Scale-up', 'Exited'].map(stage => <option key={stage}>{stage}</option>)}</select></label></div>
      {paragraphs.map(([key, arabic, english, max]) => <label key={key} className="gateway-label">{ar ? arabic : english}<textarea name={key} required minLength={['bio', 'company_description'].includes(key) ? 20 : 1} maxLength={max} rows={3} defaultValue={value(key)} className="gateway-input resize-y" /></label>)}
      <div className="grid gap-5 sm:grid-cols-2">{(['avatar', 'logo'] as const).map(kind => <label key={kind} className="gateway-label">{kind === 'avatar' ? t('صورتك الشخصية (اختياري)', 'Your portrait (optional)') : t('شعار الشركة (اختياري)', 'Company logo (optional)')}{(uploads[kind] || application?.onboarding_data?.[kind === 'avatar' ? 'avatar_url' : 'logo_url']) && <Image src={String(uploads[kind] || application?.onboarding_data?.[kind === 'avatar' ? 'avatar_url' : 'logo_url'])} alt={kind === 'avatar' ? t('صورتك الشخصية', 'Your portrait') : t('شعار الشركة', 'Company logo')} width={160} height={96} unoptimized className={`my-2 h-24 w-40 rounded-xl border bg-white ${kind === 'avatar' ? 'object-cover' : 'object-contain p-3'}`} />}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => void upload(kind, e.target.files?.[0])} className="gateway-input text-xs" /><span className="text-xs font-normal text-slate-500">{uploads[kind] ? t('تم رفع الصورة', 'Image uploaded') : t('PNG أو JPG أو WebP، حتى 2 MB.', 'PNG, JPG or WebP, up to 2 MB.')}</span></label>)}</div>
      <label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" name="public_profile_consent" required className="mt-2 h-4 w-4 shrink-0" /><span>{t('أوافق على عرض اسمي وصورتي وبيانات شركتي المهنية في دليل المؤسسين والصفحة الرئيسية بعد الموافقة. يبقى بريدي ورقم جوالي خاصين.', 'I agree to publish my name, photo and professional company information in the founder directory and homepage after approval. My email and phone remain private.')}</span></label>
      <button disabled={busy} className="gateway-button w-full">{busy ? t('جارٍ الحفظ…', 'Saving…') : t('إرسال الطلب للمراجعة', 'Submit for review')}</button>
    </form>}
  </div></section></PublicLayout>
}
