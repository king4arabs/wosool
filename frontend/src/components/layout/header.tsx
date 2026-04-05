"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Founders", href: "/founders" },
  { label: "Companies", href: "/companies" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Partners", href: "/partners" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "News", href: "/news" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/5 bg-white/80 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-accent">
              W
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-primary">
                Wosool
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-widest text-secondary/50 sm:block">
                Founders to Founders
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-secondary/80 transition-colors hover:bg-muted hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href="/apply">Apply</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-secondary transition-colors hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile slide-out nav */}
      <div
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 transform bg-white transition-transform duration-300 ease-in-out lg:hidden lg:top-20",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-3 text-base font-medium text-secondary/80 transition-colors hover:bg-muted hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3 border-t border-primary/5 pt-6">
            <Button variant="outline" asChild className="w-full">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button variant="accent" asChild className="w-full">
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                Apply
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
