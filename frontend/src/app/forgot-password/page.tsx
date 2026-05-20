"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("يرجى إدخال بريدك الإلكتروني.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.")
      return
    }

    setSubmitting(true)
    // Simulate API call — auth endpoints will be implemented in a future cycle
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0A1628]">Wosool</span>
              <span className="text-base text-[#C9A84C] font-medium tracking-widest uppercase">
                وصول
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-[#C9A84C]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628] mb-2">تحقق من بريدك الإلكتروني</h1>
            <p className="text-gray-500 text-sm mb-6">
              إذا كان هناك حساب مرتبط بعنوان <span className="font-medium text-[#0A1628]">{email}</span>،
              فستصلك خلال دقائق رسالة تتضمن رابط إعادة تعيين كلمة المرور.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة إلى تسجيل الدخول
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها أو{" "}
            <button
              onClick={() => {
                setSubmitted(false)
              }}
              className="text-[#C9A84C] hover:underline"
            >
              أعد المحاولة
            </button>
          </p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-500 text-sm mb-8">
            أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل إليك رابطًا لإعادة تعيين كلمة المرور.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                aria-invalid={!!error}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جارٍ الإرسال...
                </>
              ) : (
                "إرسال رابط إعادة التعيين"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#C9A84C] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
