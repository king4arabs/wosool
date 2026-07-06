"use client"

import Image from "next/image"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { companies, events, founders, newsItems, partners } from "@/data/seed"
import { getLocalizedNewsContent } from "@/lib/news-content"
import { type Locale, useLocale } from "@/lib/locale"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
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
      { value: "250+", label: "مؤسس" },
      { value: "15+", label: "برنامج" },
      { value: "3", label: "صناديق نشطة" },
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
      { value: "250+", label: "Founders" },
      { value: "15+", label: "Programs" },
      { value: "3", label: "Active funds" },
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
      { num: "01", title: "سجّل", desc: "أنشئ ملفك الشخصي وانضم للمجتمع" },
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
      { num: "01", title: "Register", desc: "Create your profile and join the community" },
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

const founderDetails = {
  f1: {
    ar: {
      role: "الشريك المؤسس والرئيسة التنفيذية، Meezan Capital",
      bio: "تقود بناء حلول مالية متوافقة مع الشريعة وتربط بين الابتكار المالي والاحتياجات الواقعية للشركات والأفراد في السوق السعودي.",
      sector: "تقنية مالية",
      stage: "السلسلة A",
      location: "الرياض، السعودية",
    },
    en: {
      role: "Founder & CEO, Meezan Capital",
      bio: "Building Shariah-compliant financial products with a clear focus on access, trust, and practical adoption across Saudi Arabia.",
      sector: "Fintech",
      stage: "Series A",
      location: "Riyadh, Saudi Arabia",
    },
    fr: {
      role: "Fondatrice et CEO, Meezan Capital",
      bio: "Elle développe des produits financiers conformes à la charia, pensés pour l’accès, la confiance et l’adoption concrète en Arabie saoudite.",
      sector: "Fintech",
      stage: "Série A",
      location: "Riyad, Arabie saoudite",
    },
  },
  f2: {
    ar: {
      role: "المؤسس، Shifaa Health",
      bio: "يبني منصة صحية تربط بين الرعاية المتخصصة والتشخيص المدعوم بالتقنية لخدمة المرضى في الخليج بصورة أكثر كفاءة.",
      sector: "تقنية صحية",
      stage: "البذرة",
      location: "دبي، الإمارات",
    },
    en: {
      role: "Founder, Shifaa Health",
      bio: "Scaling a healthcare platform that combines specialist access, patient trust, and technology-led diagnostics across the GCC.",
      sector: "HealthTech",
      stage: "Seed",
      location: "Dubai, UAE",
    },
    fr: {
      role: "Fondateur, Shifaa Health",
      bio: "Il développe une plateforme de santé qui combine accès aux spécialistes, confiance des patients et outils diagnostiques technologiques dans le Golfe.",
      sector: "HealthTech",
      stage: "Amorçage",
      location: "Dubaï, Émirats arabes unis",
    },
  },
  f3: {
    ar: {
      role: "المؤسسة، Amal Ops",
      bio: "تعمل على أتمتة العمليات الخلفية للشركات الصغيرة والمتوسطة عبر منتجات ذكاء اصطناعي واضحة القيمة وسهلة التطبيق.",
      sector: "برمجيات أعمال",
      stage: "ما قبل البذرة",
      location: "الرياض، السعودية",
    },
    en: {
      role: "Founder, Amal Ops",
      bio: "Creating AI-powered operations software that helps regional SMEs simplify back-office complexity and move faster.",
      sector: "B2B SaaS",
      stage: "Pre-seed",
      location: "Riyadh, Saudi Arabia",
    },
    fr: {
      role: "Fondatrice, Amal Ops",
      bio: "Elle crée des outils IA pour simplifier les opérations internes des PME régionales et réduire la friction du quotidien.",
      sector: "SaaS B2B",
      stage: "Pré-amorçage",
      location: "Riyad, Arabie saoudite",
    },
  },
} as const

const companyDetails = {
  c1: {
    ar: {
      sector: "تقنية مالية",
      stage: "السلسلة A",
      location: "الرياض، السعودية",
      description: "حلول تمويل متوافقة مع الشريعة تخدم الأفراد والمنشآت الصغيرة والمتوسطة داخل السعودية وبقية الخليج.",
    },
    en: {
      sector: "Fintech",
      stage: "Series A",
      location: "Riyadh, Saudi Arabia",
      description: "Shariah-compliant credit and finance products serving underserved consumers and SMEs across Saudi Arabia and the GCC.",
    },
    fr: {
      sector: "Fintech",
      stage: "Série A",
      location: "Riyad, Arabie saoudite",
      description: "Des solutions de financement conformes à la charia pour les particuliers et PME en Arabie saoudite et dans le Golfe.",
    },
  },
  c2: {
    ar: {
      sector: "تقنية صحية",
      stage: "البذرة",
      location: "دبي، الإمارات",
      description: "منصة رعاية صحية رقمية تجمع بين الوصول إلى الأطباء المتخصصين والتشخيص المدعوم بالتقنية.",
    },
    en: {
      sector: "HealthTech",
      stage: "Seed",
      location: "Dubai, UAE",
      description: "A digital health platform combining specialist care access with technology-assisted diagnostics and preventive workflows.",
    },
    fr: {
      sector: "HealthTech",
      stage: "Amorçage",
      location: "Dubaï, Émirats arabes unis",
      description: "Une plateforme de santé numérique qui réunit accès aux spécialistes et diagnostics assistés par la technologie.",
    },
  },
  c3: {
    ar: {
      sector: "برمجيات أعمال",
      stage: "ما قبل البذرة",
      location: "الرياض، السعودية",
      description: "منصة أتمتة تشغيلية تساعد الشركات الصغيرة والمتوسطة على تنظيم المحاسبة والامتثال والموارد البشرية في مكان واحد.",
    },
    en: {
      sector: "B2B SaaS",
      stage: "Pre-seed",
      location: "Riyadh, Saudi Arabia",
      description: "An AI-enabled operations platform helping SMEs unify finance, compliance, and HR workflows in one place.",
    },
    fr: {
      sector: "SaaS B2B",
      stage: "Pré-amorçage",
      location: "Riyad, Arabie saoudite",
      description: "Une plateforme d’opérations assistée par IA qui réunit finance, conformité et RH pour les PME.",
    },
  },
} as const

const eventDetails = {
  e1: {
    ar: {
      title: "انطلاق دوائر المؤسسين في الرياض",
      location: "الرياض، السعودية",
      description: "جلسة إطلاق لمجموعة جديدة من المؤسسين لوضع الأهداف، وبناء الثقة، وتحديد إيقاع عمل مشترك خلال الأسابيع المقبلة.",
    },
    en: {
      title: "Founder Circles Riyadh Kickoff",
      location: "Riyadh, Saudi Arabia",
      description: "A launch session for the next Riyadh circle cohort to set goals, build trust, and establish a strong working cadence.",
    },
    fr: {
      title: "Lancement des cercles de fondateurs à Riyad",
      location: "Riyad, Arabie saoudite",
      description: "Une session d’ouverture pour la nouvelle cohorte à Riyad afin d’aligner les objectifs et poser un rythme de travail commun.",
    },
  },
  e2: {
    ar: {
      title: "ساعات مكتبية: ماستر كلاس في جمع الاستثمار",
      location: "عن بُعد",
      description: "جلسات فردية ومجموعات صغيرة مع مستثمر متمرس حول العروض الاستثمارية، الجاهزية للفحص، وديناميكيات التمويل في الخليج.",
    },
    en: {
      title: "Expert Office Hours: Fundraising Masterclass",
      location: "Virtual",
      description: "Small-group and one-on-one sessions with a seasoned investor covering decks, diligence readiness, and GCC fundraising dynamics.",
    },
    fr: {
      title: "Office hours experts: masterclass levée de fonds",
      location: "En ligne",
      description: "Des sessions en petit groupe et en individuel avec un investisseur expérimenté sur le pitch, la due diligence et les codes du Golfe.",
    },
  },
  e3: {
    ar: {
      title: "عشاء وصول للمؤسسين - دبي",
      location: "دبي، الإمارات",
      description: "عشاء خاص لأعضاء وصول وضيوف مختارين في دبي، يركز على الحوار الصريح والتعارف النوعي ضمن أجواء هادئة.",
    },
    en: {
      title: "Wosool Founders Dinner - Dubai",
      location: "Dubai, UAE",
      description: "An intimate dinner for Wosool members and selected guests in Dubai, built around candid conversation and useful introductions.",
    },
    fr: {
      title: "Dîner des fondateurs Wosool - Dubaï",
      location: "Dubaï, Émirats arabes unis",
      description: "Un dîner privé pour les membres Wosool et quelques invités sélectionnés, pensé pour favoriser les échanges sincères et utiles.",
    },
  },
} as const

const partnerDetails = {
  pt1: {
    ar: {
      type: "شريك منظومة",
      description: "جهة رائدة في تمويل رأس المال الجريء مدعومة حكوميًا وتسهم في تسريع المشهد الريادي السعودي عبر الاستثمار وبناء المسارات.",
    },
    en: {
      type: "Ecosystem partner",
      description: "A leading government-backed venture capital platform catalysing the Saudi startup ecosystem through capital and strategic participation.",
    },
    fr: {
      type: "Partenaire écosystème",
      description: "Une plateforme de capital-risque soutenue par l’État, au cœur de l’accélération de l’écosystème saoudien.",
    },
  },
  pt2: {
    ar: {
      type: "شريك معرفي",
      description: "جامعة ومنظومة ابتكار عالمية توفر موارد معرفية وشراكات بحث وتطوير وخبرة عميقة في التقنيات المتقدمة.",
    },
    en: {
      type: "Knowledge partner",
      description: "A world-class university and innovation ecosystem bringing deep research capability, talent, and technical insight.",
    },
    fr: {
      type: "Partenaire connaissance",
      description: "Une université de référence et un écosystème d’innovation qui apportent recherche, talents et expertise technique.",
    },
  },
  pt3: {
    ar: {
      type: "شريك مجتمع",
      description: "مسرعة ومستثمر مبكر إقليمي يدعم المؤسسين عبر رأس المال، الإرشاد، والانضباط التنفيذي في مراحل النمو الأولى.",
    },
    en: {
      type: "Community partner",
      description: "A regional accelerator and early-stage investor supporting founders with capital, mentorship, and operating discipline.",
    },
    fr: {
      type: "Partenaire communauté",
      description: "Un accélérateur régional et investisseur early-stage qui accompagne les fondateurs avec capital et mentorat.",
    },
  },
  pt4: {
    ar: {
      type: "دعم استراتيجي",
      description: "شريك استشاري يقدم خبرة مالية وقانونية وتشغيلية للشركات التي تستعد للنمو المؤسسي والتوسع.",
    },
    en: {
      type: "Strategic supporter",
      description: "An advisory partner bringing financial, legal, and growth-strategy support to companies preparing for scaled execution.",
    },
    fr: {
      type: "Soutien stratégique",
      description: "Un partenaire conseil qui apporte expertise financière, juridique et stratégique aux entreprises en phase d’accélération.",
    },
  },
} as const

function formatEventDate(date: string, locale: Locale) {
  const parserLocale = locale === "ar" ? "ar" : "en-US"
  const parsed = new Date(date)
  return {
    month: parsed.toLocaleString(parserLocale, { month: "short" }).toUpperCase(),
    day: parsed.toLocaleString(parserLocale, { day: "2-digit" }),
    full: parsed.toLocaleDateString(parserLocale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }
}

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
  const copy = homeCopy[locale]
  const heroCopy = heroSectionCopy[locale]
  const featuredFounders = founders.filter((founder) => founder.isFeatured).slice(0, 3)
  const featuredCompanies = companies.slice(0, 3)
  const upcomingEvents = events.slice(0, 3)
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

        <div className="relative mx-auto max-w-7xl py-20 lg:py-28">
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
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
                {heroCopy.titleLead}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
                  {heroCopy.titleHighlight}
                </span>
                {heroCopy.titleTail ? <> {heroCopy.titleTail}</> : null}
              </h1>

              <p className="text-sm lg:text-base text-slate-600 leading-relaxed max-w-xl">
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
              <div className="flex gap-6 pt-2">
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

            {/* ── RIGHT: Glass card ── */}
            <div className="lg:col-span-5">
              <div
                className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-6 transition duration-300 hover:rotate-0"
                style={{
                  boxShadow: "0 20px 25px -5px rgba(59,82,212,0.04), 0 10px 10px -5px rgba(59,82,212,0.02)",
                  transform: "rotate(1deg)",
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] text-[#3B52D4] flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M120 160c-33.1 0-60 26.9-60 60s26.9 60 60 60c11.3 0 21.9-3.1 31-8.5l68.5 68.5c-5.4 9.1-8.5 19.7-8.5 31 0 33.1 26.9 60 60 60s60-26.9 60-60c0-11.3-3.1-21.9-8.5-31l68.5-68.5c9.1 5.4 19.7 8.5 31 8.5 33.1 0 60-26.9 60-60s-26.9-60-60-60-60 26.9-60 60c0 11.3 3.1 21.9 8.5 31l-68.5 68.5c-9.1-5.4-19.7-8.5-31-8.5s-21.9 3.1-31 8.5L151 222.5c5.4-9.1 8.5-19.7 8.5-31 0-33.1-26.9-60-60-60z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {locale === "ar" ? "محمد بنعمر" : "Mohammed B."}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {locale === "ar" ? "مؤسس منصة رابح للتمويل" : "Founder, Rabeh Finance"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#EEF1FF] text-[#3B52D4] px-2 py-0.5 rounded-full font-bold border border-[#E4E7F0]">
                    Fintech
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {locale === "ar"
                    ? "\"ارتبطت بـ 14 مؤسس تقني نشط عبر شبكة وصول لتبادل الخبرات وتسريع النمو.\""
                    : "\"Connected with 14 active tech founders through Wosool to exchange expertise and accelerate growth.\""}
                </p>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-[#3B52D4] rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-bold">
                  <span>
                    {locale === "ar" ? "معدل الارتباط بالمنظومة" : "Network connection rate"}
                  </span>
                  <span className="text-[#3B52D4] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
                    {locale === "ar" ? "موثق  " : "Live & verified"}
                  </span>
                </div>

                {/* Mini founder grid */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  {[
                    { initials: "عس", label: locale === "ar" ? "LegalTech" : "LegalTech" },
                    { initials: "سأ", label: "ClimateTech" },
                    { initials: "رج", label: "EdTech" },
                  ].map((item) => (
                    <div key={item.initials} className="text-center">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center text-[10px] font-bold mx-auto mb-1">
                        {item.initials}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
      <section className="section-veil relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
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
                  const details = founderDetails[leadFounder.id as keyof typeof founderDetails][locale]
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
                const details = founderDetails[founder.id as keyof typeof founderDetails][locale]
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
      </section>

      {/* ── Companies ── */}
      <section className="section-veil-tinted relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
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
              const details = companyDetails[company.id as keyof typeof companyDetails][locale]
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
      </section>

      {/* ── Events ── */}
      <section className="section-veil relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="relative mx-auto max-w-7xl">
          <SectionIntro
            eyebrow={copy.events.eyebrow}
            title={copy.events.title}
            description={copy.events.description}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const details = eventDetails[event.id as keyof typeof eventDetails][locale]
              const eventDate = formatEventDate(event.date, locale)

              return (
                <article key={event.id} className="premium-card flex h-full flex-col rounded-2xl p-7">
                  <div className="flex items-start gap-5">
                    <div className="min-w-[76px] rounded-xl border border-[#E4E7F0] bg-[#F5F7FF] px-3 py-4 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3B52D4]">{eventDate.month}</div>
                      <div className="mt-1.5 text-2xl font-bold text-[#0F1628]">{eventDate.day}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold tracking-[0.16em] text-[#3B52D4]">
                        {event.isPublic ? (locale === "ar" ? "دعوة ممتدة" : "Open invitation") : (locale === "ar" ? "دعوة خاصة" : "Private room")}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-[#0F1628]">{details.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#8B95A9]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#3B52D4]/60" />
                          {details.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-[#3B52D4]/60" />
                          {eventDate.full}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-7 text-[#5D6B8A]">{details.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E4E7F0] pt-5">
                    <div className="text-xs text-[#8B95A9]">{event.type}</div>
                    <Button asChild variant="ghost" className="h-auto px-0 py-0 text-sm font-semibold text-[#3B52D4] hover:bg-transparent hover:text-[#2E44C8]">
                      <Link href="/events">{copy.events.rsvp}</Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="section-veil-tinted relative z-10 px-4 py-20 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
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
                const details = partnerDetails[partner.id as keyof typeof partnerDetails][locale]

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
      </section>

      {/* ── News ── */}
      <section className="section-veil relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
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
      </section>

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
