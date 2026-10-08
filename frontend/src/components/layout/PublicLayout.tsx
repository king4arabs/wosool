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
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
