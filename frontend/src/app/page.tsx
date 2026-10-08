"use client"

import Image from "next/image"
import Link from "next/link"
import { UpcomingEvents } from "@/components/sections/UpcomingEvents"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { useHomeContent } from "@/lib/use-home-content"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { useLocale } from "@/lib/locale"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Handshake,
  MapPin,
  Sparkles,
} from "lucide-react"

const homeCopy = {
  ar: {
    badge: "شبكة المؤسسين الخاصة",
    heroTitle: "وصول يربط المؤسسين الطموحين بمنظومة الأعمال في الخليج",
    heroHighlight: ["وصول", "منظومة الأعمال في الخليج"],
    heroSubtitle:
      "شبكة منتقاة للمؤسسين والمشغلين والمستثمرين والشركاء الذين يبنون شركات جادة ويبحثون عن علاقات ذات قيمة حقيقية في المنطقة.",
    apply: "قدّم للانضمام",
    explore: "استكشف الشبكة",
    trustMetrics: [
      { value: "علاقات", label: "من مؤسس إلى مؤسس" },
      { value: "برامج", label: "للتعلم والنمو" },
      { value: "فرص", label: "للتواصل والتعاون" },
    ],
    accessLabel: "دخول انتقائي",
    accessTitle: "ثقة مؤسسية بروح مجتمع يعرف كيف يصنع الأثر.",
    accessCards: [
      {
        title: "وصول",
        body: "تعريفات دافئة تجمع بين المؤسسين والصناديق والمشغلين والشركاء المناسبين في الوقت المناسب.",
      },
      {
        title: "جودة",
        body: "شبكة صُممت لبناء شركات حقيقية، لا لاستهلاك الأسماء أو تصفح دليل عام.",
      },
    ],
    why: {
      eyebrow: "لماذا وصول",
      title: "مبني للمؤسسين الجادين في النمو",
      description:
        "كل جزء في التجربة مصمم لتقليل الضوضاء، وتعزيز الثقة، وتسريع التنفيذ في السوق السعودي والخليجي.",
      cards: [
        {
          title: "شبكة موثوقة",
          description: "عضوية منتقاة بعناية تقوم على السمعة والملاءمة وجودة العلاقات طويلة الأمد.",
        },
        {
          title: "دعم تنفيذي",
          description: "وصول دافئ، خبرة تشغيلية، ومساندة عملية تساعد الفرق القوية على التحرك بثقة وسرعة.",
        },
        {
          title: "تركيز سعودي وخليجي",
          description: "مصمم للمؤسسين الذين يبنون داخل المنطقة ويفهمون خصوصيتها وفرصها ومساراتها.",
        },
      ],
    },
    audience: {
      eyebrow: "لمن هذه الشبكة",
      title: "للمؤسسين في كل مرحلة من الرحلة",
      description:
        "من البدايات المبكرة إلى التوسع الإقليمي، مع توقع واضح: طموح جاد، عمل منضبط، واستعداد للاستفادة من شبكة عالية الثقة.",
      items: [
        { title: "ما قبل البذرة", description: "لمن يبني الفرضية الأولى ويختبر الإشارة المبكرة للسوق." },
        { title: "البذرة", description: "للفرق التي تنتقل من الجذب الأولي إلى بناء قابلية التكرار." },
        { title: "السلسلة A", description: "للشركات التي توسع الإيراد، والحوكمة، والفرق، وخطة النمو." },
        { title: "التوسّع", description: "للقادة الذين يبنون مؤسسات أكثر نضجًا عبر السعودية والخليج." },
        { title: "الشركاء الاستراتيجيون", description: "للمستثمرين والمنصات والجهات الداعمة التي تضيف قيمة حقيقية للشبكة." },
      ],
    },
    benefits: {
      eyebrow: "ما الذي يحصل عليه الأعضاء",
      title: "طبقة خاصة من الدعم حول بناء الشركات الجادة",
      description:
        "الفائدة هنا عملية بطبيعتها: وصول نوعي، خبرة مركزة، وفرص منتقاة تساعد على اتخاذ قرارات أفضل وتنفيذ أسرع.",
      items: [
        "تعريفات دافئة",
        "دوائر المؤسسين",
        "ساعات مكتبية مع خبراء",
        "أدوات مواءمة بالذكاء الاصطناعي",
        "فعاليات منتقاة",
        "موارد للنمو",
      ],
      body: "مصممة لرفع جودة المحادثات، وتسريع القرار، وتقوية الدعم التشغيلي حول الشركة.",
    },
    founders: {
      eyebrow: "مؤسسون مختارون",
      title: "قادة يبنون ويؤثرون في المنظومة",
      description: "مؤسسون ومشغلون يملكون سياقًا حقيقيًا وخبرة تشغيلية مرتبطة بالمنطقة.",
      connect: "تعرّف عليهم",
    },
    companies: {
      eyebrow: "شركات الأعضاء",
      title: "شركات تنمو داخل الشبكة",
      description: "أعمال تتوسع بدعم من شبكة موثوقة، وصول نوعي، ونقاشات عملية بين المؤسسين.",
      view: "عرض الشركة",
      statuses: {
        isHiring: "يوظف الآن",
        isFundraising: "يجمع استثمارًا",
        isCollaborating: "منفتح على الشراكات",
      },
    },
    events: {
      eyebrow: "الفعاليات",
      title: "لقاءات خاصة ذات قيمة عملية",
      description: "أمسيات وحوارات وجلسات مركزة تعطي الأولوية لجودة العلاقة، لا كثافة الحضور.",
      rsvp: "سجّل اهتمامك",
    },
    partners: {
      eyebrow: "شركاء المنظومة",
      title: "مدعوم من شركاء يضيفون قيمة حقيقية",
      description: "جهات متوافقة مع الرسالة تمنح الأعضاء خبرة، وصولًا، وموثوقية إقليمية.",
    },
    news: {
      eyebrow: "الأخبار",
      title: "إشارات من داخل الشبكة",
      description: "تحديثات مختارة، إنجازات للأعضاء، وقراءة أعمق لما يتحرك في المنظومة.",
      read: "اقرأ المزيد",
      story: "قصة",
    },
    cta: {
      badge: "تُراجع الطلبات شهريًا",
      title: "جاهز للانضمام إلى وصول؟",
      description: "نراجع الطلبات شهريًا للحفاظ على الشبكة مركزة وموثوقة وذات قيمة فعلية للأعضاء.",
      apply: "قدّم للانضمام",
      contact: "تواصل معنا",
    },
    shared: {
      storyPrefix: "قصة",
      labels: {
        access: "الوصول",
        signal: "الإشارة",
      },
    },
  },
  en: {
    badge: "Private Founders Network",
    heroTitle: "Wosool connects ambitious founders with the GCC ecosystem",
    heroHighlight: ["Wosool", "GCC ecosystem"],
    heroSubtitle:
      "A curated network for founders, operators, investors, and partners building serious companies and seeking trusted relationships across the region.",
    apply: "Apply to join",
    explore: "Explore the network",
    trustMetrics: [
      { value: "Connect", label: "Founder to founder" },
      { value: "Learn", label: "Focused programs" },
      { value: "Grow", label: "Shared opportunities" },
    ],
    accessLabel: "Selective access",
    accessTitle: "Institutional trust with the warmth of a serious founder community.",
    accessCards: [
      {
        title: "Access",
        body: "Warm introductions across founders, funds, operators, and ecosystem partners when timing and fit actually matter.",
      },
      {
        title: "Signal",
        body: "A network designed for company building, not generic discovery or broad directory browsing.",
      },
    ],
    why: {
      eyebrow: "Why Wosool",
      title: "Built for founders who are serious about growth",
      description:
        "Every layer of the experience is designed to reduce noise, deepen trust, and accelerate execution in Saudi Arabia and the wider GCC.",
      cards: [
        {
          title: "Trusted network",
          description: "A deliberately curated membership built on reputation, fit, and high-quality long-term relationships.",
        },
        {
          title: "Execution support",
          description: "Warm access, operator insight, and practical support that helps strong teams move with confidence.",
        },
        {
          title: "Saudi & GCC focus",
          description: "Designed for founders building inside the region with the context, partners, and pathways that matter.",
        },
      ],
    },
    audience: {
      eyebrow: "Who It Is For",
      title: "For founders at every stage of the journey",
      description:
        "From early conviction to regional scale, with one shared expectation: ambitious execution and a serious approach to network value.",
      items: [
        { title: "Pre-seed", description: "For founders shaping the first thesis and testing early market signal." },
        { title: "Seed", description: "For teams moving from traction to repeatability and sharper go-to-market motion." },
        { title: "Series A", description: "For companies scaling revenue, governance, hiring, and expansion." },
        { title: "Scale-up", description: "For operators building stronger institutions across Saudi Arabia and the GCC." },
        { title: "Strategic partners", description: "For investors, platforms, and ecosystem players who add real value to members." },
      ],
    },
    benefits: {
      eyebrow: "What Members Get",
      title: "A private layer of support around serious company building",
      description:
        "The membership is intentionally practical: high-quality access, focused expertise, and curated opportunities that improve execution.",
      items: [
        "Warm introductions",
        "Founder circles",
        "Expert office hours",
        "AI matching tools",
        "Curated events",
        "Growth resources",
      ],
      body: "Designed to improve conversation quality, decision speed, and operating support around the company.",
    },
    founders: {
      eyebrow: "Featured Founders",
      title: "Builders helping shape the regional ecosystem",
      description: "Founders and operators with real context, strong judgment, and meaningful operating depth.",
      connect: "Connect",
    },
    companies: {
      eyebrow: "Member Companies",
      title: "Companies built by members",
      description: "Businesses growing with the support of trusted access, sharper introductions, and founder-level perspective.",
      view: "View company",
      statuses: {
        isHiring: "Hiring",
        isFundraising: "Fundraising",
        isCollaborating: "Open to partners",
      },
    },
    events: {
      eyebrow: "Events",
      title: "Private gatherings with practical value",
      description: "Dinners, roundtables, and focused sessions that prioritize the quality of the room over the size of it.",
      rsvp: "RSVP",
    },
    partners: {
      eyebrow: "Ecosystem Partners",
      title: "Backed by ecosystem partners",
      description: "Aligned institutions bringing expertise, access, and regional credibility into the network.",
    },
    news: {
      eyebrow: "News",
      title: "Signals from the network",
      description: "Selected updates, member milestones, and ecosystem context from across the Wosool community.",
      read: "Read article",
      story: "Story",
    },
    cta: {
      badge: "Applications reviewed monthly",
      title: "Ready to join Wosool?",
      description: "Applications are reviewed monthly to keep the network focused, trusted, and valuable.",
      apply: "Apply to join",
      contact: "Contact us",
    },
    shared: {
      storyPrefix: "Story",
      labels: {
        access: "Access",
        signal: "Signal",
      },
    },
  },
  fr: {
    badge: "Réseau privé de fondateurs",
    heroTitle: "Wosool relie les fondateurs ambitieux à l’écosystème du Golfe",
    heroHighlight: ["Wosool", "l’écosystème du Golfe"],
    heroSubtitle:
      "Un réseau sélectif pour fondateurs, opérateurs, investisseurs et partenaires qui bâtissent des entreprises solides et recherchent des relations de confiance dans la région.",
    apply: "Postuler",
    explore: "Explorer le réseau",
    trustMetrics: [
      { value: "250+", label: "Fondateurs" },
      { value: "15+", label: "Programmes" },
      { value: "3", label: "Fonds actifs" },
    ],
    accessLabel: "Accès sélectif",
    accessTitle: "Une confiance institutionnelle, portée par une communauté de fondateurs exigeante.",
    accessCards: [
      {
        title: "Accès",
        body: "Des introductions ciblées entre fondateurs, fonds, opérateurs et partenaires quand la pertinence est réelle.",
      },
      {
        title: "Qualité",
        body: "Un réseau pensé pour bâtir des entreprises durables, pas pour parcourir un simple annuaire.",
      },
    ],
    why: {
      eyebrow: "Pourquoi Wosool",
      title: "Pensé pour les fondateurs qui prennent la croissance au sérieux",
      description:
        "Chaque couche de l’expérience réduit le bruit, renforce la confiance et améliore l’exécution en Arabie saoudite et dans le Golfe.",
      cards: [
        {
          title: "Réseau de confiance",
          description: "Une adhésion soigneusement sélectionnée, fondée sur la réputation, l’adéquation et la qualité des relations.",
        },
        {
          title: "Soutien à l’exécution",
          description: "Accès ciblé, expertise opérationnelle et accompagnement concret pour aider les équipes à avancer plus vite.",
        },
        {
          title: "Focalisation Arabie saoudite & GCC",
          description: "Conçu pour les fondateurs qui bâtissent dans la région avec le bon contexte et les bons relais.",
        },
      ],
    },
    audience: {
      eyebrow: "Pour qui",
      title: "Pour les fondateurs à chaque étape du parcours",
      description:
        "Des premiers signaux de marché à l’expansion régionale, avec la même exigence: ambition, rigueur et vraie valeur relationnelle.",
      items: [
        { title: "Pré-amorçage", description: "Pour les fondateurs qui structurent leur première thèse et testent le marché." },
        { title: "Amorçage", description: "Pour les équipes qui transforment la traction en dynamique reproductible." },
        { title: "Série A", description: "Pour les entreprises qui accélèrent revenus, gouvernance, recrutement et expansion." },
        { title: "Scale-up", description: "Pour les opérateurs qui bâtissent des structures plus solides dans la région." },
        { title: "Partenaires stratégiques", description: "Pour les investisseurs et plateformes capables d’apporter une vraie valeur au réseau." },
      ],
    },
    benefits: {
      eyebrow: "Ce que les membres obtiennent",
      title: "Une couche de soutien privée autour de la construction d’entreprise",
      description:
        "L’adhésion reste volontairement utile: accès qualifié, expertise ciblée et opportunités sélectionnées pour mieux exécuter.",
      items: [
        "Introductions ciblées",
        "Cercles de fondateurs",
        "Office hours d’experts",
        "Outils de matching IA",
        "Événements sélectifs",
        "Ressources de croissance",
      ],
      body: "Pensé pour améliorer la qualité des échanges, la vitesse de décision et l’appui opérationnel.",
    },
    founders: {
      eyebrow: "Fondateurs mis en avant",
      title: "Des bâtisseurs qui façonnent l’écosystème régional",
      description: "Des fondateurs et opérateurs avec une vraie profondeur d’exécution et une lecture fine du marché.",
      connect: "Entrer en contact",
    },
    companies: {
      eyebrow: "Entreprises membres",
      title: "Des entreprises construites par les membres",
      description: "Des sociétés qui grandissent grâce à un réseau fiable, un meilleur accès et des échanges utiles.",
      view: "Voir l’entreprise",
      statuses: {
        isHiring: "Recrute",
        isFundraising: "Levée en cours",
        isCollaborating: "Ouverte aux partenariats",
      },
    },
    events: {
      eyebrow: "Événements",
      title: "Des rencontres privées à forte valeur",
      description: "Dîners, tables rondes et sessions ciblées où la qualité des échanges prime sur le volume.",
      rsvp: "RSVP",
    },
    partners: {
      eyebrow: "Partenaires",
      title: "Soutenu par des partenaires de l’écosystème",
      description: "Des institutions alignées qui apportent expertise, accès et crédibilité régionale au réseau.",
    },
    news: {
      eyebrow: "Actualités",
      title: "Les signaux du réseau",
      description: "Des nouvelles choisies, des étapes clés pour les membres et une lecture plus fine de l’écosystème.",
      read: "Lire l’article",
      story: "Édition",
    },
    cta: {
      badge: "Candidatures examinées chaque mois",
      title: "Prêt à rejoindre Wosool ?",
      description: "Les candidatures sont étudiées chaque mois pour préserver la concentration, la confiance et la valeur du réseau.",
      apply: "Postuler",
      contact: "Nous contacter",
    },
    shared: {
      storyPrefix: "Édition",
      labels: {
        access: "Accès",
        signal: "Qualité",
      },
    },
  },
} as const

const heroSectionCopy = {
  ar: {
    badge: "شبكة المؤسسين الخاصة",
    titleLead: "مجتمع",
    titleHighlight: "مؤسسين",
    titleTail: "لمؤسسين",
    subtitle:
      "شبكة منتقاة للمؤسسين والمشغلين والمستثمرين والشركاء الذين يبنون شركات جادة ويبحثون عن علاقات ذات قيمة حقيقية في المنطقة.",
    steps: [
      { num: "01", title: "قدّم طلبك", desc: "عرّفنا بك وبالشركة التي تبنيها" },
      { num: "02", title: "تواصل", desc: "ارتبط بمؤسسين موجودين في الشبكة" },
      { num: "03", title: "استعرض", desc: "اكتشف أعمالهم كأنك تقلّب كتاباً" },
    ],
  },
  en: {
    badge: "Private Founders Network",
    titleLead: "A community of",
    titleHighlight: "founders",
    titleTail: "for founders",
    subtitle:
      "A curated network for founders, operators, investors, and partners building serious companies and seeking trusted relationships across the region.",
    steps: [
      { num: "01", title: "Apply", desc: "Tell us about you and your company" },
      { num: "02", title: "Connect", desc: "Link with founders already in the network" },
      { num: "03", title: "Explore", desc: "Browse their work like reading a book" },
    ],
  },
  fr: {
    badge: "Réseau privé de fondateurs",
    titleLead: "Une communauté de",
    titleHighlight: "fondateurs",
    titleTail: "pour fondateurs",
    subtitle:
      "Un réseau sélectif pour fondateurs, opérateurs, investisseurs et partenaires qui bâtissent des entreprises solides et recherchent des relations de confiance dans la région.",
    steps: [
      { num: "01", title: "Rejoins", desc: "Crée ton profil et intègre la communauté" },
      { num: "02", title: "Connecte-toi", desc: "Rejoins des fondateurs dans le réseau" },
      { num: "03", title: "Explore", desc: "Découvre leurs travaux comme un livre" },
    ],
  },
} as const

function SectionIntro({
  eyebrow,
  title,
  description,
  light = false,
  align = "center",
}: {
  eyebrow: string
  title: string
  description?: string
  light?: boolean
  align?: "center" | "start"
}) {
  return (
    <div className={`mb-14 max-w-3xl ${align === "center" ? "mx-auto text-center" : "text-start"}`}>
      <div
        className={`mb-4 inline-flex rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest ${
          light
            ? "border-white/15 bg-white/8 text-[#A8B4F8]"
            : "border-[#E4E7F0] bg-[#EEF1FF] text-[#3B52D4]"
        }`}
      >
        {eyebrow}
      </div>
      <h2
        className={`text-balance text-3xl font-semibold sm:text-4xl lg:text-[2.75rem] ${
          light ? "text-white" : "text-[#0F1628]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg ${
            light ? "text-white/60" : "text-[#5D6B8A]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default function HomePage() {
  const { locale, direction } = useLocale()
  const { companies, founders, newsItems, partners } = useHomeContent()
  const copy = homeCopy[locale]
  const heroCopy = heroSectionCopy[locale]
  const featuredFounders = [...founders].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 3)
  const featuredCompanies = companies.slice(0, 3)
  const ecosystemPartners = partners.slice(0, 4)
  const latestNews = newsItems.slice(0, 3)
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight
  const ChevronIcon = direction === "rtl" ? ChevronLeft : ChevronRight
  const primaryBenefit = copy.benefits.items[0]
  const secondaryBenefits = copy.benefits.items.slice(1)
  const leadFounder = featuredFounders[0]
  const supportingFounders = featuredFounders.slice(1)

  return (
    <PublicLayout>
      <section
        className="relative overflow-hidden bg-slate-50/60 px-4 sm:px-6 lg:px-8"
        dir={direction}
      >
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#14b8a6]/5 blur-[140px]" />

          {/* Dot constellation */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.07)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_85%_85%_at_50%_40%,black_10%,transparent_72%)]" />

          {/* Connected-node network */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 680"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="lng1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B52D4" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#3B52D4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="lng2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6B7EEB" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#6B7EEB" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Left cluster */}
            <circle cx="90"  cy="160" r="68" fill="url(#lng1)" />
            <circle cx="240" cy="340" r="54" fill="url(#lng2)" />
            <circle cx="60"  cy="500" r="46" fill="url(#lng1)" />
            <line x1="90"  y1="160" x2="240" y2="340" stroke="#3B52D4" strokeWidth="1.2" strokeOpacity="0.14" />
            <line x1="240" y1="340" x2="60"  y2="500" stroke="#3B52D4" strokeWidth="1"   strokeOpacity="0.1"  />
            <circle cx="90"  cy="160" r="4" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="240" cy="340" r="5" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="60"  cy="500" r="3" fill="#3B52D4" fillOpacity="0.35" />
            {/* Right cluster */}
            <circle cx="1230" cy="100" r="76" fill="url(#lng1)" />
            <circle cx="1070" cy="270" r="92" fill="url(#lng2)" />
            <circle cx="1320" cy="410" r="58" fill="url(#lng1)" />
            <circle cx="1090" cy="550" r="54" fill="url(#lng2)" />
            <circle cx="1390" cy="570" r="40" fill="url(#lng1)" />
            <line x1="1230" y1="100" x2="1070" y2="270" stroke="#3B52D4" strokeWidth="1.2" strokeOpacity="0.14" />
            <line x1="1070" y1="270" x2="1320" y2="410" stroke="#3B52D4" strokeWidth="1.2" strokeOpacity="0.12" />
            <line x1="1320" y1="410" x2="1090" y2="550" stroke="#3B52D4" strokeWidth="1"   strokeOpacity="0.1"  />
            <line x1="1090" y1="550" x2="1390" y2="570" stroke="#3B52D4" strokeWidth="1"   strokeOpacity="0.09" />
            <circle cx="1230" cy="100" r="5" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="1070" cy="270" r="6" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="1320" cy="410" r="4" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="1090" cy="550" r="4" fill="#3B52D4" fillOpacity="0.35" />
            <circle cx="1390" cy="570" r="3" fill="#3B52D4" fillOpacity="0.35" />
          </svg>

          {/* Polygon wave — bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-48 opacity-[0.04]"
            style={{
              background: "linear-gradient(0deg,rgba(59,82,212,0.8),transparent)",
              clipPath: "polygon(0 55%,7% 30%,16% 52%,26% 20%,37% 48%,49% 14%,60% 44%,72% 18%,83% 42%,91% 16%,100% 40%,100% 100%,0 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl py-12 sm:py-16 lg:py-20">
          <div id="ecosystem" className="absolute top-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* ── LEFT: Text column ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {heroCopy.badge}
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight">
                {heroCopy.titleLead}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
                  {heroCopy.titleHighlight}
                </span>
                {heroCopy.titleTail ? <> {heroCopy.titleTail}</> : null}
              </h1>

              <p className="text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl">
                {heroCopy.subtitle}
              </p>

              {/* Three-step journey */}
              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                {heroCopy.steps.map((step) => (
                  <div
                    key={step.num}
                    className="p-4 bg-white/80 border border-slate-200/60 rounded-2xl hover:border-[#3B52D4]/40 transition-all"
                    style={{ boxShadow: "0 4px 20px -2px rgba(59,82,212,0.03)" }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] text-[#3B52D4] flex items-center justify-center font-black text-xs mb-2">
                      {step.num}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{step.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-[#3B52D4]/20"
                >
                  {copy.apply}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/founders"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition shadow-sm"
                >
                  {copy.explore}
                </Link>
              </div>

              {/* Trust metrics */}
              <div className="flex flex-wrap gap-4 pt-2">
                {copy.trustMetrics.map((metric, i) => (
                  <div key={metric.label} className="flex items-center gap-3">
                    {i > 0 && <div className="w-px h-8 bg-slate-200" />}
                    <div>
                      <div className="text-xl font-black text-[#3B52D4]">{metric.value}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{metric.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-900/5 sm:p-8" aria-labelledby="network-paths-title">
              <div className="mb-6 flex items-center gap-4">
                <Image src="/wosool-network-logo.png" alt="" width={52} height={52} />
                <div>
                  <p className="text-xs font-bold text-[#3B52D4]">WOSOOL / وصول</p>
                  <h2 id="network-paths-title" className="mt-2 text-xl font-bold text-slate-900">{locale === "ar" ? "خطوتك التالية تبدأ بعلاقة" : "Your next step starts with a connection"}</h2>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { href: "/founders", icon: Handshake, title: locale === "ar" ? "تعرّف على المؤسسين" : "Meet the founders", body: locale === "ar" ? "اكتشف الخبرات والاهتمامات المشتركة." : "Discover shared interests and operating experience." },
                  { href: "/programs", icon: Sparkles, title: locale === "ar" ? "اعثر على برنامجك" : "Find your program", body: locale === "ar" ? "استكشف مسارات التعلم والنمو." : "Explore focused learning and growth opportunities." },
                  { href: "/events", icon: CheckCircle2, title: locale === "ar" ? "انضم إلى اللقاءات" : "Join the conversation", body: locale === "ar" ? "تابع فعاليات المجتمع القادمة." : "See upcoming community gatherings." },
                ].map(({ href, icon: Icon, title, body }) => (
                  <Link key={href} href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-indigo-200 hover:bg-[#EEF1FF]">
                    <Icon className="h-5 w-5 shrink-0 text-[#3B52D4]" aria-hidden="true" />
                    <div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-6 text-slate-600">{body}</p></div>
                    <ArrowIcon className="h-4 w-4 shrink-0 text-[#3B52D4]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-7 text-slate-600">{locale === "ar" ? "من مؤسس إلى مؤسس. خبرة مشتركة، علاقات موثوقة، وخطوات عملية للنمو." : "Founder to founder. Shared experience, trusted relationships, and practical steps forward."}</p>
            </aside>
          </div>
        </div>
      </section>

      <div className="ecosystem-canvas relative overflow-hidden">

      <section className="section-veil relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start">
            <div className="max-w-2xl">
              <SectionIntro
                eyebrow={copy.why.eyebrow}
                title={copy.why.title}
                description={copy.why.description}
                align="start"
              />
              <div className="rounded-2xl border border-[#E4E7F0] bg-white p-7 shadow-[0_2px_16px_rgba(15,22,40,0.05)] sm:p-9">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#0F1628]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#3B52D4]">
                    <Handshake className="h-5 w-5" />
                  </span>
                  {copy.accessTitle}
                </div>
                <p className="mt-6 max-w-xl text-lg leading-8 text-[#5D6B8A]">
                  {copy.why.cards[0].description}
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {copy.trustMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-[#E4E7F0] bg-[#F5F7FF] px-5 py-5">
                      <div className="text-3xl font-bold text-[#3B52D4]">{metric.value}</div>
                      <div className="mt-2 text-sm text-[#5D6B8A]">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="premium-card rounded-2xl p-7 sm:col-span-2">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-semibold text-[#0F1628]">{copy.why.cards[1].title}</h3>
                <p className="mt-4 text-base leading-7 text-[#5D6B8A]">{copy.why.cards[1].description}</p>
              </article>
              <article className="premium-card rounded-2xl p-7">
                <div className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#3B52D4]">
                  {copy.accessLabel}
                </div>
                <h3 className="text-xl font-semibold text-[#0F1628]">{copy.accessCards[0].title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5D6B8A]">{copy.accessCards[0].body}</p>
              </article>
              <article className="premium-card rounded-2xl p-7">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#3B52D4]">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F1628]">{copy.why.cards[2].title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5D6B8A]">{copy.why.cards[2].description}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section-veil-tinted relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={copy.audience.eyebrow}
            title={copy.audience.title}
            description={copy.audience.description}
          />
          <div className="relative mt-16">
            <div className="absolute left-6 right-6 top-6 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(59,82,212,0.2),transparent)] lg:block" />
            <div className="grid gap-4 lg:grid-cols-5">
              {copy.audience.items.map((item, index) => (
                <article
                  key={item.title}
                  className="group relative flex h-full flex-col rounded-2xl border border-[#E4E7F0] bg-white p-7 shadow-[0_1px_4px_rgba(15,22,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(59,82,212,0.25)] hover:shadow-[0_8px_28px_rgba(59,82,212,0.08)]"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1FF] text-sm font-bold text-[#3B52D4]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(59,82,212,0.15),transparent)] lg:block" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-[#3B52D4]">
                      {locale === "ar" ? `مرحلة ${index + 1}` : `Stage ${index + 1}`}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#0F1628]">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#5D6B8A]">{item.description}</p>
                  </div>
                  <div className="mt-8 flex justify-end text-[#3B52D4] opacity-50 transition-opacity group-hover:opacity-100">
                    <ChevronIcon className="h-5 w-5" />
                  </div>
                  {index < copy.audience.items.length - 1 ? (
                    <div className="absolute top-11 hidden h-3 w-3 rounded-full border border-[rgba(59,82,212,0.2)] bg-[#F5F7FF] lg:block rtl:-left-1.5 ltr:-right-1.5" />
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-veil-dark relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <article className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 sm:p-10"
              style={{ boxShadow: "0 4px 20px -2px rgba(59,82,212,0.04)" }}>
              <SectionIntro
                eyebrow={copy.benefits.eyebrow}
                title={copy.benefits.title}
                description={copy.benefits.description}
                align="start"
              />
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 sm:p-7">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#3B52D4]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-[#3B52D4]">
                    {copy.shared.labels.access}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{primaryBenefit}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">{copy.benefits.body}</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {copy.accessCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-slate-200/60 bg-[#EEF1FF]/50 p-5">
                    <div className="text-sm font-bold text-[#3B52D4]">{card.title}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {secondaryBenefits.map((benefit, index) => (
                <article
                  key={benefit}
                  className="rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-300 hover:border-[#3B52D4]/30 hover:bg-[#EEF1FF]/30"
                  style={{ boxShadow: "0 2px 12px -2px rgba(59,82,212,0.03)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-black tracking-[0.2em] text-[#3B52D4]">
                      {String(index + 2).padStart(2, "0")}
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{benefit}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{copy.benefits.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Founders ── */}
      {featuredFounders.length > 0 && (<section className="section-veil relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={copy.founders.eyebrow}
            title={copy.founders.title}
            description={copy.founders.description}
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            {leadFounder ? (
              <article className="premium-card relative overflow-hidden rounded-2xl p-8 sm:p-10">
                {(() => {
                  const details = { role: leadFounder.tagline || leadFounder.companyName, bio: leadFounder.bio, sector: leadFounder.sector, stage: leadFounder.stage, location: leadFounder.location }
                  const initials = leadFounder.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <>
                      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold tracking-[0.2em] text-[#3B52D4]">
                            {copy.shared.storyPrefix}
                          </div>
                          <h3 className="mt-4 text-3xl font-semibold text-[#0F1628] sm:text-4xl">{leadFounder.name}</h3>
                          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5D6B8A]">{details.role}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-xs font-semibold text-[#3B52D4]">
                              {details.sector}
                            </span>
                            <span className="rounded-full border border-[#E4E7F0] px-3 py-1 text-xs font-semibold text-[#5D6B8A]">
                              {details.stage}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FF] px-3 py-1 text-xs font-medium text-[#5D6B8A]">
                              <MapPin className="h-3.5 w-3.5 text-[#3B52D4]" />
                              {details.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <blockquote className="mt-8 border-s-2 border-[rgba(59,82,212,0.2)] ps-5 text-lg leading-8 text-[#5D6B8A]">
                        {details.bio}
                      </blockquote>
                      <div className="mt-10">
                        <Button
                          asChild
                          variant="outline"
                          className="border-[#E4E7F0] text-[#0F1628] hover:border-[#3B52D4] hover:bg-[#3B52D4] hover:text-white"
                        >
                          <Link href="/founders">{copy.founders.connect}</Link>
                        </Button>
                      </div>
                    </>
                  )
                })()}
              </article>
            ) : null}

            <div className="grid gap-4">
              {supportingFounders.map((founder) => {
                const details = { role: founder.tagline || founder.companyName, bio: founder.bio }
                const initials = founder.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <article key={founder.id} className="premium-card flex flex-col rounded-2xl p-6 sm:flex-row sm:items-start sm:gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF] text-lg font-bold text-[#3B52D4]">
                      {initials}
                    </div>
                    <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                      <h3 className="text-lg font-semibold text-[#0F1628]">{founder.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#8B95A9]">{details.role}</p>
                      <p className="mt-3 text-sm leading-7 text-[#5D6B8A]">{details.bio}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>)}

      {/* ── Companies ── */}
      {featuredCompanies.length > 0 && (<section className="section-veil-tinted relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3B52D4]">
                {copy.companies.eyebrow}
              </div>
              <h2 className="text-balance text-3xl font-semibold text-[#0F1628] sm:text-4xl lg:text-[2.75rem]">
                {copy.companies.title}
              </h2>
            </div>
            <Link
              href="/founders/companies"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#3B52D4] transition-colors hover:text-[#2E44C8]"
            >
              {copy.companies.view}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCompanies.map((company, index) => {
              const details = company
              const statuses = [
                company.isHiring ? copy.companies.statuses.isHiring : null,
                company.isFundraising ? copy.companies.statuses.isFundraising : null,
                company.isCollaborating ? copy.companies.statuses.isCollaborating : null,
              ].filter(Boolean)
              const initials = company.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <article
                  key={company.id}
                  className="group flex flex-col rounded-2xl border border-[#E4E7F0] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[rgba(59,82,212,0.25)] hover:shadow-[0_8px_32px_rgba(59,82,212,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                      {initials}
                    </div>
                    <span className="text-3xl font-bold text-[#0F1628]/[0.04]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B52D4]">
                      {details.sector}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#0F1628]">{company.name}</h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8B95A9]">
                      <MapPin className="h-3.5 w-3.5 text-[#3B52D4]/50" />
                      {details.location}
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-7 text-[#5D6B8A]">{details.description}</p>

                  <div className="mt-5 border-t border-[#E4E7F0] pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {details.stage}
                      </span>
                      {statuses.map((status) => (
                        <span
                          key={status}
                          className="rounded-full border border-[rgba(59,82,212,0.18)] bg-[#EEF1FF] px-3 py-1 text-xs font-semibold text-[#3B52D4]"
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>)}

      {/* ── Events ── */}
      <section className="section-veil relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={copy.events.eyebrow}
            title={copy.events.title}
            description={copy.events.description}
          />
          <UpcomingEvents />
        </div>
      </section>

      {/* ── Partners ── */}
      {ecosystemPartners.length > 0 && (<section className="section-veil-tinted relative z-10 px-4 py-20 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={copy.partners.eyebrow}
            title={copy.partners.title}
            description={copy.partners.description}
          />
          <div className="overflow-hidden rounded-2xl border border-[#E4E7F0] bg-white shadow-[0_2px_20px_rgba(15,22,40,0.05)]">
            <div className="border-b border-[#E4E7F0] px-6 py-6 sm:px-8">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ecosystemPartners.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.website}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-h-[96px] items-center justify-center rounded-xl border border-[#E4E7F0] bg-[#F8F9FC] px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(59,82,212,0.25)] hover:bg-white hover:shadow-[0_6px_24px_rgba(59,82,212,0.07)]"
                  >
                    {partner.logoUrl ? (
                      <Image
                        src={partner.logoUrl}
                        alt={`${partner.name} logo`}
                        width={160}
                        height={48}
                        className="max-h-10 w-auto max-w-[140px] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <span className="text-base font-semibold text-[#0F1628]">{partner.name}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-px bg-[#E4E7F0] lg:grid-cols-2">
              {ecosystemPartners.map((partner) => {
                const details = partner

                return (
                  <article key={partner.id} className="flex min-h-[200px] flex-col bg-white p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0F1628]">{partner.name}</h3>
                        <p className="mt-1.5 text-sm text-[#8B95A9]">{details.type}</p>
                      </div>
                      <div className="hidden rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#3B52D4] sm:block">
                        {partner.sector}
                      </div>
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#5D6B8A]">{details.description}</p>
                    <div className="mt-auto pt-6">
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B52D4] transition-colors hover:text-[#2E44C8]"
                      >
                        {locale === "ar" ? "زيارة الجهة" : "Visit partner"}
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>)}

      {/* ── News ── */}
      {latestNews.length > 0 && (<section className="section-veil relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3B52D4]">
                {copy.news.eyebrow}
              </div>
              <h2 className="text-balance text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-[2.75rem]">
                {copy.news.title}
              </h2>
            </div>
            <Link
              href="/news"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#3B52D4] transition-colors hover:text-[#2E44C8]"
            >
              {copy.news.read}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-14 divide-y divide-slate-200/60">
            {latestNews.map((article, index) => {
              const details = getLocalizedNewsContent(article, locale)
              const dateStr = new Date(details.publishedAt).toLocaleDateString(
                locale === "ar" ? "ar" : "en-US",
                { month: "long", day: "numeric", year: "numeric" }
              )

              return (
                <article
                  key={article.id}
                  className="group relative grid gap-6 py-10 sm:grid-cols-[64px_1fr] lg:grid-cols-[64px_200px_1fr]"
                >
                  <div className="hidden sm:block">
                    <span className="text-5xl font-bold leading-none text-slate-100 transition-colors group-hover:text-[#EEF1FF]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 lg:border-e lg:border-slate-200/60 lg:pe-6">
                    <span className="inline-flex w-fit rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-3 py-1 text-[11px] font-semibold text-[#3B52D4]">
                      {details.category}
                    </span>
                    <time className="text-xs text-slate-400">{dateStr}</time>
                    {details.readTime ? (
                      <span className="text-xs text-slate-400">{details.readTime}</span>
                    ) : null}
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#3B52D4] sm:text-2xl">
                      {details.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
                      {details.excerpt}
                    </p>
                    <div className="mt-6">
                      <Link
                        href={`/news/${details.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#3B52D4] transition-colors hover:text-[#2E44C8]"
                      >
                        {copy.news.read}
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>)}

      {/* ── CTA ── */}
      <section className="section-veil relative z-10 px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-32">
        <div className="relative mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 px-8 py-16 sm:px-14 sm:py-20"
            style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.06), 0 1px 4px rgba(59,82,212,0.04)" }}
          >
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#3B52D4]">
                {copy.cta.badge}
              </div>
              <h2 className="text-balance text-4xl font-black text-slate-900 sm:text-5xl">{copy.cta.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">{copy.cta.description}</p>
              <div className="mx-auto mt-6 max-w-xl rounded-xl border border-slate-200/60 bg-slate-50 px-5 py-3 text-sm text-slate-500">
                {locale === "ar"
                  ? "شبكة انتقائية للمؤسسين الجادين، تُراجع بعناية للحفاظ على الجودة والثقة داخل المنظومة."
                  : "A selective circle reviewed with care to preserve trust, relevance, and institutional quality."}
              </div>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-[#3B52D4] text-white font-bold hover:bg-[#2E44C8] shadow-lg shadow-[#3B52D4]/20"
                >
                  <Link href="/apply">{copy.cta.apply}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] hover:bg-[#EEF1FF]/50 font-bold"
                >
                  <Link href="/contact">{copy.cta.contact}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}
