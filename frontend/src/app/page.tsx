"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Handshake, Lightbulb, Users } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { UpcomingEvents } from "@/components/sections/UpcomingEvents"
import { CommunityPartners, FounderShowcase } from "@/components/sections/CommunityShowcase"
import { EoaOverview } from "@/components/eoa/Overview"
import { useHomeContent } from "@/lib/use-home-content"
import { useLocale } from "@/lib/locale"
import styles from "./home.module.css"

const content = {
  ar: {
    eyebrow: "وصول · مجتمع المؤسسين", title: "من مؤسس", highlight: "إلى مؤسس",
    intro: "بناء الشركات رحلة. لا تقطعها وحدك.",
    description: "مجتمع يجمع المؤسسين في السعودية والخليج لتبادل الخبرات، وبناء علاقات حقيقية، واكتشاف فرص التعاون. هنا، تبدأ المحادثة بتجربة مشتركة، وتكبر بما يقدّمه كل مؤسس للآخر.",
    join: "انضم إلى وصول", explore: "تعرّف على المؤسسين", note: "عضوية المجتمع تخضع للمراجعة. برامج النمو لها متطلبات تقديم مستقلة.",
    panelTitle: "أشخاص يفهمون رحلتك.", panelText: "اسأل عن تحدٍّ. شارك درسًا. ابدأ علاقة تستمر.",
    panelItems: ["خبرات من أرض الواقع", "علاقات قبل المعاملات", "تعاون يصنع قيمة للطرفين"],
    why: "ما الذي يجمعنا؟", whyTitle: "شركات مختلفة. تحديات مشتركة.",
    benefits: [
      { title: "تعلّم من التجربة", text: "تبادل الدروس العملية في بناء الفرق، وفهم العملاء، وتطوير المنتجات مع مؤسسين يعيشون تحديات مشابهة." },
      { title: "اعثر على الأشخاص المناسبين", text: "استكشف المؤسسين حسب قطاعاتهم ومراحل شركاتهم، وتعرّف على ما يحتاجونه وما يمكنهم مشاركته." },
      { title: "ابنِ شيئًا مع الآخرين", text: "اكتشف شركات المجتمع واللقاءات والفرص، وابدأ محادثات قد تتحول إلى تعاون حقيقي." },
    ],
    foundersLabel: "الأشخاص وراء الشركات", foundersTitle: "تعرّف على من يبنون المستقبل.", foundersText: "المؤسس، قصته، وشركته في مكان واحد. تحكّم بكل صف باستخدام الأسهم أو السحب؛ لا تتحرك البطاقات تلقائيًا.", allFounders: "دليل المؤسسين", allCompanies: "شركات المجتمع",
    loading: "جارٍ تحميل ملفات المؤسسين…", empty: "تظهر ملفات المؤسسين هنا بعد الموافقة على نشرها.", error: "تعذر تحميل ملفات المؤسسين الآن.", retry: "إعادة المحاولة",
    how: "كيف تبدأ؟", howTitle: "علاقتك القادمة تبدأ بخطوة.", steps: [
      { title: "عرّفنا بك", text: "قدّم طلب عضوية يوضح تجربتك وشركتك وما تبحث عنه في المجتمع." },
      { title: "ابنِ حضورك", text: "بعد الموافقة، أكمل ملفك وعرّف الآخرين بخبراتك واحتياجاتك." },
      { title: "شارك وتواصل", text: "تعرّف على المؤسسين، واستكشف اللقاءات، وقدّم قيمة قبل أن تطلبها." },
    ],
    events: "لقاءات المجتمع", eventsTitle: "من التعارف إلى المحادثات المفيدة.", eventsText: "استكشف اللقاءات القادمة وتفاصيل المشاركة في كل فعالية.",
    program: "مسار مستقل للنمو", programTitle: "EO Riyadh Accelerator", programText: "اكتشف برنامج النمو ومعايير الأهلية ورحلة التقديم في بوابته المخصصة. عضوية وصول لا تعني القبول في المسرّعة أو عضوية EO.", programLink: "اكتشف المسرّعة",
    news: "من المجتمع", newsTitle: "أخبار وأفكار تستحق المشاركة.", allNews: "جميع الأخبار",
  },
  en: {
    eyebrow: "WOSOOL · THE FOUNDER COMMUNITY", title: "Founders", highlight: "to Founders",
    intro: "Building a company is a journey. Don’t go it alone.",
    description: "A community connecting founders across Saudi Arabia and the GCC to exchange experience, build genuine relationships, and discover ways to collaborate. Shared experience starts the conversation. What we give each other takes it further.",
    join: "Join Wosool", explore: "Meet the founders", note: "Community membership is reviewed. Growth programs have separate application requirements.",
    panelTitle: "People who get your journey.", panelText: "Bring a challenge. Share a lesson. Build a lasting connection.", panelItems: ["Experience from the field", "Relationships before transactions", "Collaboration that goes both ways"],
    why: "WHAT BRINGS US TOGETHER", whyTitle: "Different companies. Shared challenges.",
    benefits: [
      { title: "Learn from experience", text: "Exchange practical lessons in building teams, understanding customers, and developing products with founders navigating similar challenges." },
      { title: "Find your people", text: "Explore founders by sector and company stage. Understand what they need and the experience they can share." },
      { title: "Build something together", text: "Discover community companies, gatherings, and opportunities. Start conversations that could become meaningful collaborations." },
    ],
    foundersLabel: "THE PEOPLE BEHIND THE COMPANIES", foundersTitle: "Meet the people building what’s next.", foundersText: "The founder, their story, and their company, together. Browse each row using the arrows or swipe; cards never move automatically.", allFounders: "Founder directory", allCompanies: "Community companies",
    loading: "Loading founder profiles…", empty: "Founder profiles appear here once approved for public sharing.", error: "We couldn’t load founder profiles right now.", retry: "Try again",
    how: "YOUR NEXT STEP", howTitle: "Every connection starts somewhere.", steps: [
      { title: "Introduce yourself", text: "Apply for membership with your experience, company, and what you’re looking for in the community." },
      { title: "Build your presence", text: "Once approved, complete your profile so others can discover your experience and needs." },
      { title: "Take part", text: "Meet founders, explore gatherings, and offer something useful before asking for something back." },
    ],
    events: "COME TOGETHER", eventsTitle: "Turn introductions into real conversations.", eventsText: "Explore upcoming gatherings and the participation details for each event.",
    program: "A SEPARATE GROWTH PATHWAY", programTitle: "EO Riyadh Accelerator", programText: "Explore the growth program, eligibility criteria, and application journey in its dedicated gateway. Wosool membership does not imply Accelerator admission or EO membership.", programLink: "Explore the Accelerator",
    news: "FROM THE COMMUNITY", newsTitle: "Ideas and updates worth sharing.", allNews: "All news",
  },
}

export default function HomePage() {
  const { locale } = useLocale()
  const copy = content[locale]
  const { founders, partners, newsItems, loading, failed, retry } = useHomeContent()
  const icons = [Lightbulb, Users, Handshake]
  return <PublicLayout><div className={styles.home}>
    <section className={styles.hero} aria-labelledby="home-title"><div className={`${styles.container} ${styles.heroGrid}`}>
      <div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1 id="home-title">{copy.title}<br /><span>{copy.highlight}</span></h1><p className={styles.intro}>{copy.intro}</p><p className={styles.lead}>{copy.description}</p><div className={styles.actions}><Link className={styles.primary} href="/apply">{copy.join}<ArrowUpRight size={18} /></Link><Link className={styles.secondary} href="#founder-community">{copy.explore}</Link></div><p className={styles.note}>{copy.note}</p></div>
      <aside className={styles.heroPanel}><div className={styles.panelBrand}><Image src="/wosool-network-logo.png" alt="" width={48} height={48} /><span>WOSOOL / وصول</span></div><h2>{copy.panelTitle}</h2><p>{copy.panelText}</p><ul>{copy.panelItems.map((item,i) => <li key={item}><span>0{i+1}</span>{item}</li>)}</ul><Link href="/about">{locale === "ar" ? "اكتشف مجتمع وصول" : "Discover the Wosool community"}<ArrowUpRight size={18} /></Link></aside>
    </div></section>
    <CommunityPartners partners={partners} loading={loading} failed={failed.includes("partners")} retry={retry} />
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="why-title"><p className={styles.eyebrow}>{copy.why}</p><h2 id="why-title">{copy.whyTitle}</h2><div className={styles.benefits}>{copy.benefits.map((benefit,i) => { const Icon = icons[i]; return <article key={benefit.title}><Icon size={25} aria-hidden="true" /><h3>{benefit.title}</h3><p>{benefit.text}</p></article> })}</div></section>
    <section id="founder-community" className={styles.founders} aria-labelledby="founders-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.foundersLabel}</p><h2 id="founders-title">{copy.foundersTitle}</h2><p className={styles.lead}>{copy.foundersText}</p></div><Link className={styles.textLink} href="/founders">{copy.allFounders}<ArrowUpRight size={18} /></Link></div>
      {founders.length ? <FounderShowcase founders={founders} /> : <div className={styles.empty} role="status"><p>{loading ? copy.loading : failed.includes("founders") ? copy.error : copy.empty}</p>{failed.includes("founders") && <button className={styles.secondary} onClick={retry} type="button">{copy.retry}</button>}<Link className={styles.textLink} href="/apply">{copy.join}</Link></div>}
      <Link className={styles.textLink} href="/founders/companies">{copy.allCompanies}<ArrowUpRight size={18} /></Link>
    </div></section>
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="how-title"><p className={styles.eyebrow}>{copy.how}</p><h2 id="how-title">{copy.howTitle}</h2><ol className={styles.steps}>{copy.steps.map((step,i) => <li key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol><Link href="/apply" className={styles.primary}>{copy.join}<ArrowUpRight size={18} /></Link></section>
    <section className={styles.events} aria-labelledby="events-title"><div className={styles.container}><p className={styles.eyebrow}>{copy.events}</p><h2 id="events-title">{copy.eventsTitle}</h2><p className={styles.lead}>{copy.eventsText}</p><div className="mt-8"><UpcomingEvents /></div></div></section>
    <div className={`${styles.container} ${styles.section}`}><EoaOverview /></div>
    {newsItems.length > 0 && <section className={`${styles.container} ${styles.news}`} aria-labelledby="news-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.news}</p><h2 id="news-title">{copy.newsTitle}</h2></div><Link className={styles.textLink} href="/news">{copy.allNews}</Link></div><div className={styles.benefits}>{newsItems.slice(0,3).map(item => <article key={item.id}><p className={styles.eyebrow}>{item.category}</p><h3><Link href={`/news/${item.slug}`}>{item.title}</Link></h3><p>{item.excerpt}</p></article>)}</div></section>}
  </div></PublicLayout>
}
