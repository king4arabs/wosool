"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { isAdminUser } from "@/lib/admin"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading, error, refresh } = useAuth()
  const { locale } = useLocale()

  useEffect(() => {
    if (!isLoading && !error && !isAdminUser(user)) {
      router.replace("/dashboard")
    }
  }, [isLoading, error, router, user])

  if (error) return <div className="p-6" role="alert"><p>{error}</p><button className="mt-4 underline" onClick={() => void refresh()}>{locale === "ar" ? "إعادة المحاولة" : "Try again"}</button></div>

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        جاري تحميل لوحة الأدمن...
      </div>
    )
  }

  if (!isAdminUser(user)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        جاري التحقق من الصلاحيات...
      </div>
    )
  }

  return <>{children}</>
}
