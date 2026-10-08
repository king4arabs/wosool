import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PasswordRecovery } from '@/components/auth/PasswordRecovery'

export const metadata: Metadata = {
  title: 'كلمة مرور جديدة | Reset password',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<section className="min-h-screen bg-[#F5F7FF]" />}>
      <PasswordRecovery mode="reset" eoa />
    </Suspense>
  )
}
