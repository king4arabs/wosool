"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { useLocale } from "@/lib/locale"

const copy = {
  ar: {
    forgot: "استعادة الوصول إلى حسابك", reset: "اختر كلمة مرور جديدة",
    introduction: "أدخل بريدك الإلكتروني لإرسال رابط آمن لإعادة تعيين كلمة المرور.",
    guidance: "استخدم 8 أحرف على الأقل، تتضمن حرفًا كبيرًا وحرفًا صغيرًا ورقمًا.",
    email: "البريد الإلكتروني", password: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور",
    send: "إرسال رابط إعادة التعيين", save: "حفظ كلمة المرور", pending: "جارٍ المعالجة…",
    sentTitle: "تحقق من بريدك الإلكتروني", savedTitle: "تم تغيير كلمة المرور",
    sent: "إذا كان هناك حساب مرتبط بهذا البريد، فستصلك رسالة لإعادة تعيين كلمة المرور. تحقق أيضًا من مجلد الرسائل غير المرغوب فيها.",
    saved: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
    back: "العودة إلى تسجيل الدخول", retry: "طلب رابط جديد", home: "العودة إلى الرئيسية",
    invalid: "رابط إعادة التعيين غير مكتمل. يرجى طلب رابط جديد.",
    mismatch: "كلمتا المرور غير متطابقتين.", error: "تعذر إكمال الطلب. يرجى المحاولة مجددًا.",
  },
  en: {
    forgot: "Get back to your network", reset: "Choose a new password",
    introduction: "Enter your account email to receive a secure password reset link.",
    guidance: "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
    email: "Email address", password: "New password", confirm: "Confirm password",
    send: "Send reset link", save: "Save password", pending: "Please wait…",
    sentTitle: "Check your email", savedTitle: "Password updated",
    sent: "If an account exists for this email, a password reset link will be sent. Please also check your spam folder.",
    saved: "You can now sign in with your new password.",
    back: "Back to sign in", retry: "Request a new link", home: "Back to home",
    invalid: "This reset link is incomplete. Please request a new link.",
    mismatch: "The passwords do not match.", error: "Unable to complete your request. Please try again.",
  },
}

export function PasswordRecovery({ mode, eoa = false }: { mode: "forgot" | "reset"; eoa?: boolean }) {
  const { locale, direction, setLocale } = useLocale()
  const t = copy[locale]
  const Container = eoa ? "section" : "main"
  const params = useSearchParams()
  const token = params.get("token") || ""
  const [email, setEmail] = useState(mode === "reset" ? params.get("email") || "" : "")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState("")
  const invalidLink = mode === "reset" && !token

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError("")
    if (mode === "reset" && password !== confirmation) { setError(t.mismatch); return }
    setPending(true)
    try {
      await api.post(`/auth/${mode === "reset" ? "reset-password" : "forgot-password"}`, {
        email: email.trim(),
        ...(mode === "reset" ? { token, password, password_confirmation: confirmation } : {}),
      })
      setComplete(true)
    } catch (err) {
      const errors = err instanceof ApiError ? (err.data as { errors?: Record<string, string[]> })?.errors : undefined
      setError(errors ? Object.values(errors).flat()[0] : err instanceof ApiError ? err.message : t.error)
    } finally { setPending(false) }
  }

  return (
    <Container id={eoa ? "eoa-recovery" : "main-content"} className="flex min-h-screen items-center justify-center bg-[#F5F7FF] px-4 py-12" dir={direction}>
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href={eoa ? "/EOA" : "/"} aria-label={t.home} className="flex items-center gap-3 text-xl font-black text-slate-900">
            <Image src="/wosool-network-logo.png" alt="" width={40} height={40} /> WOSOOL
          </Link>
          <button type="button" lang={locale === "ar" ? "en" : "ar"} onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700">
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="recovery-title">
          {complete ? (
            <div role="status" className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#3B52D4]" aria-hidden="true" />
              <h1 id="recovery-title" className="text-2xl font-bold text-slate-900">{mode === "reset" ? t.savedTitle : t.sentTitle}</h1>
              <p className="text-sm leading-7 text-slate-600">{mode === "reset" ? t.saved : t.sent}</p>
              <Button asChild className="w-full"><Link href={eoa ? "/EOA/account" : "/login"}>{t.back}</Link></Button>
              {mode === "forgot" && <button type="button" onClick={() => setComplete(false)} className="min-h-11 text-sm text-[#3B52D4]">{t.retry}</button>}
            </div>
          ) : (
            <>
              <LockKeyhole className="mb-5 h-9 w-9 text-[#3B52D4]" aria-hidden="true" />
              <h1 id="recovery-title" className="text-2xl font-bold text-slate-900">{mode === "reset" ? t.reset : t.forgot}</h1>
              <p id="password-guidance" className="mt-3 text-sm leading-7 text-slate-600">{mode === "reset" ? t.guidance : t.introduction}</p>
              {invalidLink ? (
                <div className="mt-6 space-y-4"><p role="alert" className="text-sm text-red-700">{t.invalid}</p><Button asChild><Link href={eoa ? "/EOA/forgot-password" : "/forgot-password"}>{t.retry}</Link></Button></div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-5" aria-busy={pending}>
                  <div className="space-y-2"><Label htmlFor="email">{t.email}</Label><Input id="email" name="email" type="email" dir="ltr" autoComplete="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  {mode === "reset" && <>
                    <div className="space-y-2"><Label htmlFor="password">{t.password}</Label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-guidance" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="password-confirmation">{t.confirm}</Label><Input id="password-confirmation" name="password_confirmation" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></div>
                  </>}
                  {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}
                  <Button type="submit" disabled={pending} className="min-h-11 w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{pending ? t.pending : mode === "reset" ? t.save : t.send}</Button>
                </form>
              )}
              <Link href={eoa ? "/EOA/account" : "/login"} className="mt-6 block py-2 text-center text-sm text-[#3B52D4]">{t.back}</Link>
            </>
          )}
        </section>
      </div>
    </Container>
  )
}
