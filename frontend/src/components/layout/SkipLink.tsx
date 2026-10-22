'use client'

import { useLocale } from '@/lib/locale'

export function SkipLink() {
  const { locale } = useLocale()
  return <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--action-bg)] focus:px-4 focus:py-3 focus:font-bold focus:text-white">
    {locale === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to main content'}
  </a>
}
