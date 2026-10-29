"use client"

import Link from "next/link"
import { ArrowUpRight, Handshake, Lightbulb, Users } from "lucide-react"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { categoryLabel } from "@/lib/news-feed"
import { getFounderSpotlights } from "@/lib/founder-spotlight"
import { editorialFounders } from "@/lib/founder-discovery"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { UpcomingEvents } from "@/components/sections/UpcomingEvents"
import { StartupDirectory } from "@/components/sections/StartupDirectory"
import { CommunityPartners, FounderShowcase } from "@/components/sections/CommunityShowcase"
import { EoaOverview } from "@/components/eoa/Overview"
import { WosoolBoard } from "@/components/sections/WosoolBoard"
import { RegionalHeroMetrics } from "@/components/sections/RegionalHeroMetrics"
import { HomeHeroMedia } from "@/components/sections/HomeHeroMedia"
import { useHomeContent } from "@/lib/use-home-content"
import { useLocale } from "@/lib/locale"
import styles from "./home.module.css"

const content = {
  ar: {
    eyebrow: "وصول · مجتمع المؤسسين", title: "من مؤسس", highlight: "إلى مؤسس",
    intro: "شبكة أعضاء للمؤسسين في السعودية والخليج وخارجها.",
    description: "مجتمع وصول، من مؤسسين إلى مؤسسين، لمشاركة التجارب والخبرات وتقوية العلاقات وتعزيز فرص النمو.",
    join: "قدّم طلب العضوية", explore: "تصفّح المؤسسين",
    panelTitle: "أشخاص يفهمون رحلتك.", panelText: "اسأل عن تحدٍّ. شارك درسًا. ابدأ علاقة تستمر.",
    panelItems: ["خبرات من أرض الواقع", "علاقات قبل المعاملات", "تعاون يصنع قيمة للطرفين"],
    why: "ما الذي يجمعنا؟", whyTitle: "شركات مختلفة. تحديات متشابهة.",
    benefits: [
      { title: "تعلّم من التجربة", text: "تبادل الدروس العملية في بناء الفرق، وفهم العملاء، وتطوير المنتجات مع مؤسسين يعيشون تحديات مشابهة." },
      { title: "اعثر على الأشخاص المناسبين", text: "استكشف المؤسسين حسب قطاعاتهم ومراحل شركاتهم، وتعرّف على ما يحتاجونه وما يمكنهم مشاركته." },
      { title: "اعملوا معًا", text: "اكتشف شركات المجتمع واللقاءات والفرص، وابدأ محادثات قد تنتهي بعمل مشترك." },
    ],
    foundersLabel: "مجتمع وصول", foundersTitle: "المؤسسون وشركاتهم", foundersText: "خبرات المؤسسين وما يبنونه، لتجد من تبدأ معه محادثتك القادمة.", spotlightLabel: "مؤسسون من السعودية والعالم", spotlightTitle: "مؤسسون يديرون شركات قائمة", spotlightText: "اكتشف المؤسسين وشركاتهم وخبراتهم في السعودية والخليج والعالم.", allFounders: "دليل المؤسسين", allCompanies: "شركات المجتمع",
    loading: "جارٍ تحميل ملفات المؤسسين…", empty: "تظهر ملفات المؤسسين هنا بعد الموافقة على نشرها.", error: "ملفات أعضاء المجتمع غير متاحة مؤقتًا.", retry: "إعادة المحاولة",
    how: "كيف تبدأ؟", howTitle: "كيف تعمل العضوية", steps: [
      { title: "عرّفنا بك", text: "قدّم طلب عضوية يوضح تجربتك وشركتك وما تبحث عنه في المجتمع." },
      { title: "ابنِ حضورك", text: "بعد الموافقة، أكمل ملفك وعرّف الآخرين بخبراتك واحتياجاتك." },
      { title: "شارك وتواصل", text: "تعرّف على المؤسسين، واستكشف اللقاءات، وقدّم قيمة قبل أن تطلبها." },
    ],
    events: "لقاءات المجتمع", eventsTitle: "اللقاءات القادمة",
    program: "مسار مستقل للنمو", programTitle: "EO Riyadh Accelerator", programText: "برنامج النمو ومعايير الأهلية وخطوات التقديم في بوابته المخصصة. عضوية وصول لا تعني القبول في المسرّعة أو عضوية EO.", programLink: "اكتشف المسرّعة",
    news: "الأخبار", newsTitle: "آخر أخبار الشركات الناشئة", allNews: "جميع الأخبار",
  },
  en: {
    eyebrow: "WOSOOL · THE FOUNDER COMMUNITY", title: "Founders", highlight: "to Founders",
    intro: "A members' network for founders in Saudi Arabia, the Gulf and beyond.",
    description: "The Wosool community, from founders to founders: sharing experience and expertise, strengthening relationships and opening up growth opportunities.",
    join: "Apply for membership", explore: "Browse founders",
    why: "WHAT BRINGS US TOGETHER", whyTitle: "Different companies. Similar problems.",
    benefits: [
      { title: "Learn from experience", text: "Exchange practical lessons in building teams, understanding customers, and developing products with founders navigating similar challenges." },
      { title: "Find your people", text: "Explore founders by sector and company stage. Understand what they need and the experience they can share." },
      { title: "Work together", text: "Find community companies, gatherings and opportunities, and start conversations that can turn into joint work." },
    ],
    foundersLabel: "THE WOSOOL COMMUNITY", foundersTitle: "Founders and their companies", foundersText: "What founders have done and what they are building, so you can see who to talk to next.", spotlightLabel: "FOUNDERS FROM SAUDI ARABIA AND BEYOND", spotlightTitle: "Founders running real companies", spotlightText: "Discover founders, their companies and their experience across Saudi Arabia, the Gulf and beyond.", allFounders: "Founder directory", allCompanies: "Community companies",
    loading: "Loading founder profiles…", empty: "Founder profiles appear here once approved for public sharing.", error: "Community member profiles are temporarily unavailable.", retry: "Try again",
    how: "YOUR NEXT STEP", howTitle: "How membership works", steps: [
      { title: "Introduce yourself", text: "Apply for membership with your experience, company, and what you’re looking for in the community." },
      { title: "Build your presence", text: "Once approved, complete your profile so others can discover your experience and needs." },
      { title: "Take part", text: "Meet founders, explore gatherings, and offer something useful before asking for something back." },
    ],
    events: "GATHERINGS", eventsTitle: "Upcoming sessions",
    program: "A SEPARATE GROWTH PATHWAY", programTitle: "EO Riyadh Accelerator", programText: "The growth program, eligibility and application steps are on its own gateway. Wosool membership does not mean Accelerator admission or EO membership.", programLink: "Explore the Accelerator",
    news: "NEWS", newsTitle: "Latest startup news", allNews: "All news",
  },
}

export default function HomePage() {
  const { locale } = useLocale()
  const copy = content[locale]
  const { founders, partners, partnersLoaded, newsItems, loading, failed, retry } = useHomeContent()
  const icons = [Lightbulb, Users, Handshake]
  const spotlights = editorialFounders(getFounderSpotlights(locale), founders)
  return <PublicLayout><div className={styles.home} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className={styles.hero} aria-labelledby="home-title"><HomeHeroMedia ar={locale === "ar"} /><div className={`${styles.container} ${styles.heroGrid}`}>
      <div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1 id="home-title">{copy.title}<br /><span>{copy.highlight}</span></h1><p className={styles.intro}>{copy.intro}</p><p className={styles.lead}>{copy.description}</p><div className={styles.actions}><Link className={styles.primary} href="/apply">{copy.join}<ArrowUpRight size={18} /></Link><Link className={styles.secondary} href="#founder-community">{copy.explore}</Link></div></div>
      <RegionalHeroMetrics ar={locale === "ar"} />
    </div></section>
    <CommunityPartners partners={partners} loaded={partnersLoaded} loading={loading} failed={failed.includes("partners")} retry={retry} />
    <section id="founder-community" className={styles.founders} aria-labelledby="founders-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.spotlightLabel}</p><h2 id="founders-title">{locale === 'ar' ? 'تعرّف على المؤسسين' : 'Meet the founders'}</h2><p className={styles.lead}>{copy.spotlightText}</p></div><Link className={styles.textLink} href="/founders">{copy.allFounders}<ArrowUpRight size={18} /></Link></div>
      <div id="founder-spotlight"><FounderShowcase founders={spotlights} randomize /></div>
      {(founders.length > 0 || failed.includes('founders')) && <section className="mt-12" aria-labelledby="community-profiles-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.foundersLabel}</p><h3 id="community-profiles-title">{copy.foundersTitle}</h3><p className={styles.lead}>{copy.foundersText}</p></div></div>
        {failed.includes('founders') && <div className={styles.availability} role="status"><span>{copy.error}</span><button type="button" onClick={retry} disabled={loading}>{loading ? copy.loading : copy.retry}</button></div>}
        {founders.length > 0 && <FounderShowcase founders={founders} randomize />}
      </section>}
      <div className={styles.directoryLinks}><Link className={styles.textLink} href="/startups">{locale === "ar" ? "دليل الشركات الناشئة" : "Startup directory"}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link className={styles.textLink} href="/founders/companies">{copy.allCompanies}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </div></section>
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="why-title"><p className={styles.eyebrow}>{copy.why}</p><h2 id="why-title">{copy.whyTitle}</h2><div className={styles.benefits}>{copy.benefits.map((benefit,i) => { const Icon = icons[i]; return <article key={benefit.title}><Icon size={25} aria-hidden="true" /><h3>{benefit.title}</h3><p>{benefit.text}</p></article> })}</div></section>
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="how-title"><p className={styles.eyebrow}>{copy.how}</p><h2 id="how-title">{copy.howTitle}</h2><ol className={styles.steps}>{copy.steps.map((step,i) => <li key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol><Link href="/apply" className={styles.primary}>{copy.join}<ArrowUpRight size={18} /></Link></section>
    <section className={styles.events} aria-labelledby="events-title"><div className={styles.container}><p className={styles.eyebrow}>{copy.events}</p><h2 id="events-title">{copy.eventsTitle}</h2><div className="mt-8"><UpcomingEvents /></div></div></section>
    <div className={`${styles.container} ${styles.section}`}><StartupDirectory compact />
    <EoaOverview /></div>
    {newsItems.length > 0 && <section className={`${styles.container} ${styles.news}`} aria-labelledby="news-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.news}</p><h2 id="news-title">{copy.newsTitle}</h2></div><Link className={styles.textLink} href="/news">{copy.allNews}</Link></div><div className={styles.benefits}>{newsItems.slice(0,3).map(item => { const story = getLocalizedNewsContent(item, locale); return <article key={item.id}><p className={styles.eyebrow}>{categoryLabel(item.category, locale)}</p><h3><Link href={`/news/${item.slug}`}>{story.title}</Link></h3><p>{story.excerpt}</p></article> })}</div></section>}
    <WosoolBoard />
  </div></PublicLayout>
}
