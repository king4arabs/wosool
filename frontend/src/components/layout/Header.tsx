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
      { href: "/opportunities", label: "الفرص" },
      { href: "/eoa", label: "EO Riyadh Accelerator" },
      { href: "/founders", label: "المؤسسون" },
      { href: "/events", label: "الفعاليات" },
      { href: "/partners", label: "الشركاء" },
      { href: "/news", label: "الرؤى" },
    ],
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
      { href: "/eoa", label: "EO Riyadh Accelerator" },
      { href: "/founders", label: "Founders" },
      { href: "/events", label: "Events" },
      { href: "/partners", label: "Partners" },
      { href: "/news", label: "Insights" },
    ],
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
        mobile && "flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3",
      )}
    >
      <Globe
        className={cn(
          "text-[var(--text-muted)]",
          mobile
            ? "h-4 w-4 shrink-0"
            : `pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 ${direction === "rtl" ? "right-3" : "left-3"}`,
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
            : `h-11 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)] ${direction === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"}`,
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
  const normalizedPath = pathname.toLowerCase()
  const isActive = (href: string) => {
    const normalizedHref = href.toLowerCase()
    return normalizedHref === "/"
      ? normalizedPath === "/"
      : normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`)
  }

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
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMenuOpen(false)
    }
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
        "fixed inset-x-0 top-0 z-50 bg-[color:var(--surface)]/96 text-[var(--text)] backdrop-blur-xl transition-shadow duration-300 motion-reduce:transition-none [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[var(--action-bg)]",
        isScrolled
          ? "border-b border-[var(--border-soft)] shadow-[var(--shadow-card)]"
          : "border-b border-[var(--border-soft)]",
      )}
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[88px] items-center justify-between gap-5">
          <Link
            href="/"
            aria-label={locale === "ar" ? "وصول — من مؤسس إلى مؤسس" : "Wosool — Founders to Founders"}
            className="flex min-w-0 shrink-0 items-center"
          >
            <Image
              src="/wosool-logo-eo.svg"
              alt="Wosool — Founders to Founders"
              width={914}
              height={205}
              priority
              unoptimized
              className="h-auto w-[198px] object-contain sm:w-[235px] lg:w-[255px] 2xl:w-[280px]"
            />
          </Link>

          <nav className="hidden min-w-0 items-center gap-0.5 xl:flex" aria-label={copy.navigation}>
            {copy.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-[var(--radius-control)] px-2.5 py-3 text-[11px] font-extrabold transition-colors 2xl:px-3 2xl:text-xs",
                  isActive(link.href)
                    ? "bg-[var(--surface-blue)] text-[var(--action-bg)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--action-bg)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <LanguageSelect locale={locale} direction={direction} onChange={setLocale} label={copy.languageLabel} />
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[110px] truncate text-xs text-[var(--text-muted)] 2xl:block">{user?.name}</span>
                <Button asChild size="sm" className="min-h-11 rounded-[var(--radius-control)] bg-[var(--action-bg)] text-xs font-extrabold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
                  <Link href={workspace}>{copy.dashboard}</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href={journey.loginHref} className="inline-flex min-h-11 items-center px-2 text-xs font-extrabold text-[var(--text-muted)] transition-colors hover:text-[var(--action-bg)]">
                  {copy.login}
                </Link>
                <Button asChild size="sm" className="min-h-11 rounded-[var(--radius-control)] bg-[var(--action-bg)] text-xs font-extrabold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
                  <Link href={journey.applyHref}>{applyLabel}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            ref={menuButton}
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--action-bg)] xl:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? copy.closeMenu : copy.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain border-t border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-raised)] xl:hidden">
          <nav className="mx-auto max-w-[var(--container-wide)] space-y-1 px-4 py-4 sm:px-6" aria-label={copy.navigation}>
            <LanguageSelect locale={locale} direction={direction} onChange={setLocale} mobile label={copy.languageLabel} />
            {copy.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "block rounded-[var(--radius-control)] px-4 py-3 text-sm font-extrabold transition-colors",
                  isActive(link.href)
                    ? "bg-[var(--surface-blue)] text-[var(--action-bg)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-4">
              {isAuthenticated ? (
                <Button asChild size="sm" className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--action-bg)] font-extrabold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
                  <Link href={workspace} onClick={() => setIsMenuOpen(false)}>{copy.dashboard}</Link>
                </Button>
              ) : (
                <>
                  <Link href={journey.loginHref} className="block min-h-11 px-4 py-3 text-sm font-extrabold text-[var(--text-muted)] hover:text-[var(--action-bg)]" onClick={() => setIsMenuOpen(false)}>
                    {copy.login}
                  </Link>
                  <Button asChild size="sm" className="min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--action-bg)] font-extrabold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
                    <Link href={journey.applyHref} onClick={() => setIsMenuOpen(false)}>{applyLabel}</Link>
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
