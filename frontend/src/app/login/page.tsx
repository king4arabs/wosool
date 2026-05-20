"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirect = searchParams.get("redirect") || "/dashboard"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsSubmitting(true)

      try {
        await login(email, password)
        router.replace(redirect)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, login, router, redirect]
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
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">مرحبًا بعودتك</h1>
          <p className="text-gray-500 text-sm mb-8">
            سجّل الدخول للوصول إلى حسابك ولوحة التحكم الخاصة بك
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#C9A84C] hover:underline"
                >
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              لا تملك حسابًا بعد؟
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/register">إنشاء حساب</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/apply">قدّم للانضمام إلى وصول</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          بتسجيل الدخول، فإنك توافق على{" "}
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
