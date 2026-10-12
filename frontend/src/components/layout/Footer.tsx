"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUp, ArrowUpRight, AtSign, Camera, Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import { useLocale } from "@/lib/locale"
import { publicJourney } from "@/lib/navigation"
import styles from "./footer.module.css"

const footerCopy = {
  ar: {
    description: "وصول شبكة من المؤسسين إلى المؤسسين، تربطهم بممكّني منظومة ريادة الأعمال والمستثمرين وشركات رأس المال الجريء. انطلقت بمبادرة من مؤسسين سعوديين خريجي برنامج «Multiverse» التابع لـ CODE بوزارة الاتصالات وتقنية المعلومات، من السعودية إلى العالم.",
    columns: {
      "المنصة": [
        { href: "/founders", label: "شبكة المؤسسين" },
        { href: "/founders/companies", label: "شركات المجتمع" },
        { href: "/events", label: "الفعاليات" },
        { href: "/apply", label: "قدّم للانضمام" },
      ],
      "البرامج": [
        { href: "/eoa", label: "EO Riyadh Accelerator" },
        { href: "/programs", label: "جميع البرامج" },
        { href: "/opportunities", label: "فرص ريادة الأعمال" },
        { href: "/eoa/eligibility", label: "معايير الملاءمة" },
      ],
      "المجتمع": [
        { href: "/news", label: "الأخبار والرؤى" },
        { href: "/partners", label: "الشركاء" },
        { href: "/sponsors", label: "الرعاة" },
        { href: "/faq", label: "الأسئلة الشائعة" },
        { href: "/contact", label: "تواصل معنا" },
      ],
      "عن وصول": [
        { href: "/about", label: "عن وصول" },
        { href: "/login", label: "حسابي" },
        { href: "/privacy", label: "الخصوصية" },
        { href: "/terms", label: "شروط الاستخدام" },
      ],
    },
    copyright: "جميع الحقوق محفوظة.",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    contact: "اتصل بنا",
  },
  en: {
    description: "Wosool is a founders-to-founders network connecting entrepreneurs with ecosystem enablers, investors and venture capital firms. Founded as an initiative by Saudi founder alumni of Multiverse, a CODE–MCIT program, Wosool connects founders from Saudi Arabia to the world.",
    columns: {
      Platform: [
        { href: "/founders", label: "Founder network" },
        { href: "/founders/companies", label: "Community companies" },
        { href: "/events", label: "Events" },
        { href: "/apply", label: "Apply to join" },
      ],
      Programs: [
        { href: "/eoa", label: "EO Riyadh Accelerator" },
        { href: "/programs", label: "All programs" },
        { href: "/opportunities", label: "Entrepreneurship opportunities" },
        { href: "/eoa/eligibility", label: "Eligibility criteria" },
      ],
      Community: [
        { href: "/news", label: "News & insights" },
        { href: "/partners", label: "Partners" },
        { href: "/sponsors", label: "Sponsors" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
      ],
      "About Wosool": [
        { href: "/about", label: "About Wosool" },
        { href: "/login", label: "My account" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms of use" },
      ],
    },
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
  const ar = locale === "ar"
  const footerColumns: Array<[string, Array<{ href: string; label: string }>]> = isEoa ? [
    [ar ? "المسرّعة" : "Accelerator", [
      { href: "/eoa/about", label: ar ? "عن البرنامج" : "About the program" },
      { href: "/eoa/program", label: ar ? "رحلة التعلم" : "Learning journey" },
      { href: "/eoa/eligibility", label: ar ? "الأهلية والرسوم" : "Eligibility & fees" },
      { href: "/eoa/faq", label: ar ? "الأسئلة الشائعة" : "FAQs" },
    ]],
    [ar ? "ابدأ رحلتك" : "Your journey", [
      { href: "/eoa/apply", label: ar ? "قدّم طلبك" : "Apply" },
      { href: "/eoa/account", label: ar ? "حسابي" : "My account" },
      { href: "/dashboard/eoa", label: ar ? "لوحة المشارك" : "Participant dashboard" },
      { href: "/eoa/privacy", label: ar ? "الخصوصية والبيانات" : "Privacy & data" },
    ]],
    [ar ? "مجتمع الرياض" : "Riyadh community", [
      { href: "/eoa/leadership", label: ar ? "مجلس الإدارة والقيادة" : "Board & leadership" },
      { href: "/eoa/mentors", label: ar ? "المرشدون والمدربون" : "Mentors & coaches" },
      { href: "/eoa/partners", label: ar ? "الشركاء" : "Partners" },
      { href: "/eoa/contact", label: ar ? "تواصل مع الفريق" : "Contact the team" },
    ]],
    [ar ? "اكتشف وصول" : "Explore Wosool", [
      { href: "/", label: ar ? "من مؤسس إلى مؤسس" : "Founders to Founders" },
      { href: "/founders", label: ar ? "شبكة المؤسسين" : "Founder network" },
      { href: "/events", label: ar ? "الفعاليات" : "Events" },
    ]],
  ] : Object.entries(copy.columns)

  return (
    <footer className={styles.footer} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} aria-label={locale === "ar" ? "تذييل الموقع" : "Site footer"}>
      <div className="mx-auto max-w-[var(--container-wide)] px-4 py-16 sm:px-6 lg:px-8">
        {!isEoa && (
          <div className={styles.invitation}>
            <div>
              <p>{locale === "ar" ? "من مؤسس إلى مؤسس" : "FOUNDERS TO FOUNDERS"}</p>
              <h2>{locale === "ar" ? "ابنِ علاقات تستحق وقتك." : "Make your next connection count."}</h2>
              <span>{locale === "ar" ? "شارك تجربتك. تعرّف على مجتمعك. وابنِ ما هو قادم." : "Share your experience. Find your community. Build what comes next."}</span>
            </div>
            <Link href="/apply">{locale === "ar" ? "انضم إلى وصول" : "Join Wosool"}<ArrowUpRight size={20} /></Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-flex max-w-full" aria-label={locale === "ar" ? "وصول — من مؤسس إلى مؤسس" : "Wosool — Founders to Founders"}>
              <Image
                src="/wosool-logo-white.svg"
                alt="Wosool — Founders to Founders"
                width={914}
                height={205}
                unoptimized
                className="h-auto w-[270px] max-w-full object-contain sm:w-[310px]"
              />
            </Link>
            <p className={`mb-6 max-w-sm text-sm leading-7 ${styles.muted}`}>{isEoa ? (ar ? "بوابتك الرقمية إلى مسرّعة EO الرياض. تعلّم مع المؤسسين، وطبّق ما تتعلمه، وتابع رحلة نمو شركتك." : "Your digital gateway to EO Riyadh Accelerator. Learn alongside founders, put ideas into practice and follow your company’s growth journey.") : copy.description}</p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/AboutWosool" target="_blank" rel="noopener noreferrer" aria-label="Wosool on X" className={styles.socialLink}><AtSign className="h-4 w-4" /></a>
              <a href="https://linkedin.com/company/wosool" target="_blank" rel="noopener noreferrer" aria-label="Wosool on LinkedIn" className={styles.socialLink}><Globe className="h-4 w-4" /></a>
              <a href="https://instagram.com/aboutwosool" target="_blank" rel="noopener noreferrer" aria-label="Wosool on Instagram" className={styles.socialLink}><Camera className="h-4 w-4" /></a>
            </div>
          </div>

          {footerColumns.map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-bold">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}><Link href={link.href} className={`text-sm ${styles.muted}`}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row ${styles.bottom}`}>
          <p className={`text-sm ${styles.muted}`}>© {new Date().getFullYear()} Wosool. {copy.copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href={isEoa ? "/eoa/privacy" : "/privacy"} className={`text-sm ${styles.muted}`}>{copy.privacy}</Link>
            <Link href="/terms" className={`text-sm ${styles.muted}`}>{copy.terms}</Link>
            <Link href={isEoa ? "/eoa/contact" : "/contact"} className={`text-sm ${styles.muted}`}>{copy.contact}</Link>
            <button
              type="button"
              className={styles.backTop}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
                document.getElementById("main-content")?.focus({ preventScroll: true })
              }}
            >
              {locale === "ar" ? "إلى الأعلى" : "Back to top"}<ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
