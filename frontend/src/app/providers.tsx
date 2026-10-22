"use client"

import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/lib/auth"
import { LocaleProvider } from "@/lib/locale"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </LocaleProvider>
  )
}
