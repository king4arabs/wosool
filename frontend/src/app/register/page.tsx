"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const inviteToken = searchParams.get("invite") || ""
  const invitedEmail = searchParams.get("email") || ""

  const [name, setName] = useState("")
  const [email, setEmail] = useState(invitedEmail)
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")

      if (password !== passwordConfirmation) {
        setError("كلمتا المرور غير متطابقتين.")
        return
      }

      setIsSubmitting(true)

      try {
        await register(name, email, password, passwordConfirmation, inviteToken || undefined)
        router.push("/dashboard")
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [name, email, password, passwordConfirmation, register, router, inviteToken]
  )

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold text-[#0A1628]">Wosool</span>
            <span className="text-base text-[#C9A84C] font-medium tracking-widest uppercase">
              وصول
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">شبكة خاصة للمؤسسين</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">أنشئ حسابك</h1>
          <p className="text-gray-500 text-sm mb-8">
            ابدأ رحلتك داخل وصول وتواصل مع مؤسسين يبنون في السعودية والخليج
          </p>
          {inviteToken ? (
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              رابط الدعوة الخاص بك مفعّل تلقائيًا. أكمل إنشاء الحساب بنفس البريد.
            </div>
          ) : null}

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="اكتب اسمك الكامل"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || Boolean(inviteToken)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="8 أحرف على الأقل"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400">
                يُفضّل أن تتضمن حروفًا كبيرة وصغيرة ورقمًا واحدًا على الأقل.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              لديك حساب بالفعل؟
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          بإنشاء الحساب، فإنك توافق على{" "}
          <Link href="/terms" className="hover:text-gray-600 underline">
            الشروط
          </Link>{" "}
          و{" "}
          <Link href="/privacy" className="hover:text-gray-600 underline">
            سياسة الخصوصية
          </Link>
        </p>
      </div>
    </div>
  )
}
