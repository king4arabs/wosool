"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { isAdminUser } from "@/lib/admin"
import { useLocale, localeOptions, type Locale } from "@/lib/locale"
import { dashboardDictionary, resolveDashboardLocale } from "@/lib/dashboard-i18n"

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, key: "foundersBook" },
  { href: "/dashboard/profile",  icon: User,            key: "profile" },
  { href: "/dashboard/company",  icon: Building2,       key: "company" },
  { href: "/dashboard/scorecard",icon: Star,            key: "scorecard" },
  { href: "/dashboard/society",  icon: Users,           key: "society" },
  { href: "/dashboard/matches",  icon: Sparkles,        key: "matches" },
  { href: "/dashboard/events",   icon: CalendarDays,    key: "events" },
  { href: "/dashboard/programs", icon: GraduationCap,   key: "programs" },
  { href: "/dashboard/messages", icon: MessageCircle,   key: "messages" },
  { href: "/dashboard/settings", icon: Settings,        key: "settings" },
] as const

const onboardingNavItems = [
  { href: "/dashboard/profile", icon: User, key: "profile" },
  { href: "/dashboard/company", icon: Building2, key: "company" },
] as const

interface DashboardGateResponse {
  data?: {
    account_approved?: boolean
    profile_completion?: number
    company_completion?: number
    profile?: { id?: number } | null
    intro_requests?: { pending_count?: number }
    companies?: Array<unknown>
  }
}

const onboardingAllowedPaths = new Set([
  "/dashboard/profile",
  "/dashboard/company",
])

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
              <span className="text-xs font-extrabold text-[#3B52D4] bg-[#EEF1FF] px-1.5 py-0.5 rounded border border-[#E4E7F0]">
                وصول
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {copy.layout.networkAdmin}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <Link href="/dashboard/eoa" className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-[#3B52D4]"><GraduationCap className="h-4 w-4" />EO Riyadh Accelerator</Link>
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
              <p className="text-xs font-extrabold text-slate-800 truncate">{displayName}</p>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{email}</p>
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

function DashboardFullscreenLoader({
  locale,
  label,
}: {
  locale: "ar" | "en"
  label: string
}) {
  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center px-6"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div
          className="pointer-events-none absolute -top-10 -end-10 h-28 w-28 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(59,82,212,0.25), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E4E7F0] bg-[#EEF1FF]">
            <Image
              src="/wosool-network-logo.png"
              alt="Wosool logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <div className="text-base font-black tracking-tight text-slate-900">
              WOSOOL
            </div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#EEF1FF]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#3B52D4]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEoaWorkspace = pathname.startsWith("/dashboard/eoa")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout, isLoading, error: authError, refresh } = useAuth()
  const { toast } = useToast()
  const { locale, setLocale } = useLocale()
  const activeLocale = resolveDashboardLocale(locale)
  const copy = dashboardDictionary[activeLocale]
  const [search, setSearch] = useState("")
  const [gateError, setGateError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pendingIntros, setPendingIntros] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [onboardingRequired, setOnboardingRequired] = useState(true)
  const hasOnboardingQuery = searchParams.get("onboarding") === "1"

  function cycleLocale() {
    const idx = localeOptions.findIndex((o) => o.code === locale)
    const next = localeOptions[(idx + 1) % localeOptions.length]
    setLocale(next.code as Locale)
  }

  useEffect(() => {
    if (!isLoading && !authError && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (!isLoading && isAdminUser(user) && !isEoaWorkspace) {
      window.location.replace('/admin')
    }
  }, [isLoading, authError, pathname, router, user, isEoaWorkspace])

  useEffect(() => {
    if (isLoading || !user) return
    if (isEoaWorkspace) { setIsCheckingOnboarding(false); setGateError(null); return }
    if (isAdminUser(user)) return

    let cancelled = false

    async function checkOnboarding() {
      setIsCheckingOnboarding(true)
      setGateError(null)
      try {
        const payload = await api.get<DashboardGateResponse>("/member/dashboard", { headers: { "X-Locale": locale } })
        const accountApproved = Boolean(payload?.data?.account_approved)
        const hasProfile = Boolean(payload?.data?.profile?.id)
        const companiesCount = Array.isArray(payload?.data?.companies) ? payload!.data!.companies!.length : 0
        // Unlock full dashboard when the account is approved and the user has both
        // a founder profile and at least one company linked.
        const needsOnboarding = !accountApproved || !hasProfile || companiesCount === 0

          if (!cancelled) {
            setPendingIntros(payload?.data?.intro_requests?.pending_count ?? 0)
            setOnboardingRequired(needsOnboarding)
            if (needsOnboarding && !onboardingAllowedPaths.has(pathname)) {
              router.replace("/dashboard/profile?onboarding=1")
            }

            if (!needsOnboarding && pathname === "/dashboard/profile" && hasOnboardingQuery) {
              router.replace("/dashboard/profile")
            }
          }
      } catch (error) {
        if (!cancelled) setGateError(error instanceof Error ? error.message : (locale === "ar" ? "تعذر تحميل الحساب." : "Unable to load your account."))
      } finally {
        if (!cancelled) setIsCheckingOnboarding(false)
      }
    }

    checkOnboarding()
    return () => {
      cancelled = true
    }
  }, [attempt, hasOnboardingQuery, isLoading, locale, pathname, router, user, isEoaWorkspace])

  const displayName = user?.name ?? copy.layout.memberFallback
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    try {
      await logout()
      setMobileOpen(false)
      router.replace("/login")
      router.refresh()
    } catch (error) { toast(error instanceof Error ? error.message : "Unable to sign out", "error") }
  }

  if (authError || gateError) return <div className="mx-auto max-w-xl p-6 pt-20" role="alert"><p>{authError || gateError}</p><button className="mt-4 rounded-xl bg-[#3B52D4] px-5 py-3 text-white" onClick={() => authError ? void refresh() : setAttempt(value => value + 1)}>{locale === "ar" ? "إعادة المحاولة" : "Try again"}</button></div>

  if (isLoading || isCheckingOnboarding) {
    return <DashboardFullscreenLoader locale={activeLocale} label={copy.layout.loading} />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={activeLocale === "ar" ? "rtl" : "ltr"}>
        <span className="text-slate-600 text-sm font-bold">{copy.layout.redirecting}</span>
      </div>
    )
  }

  if (isEoaWorkspace) return <div className="min-h-screen bg-slate-50" dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}><header className="border-b bg-white"><nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4"><Link className="font-bold text-[#3B52D4]" href="/">WOSOOL / وصول</Link><Link className="min-h-11 flex items-center text-sm" href="/EOA">EO Riyadh Accelerator</Link><Link className="min-h-11 flex items-center text-sm" href="/EOA/apply">{locale === 'ar' ? 'طلب الالتحاق' : 'Application'}</Link><button className="ms-auto min-h-11 rounded-lg border px-4" onClick={cycleLocale}>{locale === 'ar' ? 'English' : 'العربية'}</button></nav></header><main id="main-content" className="eoa">{children}</main></div>

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
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="start-0 end-auto top-0 bottom-0 translate-x-0 translate-y-0 h-dvh max-h-dvh w-[min(20rem,calc(100%-2rem))] rounded-none p-3 pt-14">
          <DialogTitle className="sr-only">{copy.layout.menuNavigation}</DialogTitle>
          <SidebarContent pathname={pathname} displayName={displayName} email={user?.email} locale={activeLocale} onboardingRequired={onboardingRequired} onLogout={handleLogout} onNavClick={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Main area ── */}
      <div className="lg:ms-72 flex flex-col min-h-screen relative z-10">

        {/* Top bar */}
        <header
          className="min-h-16 flex items-center justify-between px-2 sm:px-4 mb-4 glass-panel rounded-2xl shrink-0 bg-white/90 shadow-sm mt-4"
          style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.05)" }}
        >
          <div className="mx-auto w-full min-w-0 max-w-screen-2xl px-2 py-3 flex flex-wrap items-center gap-3">

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
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
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
                <span className="text-xs font-extrabold uppercase hidden sm:inline">
                  {locale}
                </span>
              </button>

              <details className="relative">
                <summary className="flex min-h-11 min-w-11 list-none items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label={copy.layout.notifications}>
                  <Bell className="h-5 w-5" />
                  {pendingIntros > 0 && <span className="ms-1 text-xs text-[#3B52D4]">{pendingIntros}</span>}
                </summary>
                <div className="absolute start-0 z-40 mt-2 w-56 rounded-xl border bg-white p-3 shadow-lg">
                  <Link className="block rounded-lg p-2 hover:bg-slate-50" href="/dashboard/matches">{locale === "ar" ? "طلبات التعارف" : "Introductions"} ({pendingIntros})</Link>
                  <Link className="block rounded-lg p-2 hover:bg-slate-50" href="/dashboard/events">{copy.nav.events}</Link>
                  <Link className="block rounded-lg p-2 hover:bg-slate-50" href="/dashboard/messages">{copy.nav.messages}</Link>
                </div>
              </details>

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
            <form role="search" onSubmit={event => { event.preventDefault(); router.push(`/dashboard/directory?q=${encodeURIComponent(search.trim())}`) }} className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-xl px-3 py-2 w-full sm:max-w-xs">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                aria-label={copy.layout.searchPlaceholder}
                placeholder={copy.layout.searchPlaceholder}
                className="bg-transparent text-xs text-slate-700 w-full focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button type="submit" className="min-h-9 shrink-0 px-2 text-sm text-[#3B52D4]">{locale === "ar" ? "بحث" : "Search"}</button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="min-w-0 flex-1 px-4 sm:px-6 py-6">
          <div className="mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
