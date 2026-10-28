"use client"

import { useLocale } from "@/lib/locale"
import { systemScreens } from "@/lib/system-screens"

export default function Loading() {
  const { locale } = useLocale()
  const label = systemScreens(locale).loading

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-4 border-brand-navy/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-gold animate-spin" />
        </div>
        <p className="text-sm font-medium text-brand-navy/60">{label}</p>
      </div>
    </div>
  )
}
