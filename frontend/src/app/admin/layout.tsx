"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Compass,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const labels = {
  ar: {
    panel: "مركز إدارة وصول",
    subtitle: "المجتمع · الشركات · المسرّعة",
    navigation: "قائمة إدارة وصول",
    visit: "عرض الموقع",
    language: "اللغة",
    fallback: "الإدارة",
    groups: {
      community: "المجتمع",
      operations: "العمليات",
      growth: "النمو والمحتوى",
      system: "النظام",
    },
    nav: {
      "/admin": "نظرة عامة",
      "/admin/members": "طلبات العضوية",
      "/admin/founders": "المؤسسون",
      "/admin/companies": "الشركات",
      "/admin/scorecards": "بطاقات التقييم",
      "/admin/matches": "التوافق الذكي",
      "/admin/intros": "طلبات التعارف",
      "/admin/chat": "إشراف المحادثات",
      "/admin/events": "الفعاليات",
      "/admin/programs": "البرامج",
      "/eoa/admin": "عمليات EOA",
      "/admin/opportunities": "مصادر المنظومة",
      "/admin/partners": "الشركاء",
      "/admin/sponsors": "الرعاة",
      "/admin/news": "الأخبار والمحتوى",
      "/admin/analytics": "التحليلات",
      "/admin/privacy-requests": "طلبات الخصوصية",
      "/admin/settings": "الإعدادات",
    },
  },
  en: {
    panel: "Wosool Command Center",
    subtitle: "Community · Companies · Accelerator",
    navigation: "Wosool administration",
    visit: "View site",
    language: "Language",
    fallback: "Administration",
    groups: {
      community: "Community",
      operations: "Operations",
      growth: "Growth & content",
      system: "System",
    },
    nav: {
      "/admin": "Overview",
      "/admin/members": "Membership requests",
      "/admin/founders": "Founders",
      "/admin/companies": "Companies",
      "/admin/scorecards": "Scorecards",
      "/admin/matches": "Smart matching",
      "/admin/intros": "Introductions",
      "/admin/chat": "Chat moderation",
      "/admin/events": "Events",
      "/admin/programs": "Programs",
      "/eoa/admin": "EOA operations",
      "/admin/opportunities": "Ecosystem sources",
      "/admin/partners": "Partners",
      "/admin/sponsors": "Sponsors",
      "/admin/news": "News & content",
      "/admin/analytics": "Analytics",
      "/admin/privacy-requests": "Privacy requests",
      "/admin/settings": "Settings",
    },
  },
} as const

type AdminRoute = keyof typeof labels.en.nav

type NavigationGroup = {
  key: keyof typeof labels.en.groups
  items: Array<{ href: AdminRoute; icon: LucideIcon }>
}

const groups: NavigationGroup[] = [
  {
    key: "community",
    items: [
      { href: "/admin", icon: LayoutDashboard },
      { href: "/admin/members", icon: UserRoundCheck },
      { href: "/admin/founders", icon: Users },
      { href: "/admin/companies", icon: Building2 },
      { href: "/admin/scorecards", icon: ClipboardList },
      { href: "/admin/matches", icon: Sparkles },
      { href: "/admin/intros", icon: Handshake },
      { href: "/admin/chat", icon: MessageCircle },
    ],
  },
  {
    key: "operations",
    items: [
      { href: "/admin/events", icon: CalendarDays },
      { href: "/admin/programs", icon: GraduationCap },
      { href: "/eoa/admin", icon: Trophy },
    ],
  },
  {
    key: "growth",
    items: [
      { href: "/admin/opportunities", icon: Compass },
      { href: "/admin/partners", icon: Handshake },
      { href: "/admin/sponsors", icon: BadgeCheck },
      { href: "/admin/news", icon: Newspaper },
      { href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    key: "system",
    items: [
      { href: "/admin/privacy-requests", icon: ShieldCheck },
      { href: "/admin/settings", icon: Settings },
    ],
  },
]

function routeActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
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
      <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text)]" dir={activeLocale === "ar" ? "rtl" : "ltr"} lang={activeLocale}>
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
            <p className="mt-3 text-[11px] font-semibold text-white/55">{t.subtitle}</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.navigation}>
            {groups.map((group) => (
              <section key={group.key} className="mb-5">
                <h2 className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-white/45">
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
                          "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                          active
                            ? "bg-white text-[var(--brand-navy)] shadow-sm"
                            : "text-white/68 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[var(--action-bg)]" : "text-white/45 group-hover:text-white")} aria-hidden="true" />
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
              <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{user?.name ?? t.fallback}</p><p className="mt-1 truncate text-[10px] text-white/50">{user?.email}</p></div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:ms-[18rem]">
          <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[color:var(--surface)]/92 px-4 py-3 shadow-[var(--shadow-xs)] backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--action-bg)]">{t.panel}</p>
                <h1 className="mt-1 text-lg font-extrabold text-[var(--text-strong)]">{t.nav[current] ?? t.fallback}</h1>
              </div>
              <div className="flex items-center gap-2">
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
