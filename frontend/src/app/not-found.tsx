"use client"

import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"
import { systemScreens } from "@/lib/system-screens"

export default function NotFound() {
  const { locale } = useLocale()
  const t = systemScreens(locale)

  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <p className="mb-4 text-8xl font-bold text-[var(--color-logo-blue)]" aria-hidden="true">404</p>
          <h1 className="mb-3 text-3xl font-bold text-[var(--color-primary-navy)]">{t.notFoundTitle}</h1>
          <p className="mb-8 leading-relaxed text-gray-600">{t.notFoundBody}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="me-2 h-4 w-4" aria-hidden="true" />
                {t.notFoundHome}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/founders">
                <Search className="me-2 h-4 w-4" aria-hidden="true" />
                {t.notFoundFounders}
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/about", label: t.linkAbout },
              { href: "/programs", label: t.linkPrograms },
              { href: "/events", label: t.linkEvents },
              { href: "/contact", label: t.linkContact },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-[var(--color-logo-blue)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
