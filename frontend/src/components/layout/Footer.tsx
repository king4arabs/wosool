"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ArrowUp, Globe, Camera, AtSign } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { usePathname } from "next/navigation"
import { publicJourney } from "@/lib/navigation"
import styles from "./footer.module.css"

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
        { href: "/EOA", label: "EO Riyadh Accelerator" },
        { href: "/programs", label: "جميع البرامج" },
        { href: "/opportunities", label: "فرص ريادة الأعمال" },
        { href: "/EOA/eligibility", label: "معايير الملاءمة" },
      ],
      "المجتمع": [
        { href: "/news", label: "الأخبار والرؤى" },
        { href: "/partners", label: "الشركاء" },
        { href: "/sponsors", label: "الرعاة" },
        { href: "/contact", label: "تواصل معنا" },
      ],
      "عن وصول": [
        { href: "/about", label: "عن وصول" },
        { href: "/login", label: "حسابي" },
        { href: "/privacy", label: "الخصوصية" },
        { href: "/terms", label: "شروط الاستخدام" },
      ],
    },
    tagline: "من مؤسس إلى مؤسس",
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
        { href: "/EOA", label: "EO Riyadh Accelerator" },
        { href: "/programs", label: "All programs" },
        { href: "/opportunities", label: "Entrepreneurship opportunities" },
        { href: "/EOA/eligibility", label: "Eligibility criteria" },
      ],
      Community: [
        { href: "/news", label: "News & insights" },
        { href: "/partners", label: "Partners" },
        { href: "/sponsors", label: "Sponsors" },
        { href: "/contact", label: "Contact" },
      ],
      "About Wosool": [
        { href: "/about", label: "About Wosool" },
        { href: "/login", label: "My account" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms of use" },
      ],
    },
    tagline: "Founders to Founders",
    copyright: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    contact: "Contact",
  },
} as const

export function Footer() {
  const { locale } = useLocale()
  const copy = footerCopy[locale]
  const { isEoa } = publicJourney(usePathname())
  const footerColumns = Object.entries(copy.columns) as Array<
    [string, Array<{ href: string; label: string }>]
  >

  return (
    <footer className={styles.footer} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} aria-label={locale === "ar" ? "تذييل الموقع" : "Site footer"}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {!isEoa && <div className={styles.invitation}>
          <div><p>{locale === "ar" ? "من مؤسس إلى مؤسس" : "FOUNDERS TO FOUNDERS"}</p><h2>{locale === "ar" ? "ابنِ علاقات تستحق وقتك." : "Make your next connection count."}</h2><span>{locale === "ar" ? "شارك تجربتك. تعرّف على مجتمعك. وابنِ ما هو قادم." : "Share your experience. Find your community. Build what comes next."}</span></div>
          <Link href="/apply">{locale === "ar" ? "انضم إلى وصول" : "Join Wosool"}<ArrowUpRight size={20} /></Link>
        </div>}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 inline-flex items-center gap-3">
              <div className={styles.logoFrame}>
                <Image
                  src="/wosool-network-logo.png"
                  alt=""
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className={styles.wordmark}><span lang="en" dir="ltr">WOSOOL</span><span lang="ar" dir="rtl">وصول</span></div>
                <div className={styles.tagline}>{copy.tagline}</div>
              </div>
            </Link>
            <p className={`mb-6 max-w-sm text-sm leading-7 ${styles.muted}`}>{copy.description}</p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/AboutWosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Twitter"
                className={styles.socialLink}
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/wosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on LinkedIn"
                className={styles.socialLink}
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/aboutwosool"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wosool on Instagram"
                className={styles.socialLink}
              >
                <Camera className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerColumns.map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-bold">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm ${styles.muted}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row ${styles.bottom}`}>
          <p className={`text-sm ${styles.muted}`}>
            © {new Date().getFullYear()} Wosool. {copy.copyright}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className={`text-sm ${styles.muted}`}>
              {copy.privacy}
            </Link>
            <Link href="/terms" className={`text-sm ${styles.muted}`}>
              {copy.terms}
            </Link>
            <Link href="/contact" className={`text-sm ${styles.muted}`}>
              {copy.contact}
            </Link>
            <button type="button" className={styles.backTop} onClick={() => { window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); document.getElementById("main-content")?.focus({ preventScroll: true }) }}>
              {locale === "ar" ? "إلى الأعلى" : "Back to top"}<ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
