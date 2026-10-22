"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUp, ArrowUpRight } from "lucide-react"
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
        { href: "/wiki", label: "مركز المعرفة" },
        { href: "/api", label: "واجهة البيانات" },
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
        { href: "/wiki", label: "Knowledge hub" },
        { href: "/api", label: "API reference" },
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
  const pathname = usePathname()
  const { isEoa } = publicJourney(pathname)
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
      <div className={styles.container}>
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

        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label={locale === "ar" ? "وصول — من مؤسس إلى مؤسس" : "Wosool — Founders to Founders"}>
              <Image
                src="/wosool-logo-white.svg"
                alt="Wosool — Founders to Founders"
                width={914}
                height={205}
                unoptimized
                className="h-auto w-[270px] max-w-full object-contain sm:w-[310px]"
              />
            </Link>
            <p className={styles.description}>{isEoa ? (ar ? "بوابتك الرقمية إلى مسرّعة EO الرياض. تعلّم مع المؤسسين، وطبّق ما تتعلمه، وتابع رحلة نمو شركتك." : "Your digital gateway to EO Riyadh Accelerator. Learn alongside founders, put ideas into practice and follow your company’s growth journey.") : copy.description}</p>
            <div className={styles.socials}>
              <a href="https://twitter.com/AboutWosool" target="_blank" rel="noopener noreferrer" aria-label={ar ? "وصول على X — يفتح في نافذة جديدة" : "Wosool on X — opens in a new tab"} className={styles.socialLink}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.4-8.5L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" /></svg><span dir="ltr">X</span>
              </a>
              <a href="https://linkedin.com/company/wosool" target="_blank" rel="noopener noreferrer" aria-label={ar ? "وصول على LinkedIn — يفتح في نافذة جديدة" : "Wosool on LinkedIn — opens in a new tab"} className={styles.socialLink}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.76V9.2h2.83v1.3h.04c.39-.74 1.35-1.52 2.79-1.52 2.98 0 3.58 1.96 3.58 4.51v5.26Z" /></svg><span dir="ltr">LinkedIn</span>
              </a>
              <a href="https://instagram.com/aboutwosool" target="_blank" rel="noopener noreferrer" aria-label={ar ? "وصول على Instagram — يفتح في نافذة جديدة" : "Wosool on Instagram — opens in a new tab"} className={styles.socialLink}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg><span dir="ltr">Instagram</span></a>
            </div>
          </div>

          <nav className={styles.navigation} aria-label={ar ? "روابط التذييل" : "Footer navigation"}>
          {footerColumns.map(([category, links]) => (
            <div key={category} className={styles.linkGroup}>
              <h3 className={styles.groupTitle}>{category}</h3>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link.href}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`text-sm ${styles.muted}`}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={`text-sm ${styles.muted}`}>© {new Date().getFullYear()} Wosool. {copy.copyright}</p>
          <div className={styles.legalLinks}>
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
