"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { isAdminUser } from "@/lib/admin"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAdminUser(user)) {
      router.replace("/dashboard")
    }
  }, [isLoading, router, user])

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
