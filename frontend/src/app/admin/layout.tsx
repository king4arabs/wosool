"use client"

import { useState, type ReactNode } from "react"
import { Search, ChevronRight } from "lucide-react"
import { adminLabels as labels, adminGroups as groups, adminRouteActive as routeActive, filterAdminServices } from "@/lib/admin-navigation"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [navigationSearch, setNavigationSearch] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { locale, setLocale } = useLocale()
  const activeLocale = locale === "ar" ? "ar" : "en"
  const t = labels[activeLocale]
  const flatItems = groups.flatMap((group) => group.items)
  const visibleGroups = filterAdminServices(navigationSearch, activeLocale)
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

          <label className="mx-4 mt-4 flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-3"><Search size={17} aria-hidden="true" /><input type="search" value={navigationSearch} onChange={event => setNavigationSearch(event.target.value)} aria-label={activeLocale === "ar" ? "ابحث عن خدمة إدارية" : "Search admin services"} placeholder={activeLocale === "ar" ? "ابحث عن خدمة…" : "Find a service…"} className="min-w-0 w-full bg-transparent py-3 text-sm text-white placeholder:text-white/70 focus:outline-none" /></label>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.navigation}>
            {!visibleGroups.length && <p role="status" className="p-3 text-sm text-white/80">{activeLocale === "ar" ? "لا توجد خدمة مطابقة." : "No matching services."}</p>}
            {visibleGroups.map((group) => (
              <section key={group.key} className="mb-5">
                <h2 className="px-3 pb-2 text-xs font-extrabold uppercase tracking-[.16em] text-white/70">
                  {t.groups[group.key]}
                </h2>
                <div className="space-y-1">
                  {group.items.map(({ href, icon: Icon }) => {
                    const active = routeActive(pathname, href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                          active
                            ? "bg-white text-[var(--brand-navy)] shadow-sm"
                            : "text-white/80 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[var(--action-bg)]" : "text-white/70 group-hover:text-white")} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{t.nav[href]}</span>
                        {active && <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />}
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </nav>

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
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--action-bg)]">{t.panel}</p>
                <h1 className="mt-1 text-lg font-extrabold text-[var(--text-strong)]">{t.nav[current] ?? t.fallback}</h1>
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

          <nav className="border-b border-[var(--border-soft)] bg-[var(--surface)] p-4 lg:hidden" aria-label={t.navigation}>
            <select
              className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 font-bold"
              aria-label={t.navigation}
              value={current}
              onChange={(event) => router.push(event.target.value)}
            >
              {groups.map((group) => (
                <optgroup key={group.key} label={t.groups[group.key]}>
                  {group.items.map((item) => <option key={item.href} value={item.href}>{t.nav[item.href]}</option>)}
                </optgroup>
              ))}
            </select>
          </nav>

          <main id="main-content" className="mx-auto min-w-0 max-w-[var(--container-wide)] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
