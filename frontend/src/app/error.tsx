"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"
import { errorDigest, systemScreens } from "@/lib/system-screens"

export default function Error({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  const { locale, direction } = useLocale()
  const t = systemScreens(locale)
  const digest = errorDigest(error)

  useEffect(() => {
    console.error("[Wosool Error]", error)
  }, [error])

  return (
    <main id="main-content" tabIndex={-1} dir={direction} lang={locale} className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-brand-navy mb-3">{t.errorTitle}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{t.errorBody}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* retry() re-fetches the segment instead of re-rendering the same failed payload. */}
          <Button onClick={() => retry()} variant="default" size="lg">
            <RefreshCw className="h-4 w-4 me-2" aria-hidden="true" />
            {t.errorRetry}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4 me-2" aria-hidden="true" />
              {t.errorHome}
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/contact" className="text-gray-600 underline underline-offset-2 hover:text-[var(--color-logo-blue)]">
            {t.errorContact}
          </Link>
        </p>
        {digest && (
          <p className="mt-4 text-xs text-gray-500">
            {t.errorId} <span dir="ltr" className="font-mono">{digest}</span>
          </p>
        )}
      </div>
    </main>
  )
}
