"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { dateLocale } from "@/lib/date-locale"

type Invitation = { name: string; slug: string; email_hint: string; existing_account: boolean; expires_at: string }

export function FounderActivation() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [token, setToken] = useState('')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const input = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500'

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
    setToken(value)
    if (!value) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true); setError(null)
    api.post<{data: Invitation}>('/founder-activation/preview', {token: value}, {signal: controller.signal})
      .then(response => { if (!controller.signal.aborted) setInvitation(response.data) })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const fields = new FormData(event.currentTarget)
    setBusy(true); setError(null)
    try {
      await api.post('/founder-activation/activate', { token, code: fields.get('code'), password: fields.get('password'), password_confirmation: fields.get('password_confirmation'), privacy_accepted: fields.get('privacy') === 'on' })
      window.history.replaceState(null, '', window.location.pathname)
      setToken(''); setDone(true)
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to activate profile.') }
    finally { setBusy(false) }
  }

  return <PublicLayout><main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-xl px-4 py-14 sm:py-20">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <p className="text-sm font-bold tracking-wide text-indigo-600">WOSOOL · وصول</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">{done ? ar ? 'تم تفعيل ملفك' : 'Your profile is activated' : ar ? 'مساحتك في مجتمع المؤسسين' : 'Your place in the founder community'}</h1>
      {loading && <p role="status" className="mt-6">{ar ? 'جارٍ التحقق من الدعوة…' : 'Checking your invitation…'}</p>}
      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}{!invitation && <Button variant="outline" className="mt-3" onClick={() => setAttempt(n => n + 1)}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button>}</div>}
      {done ? <div className="mt-6 space-y-5"><p className="leading-7 text-slate-600">{ar ? 'يمكنك الآن تسجيل الدخول، مراجعة ملفك وشركتك، والتواصل مع المؤسسين.' : 'Sign in to review your profile and company, then start connecting with founders.'}</p><Button asChild><Link href="/login?redirect=/dashboard/profile">{ar ? 'تسجيل الدخول وإكمال الملف' : 'Sign in and complete your profile'}</Link></Button></div>
        : invitation ? <form onSubmit={activate} className="mt-6 space-y-5">
          <div className="rounded-2xl bg-indigo-50 p-5"><h2 className="text-xl font-bold">{invitation.name}</h2><p className="mt-2 break-all text-sm text-slate-600" dir="ltr">{invitation.email_hint}</p><p className="mt-2 text-sm">{ar ? 'صلاحية الدعوة حتى: ' : 'Invitation expires: '}{new Date(invitation.expires_at).toLocaleDateString(dateLocale(ar, "en-GB"))}</p></div>
          <p className="text-sm leading-7 text-[var(--text-muted)]">{ar ? 'أدخل رمز التفعيل المكوّن من ٦ أرقام الموجود في رسالة الدعوة.' : 'Enter the 6-digit activation code from your invitation email.'}</p>
          <label className="block text-sm font-semibold">{ar ? 'رمز التفعيل' : 'Activation code'}<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required dir="ltr" className={input} /></label>
          <p className="text-sm leading-7 text-slate-600">{invitation.existing_account ? ar ? 'أدخل كلمة المرور الحالية لحساب البريد المدعو لربط الملف بحسابك.' : 'Enter the current password for your invited email account to claim this profile.' : ar ? 'أنشئ كلمة مرور من 12 حرفاً على الأقل، تشمل أحرفاً كبيرة وصغيرة وأرقاماً.' : 'Create a password of at least 12 characters with uppercase and lowercase letters and numbers.'}</p>
          <label className="block text-sm font-semibold">{ar ? 'كلمة المرور' : 'Password'}<input name="password" type="password" required minLength={invitation.existing_account ? 1 : 12} maxLength={128} autoComplete={invitation.existing_account ? 'current-password' : 'new-password'} className={input} /></label>
          {!invitation.existing_account && <label className="block text-sm font-semibold">{ar ? 'تأكيد كلمة المرور' : 'Confirm password'}<input name="password_confirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className={input} /></label>}
          {invitation.existing_account && <Link className="inline-block min-h-11 text-sm text-indigo-600 underline" href="/forgot-password" target="_blank" rel="noopener noreferrer">{ar ? 'استعادة كلمة المرور' : 'Reset your password'}</Link>}
          <label className="flex items-start gap-3 text-sm leading-7"><input name="privacy" type="checkbox" required className="mt-2 h-5 w-5 shrink-0" /><span>{ar ? 'أنا صاحب هذا الملف وأوافق على ' : 'I am the owner of this profile and agree to the '}<Link href="/privacy" target="_blank" className="text-indigo-600 underline">{ar ? 'سياسة الخصوصية' : 'privacy policy'}</Link>{ar ? '. يمكنني تعديل ظهوره في إعدادات ملفي.' : '. I can manage profile visibility in my settings.'}</span></label>
          <Button className="min-h-12 w-full" disabled={busy}>{busy ? ar ? 'جارٍ التفعيل…' : 'Activating…' : ar ? 'تفعيل الملف والانضمام للمجتمع' : 'Activate profile and join the community'}</Button>
        </form> : !loading && !error && <p className="mt-6 leading-7 text-slate-600">{ar ? 'افتح الرابط الشخصي في رسالة الدعوة. إذا انتهت صلاحيته، تواصل مع وصول لطلب دعوة جديدة.' : 'Open the personal link in your invitation email. If it has expired, contact Wosool for a new invitation.'}</p>}
      <Link className="mt-6 inline-flex min-h-11 items-center text-sm text-indigo-600 underline" href="/contact">{ar ? 'تواصل مع وصول' : 'Contact Wosool'}</Link>
    </div>
  </main></PublicLayout>
}
