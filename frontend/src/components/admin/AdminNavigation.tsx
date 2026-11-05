"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { adminLabels, adminRouteActive, filterAdminServices } from "@/lib/admin-navigation"
import { cn } from "@/lib/utils"

export function AdminNavigation({ locale, pathname, onNavigate }: { locale: "ar" | "en"; pathname: string; onNavigate?: () => void }) {
  const [query, setQuery] = useState("")
  const groups = filterAdminServices(query, locale)
  const t = adminLabels[locale]
  return <>
    <label className="mx-4 mt-4 flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 focus-within:ring-2 focus-within:ring-white">
      <Search size={18} aria-hidden="true" />
      <input style={{ outline: "none" }} type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={locale === "ar" ? "ابحث عن خدمة إدارية" : "Search admin services"} placeholder={locale === "ar" ? "ابحث عن خدمة…" : "Find a service…"} className="min-w-0 w-full bg-transparent py-3 text-white placeholder:text-white/75 focus:outline-none" />
    </label>
    <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label={t.navigation}>
      {!groups.length && <p role="status" className="p-3 text-sm text-white/80">{locale === "ar" ? "لا توجد خدمة مطابقة. جرّب اسمًا آخر." : "No matching services. Try another name."}</p>}
      {groups.map(group => <section key={group.key} className="mb-5">
        <h2 className="px-3 pb-2 text-xs font-bold text-white/75">{t.groups[group.key]}</h2>
        <div className="space-y-1">{group.items.map(({ href, icon: Icon }) => {
          const active = adminRouteActive(pathname, href)
          return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white", active ? "bg-white text-[var(--brand-navy)]" : "text-white/85 hover:bg-white/10 hover:text-white")}>
            <Icon size={18} className="shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1">{t.nav[href]}</span>{active && <ChevronRight size={15} className="shrink-0 rtl:rotate-180" aria-hidden="true" />}
          </Link>
        })}</div>
      </section>)}
    </nav>
  </>
}
