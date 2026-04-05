"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/founders", label: "Founders" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/partners", label: "Partners" },
  { href: "/news", label: "News" },
  { href: "/apply", label: "Apply" },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

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
          ? "bg-[#0A1628] shadow-lg"
          : "bg-[#0A1628]/95 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold text-white tracking-tight">
              Wosool
            </span>
            <span className="hidden sm:block text-xs text-[#C9A84C] font-medium mt-1 tracking-widest uppercase">
              وصول
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#C9A84C]"
                    : "text-gray-300 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Button asChild size="sm">
              <Link href="/apply">Join Wosool</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0A1628] border-t border-white/10">
          <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#C9A84C] bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/login"
                className="block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Button asChild size="sm" className="w-full">
                <Link href="/apply" onClick={() => setIsMenuOpen(false)}>
                  Join Wosool
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
