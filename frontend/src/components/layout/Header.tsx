"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { publicJourney, workspacePath } from "@/lib/navigation"
import { localeOptions, type Locale, useLocale } from "@/lib/locale"

const headerCopy = {
  ar: {
    navLinks: [
      { href: "/", label: "الرئيسية" },
      { href: "/opportunities", label: "فرص ريادة الأعمال" },
      { href: "/EOA", label: "EO Riyadh Accelerator" },
      { href: "/founders", label: "الأعضاء" },
      { href: "/events", label: "الفعاليات" },
      { href: "/partners", label: "الشركاء" },
      { href: "/news", label: "الرؤى" },
    ],
    tagline: "من مؤسس إلى مؤسس",
    login: "تسجيل الدخول",
    apply: "انضم إلى وصول",
    applyEoa: "تقدم إلى EO Accelerator",
    dashboard: "لوحة التحكم",
    languageLabel: "اللغة",
    navigation: "التنقل الرئيسي",
    openMenu: "فتح قائمة التنقل",
    closeMenu: "إغلاق قائمة التنقل",
  },
  en: {
    navLinks: [
      { href: "/", label: "Home" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/EOA", label: "EO Riyadh Accelerator" },
      { href: "/founders", label: "Members" },
      { href: "/events", label: "Events" },
      { href: "/partners", label: "Partners" },
      { href: "/news", label: "Insights" },
    ],
    tagline: "Founders to Founders",
    login: "Login",
    apply: "Join Wosool",
    applyEoa: "Apply to EO Accelerator",
    dashboard: "Dashboard",
    languageLabel: "Language",
    navigation: "Main navigation",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
  },
} as const

function LanguageSelect({
  locale,
  direction,
  onChange,
  mobile = false,
  label,
}: {
  locale: Locale
  direction: "rtl" | "ltr"
  onChange: (locale: Locale) => void
  mobile?: boolean
  label: string
}) {
  return (
    <div
      className={cn(
        "relative",
        mobile && "flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3"
      )}
    >
      <Globe
        className={cn(
          "text-[var(--text-muted)]",
          mobile
            ? "h-4 w-4 shrink-0"
            : `pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 ${direction === "rtl" ? "right-3" : "left-3"}`
        )}
      />
      {!mobile ? <span className="sr-only">{label}</span> : null}
      <select
        aria-label={label}
        value={locale}
        onChange={(event) => onChange(event.target.value as Locale)}
        className={cn(
          "appearance-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--action-bg)]",
          mobile
            ? "min-h-11 min-w-0 flex-1 bg-transparent text-sm text-[var(--text)]"
            : `h-11 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)] ${direction === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"}`
        )}
      >
        {localeOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { locale, setLocale, direction } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const menuButton = React.useRef<HTMLButtonElement>(null)
  const copy = headerCopy[locale]
  const journey = publicJourney(pathname)
  const applyLabel = journey.isEoa ? copy.applyEoa : copy.apply
  const workspace = workspacePath(user)
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  React.useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    const desktop = window.matchMedia("(min-width: 1280px)")
    const closeOnDesktop = () => { if (desktop.matches) setIsMenuOpen(false) }
    window.addEventListener("keydown", closeOnEscape)
    desktop.addEventListener("change", closeOnDesktop)
    return () => {
      window.removeEventListener("keydown", closeOnEscape)
      desktop.removeEventListener("change", closeOnDesktop)
    }
  }, [isMenuOpen])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] text-[var(--text)] transition-shadow duration-300 motion-reduce:transition-none [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[var(--action-bg)]",
        isScrolled
          ? "border-b border-[var(--border-soft)] shadow-[var(--shadow-card)]"
          : "border-b border-[var(--border-soft)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-soft)] bg-[var(--surface)]">
              <Image
                src="/wosool-network-logo.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
                <span lang="en" dir="ltr">WOSOOL</span>
                <span lang="ar" dir="rtl" className="text-base font-bold text-[var(--text)]">
                  وصول
                </span>
              </div>
              <div className="hidden text-xs font-normal text-[var(--text-muted)] sm:block">
                {copy.tagline}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 xl:flex" aria-label={copy.navigation}>
            {copy.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-control)] px-3 py-3 text-xs font-bold transition-colors",
                  isActive(link.href)
                    ? "bg-[var(--surface-soft)] text-[var(--action-bg)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--action-bg)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 xl:flex">
            <LanguageSelect
              locale={locale}
              direction={direction}
              onChange={setLocale}
              label={copy.languageLabel}
            />
            {isAuthenticated ? (
              <>
                <span className="max-w-[140px] truncate text-sm text-[var(--text-muted)]">{user?.name}</span>
                <Button
                  asChild
                  size="sm"
                  className="min-h-11 rounded-[var(--radius-control)] bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-[var(--on-dark)] text-xs font-bold"
                >
                  <Link href={workspace}>{copy.dashboard}</Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={journey.loginHref}
                  className="inline-flex min-h-11 items-center text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--action-bg)]"
                >
                  {copy.login}
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="min-h-11 rounded-[var(--radius-control)] bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-[var(--on-dark)] text-xs font-bold"
                >
                  <Link href={journey.applyHref}>{applyLabel}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            ref={menuButton}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--action-bg)] xl:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? copy.closeMenu : copy.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-card)] xl:hidden">
          <nav className="space-y-1 px-4 py-4" aria-label={copy.navigation}>
            <LanguageSelect
              locale={locale}
              direction={direction}
              onChange={setLocale}
              mobile
              label={copy.languageLabel}
            />
            {copy.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "block rounded-[var(--radius-control)] px-4 py-3 text-sm font-bold transition-colors",
                  isActive(link.href)
                    ? "bg-[var(--surface-soft)] text-[var(--action-bg)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-4">
              {isAuthenticated ? (
                <Button
                  asChild
                  size="sm"
                  className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-[var(--on-dark)] font-bold"
                >
                  <Link href={workspace} onClick={() => setIsMenuOpen(false)}>
                    {copy.dashboard}
                  </Link>
                </Button>
              ) : (
                <>
                  <Link
                    href={journey.loginHref}
                    className="block min-h-11 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--action-bg)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {copy.login}
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-[var(--on-dark)] font-bold"
                  >
                    <Link href={journey.applyHref} onClick={() => setIsMenuOpen(false)}>
                      {applyLabel}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
