"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { localeOptions, type Locale, useLocale } from "@/lib/locale"

const headerCopy = {
  ar: {
    navLinks: [
      { href: "/", label: "الرئيسية" },
      { href: "/programs", label: "البرامج" },
      { href: "/founders", label: "الأعضاء" },
      { href: "/events", label: "الفعاليات" },
      { href: "/partners", label: "الشركاء" },
      { href: "/news", label: "الرؤى" },
    ],
    tagline: "من مؤسس إلى مؤسس",
    login: "تسجيل الدخول",
    apply: "قدّم للانضمام",
    dashboard: "لوحة التحكم",
    languageLabel: "اللغة",
  },
  en: {
    navLinks: [
      { href: "/", label: "Home" },
      { href: "/programs", label: "Programs" },
      { href: "/founders", label: "Members" },
      { href: "/events", label: "Events" },
      { href: "/partners", label: "Partners" },
      { href: "/news", label: "Insights" },
    ],
    tagline: "Private founders network",
    login: "Login",
    apply: "Apply to join",
    dashboard: "Dashboard",
    languageLabel: "Language",
  },
  fr: {
    navLinks: [
      { href: "/", label: "Accueil" },
      { href: "/programs", label: "Programmes" },
      { href: "/founders", label: "Membres" },
      { href: "/events", label: "Événements" },
      { href: "/partners", label: "Partenaires" },
      { href: "/news", label: "Insights" },
    ],
    tagline: "Réseau privé de fondateurs",
    login: "Connexion",
    apply: "Postuler",
    dashboard: "Tableau de bord",
    languageLabel: "Langue",
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
        mobile && "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
      )}
    >
      <Globe
        className={cn(
          "text-slate-400",
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
          "appearance-none outline-none",
          mobile
            ? "min-w-0 flex-1 bg-transparent text-sm text-slate-700"
            : `h-9 rounded-full border border-slate-200 bg-white text-sm text-slate-700 transition-colors hover:bg-slate-50 ${direction === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"}`
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
  const copy = headerCopy[locale]

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
          : "bg-white/70 backdrop-blur-md"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image
                src="/wosool-network-logo.png"
                alt="Wosool logo"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
                WOSOOL
                <span className="text-[10px] font-extrabold text-[#3B52D4] bg-[#EEF1FF] px-1.5 py-0.5 rounded border border-[#E4E7F0]">
                  وصول
                </span>
              </div>
              <div
                className={cn(
                  "hidden text-[10px] font-bold text-slate-500 sm:block",
                  locale === "ar" ? "tracking-normal" : "uppercase tracking-[0.18em]"
                )}
              >
                {copy.tagline}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {copy.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-colors",
                  pathname === link.href
                    ? "text-[#3B52D4]"
                    : "text-slate-600 hover:text-[#3B52D4]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSelect
              locale={locale}
              direction={direction}
              onChange={setLocale}
              label={copy.languageLabel}
            />
            {isAuthenticated ? (
              <>
                <span className="max-w-[140px] truncate text-sm text-slate-500">{user?.name}</span>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-xs font-bold shadow-md shadow-[#3B52D4]/20"
                >
                  <Link href="/dashboard">{copy.dashboard}</Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-600 transition-colors hover:text-[#3B52D4]"
                >
                  {copy.login}
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-xs font-bold shadow-md shadow-[#3B52D4]/20"
                >
                  <Link href="/apply">{copy.apply}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="p-2 text-slate-600 transition-colors hover:text-slate-900 lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="space-y-1 px-4 py-4" aria-label="Mobile navigation">
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
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  pathname === link.href
                    ? "bg-[#EEF1FF] text-[#3B52D4]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              {isAuthenticated ? (
                <Button
                  asChild
                  size="sm"
                  className="w-full rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold"
                >
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    {copy.dashboard}
                  </Link>
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm font-bold text-slate-600 hover:text-[#3B52D4]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {copy.login}
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold"
                  >
                    <Link href="/apply" onClick={() => setIsMenuOpen(false)}>
                      {copy.apply}
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
