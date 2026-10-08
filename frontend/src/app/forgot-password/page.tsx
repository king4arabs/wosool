import { Suspense } from "react"
import type { Metadata } from "next"
import { PasswordRecovery } from "@/components/auth/PasswordRecovery"

export const metadata: Metadata = { title: "استعادة الحساب | Account recovery", robots: { index: false, follow: false }, referrer: "no-referrer" }

export default function PasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F5F7FF]" />}><PasswordRecovery mode="forgot" /></Suspense>
}
