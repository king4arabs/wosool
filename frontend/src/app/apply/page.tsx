"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { PublicLayout } from '@/components/layout/PublicLayout'
export default function ApplyPage() {
  const { user, isLoading, error } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  useEffect(() => { if (!isLoading && !error) router.replace(user ? '/onboarding' : '/register') }, [user, isLoading, error, router])
  return <PublicLayout><section className="gateway-section"><p role="status">{error || (locale === 'ar' ? 'جارٍ فتح التسجيل…' : 'Opening registration…')}</p></section></PublicLayout>
}
