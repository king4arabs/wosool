import Image from 'next/image'
import { ArrowUpRight, BrainCircuit, Globe2, Network, Rocket } from 'lucide-react'
import styles from './Leadership.module.css'

// Source: owner-supplied Lamarka Ventures.pdf, pp. 3, 5–12, 17.
// Figures describe that company profile, not independently audited live totals.
export function LamarkaProfile({ ar }: { ar: boolean }) {
  const engines = ar ? [
    ['الذكاء التطبيقي', 'الاستراتيجية × التقنية', 'توظيف الذكاء الاصطناعي والاستراتيجية والابتكار والتقنية لتطوير الشركات وبناء ميزتها التنافسية.'],
    ['بناء المشاريع', 'من الفكرة إلى السوق', 'بناء الشركات التقنية وإطلاقها وتطويرها، من الفكرة إلى طرح المنتجات والخدمات تجارياً.'],
    ['رأس المال والنمو', 'العلاقات × التوسع', 'ربط المشاريع بالعملاء والشركاء والمستثمرين، ودعم الحوكمة والتوسع.'],
  ] : [
    ['Applied intelligence', 'STRATEGY × TECHNOLOGY', 'AI, strategy, innovation and technology that help startups and established businesses build a competitive edge.'],
    ['Venture creation', 'IDEA TO MARKET', 'Building, launching and scaling technology ventures from an initial idea to commercialization.'],
    ['Capital & growth', 'CONNECTIONS × SCALE', 'Connecting ventures with customers, partners and investors, with support for governance and expansion.'],
  ]
  const icons = [BrainCircuit, Rocket, Network]
  const programs = ar ? [
    ['InspireU', 'STC', 'تصميم وتشغيل مسرّعة للأعمال الرقمية؛ يذكر الملف تخرّج أكثر من 70 شركة ناشئة.'],
    ['Saudi Unicorns', 'الشركات عالية النمو', 'تصميم وتشغيل برنامج لمساندة الشركات الطامحة للوصول إلى مصاف الشركات المليارية.'],
    ['Multiverse', 'CODE', 'برنامج عالمي للابتكار والاستثمار يفتح قنوات للتواصل مع منظومات تقنية متقدمة.'],
    ['Sedrah', 'MEWA', 'تصميم وتشغيل برنامج لاحتضان وتسريع مشاريع التقنيات البيئية.'],
    ['Global Exposure', 'التعلم عبر الحدود', 'رحلات تعلم لقادة الاستثمار والابتكار حول الذكاء الاصطناعي والتقنيات العميقة والاستحواذات.'],
    ['Entrepreneurs Community', 'مجتمعات المؤسسين', 'تصميم برامج ومنتجات وعروض قيمة ونماذج شراكة تدعم استدامة المجتمعات الريادية.'],
  ] : [
    ['InspireU', 'STC', 'Design and operation of a digital accelerator, with more than 70 startup graduates reported in the profile.'],
    ['Saudi Unicorns', 'HIGH-GROWTH VENTURES', 'A program designed and operated to support high-growth startups with unicorn ambitions.'],
    ['Multiverse', 'CODE', 'A global innovation and investment program connecting founders to advanced technology ecosystems.'],
    ['Sedrah', 'MEWA', 'Program design and operation for the incubation and acceleration of environmental technologies.'],
    ['Global Exposure', 'IMMERSIVE LEARNING', 'International learning journeys for investment and innovation leaders, covering AI, deep tech and M&A.'],
    ['Entrepreneurs Community', 'FOUNDER COMMUNITIES', 'Programs, products, value propositions and partnership models designed for community sustainability.'],
  ]
  return <section id="operator" className={styles.operator} aria-labelledby="operator-title">
    <header className={styles.operatorHero}>
      <div>
        <span className={styles.eyebrow}>{ar ? 'الشريك المشغّل لمسرّعة EO الرياض' : 'EO RIYADH ACCELERATOR · OPERATING PARTNER'}</span>
        <Image src="/partners/lamarka.png" alt="LAMARKA" width={560} height={73} className={styles.wordmark} unoptimized />
        <h2 id="operator-title">{ar ? 'خبرة في البناء. طموح للنمو.' : 'Built by experience. Driven by growth.'}</h2>
        <p>{ar ? 'لاماركا شريك تشغيل مسرّعة EO الرياض. تجمع منصتها بين بناء المشاريع والاستراتيجية والابتكار والوصول إلى رأس المال، مع خبرة في تصميم وتشغيل برامج تدعم المؤسسين والشركات التقنية.' : 'LAMARKA is the operating partner for EO Riyadh Accelerator. Its platform brings together venture building, strategy, innovation and access to capital, backed by experience designing and operating programs for founders and technology companies.'}</p>
        <a href="https://sa.linkedin.com/company/lamarka-global" target="_blank" rel="noopener noreferrer">{ar ? 'تعرّف على LAMARKA' : 'Connect with LAMARKA'} <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </header>
    <dl className={styles.metrics}>
      {(ar ? [['2015', 'بداية دعم الشركات'], ['500+', 'شركة ناشئة دعمتها البرامج'], ['20', 'شركة ناشئة في المحفظة']] : [['2015', 'Supporting startups since'], ['500+', 'Startups supported through programs'], ['20', 'Startups in the portfolio']]).map(([value, label]) => <div key={value}><dt>{label}</dt><dd dir="ltr">{value}</dd></div>)}
    </dl>
    <p className={styles.sourceNote}>{ar ? 'الأرقام والخبرات وفق ملف LAMARKA Ventures التعريفي المقدم في أكتوبر 2026.' : 'Figures and experience reported in the LAMARKA Ventures profile supplied in October 2026.'}</p>
    <div className={styles.engines}>
      {engines.map(([title, label, detail], index) => {
        const Icon = icons[index]
        return <article key={title}><div className={styles.engineIcon}><Icon size={27} aria-hidden="true" /><span>0{index + 1}</span></div><span className={styles.eyebrow}>{label}</span><h3>{title}</h3><p>{detail}</p></article>
      })}
    </div>
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>{ar ? 'خبرات تشغيلية' : 'PROGRAM EXPERIENCE'}</span><h3>{ar ? 'برامج تجمع المؤسسين بالفرص' : 'Programs that connect founders with opportunity'}</h3><p>{ar ? 'نماذج مختارة من البرامج التي صممتها أو شغّلتها لاماركا، كما وردت في ملفها التعريفي.' : 'Selected programs LAMARKA has designed or operated, as presented in its company profile.'}</p></div>
    <div className={styles.programs}>
      {programs.map(([title, label, detail], index) => <article key={title}><span className={styles.programNumber}>0{index + 1}</span><div><span className={styles.eyebrow}>{label}</span><h4>{title}</h4><p>{detail}</p></div></article>)}
    </div>
    <div className={styles.globalReach}>
      <Globe2 size={34} aria-hidden="true" />
      <div><h3>{ar ? 'منظومات عالمية. معرفة قابلة للتطبيق.' : 'Global ecosystems. Practical perspective.'}</h3><p>{ar ? 'من الوجهات التي يربط بها برنامج Multiverse المؤسسين، وفق ملف لاماركا:' : 'Ecosystems connected through Multiverse, as described in LAMARKA’s profile:'}</p><ul>{(ar ? ['وادي السيليكون', 'لندن', 'كوريا الجنوبية', 'سنغافورة'] : ['Silicon Valley', 'London', 'South Korea', 'Singapore']).map(place => <li key={place}>{place}</li>)}</ul></div>
    </div>
  </section>
}
