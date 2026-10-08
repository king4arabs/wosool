"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { safeRedirect } from "@/lib/navigation"
import { sessionFetch } from "@/lib/session-request"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirect = safeRedirect(searchParams.get("redirect"))

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsSubmitting(true)
      try {
        await login(email, password)
        const meRes = await sessionFetch('/api/v1/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })
        const mePayload = await meRes.json().catch(() => null)
        const isAdmin = Boolean(mePayload?.user?.is_admin || mePayload?.user?.role_token === 'admin' || mePayload?.user?.roles?.includes?.('admin'))
        router.replace(isAdmin ? '/admin' : redirect)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, login, router, redirect]
  )

  const inputClass =
    "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors disabled:opacity-50"

  return (
    <div className="relative min-h-screen bg-slate-50/60 flex items-center justify-center px-4 py-16" dir="rtl">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/4 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_10%,transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] group-hover:border-[#3B52D4]/40 transition-colors">
              <svg className="h-5 w-5 text-[#3B52D4]" viewBox="0 0 512 512" fill="currentColor">
                <path d="M120 160c-33.1 0-60 26.9-60 60s26.9 60 60 60c11.3 0 21.9-3.1 31-8.5l68.5 68.5c-5.4 9.1-8.5 19.7-8.5 31 0 33.1 26.9 60 60 60s60-26.9 60-60c0-11.3-3.1-21.9-8.5-31l68.5-68.5c9.1 5.4 19.7 8.5 31 8.5 33.1 0 60-26.9 60-60s-26.9-60-60-60-60 26.9-60 60c0 11.3 3.1 21.9 8.5 31l-68.5 68.5c-9.1-5.4-19.7-8.5-31-8.5s-21.9 3.1-31 8.5L151 222.5c5.4-9.1 8.5-19.7 8.5-31 0-33.1-26.9-60-60-60z" />
                <circle cx="430" cy="190" r="50" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-base font-black tracking-tight text-slate-900">
                WOSOOL
                <span className="text-[9px] font-extrabold text-[#3B52D4] bg-[#EEF1FF] px-1.5 py-0.5 rounded border border-[#E4E7F0]">
                  وصول
                </span>
              </div>
              <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-start">
                شبكة خاصة للمؤسسين
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-8 py-8 relative overflow-hidden"
          style={{ boxShadow: "0 8px 40px -8px rgba(59,82,212,0.1)" }}
        >
          {/* Card inner glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] rounded-full bg-[#3B52D4]/5 blur-[60px]" aria-hidden="true" />

          <div className="relative">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">مرحبًا بعودتك</h1>
            <p className="text-sm text-slate-500 mb-7 leading-relaxed">
              سجّل الدخول للوصول إلى لوحة التحكم والشبكة الخاصة بك
            </p>

            {error && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium"
                role="alert"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-600">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-slate-600">
                    كلمة المرور
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-[#3B52D4] hover:underline">
                    هل نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={inputClass + " pe-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-sm font-bold transition-all shadow-md shadow-[#3B52D4]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold text-xs"
              >
                <Link href="/register">إنشاء حساب جديد</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full rounded-xl text-slate-500 hover:text-[#3B52D4] hover:bg-[#EEF1FF] font-bold text-xs"
              >
                <Link href="/apply">قدّم للانضمام إلى وصول</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-400 mt-5 leading-relaxed">
          بتسجيل الدخول فإنك توافق على{" "}
          <Link href="/terms" className="text-[#3B52D4] hover:underline font-medium">الشروط</Link>
          {" "}و{" "}
          <Link href="/privacy" className="text-[#3B52D4] hover:underline font-medium">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}
