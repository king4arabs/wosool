"use client"

import { Header } from "./Header"
import { Footer } from "./Footer"
import { useLocale } from "@/lib/locale"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { locale, direction } = useLocale()

  return (
    <div className="flex min-h-screen flex-col" dir={direction} lang={locale}>
      <Header />
      <main id="main-content" className="flex-1 pt-16" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
