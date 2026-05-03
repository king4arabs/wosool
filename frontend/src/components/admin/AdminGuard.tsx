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
        Loading admin workspace...
      </div>
    )
  }

  if (!isAdminUser(user)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        Checking access...
      </div>
    )
  }

  return <>{children}</>
}
