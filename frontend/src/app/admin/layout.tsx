"use client"

import { useRef, useState, type ReactNode } from "react"
import { Menu, Search } from "lucide-react"
import { adminLabels as labels, adminGroups as groups, adminRouteActive as routeActive } from "@/lib/admin-navigation"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { AdminNavigation } from "@/components/admin/AdminNavigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuTrigger = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const { user } = useAuth()
  const { locale, setLocale } = useLocale()
  const activeLocale = locale === "ar" ? "ar" : "en"
  const t = labels[activeLocale]
  const flatItems = groups.flatMap((group) => group.items)
  const current = flatItems.find((item) => routeActive(pathname, item.href))?.href ?? "/admin"
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD"

  return (
    <AdminGuard>
      <div className="admin-workspace min-h-screen bg-[var(--page-bg)] text-[var(--text)]" dir={activeLocale === "ar" ? "rtl" : "ltr"} lang={activeLocale}>
        <aside className="fixed inset-y-0 start-0 z-50 hidden w-[18rem] flex-col overflow-hidden border-e border-white/10 bg-[var(--brand-navy)] text-white lg:flex">
          <div className="border-b border-white/10 p-5">
            <Link href="/admin" className="block rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Image
                src="/wosool-logo-white.svg"
                alt="Wosool — Founders to Founders"
                width={820}
                height={180}
                unoptimized
                className="h-auto w-[205px] max-w-full"
              />
            </Link>
            <p className="mt-3 text-[11px] font-semibold text-white/75">{t.subtitle}</p>
          </div>

          <AdminNavigation locale={activeLocale} pathname={pathname} />

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[.07] p-3">
              <Avatar className="h-10 w-10"><AvatarFallback className="bg-[var(--brand-blue)] text-xs font-bold text-white">{initials}</AvatarFallback></Avatar>
              <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{user?.name ?? t.fallback}</p><p className="mt-1 truncate text-[10px] text-white/75">{user?.email}</p></div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:ms-[18rem]">
          <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[color:var(--surface)]/92 px-4 py-3 shadow-[var(--shadow-xs)] backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button ref={menuTrigger} type="button" onClick={() => setMenuOpen(true)} aria-label={activeLocale === "ar" ? "فتح قائمة الإدارة" : "Open administration menu"} aria-haspopup="dialog" aria-expanded={menuOpen} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] lg:hidden"><Menu size={21} aria-hidden="true" /></button>
                <div>
                <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--action-bg)]">{t.panel}</p>
                <h1 className="mt-1 text-lg font-extrabold text-[var(--text-strong)]">{t.nav[current] ?? t.fallback}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/services" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-3 text-sm font-semibold text-[var(--brand-navy)]"><Search size={16} aria-hidden="true" />{activeLocale === "ar" ? "دليل الخدمات" : "All services"}</Link>
                <label className="sr-only" htmlFor="admin-language">{t.language}</label>
                <select
                  id="admin-language"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as "ar" | "en")}
                  className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
                <Link href="/" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-xs font-bold text-[var(--text-muted)] hover:border-[var(--action-bg)] hover:text-[var(--action-bg)]">
                  {t.visit}
                </Link>
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-[var(--action-bg)] text-xs font-bold text-white">{initials}</AvatarFallback></Avatar>
              </div>
            </div>
          </header>

          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogContent onCloseAutoFocus={event => { event.preventDefault(); menuTrigger.current?.focus() }} aria-describedby={undefined} className="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] max-w-sm flex-col overflow-hidden bg-[var(--brand-navy)] p-0 text-white [&>button]:text-white">
              <DialogTitle className="shrink-0 border-b border-white/10 px-6 py-5 pe-16 text-white">{t.panel}</DialogTitle>
              <AdminNavigation locale={activeLocale} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </DialogContent>
          </Dialog>

          <main id="main-content" className="mx-auto min-w-0 max-w-[var(--container-wide)] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
