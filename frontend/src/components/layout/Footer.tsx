"use client"

import Image from "next/image"
import Link from "next/link"
import { Globe, AtSign, Share2 } from "lucide-react"
import { useLocale } from "@/lib/locale"

const footerCopy = {
  ar: {
    description:
      "شبكة منتقاة للمؤسسين والمشغلين والمستثمرين والشركاء الذين يبنون شركات جادة في السعودية والخليج.",
    columns: {
      "المنصة": [
        { href: "/founders", label: "شبكة الأعضاء" },
        { href: "/founders/companies", label: "شركات الأعضاء" },
        { href: "/events", label: "الفعاليات" },
        { href: "/apply", label: "قدّم للانضمام" },
      ],
      "البرامج": [
        { href: "/programs", label: "جميع البرامج" },
        { href: "/programs#founder-circles", label: "دوائر المؤسسين" },
        { href: "/programs#growth-track", label: "مسار النمو" },
        { href: "/programs#fundraising", label: "الجاهزية للاستثمار" },
      ],
      "المجتمع": [
        { href: "/news", label: "الأخبار والرؤى" },
        { href: "/partners", label: "الشركاء" },
        { href: "/sponsors", label: "الرعاة" },
        { href: "/contact", label: "تواصل معنا" },
      ],
      "الشركة": [
        { href: "/about", label: "عن وصول" },
        { href: "/about#principles", label: "مبادئنا" },
        { href: "/about#team", label: "القيادة" },
        { href: "/contact", label: "اتصل بنا" },
      ],
    },
    tagline: "شبكة خاصة للمؤسسين",
    copyright: "جميع الحقوق محفوظة.",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    contact: "اتصل بنا",
  },
  en: {
    description:
      "A curated network for founders, operators, investors, and partners building durable companies across Saudi Arabia and the GCC.",
    columns: {
      Platform: [
        { href: "/founders", label: "Member network" },
        { href: "/founders/companies", label: "Member companies" },
        { href: "/events", label: "Events" },
        { href: "/apply", label: "Apply to join" },
      ],
      Programs: [
        { href: "/programs", label: "All programs" },
        { href: "/programs#founder-circles", label: "Founder circles" },
        { href: "/programs#growth-track", label: "Growth track" },
        { href: "/programs#fundraising", label: "Fundraising readiness" },
      ],
      Community: [
        { href: "/news", label: "News & insights" },
        { href: "/partners", label: "Partners" },
        { href: "/sponsors", label: "Sponsors" },
        { href: "/contact", label: "Contact" },
      ],
      Company: [
        { href: "/about", label: "About Wosool" },
        { href: "/about#principles", label: "Our principles" },
        { href: "/about#team", label: "Leadership" },
        { href: "/contact", label: "Get in touch" },
      ],
    },
    tagline: "Private founders network",
    copyright: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    contact: "Contact",
  },
} as const

export function Footer() {
  const { locale } = useLocale()
  const copy = footerCopy[locale]
  const footerColumns = Object.entries(copy.columns) as Array<
    [string, Array<{ href: string; label: string }>]
  >

  return (
    <footer className="bg-white border-t border-slate-200/60 text-slate-700" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D7DEED] bg-white shadow-[0_8px_24px_rgba(7,17,31,0.08)]">
                <Image
                  src="/wosool-network-logo.png"
                  alt="Wosool logo"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Wosool</div>
                <div className="text-[10px] text-slate-500">{copy.tagline}</div>
              </div>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-7 text-slate-500">{copy.description}</p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/AboutWosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Twitter"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/wosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on LinkedIn"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/aboutwosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Instagram"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerColumns.map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-900">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-[#3B52D4]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-8 sm:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Wosool. {copy.copyright}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-slate-400 transition-colors hover:text-[#3B52D4]">
              {copy.privacy}
            </Link>
            <Link href="/terms" className="text-sm text-slate-400 transition-colors hover:text-[#3B52D4]">
              {copy.terms}
            </Link>
            <Link href="/contact" className="text-sm text-slate-400 transition-colors hover:text-[#3B52D4]">
              {copy.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
