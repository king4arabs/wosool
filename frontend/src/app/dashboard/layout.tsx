"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Building2,
  Star,
  Users,
  Sparkles,
  CalendarDays,
  GraduationCap,
  MessageCircle,
  Settings,
  Bell,
  LogOut,
  Menu,
  Search,
  Globe,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { isAdminUser } from "@/lib/admin"
import { useLocale, localeOptions, type Locale } from "@/lib/locale"
import { dashboardDictionary, resolveDashboardLocale } from "@/lib/dashboard-i18n"

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, key: "foundersBook" },
  { href: "/dashboard/profile",  icon: User,            key: "profile" },
  { href: "/dashboard/company",  icon: Building2,       key: "company" },
  { href: "/dashboard/scorecard",icon: Star,            key: "scorecard" },
  { href: "/dashboard/community",icon: Users,           key: "community" },
  { href: "/dashboard/matches",  icon: Sparkles,        key: "matches" },
  { href: "/dashboard/events",   icon: CalendarDays,    key: "events" },
  { href: "/dashboard/programs", icon: GraduationCap,   key: "programs" },
  { href: "/dashboard/messages", icon: MessageCircle,   key: "messages" },
  { href: "/dashboard/settings", icon: Settings,        key: "settings" },
] as const

const onboardingNavItems = [
  { href: "/dashboard/profile", icon: User, key: "profile" },
] as const

interface DashboardGateResponse {
  data?: {
    profile_completion?: number
    profile?: { id?: number } | null
  }
}

function SidebarContent({
  pathname,
  displayName,
  email,
  locale,
  onboardingRequired,
  onLogout,
  onNavClick,
}: {
  pathname: string
  displayName: string
  email?: string
  locale: "ar" | "en"
  onboardingRequired: boolean
  onLogout: () => void
  onNavClick?: () => void
}) {
  const copy = dashboardDictionary[locale]
  const initials = getInitials(displayName)
  const visibleNavItems = onboardingRequired ? onboardingNavItems : navItems
  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm overflow-hidden rounded-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF1FF] border border-[#E4E7F0]">
            <svg className="h-5 w-5 text-[#3B52D4]" viewBox="0 0 512 512" fill="currentColor">
              <path d="M120 160c-33.1 0-60 26.9-60 60s26.9 60 60 60c11.3 0 21.9-3.1 31-8.5l68.5 68.5c-5.4 9.1-8.5 19.7-8.5 31 0 33.1 26.9 60 60 60s60-26.9 60-60c0-11.3-3.1-21.9-8.5-31l68.5-68.5c9.1 5.4 19.7 8.5 31 8.5 33.1 0 60-26.9 60-60s-26.9-60-60-60-60 26.9-60 60c0 11.3 3.1 21.9 8.5 31l-68.5 68.5c-9.1-5.4-19.7-8.5-31-8.5s-21.9 3.1-31 8.5L151 222.5c5.4-9.1 8.5-19.7 8.5-31 0-33.1-26.9-60-60-60z" />
              <circle cx="430" cy="190" r="50" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-base font-black tracking-tight text-slate-900">
              WOSOOL
              <span className="text-[9px] font-extrabold text-[#3B52D4] bg-[#EEF1FF] px-1.5 py-0.5 rounded border border-[#E4E7F0]">
                وصول
              </span>
            </div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              {copy.layout.networkAdmin}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {visibleNavItems.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              pathname === href
                ? "bg-[#EEF1FF] text-[#3B52D4] border-s-4 border-[#3B52D4]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {copy.nav[key]}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-2 shrink-0">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-[#EEF1FF] text-[#3B52D4] text-xs font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse shrink-0" />
              <p className="text-[11px] font-extrabold text-slate-800 truncate">{displayName}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {copy.layout.logout}
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { locale, setLocale } = useLocale()
  const activeLocale = resolveDashboardLocale(locale)
  const copy = dashboardDictionary[activeLocale]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [onboardingRequired, setOnboardingRequired] = useState(true)

  function cycleLocale() {
    const idx = localeOptions.findIndex((o) => o.code === locale)
    const next = localeOptions[(idx + 1) % localeOptions.length]
    setLocale(next.code as Locale)
  }

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.replace("/login?redirect=/dashboard")
      return
    }

    if (!isLoading && isAdminUser(user)) {
      window.location.replace('/admin')
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (isLoading || !user || isAdminUser(user)) return

    let cancelled = false

    async function checkOnboarding() {
      setIsCheckingOnboarding(true)
      try {
        const response = await fetch("/api/v1/member/dashboard", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-Locale": locale,
          },
        })

        if (!response.ok) {
          if (!cancelled) {
            setOnboardingRequired(true)
            if (pathname !== "/dashboard/profile") {
              router.replace("/dashboard/profile?onboarding=1")
            }
          }
          return
        }

        const payload = (await response.json().catch(() => null)) as DashboardGateResponse | null
        const completion = payload?.data?.profile_completion ?? 0
        const hasProfile = Boolean(payload?.data?.profile?.id)
        const needsOnboarding = !hasProfile || completion < 100

        if (!cancelled) {
          setOnboardingRequired(needsOnboarding)
          if (needsOnboarding && pathname !== "/dashboard/profile") {
            router.replace("/dashboard/profile?onboarding=1")
          }
        }
      } catch {
        if (!cancelled) {
          setOnboardingRequired(true)
          if (pathname !== "/dashboard/profile") {
            router.replace("/dashboard/profile?onboarding=1")
          }
        }
      } finally {
        if (!cancelled) setIsCheckingOnboarding(false)
      }
    }

    checkOnboarding()
    return () => {
      cancelled = true
    }
  }, [isLoading, locale, pathname, router, user])

  useEffect(() => {
    if (!onboardingRequired) return
    if (pathname === "/dashboard/settings") {
      router.replace("/dashboard/profile?onboarding=1")
    }
  }, [onboardingRequired, pathname, router])

  const displayName = user?.name ?? copy.layout.memberFallback
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
    router.replace("/login")
    router.refresh()
  }

  if (isLoading || isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={activeLocale === "ar" ? "rtl" : "ltr"}>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" />
          <span className="text-slate-600 text-sm font-bold">{copy.layout.loading}</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={activeLocale === "ar" ? "rtl" : "ltr"}>
        <span className="text-slate-600 text-sm font-bold">{copy.layout.redirecting}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60" dir={activeLocale === "ar" ? "rtl" : "ltr"}>
      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(59,82,212,0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(59,82,212,0.04), transparent 35%)",
        }}
      />

      {/* ── Desktop sidebar (fixed to the right) ── */}
      <aside
        className="hidden lg:flex flex-col w-72 fixed top-0 start-0 bottom-0 z-50 p-4"
        aria-label={copy.layout.dashboardNavigation}
      >
        <SidebarContent
          pathname={pathname}
          displayName={displayName}
          email={user?.email}
          locale={activeLocale}
          onboardingRequired={onboardingRequired}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label={copy.layout.menuNavigation}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer — slides from the start (right in RTL) */}
          <div className="relative me-auto w-72 h-full p-4 animate-slide-in-right">
            <SidebarContent
              pathname={pathname}
              displayName={displayName}
              email={user?.email}
              locale={activeLocale}
              onboardingRequired={onboardingRequired}
              onLogout={handleLogout}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="lg:ms-72 flex flex-col min-h-screen relative z-10">

        {/* Top bar */}
        <header
          className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40"
          style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.05)" }}
        >
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-3.5 flex items-center gap-3">

            {/* Mobile hamburger — appears on the right in RTL (first DOM = rightmost) */}
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label={copy.layout.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Actions — right side in RTL */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live badge */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {copy.layout.secureLive}
              </div>

              {/* Language switcher */}
              <button
                onClick={cycleLocale}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#3B52D4] transition-colors"
                aria-label={copy.layout.switchLanguage}
                title={localeOptions.find((o) => o.code === locale)?.nativeLabel}
              >
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-extrabold uppercase hidden sm:inline">
                  {locale}
                </span>
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label={copy.layout.notifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 start-1.5 h-2 w-2 bg-[#3B52D4] rounded-full" />
              </button>

              {/* Avatar */}
              <Avatar className="h-8 w-8 ring-2 ring-[#EEF1FF]">
                <AvatarFallback className="bg-[#EEF1FF] text-[#3B52D4] text-xs font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search — left side in RTL */}
            <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-xl px-3 py-2 w-full max-w-xs">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={copy.layout.searchPlaceholder}
                className="bg-transparent text-xs text-slate-700 w-full focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          <div className="mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
