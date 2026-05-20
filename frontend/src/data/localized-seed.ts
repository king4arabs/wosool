import { companies, events, founders, partners, programs, sponsors } from "@/data/seed"
import type { Locale } from "@/lib/locale"
import type { Company, Event, Founder, Partner, Program, Sponsor } from "@/types"

type LocalizedValue<T> = {
  ar: T
  en: T
  fr?: T
}

type PartialLocalizedRecord<T> = Record<string, LocalizedValue<Partial<T>>>

function getLocalizedValue<T>(value: LocalizedValue<T>, locale: Locale): T {
  if (locale === "fr") {
    return value.fr ?? value.en
  }

  return value[locale]
}

const founderOverlays: PartialLocalizedRecord<Founder> = {
  f1: {
    ar: {
      tagline: "تبني مستقبل التقنية المالية الإسلامية في السعودية",
      bio: "مؤسسة سابقة مرتين وخبيرة استراتيجية سابقة في ماكنزي. تعمل اليوم على حلول مالية متوافقة مع الشريعة تخدم الأفراد والمنشآت غير المخدومة بما يكفي.",
      location: "الرياض، السعودية",
      sector: "تقنية مالية",
      stage: "السلسلة A",
      needs: ["إرشاد تنظيمي", "مبيعات B2B"],
      offers: ["استراتيجية جمع الاستثمار", "ملاءمة المنتج للسوق"],
      companyName: "ميزان كابيتال",
    },
    en: {},
  },
  f2: {
    ar: {
      tagline: "توسيع الوصول إلى الرعاية الصحية في الخليج",
      bio: "طبيب تحوّل إلى رائد أعمال. بنى منصة طبّ عن بعد تخدم عشرات الآلاف من المرضى ويهتم بالوقاية والتشخيص المدعوم بالتقنية.",
      location: "دبي، الإمارات",
      sector: "تقنية صحية",
      stage: "البذرة",
      needs: ["شراكات طبية", "تنظيم صحي في الإمارات"],
      offers: ["خبرة طبية", "بحث المستخدمين"],
    },
    en: {},
  },
  f3: {
    ar: {
      tagline: "تمكين الشركات الصغيرة عبر أتمتة العمليات بالذكاء الاصطناعي",
      bio: "مديرة تقنية سابقة في بنك إقليمي. تبني اليوم أدوات تشغيلية تقلل الفوضى التشغيلية التي تعيق نمو الشركات الصغيرة والمتوسطة في المنطقة.",
      location: "الرياض، السعودية",
      sector: "برمجيات أعمال",
      stage: "ما قبل البذرة",
      needs: ["أول عملاء مؤسسيين", "شريك تقني مؤسس"],
      offers: ["هندسة الأنظمة", "بناء الفرق"],
    },
    en: {},
  },
  f4: {
    ar: {
      tagline: "إعادة تصور اللوجستيات لموجة التجارة الإلكترونية الخليجية",
      bio: "رائد أعمال متسلسل بخبرات في التجزئة واللوجستيات، يبني بنية تحتية للتوصيل الأخير مدعومة بذكاء المسارات الفوري.",
      location: "المنامة، البحرين",
      sector: "لوجستيات / تجارة إلكترونية",
      stage: "السلسلة A",
      needs: ["شراكات أساطيل", "عقود حكومية"],
      offers: ["خبرة سلاسل الإمداد", "تعريفات استثمارية"],
    },
    en: {},
  },
  f5: {
    ar: {
      tagline: "جعل الغذاء المستدام خيارًا يوميًا في السعودية",
      bio: "عالمة أغذية وقائدة منتجات سابقة، تبني أول علامة غذائية نباتية خليجية بنكهات محلية موجهة للسوق السعودي.",
      location: "جدة، السعودية",
      sector: "تقنية الغذاء",
      stage: "البذرة",
      needs: ["توزيع تجزئة", "شراكات علامة تجارية"],
      offers: ["تطوير المنتجات الغذائية", "رؤى المستهلك"],
    },
    en: {},
  },
  f6: {
    ar: {
      tagline: "بناء سوق المواهب التقنية في السعودية",
      bio: "مؤسس متخارج في مجال الموارد البشرية التقنية، يركز اليوم على سد فجوة المهارات وربط الشركات السريعة النمو بالمواهب المناسبة.",
      location: "الرياض، السعودية",
      sector: "تقنية الموارد البشرية",
      stage: "التوسّع",
      needs: ["شراكات موارد بشرية مؤسسية", "توسع إقليمي"],
      offers: ["خبرة التخارج", "استراتيجية المواهب"],
    },
    en: {},
  },
}

const companyOverlays: PartialLocalizedRecord<Company> = {
  c1: {
    ar: {
      description: "حلول مالية متوافقة مع الشريعة تخدم الأفراد والمنشآت الصغيرة والمتوسطة داخل السعودية وبقية الخليج.",
      sector: "تقنية مالية",
      stage: "السلسلة A",
      location: "الرياض، السعودية",
    },
    en: {},
  },
  c2: {
    ar: {
      description: "منصة صحية رقمية تجمع بين الوصول إلى الأطباء المتخصصين والتشخيص المدعوم بالتقنية.",
      sector: "تقنية صحية",
      stage: "البذرة",
      location: "دبي، الإمارات",
    },
    en: {},
  },
  c3: {
    ar: {
      description: "منصة أتمتة تشغيلية تساعد الشركات الصغيرة والمتوسطة على تنظيم المحاسبة والامتثال والموارد البشرية في مكان واحد.",
      sector: "برمجيات أعمال",
      stage: "ما قبل البذرة",
      location: "الرياض، السعودية",
    },
    en: {},
  },
  c4: {
    ar: {
      description: "بنية تحتية للتوصيل الأخير مدعومة بذكاء المسارات، تخدم شركات التجارة الإلكترونية في البحرين والسعودية.",
      sector: "لوجستيات",
      stage: "السلسلة A",
      location: "المنامة، البحرين",
    },
    en: {},
  },
  c5: {
    ar: {
      description: "علامة غذائية نباتية خليجية بنكهات محلية، تجعل الأكل المستدام أكثر قربًا ووضوحًا للمستهلك.",
      sector: "تقنية الغذاء",
      stage: "البذرة",
      location: "جدة، السعودية",
    },
    en: {},
  },
  c6: {
    ar: {
      description: "سوق سعودي للمواهب التقنية يربط آلاف المختصين بالشركات الناشئة والمؤسسات سريعة النمو.",
      sector: "تقنية الموارد البشرية",
      stage: "التوسّع",
      location: "الرياض، السعودية",
    },
    en: {},
  },
}

const eventOverlays: PartialLocalizedRecord<Event> = {
  e1: {
    ar: {
      title: "انطلاق دوائر المؤسسين في الرياض",
      description: "جلسة إطلاق لمجموعة جديدة من المؤسسين لوضع الأهداف وبناء الثقة وتحديد إيقاع عمل مشترك خلال الأسابيع المقبلة.",
      location: "الرياض، السعودية",
      type: "حضوري",
      tags: ["دوائر المؤسسين", "الرياض", "دفعة"],
    },
    en: {},
  },
  e2: {
    ar: {
      title: "ساعات مكتبية: ماستر كلاس في جمع الاستثمار",
      description: "جلسات فردية ومجموعات صغيرة مع مستثمر متمرس حول العروض الاستثمارية والجاهزية للفحص وديناميكيات التمويل في الخليج.",
      location: "عن بُعد",
      type: "عن بُعد",
      tags: ["الاستثمار", "ساعات مكتبية", "عن بُعد"],
    },
    en: {},
  },
  e3: {
    ar: {
      title: "عشاء وصول للمؤسسين - دبي",
      description: "عشاء خاص لأعضاء وصول وضيوف مختارين في دبي يركز على الحوار الصريح والتعارف النوعي ضمن أجواء هادئة.",
      location: "دبي، الإمارات",
      type: "حضوري",
      tags: ["شبكات", "عشاء", "دبي"],
    },
    en: {},
  },
  e4: {
    ar: {
      title: "الذكاء الاصطناعي في الخليج - طاولة مؤسسين مستديرة",
      description: "جلسة حوارية تجمع مؤسسين يبنون منتجات أصلية في الذكاء الاصطناعي لمناقشة الفرص والتحديات والتنظيم داخل المنطقة.",
      location: "عن بُعد",
      type: "عن بُعد",
      tags: ["ذكاء اصطناعي", "طاولة مستديرة", "عن بُعد"],
    },
    en: {},
  },
  e5: {
    ar: {
      title: "التوسع في السعودية - ورشة التنظيم والامتثال",
      description: "ورشة عملية حول المشهد التنظيمي للشركات الناشئة في السعودية، من التراخيص إلى حماية البيانات والمتطلبات الخاصة بالتقنية المالية.",
      location: "الرياض، السعودية",
      type: "حضوري",
      tags: ["تنظيم", "ورشة", "السعودية"],
    },
    en: {},
  },
  e6: {
    ar: {
      title: "يوم العروض - وصول الربع الثاني 2026",
      description: "شاهد عروض أحدث دفعاتنا أمام لجنة منتقاة من المستثمرين، مع جلسة تعارف لاحقة مخصصة للأعضاء.",
      location: "الرياض، السعودية",
      type: "حضوري",
      tags: ["يوم العروض", "مستثمرون", "عروض تقديمية"],
    },
    en: {},
  },
}

const programOverlays: PartialLocalizedRecord<Program> = {
  p1: {
    ar: {
      name: "برنامج التهيئة في وصول",
      description: "مسار تهيئة منظم لمدة أربعة أسابيع يساعد الأعضاء الجدد على إعداد ملفاتهم والاستفادة القصوى من الشبكة وبناء أولى العلاقات المناسبة.",
      category: "التهيئة",
      duration: "4 أسابيع",
      targetStage: ["ما قبل البذرة", "البذرة", "السلسلة A"],
      benefits: ["جلسة تهيئة فردية", "تحسين الملف الشخصي", "أول تعريف بدائرة مؤسسين", "جولة على المنصة"],
    },
    en: {},
  },
  p2: {
    ar: {
      name: "دوائر المؤسسين",
      description: "مجموعات نظيرية منتقاة من 6 إلى 8 مؤسسين في مراحل متقاربة، تجتمع دوريًا لمدة 12 أسبوعًا لمشاركة التحديات والتقدم والمساءلة.",
      category: "التعلم النظيري",
      duration: "12 أسبوعًا",
      targetStage: ["ما قبل البذرة", "البذرة", "السلسلة A"],
      benefits: ["مواءمة مؤسسين منتقاة", "أجندة واضحة", "جلسات ميسّرة", "قناة سلاك خاصة", "الوصول إلى شبكة الخريجين"],
    },
    en: {},
  },
  p3: {
    ar: {
      name: "مسار النمو",
      description: "برنامج مكثف لثمانية أسابيع للمؤسسين الجاهزين للتوسع، يغطي التوظيف والتسويق والتوسع الإقليمي وجمع الاستثمار.",
      category: "النمو",
      duration: "8 أسابيع",
      targetStage: ["السلسلة A", "التوسّع"],
      benefits: ["جلسات أسبوعية مع خبراء", "مكالمات استشارية فردية", "تعريفات للمستثمرين", "دعم الذهاب إلى السوق", "شراكات استراتيجية"],
    },
    en: {},
  },
  p4: {
    ar: {
      name: "الجاهزية لجمع الاستثمار",
      description: "برنامج مخصص لمدة ستة أسابيع لإعداد المؤسسين للجولة القادمة، من العرض الاستثماري حتى الجاهزية للفحص النافي للجهالة.",
      category: "الاستثمار",
      duration: "6 أسابيع",
      targetStage: ["ما قبل البذرة", "البذرة"],
      benefits: ["تدريب على العرض", "مكالمات تعريف بالمستثمرين", "ورشة نمذجة مالية", "مراجعة الشروط", "تعريفات دافئة"],
    },
    en: {},
  },
}

const partnerOverlays: PartialLocalizedRecord<Partner> = {
  pt1: {
    ar: {
      description: "جهة رائدة في تمويل رأس المال الجريء مدعومة حكوميًا وتسهم في تسريع المشهد الريادي السعودي عبر الاستثمار وبناء المسارات.",
      type: "شريك منظومة",
      sector: "رأس مال جريء",
    },
    en: {},
  },
  pt2: {
    ar: {
      description: "جامعة ومنظومة ابتكار عالمية توفر موارد معرفية وشراكات بحث وتطوير وخبرة عميقة في التقنيات المتقدمة.",
      type: "شريك معرفي",
      sector: "تعليم / بحث",
    },
    en: {},
  },
  pt3: {
    ar: {
      description: "مسرعة ومستثمر مبكر إقليمي يدعم المؤسسين عبر رأس المال والإرشاد والانضباط التنفيذي في مراحل النمو الأولى.",
      type: "شريك مجتمع",
      sector: "مسرعة أعمال",
    },
    en: {},
  },
  pt4: {
    ar: {
      description: "شريك استشاري يقدم خبرة مالية وقانونية وتشغيلية للشركات التي تستعد للنمو المؤسسي والتوسع.",
      type: "دعم استراتيجي",
      sector: "خدمات مهنية",
    },
    en: {},
  },
}

const sponsorOverlays: PartialLocalizedRecord<Sponsor> = {
  sp1: {
    ar: {
      description: "الذراع الاستثمارية لشركة الاتصالات السعودية، تدعم المؤسسين الطموحين الذين يبنون مستقبل البنية الرقمية في المنطقة.",
    },
    en: {},
  },
  sp2: {
    ar: {
      description: "إحدى أكبر المؤسسات المالية في السعودية، تدعم رواد الأعمال بحلول مصرفية واستثمارات موجهة للمنظومة.",
    },
    en: {},
  },
  sp3: {
    ar: {
      description: "شركة خدمات مهنية عالمية تدعم ريادة الأعمال والنمو المؤسسي في السعودية والخليج.",
    },
    en: {},
  },
}

function applyOverlay<T extends { id: string }>(item: T, locale: Locale, overlays: PartialLocalizedRecord<T>): T {
  const overlay = overlays[item.id]

  if (!overlay) {
    return item
  }

  return { ...item, ...getLocalizedValue(overlay, locale) }
}

export function localizeFounder(founder: Founder, locale: Locale): Founder {
  return applyOverlay(founder, locale, founderOverlays)
}

export function localizeCompany(company: Company, locale: Locale): Company {
  return applyOverlay(company, locale, companyOverlays)
}

export function localizeEvent(event: Event, locale: Locale): Event {
  return applyOverlay(event, locale, eventOverlays)
}

export function localizeProgram(program: Program, locale: Locale): Program {
  return applyOverlay(program, locale, programOverlays)
}

export function localizePartner(partner: Partner, locale: Locale): Partner {
  return applyOverlay(partner, locale, partnerOverlays)
}

export function localizeSponsor(sponsor: Sponsor, locale: Locale): Sponsor {
  return applyOverlay(sponsor, locale, sponsorOverlays)
}

export function getSeedFounders(locale: Locale) {
  return founders.map((founder) => localizeFounder(founder, locale))
}

export function getSeedCompanies(locale: Locale) {
  return companies.map((company) => localizeCompany(company, locale))
}

export function getSeedEvents(locale: Locale) {
  return events.map((event) => localizeEvent(event, locale))
}

export function getSeedPrograms(locale: Locale) {
  return programs.map((program) => localizeProgram(program, locale))
}

export function getSeedPartners(locale: Locale) {
  return partners.map((partner) => localizePartner(partner, locale))
}

export function getSeedSponsors(locale: Locale) {
  return sponsors.map((sponsor) => localizeSponsor(sponsor, locale))
}

export function getPartnerStatusLabel(status: Partner["status"], locale: Locale) {
  const labels: Record<Partner["status"], LocalizedValue<string>> = {
    Confirmed: { ar: "مؤكد", en: "Confirmed" },
    Prospective: { ar: "قيد التطوير", en: "Prospective" },
    "Ecosystem-Aligned": { ar: "متوافق مع المنظومة", en: "Ecosystem-Aligned" },
    "Past Collaborator": { ar: "شريك سابق", en: "Past Collaborator" },
  }

  return getLocalizedValue(labels[status], locale)
}

export function getSponsorTierLabel(tier: Sponsor["tier"], locale: Locale) {
  const labels: Record<Sponsor["tier"], LocalizedValue<string>> = {
    Platinum: { ar: "بلاتيني", en: "Platinum" },
    Gold: { ar: "ذهبي", en: "Gold" },
    Silver: { ar: "فضي", en: "Silver" },
    Bronze: { ar: "برونزي", en: "Bronze" },
    Community: { ar: "مجتمعي", en: "Community" },
  }

  return getLocalizedValue(labels[tier], locale)
}

export const foundersPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  featuredEyebrow: string
  featuredTitle: string
  directoryEyebrow: string
  directoryTitle: string
  searchPlaceholder: string
  searchAria: string
  sectors: string[]
  stages: string[]
  locations: string[]
  results: string
  login: string
  ctaTitle: string
  ctaBody: string
  apply: string
  contact: string
}> = {
  ar: {
    badge: "دليل المؤسسين",
    title: "تعرّف على مؤسسي شبكة وصول",
    description: "مجتمع يضم مؤسسين موثّقين يبنون شركات في السعودية والخليج، مع تنوع واضح في القطاعات والمراحل التشغيلية.",
    featuredEyebrow: "أعضاء مختارون",
    featuredTitle: "مؤسسون تحت الضوء",
    directoryEyebrow: "الدليل",
    directoryTitle: "جميع المؤسسين",
    searchPlaceholder: "ابحث بالاسم أو الشركة أو الكلمات المفتاحية",
    searchAria: "ابحث في المؤسسين",
    sectors: ["جميع القطاعات", "التقنية المالية", "التقنية الصحية", "برمجيات الأعمال", "اللوجستيات", "تقنية الغذاء", "تقنية الموارد البشرية"],
    stages: ["جميع المراحل", "ما قبل البذرة", "البذرة", "السلسلة A", "التوسّع", "مؤسس متخارج"],
    locations: ["جميع المواقع", "السعودية", "الإمارات", "البحرين", "الكويت", "قطر"],
    results: "يتم عرض {count} ملفات حاليًا، فيما تبقى بعض الملفات الكاملة متاحة للأعضاء المسجلين فقط.",
    login: "سجّل الدخول لعرض المزيد",
    ctaTitle: "هل تبحث عن تعريف مناسب؟",
    ctaBody: "يمكن لأعضاء وصول طلب تعريفات منتقاة عبر المنصة. إذا لم تكن عضوًا بعد، فابدأ بطلب الانضمام.",
    apply: "قدّم للانضمام",
    contact: "تواصل مع الفريق",
  },
  en: {
    badge: "Founder Directory",
    title: "Meet the founders in the Wosool network",
    description: "A curated community of verified founders building across Saudi Arabia and the GCC, with meaningful diversity in sectors and operating stages.",
    featuredEyebrow: "Featured Members",
    featuredTitle: "Founders in focus",
    directoryEyebrow: "Directory",
    directoryTitle: "All founders",
    searchPlaceholder: "Search by founder, company, or keyword",
    searchAria: "Search founders",
    sectors: ["All sectors", "Fintech", "HealthTech", "B2B SaaS", "Logistics", "FoodTech", "HRTech"],
    stages: ["All stages", "Pre-seed", "Seed", "Series A", "Scale-up", "Exited Founder"],
    locations: ["All locations", "Saudi Arabia", "UAE", "Bahrain", "Kuwait", "Qatar"],
    results: "Showing {count} profiles right now. Some full profiles remain available to signed-in members only.",
    login: "Sign in to view more",
    ctaTitle: "Looking for the right introduction?",
    ctaBody: "Wosool members can request curated introductions through the platform. If you're not a member yet, start with an application.",
    apply: "Apply to join",
    contact: "Contact the team",
  },
  fr: {
    badge: "Founder Directory",
    title: "Meet the founders in the Wosool network",
    description: "A curated community of verified founders building across Saudi Arabia and the GCC, with meaningful diversity in sectors and operating stages.",
    featuredEyebrow: "Featured Members",
    featuredTitle: "Founders in focus",
    directoryEyebrow: "Directory",
    directoryTitle: "All founders",
    searchPlaceholder: "Search by founder, company, or keyword",
    searchAria: "Search founders",
    sectors: ["All sectors", "Fintech", "HealthTech", "B2B SaaS", "Logistics", "FoodTech", "HRTech"],
    stages: ["All stages", "Pre-seed", "Seed", "Series A", "Scale-up", "Exited Founder"],
    locations: ["All locations", "Saudi Arabia", "UAE", "Bahrain", "Kuwait", "Qatar"],
    results: "Showing {count} profiles right now. Some full profiles remain available to signed-in members only.",
    login: "Sign in to view more",
    ctaTitle: "Looking for the right introduction?",
    ctaBody: "Wosool members can request curated introductions through the platform. If you're not a member yet, start with an application.",
    apply: "Apply to join",
    contact: "Contact the team",
  },
}

export const companiesPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  stats: [string, string, string]
  directoryEyebrow: string
  directoryTitle: string
  searchPlaceholder: string
  searchAria: string
  sectors: string[]
  stages: string[]
  hiringTitle: string
  fundraisingTitle: string
  ctaTitle: string
  ctaBody: string
  cta: string
}> = {
  ar: {
    badge: "شركات الأعضاء",
    title: "شركات بناها أعضاء وصول",
    description: "اكتشف شركات ناشئة وشركات نمو وتوسع أسسها أعضاء شبكة وصول في قطاعات وأسواق مختلفة.",
    stats: ["توظيف نشط", "جمع استثمار", "منفتحة على التعاون"],
    directoryEyebrow: "الدليل",
    directoryTitle: "جميع الشركات",
    searchPlaceholder: "ابحث باسم الشركة أو القطاع",
    searchAria: "ابحث في الشركات",
    sectors: ["جميع القطاعات", "التقنية المالية", "التقنية الصحية", "برمجيات الأعمال", "اللوجستيات", "تقنية الغذاء", "تقنية الموارد البشرية"],
    stages: ["جميع المراحل", "ما قبل البذرة", "البذرة", "السلسلة A", "التوسّع"],
    hiringTitle: "شركات توظّف حاليًا",
    fundraisingTitle: "شركات تجمع استثمارًا",
    ctaTitle: "أضف شركتك إلى الشبكة",
    ctaBody: "يمكن لأعضاء وصول عرض شركاتهم داخل الشبكة والاستفادة من تعريفات دافئة وفرص تعاون أكثر دقة.",
    cta: "قدّم للانضمام",
  },
  en: {
    badge: "Member Companies",
    title: "Companies built by Wosool members",
    description: "Discover startups and growth companies founded by members of the Wosool network across different sectors and markets.",
    stats: ["Actively hiring", "Fundraising", "Open to collaborate"],
    directoryEyebrow: "Directory",
    directoryTitle: "All companies",
    searchPlaceholder: "Search by company or sector",
    searchAria: "Search companies",
    sectors: ["All sectors", "Fintech", "HealthTech", "B2B SaaS", "Logistics", "FoodTech", "HRTech"],
    stages: ["All stages", "Pre-seed", "Seed", "Series A", "Scale-up"],
    hiringTitle: "Companies hiring now",
    fundraisingTitle: "Companies currently fundraising",
    ctaTitle: "Add your company to the network",
    ctaBody: "Wosool members can showcase their companies inside the network and benefit from warmer introductions and more targeted collaborations.",
    cta: "Apply to join",
  },
  fr: {
    badge: "Member Companies",
    title: "Companies built by Wosool members",
    description: "Discover startups and growth companies founded by members of the Wosool network across different sectors and markets.",
    stats: ["Actively hiring", "Fundraising", "Open to collaborate"],
    directoryEyebrow: "Directory",
    directoryTitle: "All companies",
    searchPlaceholder: "Search by company or sector",
    searchAria: "Search companies",
    sectors: ["All sectors", "Fintech", "HealthTech", "B2B SaaS", "Logistics", "FoodTech", "HRTech"],
    stages: ["All stages", "Pre-seed", "Seed", "Series A", "Scale-up"],
    hiringTitle: "Companies hiring now",
    fundraisingTitle: "Companies currently fundraising",
    ctaTitle: "Add your company to the network",
    ctaBody: "Wosool members can showcase their companies inside the network and benefit from warmer introductions and more targeted collaborations.",
    cta: "Apply to join",
  },
}

export const eventsPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  tabs: string[]
  eyebrow: string
  heading: string
  virtualTitle: string
  inPersonTitle: string
  ctaTitle: string
  ctaBody: string
  cta: string
  memberTitle: string
  memberBody: string
  memberCta: string
}> = {
  ar: {
    badge: "روزنامة الفعاليات",
    title: "التقِ بمؤسسين يشاركونك الجدية نفسها",
    description: "من اللقاءات الخاصة إلى الجلسات الرقمية المركزة، صُممت فعاليات وصول لتصنع حوارات أعمق وعلاقات أكثر فائدة.",
    tabs: ["جميع الفعاليات", "عن بُعد", "حضورية", "للأعضاء فقط"],
    eyebrow: "القادم",
    heading: "جميع الفعاليات",
    virtualTitle: "الفعاليات الرقمية",
    inPersonTitle: "الفعاليات الحضورية",
    ctaTitle: "هل لديك فكرة فعالية مناسبة للمجتمع؟",
    ctaBody: "يمكن لأعضاء وصول اقتراح فعاليات أو استضافتها بالتعاون مع الفريق. شاركنا الفكرة وسنساعدك في تقييمها وتنسيقها.",
    cta: "اقترح فعالية",
    memberTitle: "انضم للوصول إلى الفعاليات الحصرية",
    memberBody: "جزء كبير من فعاليات وصول مخصص للأعضاء فقط. انضم إلى الشبكة لتحصل على أولوية الوصول والدعوات الخاصة.",
    memberCta: "قدّم للانضمام",
  },
  en: {
    badge: "Events Calendar",
    title: "Meet founders who share the same level of intent",
    description: "From private dinners to focused virtual sessions, Wosool events are designed to create deeper conversations and more useful relationships.",
    tabs: ["All events", "Virtual", "In person", "Members only"],
    eyebrow: "Upcoming",
    heading: "All events",
    virtualTitle: "Virtual events",
    inPersonTitle: "In-person events",
    ctaTitle: "Have an event idea for the community?",
    ctaBody: "Wosool members can suggest or host events with the team. Share the concept and we'll help evaluate and shape it.",
    cta: "Suggest an event",
    memberTitle: "Join for access to private events",
    memberBody: "A large part of the Wosool calendar is reserved for members. Join the network for priority access and private invitations.",
    memberCta: "Apply to join",
  },
  fr: {
    badge: "Events Calendar",
    title: "Meet founders who share the same level of intent",
    description: "From private dinners to focused virtual sessions, Wosool events are designed to create deeper conversations and more useful relationships.",
    tabs: ["All events", "Virtual", "In person", "Members only"],
    eyebrow: "Upcoming",
    heading: "All events",
    virtualTitle: "Virtual events",
    inPersonTitle: "In-person events",
    ctaTitle: "Have an event idea for the community?",
    ctaBody: "Wosool members can suggest or host events with the team. Share the concept and we'll help evaluate and shape it.",
    cta: "Suggest an event",
    memberTitle: "Join for access to private events",
    memberBody: "A large part of the Wosool calendar is reserved for members. Join the network for priority access and private invitations.",
    memberCta: "Apply to join",
  },
}

export const programsPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  categories: string[]
  openEyebrow: string
  openTitle: string
  openBody: string
  laterEyebrow: string
  laterTitle: string
  laterBody: string
  workflowEyebrow: string
  workflowTitle: string
  workflowSteps: Array<{ step: string; desc: string }>
  ctaTitle: string
  ctaBody: string
  cta: string
}> = {
  ar: {
    badge: "البرامج",
    title: "دعم منظم لكل مرحلة",
    description: "من التهيئة الأولى حتى الجاهزية للاستثمار، صُممت برامج وصول لتقدم للمؤسس ما يحتاجه فعلاً في التوقيت المناسب.",
    categories: ["جميع البرامج", "التهيئة", "التعلم النظيري", "النمو", "الاستثمار"],
    openEyebrow: "مفتوح الآن",
    openTitle: "برامج متاحة للتقديم",
    openBody: "هذه البرامج تستقبل الطلبات حاليًا للدفعة الحالية أو القادمة.",
    laterEyebrow: "لاحقًا",
    laterTitle: "برامج تفتح قريبًا",
    laterBody: "يمكنك متابعة هذه البرامج والاستعداد للتقديم عند فتح الجولة التالية.",
    workflowEyebrow: "آلية العمل",
    workflowTitle: "برامج مصممة حول احتياج المؤسس",
    workflowSteps: [
      { step: "قدّم", desc: "اختر البرنامج المناسب وقدّم طلبًا مختصرًا يوضح المرحلة والاحتياج والهدف." },
      { step: "انضم إلى دفعتك", desc: "ننسّق مجموعات صغيرة ومركزة تضمن ملاءمة أعلى بين الأعضاء." },
      { step: "تقدّم بثبات", desc: "استفد من الجلسات والمعالم العملية والدعم اللاحق بعد انتهاء البرنامج." },
    ],
    ctaTitle: "هل أنت جاهز للتسارع؟",
    ctaBody: "انضم إلى وصول لتحصل على أولوية الوصول إلى البرامج والدفعات المقبلة والدعم المناسب لمرحلتك.",
    cta: "قدّم للانضمام",
  },
  en: {
    badge: "Programs",
    title: "Structured support for every stage",
    description: "From onboarding to fundraising readiness, Wosool programs are built to give founders what they actually need at the right time.",
    categories: ["All programs", "Onboarding", "Peer learning", "Growth", "Fundraising"],
    openEyebrow: "Open now",
    openTitle: "Programs accepting applications",
    openBody: "These programs are currently open for the current or upcoming cohort.",
    laterEyebrow: "Later",
    laterTitle: "Programs opening soon",
    laterBody: "Follow these programs and prepare for the next application window.",
    workflowEyebrow: "How it works",
    workflowTitle: "Programs designed around founder needs",
    workflowSteps: [
      { step: "Apply", desc: "Choose the right program and submit a short application explaining your stage, need, and goal." },
      { step: "Join your cohort", desc: "We assemble focused groups with strong relevance between members." },
      { step: "Move with momentum", desc: "Use the sessions, practical milestones, and ongoing support after the program ends." },
    ],
    ctaTitle: "Ready to accelerate?",
    ctaBody: "Join Wosool for priority access to upcoming cohorts, programs, and the support layer that matches your stage.",
    cta: "Apply to join",
  },
  fr: {
    badge: "Programs",
    title: "Structured support for every stage",
    description: "From onboarding to fundraising readiness, Wosool programs are built to give founders what they actually need at the right time.",
    categories: ["All programs", "Onboarding", "Peer learning", "Growth", "Fundraising"],
    openEyebrow: "Open now",
    openTitle: "Programs accepting applications",
    openBody: "These programs are currently open for the current or upcoming cohort.",
    laterEyebrow: "Later",
    laterTitle: "Programs opening soon",
    laterBody: "Follow these programs and prepare for the next application window.",
    workflowEyebrow: "How it works",
    workflowTitle: "Programs designed around founder needs",
    workflowSteps: [
      { step: "Apply", desc: "Choose the right program and submit a short application explaining your stage, need, and goal." },
      { step: "Join your cohort", desc: "We assemble focused groups with strong relevance between members." },
      { step: "Move with momentum", desc: "Use the sessions, practical milestones, and ongoing support after the program ends." },
    ],
    ctaTitle: "Ready to accelerate?",
    ctaBody: "Join Wosool for priority access to upcoming cohorts, programs, and the support layer that matches your stage.",
    cta: "Apply to join",
  },
}

export const partnersPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  types: string[]
  sectionEyebrow: string
  sectionTitle: string
  accessEyebrow: string
  accessTitle: string
  accessBody: string
  accessTopics: string[]
  accessHint: string
  accessCta: string
  ctaTitle: string
  ctaBody: string
  cta: string
}> = {
  ar: {
    badge: "الشركاء والداعمون",
    title: "شركاء يدعمون المؤسسين بعمق",
    description: "تتعاون وصول مع مؤسسات وجهات رائدة تضيف للمجتمع خبرة عملية ووصولًا نوعيًا ومصداقية طويلة الأمد.",
    types: ["شريك منظومة", "شريك معرفي", "شريك مجتمع", "دعم استراتيجي"],
    sectionEyebrow: "شركاؤنا",
    sectionTitle: "الجهات التي تقف خلف قيمة المجتمع",
    accessEyebrow: "جلسات الشركاء",
    accessTitle: "وصول مباشر إلى خبرات متخصصة",
    accessBody: "يمكن لأعضاء وصول حجز جلسات نوعية مع بعض الجهات الشريكة للحصول على دعم قانوني أو مالي أو استراتيجي.",
    accessTopics: ["القانون والامتثال", "الاستشارات المالية", "النمو الاستراتيجي"],
    accessHint: "تتوفر للأعضاء وفق المواعيد المعلنة",
    accessCta: "سجّل الدخول للحجز",
    ctaTitle: "هل ترغب في الشراكة مع وصول؟",
    ctaBody: "إذا كانت لدى جهتك قدرة حقيقية على دعم المؤسسين بخبرة أو وصول أو خدمات عالية القيمة، فنرحب ببدء الحوار.",
    cta: "تواصل معنا",
  },
  en: {
    badge: "Partners & Supporters",
    title: "Partners that support founders with real depth",
    description: "Wosool works with institutions and ecosystem players that bring practical expertise, meaningful access, and long-term credibility to the community.",
    types: ["Ecosystem partner", "Knowledge partner", "Community partner", "Strategic support"],
    sectionEyebrow: "Our partners",
    sectionTitle: "Organizations behind the network's value",
    accessEyebrow: "Partner sessions",
    accessTitle: "Direct access to specialist expertise",
    accessBody: "Wosool members can book focused sessions with selected partners for legal, financial, or strategic support.",
    accessTopics: ["Legal & compliance", "Financial advisory", "Strategic growth"],
    accessHint: "Available to members based on announced schedules",
    accessCta: "Sign in to book",
    ctaTitle: "Interested in partnering with Wosool?",
    ctaBody: "If your organization can genuinely support founders through expertise, access, or high-value services, we'd love to start the conversation.",
    cta: "Contact us",
  },
  fr: {
    badge: "Partners & Supporters",
    title: "Partners that support founders with real depth",
    description: "Wosool works with institutions and ecosystem players that bring practical expertise, meaningful access, and long-term credibility to the community.",
    types: ["Ecosystem partner", "Knowledge partner", "Community partner", "Strategic support"],
    sectionEyebrow: "Our partners",
    sectionTitle: "Organizations behind the network's value",
    accessEyebrow: "Partner sessions",
    accessTitle: "Direct access to specialist expertise",
    accessBody: "Wosool members can book focused sessions with selected partners for legal, financial, or strategic support.",
    accessTopics: ["Legal & compliance", "Financial advisory", "Strategic growth"],
    accessHint: "Available to members based on announced schedules",
    accessCta: "Sign in to book",
    ctaTitle: "Interested in partnering with Wosool?",
    ctaBody: "If your organization can genuinely support founders through expertise, access, or high-value services, we'd love to start the conversation.",
    cta: "Contact us",
  },
}

export const sponsorsPageCopy: Record<Locale, {
  badge: string
  title: string
  description: string
  stats: Array<{ value: string; label: string }>
  currentEyebrow: string
  currentTitle: string
  tiersEyebrow: string
  tiersTitle: string
  tiers: Array<{ name: string; benefits: string[] }>
  formEyebrow: string
  formTitle: string
  formLabels: {
    orgName: string
    orgPlaceholder: string
    contactName: string
    contactPlaceholder: string
    email: string
    tier: string
    message: string
    messagePlaceholder: string
    submit: string
  }
  tierOptions: string[]
}> = {
  ar: {
    badge: "الرعاية",
    title: "وصول نوعي إلى مؤسسي الخليج",
    description: "تمنحك رعاية وصول حضورًا أمام مجتمع منتقى من المؤسسين الجادين، ضمن بيئة عالية الثقة ومرتبطة بقرارات حقيقية.",
    stats: [
      { value: "250+", label: "مؤسس موثّق" },
      { value: "500M+ ر.س", label: "إجمالي تمويل جمعه الأعضاء" },
      { value: "15", label: "سوقًا ودولة ممثلة" },
      { value: "85%", label: "صنّاع قرار" },
    ],
    currentEyebrow: "الرعاة الحاليون",
    currentTitle: "جهات نفخر بدعمها للمجتمع",
    tiersEyebrow: "باقات الرعاية",
    tiersTitle: "اختر مستوى الحضور المناسب",
    tiers: [
      {
        name: "بلاتيني",
        benefits: [
          "حضور بصري رئيسي عبر المواد والمنصات المرتبطة بالبرنامج أو الفعالية.",
          "أولوية الظهور في الفعاليات الكبرى ومبادرات المجتمع المختارة.",
          "دعوات خاصة إلى لقاءات المؤسسين عالية القيمة.",
          "إبراز دوري في النشرات والمواد التحريرية ذات الصلة.",
          "إمكانية الوصول إلى فرص تعريف نوعية ضمن إطار منظم وواضح.",
        ],
      },
      {
        name: "ذهبي",
        benefits: [
          "ظهور واضح على الموقع ومواد الفعاليات المرتبطة بالرعاية.",
          "مشاركة في فعاليات مختارة على مدار العام.",
          "حضور دوري في النشرات أو المحتوى المرتبط بالمجتمع.",
          "إمكانية الظهور ضمن واجهات الشركاء والرعاة.",
        ],
      },
      {
        name: "فضي",
        benefits: [
          "إدراج على الموقع ضمن فئة الرعاة.",
          "فرصة محتوى مدعوم أو ظهور تعريفي وفق المساحة المتاحة.",
          "حضور في واجهات المجتمع المخصصة للرعاة.",
        ],
      },
    ],
    formEyebrow: "تواصل معنا",
    formTitle: "استفسار بخصوص الرعاية",
    formLabels: {
      orgName: "اسم الجهة",
      orgPlaceholder: "اسم الشركة أو المؤسسة",
      contactName: "اسم المسؤول",
      contactPlaceholder: "الاسم الكامل",
      email: "البريد الإلكتروني",
      tier: "الفئة التي تهمك",
      message: "تفاصيل إضافية",
      messagePlaceholder: "أخبرنا بأهدافك من الرعاية وطبيعة الحضور الذي تبحث عنه.",
      submit: "إرسال الطلب",
    },
    tierOptions: ["بلاتيني", "ذهبي", "فضي", "أحتاج إلى توصية"],
  },
  en: {
    badge: "Sponsorship",
    title: "High-trust access to Gulf founders",
    description: "Sponsoring Wosool gives your organization meaningful visibility with a curated group of serious founders inside a trusted, decision-relevant environment.",
    stats: [
      { value: "250+", label: "Verified founders" },
      { value: "SAR 500M+", label: "Capital raised by members" },
      { value: "15", label: "Markets represented" },
      { value: "85%", label: "Decision makers" },
    ],
    currentEyebrow: "Current sponsors",
    currentTitle: "Organizations we're proud to feature",
    tiersEyebrow: "Sponsorship tiers",
    tiersTitle: "Choose the right level of presence",
    tiers: [
      {
        name: "Platinum",
        benefits: [
          "Primary visual presence across the program or event materials and channels.",
          "Priority visibility in major events and selected community initiatives.",
          "Private invitations to high-value founder gatherings.",
          "Regular visibility in newsletters and relevant editorial assets.",
          "Access to curated introduction opportunities within a structured framework.",
        ],
      },
      {
        name: "Gold",
        benefits: [
          "Clear visibility on the site and across sponsored event materials.",
          "Participation in selected events throughout the year.",
          "Recurring placement in newsletters or community content.",
          "Inclusion across partner and sponsor surfaces.",
        ],
      },
      {
        name: "Silver",
        benefits: [
          "Listed on the site within the sponsor category.",
          "Opportunity for sponsored content or introductory brand presence when relevant.",
          "Presence across sponsor-facing community surfaces.",
        ],
      },
    ],
    formEyebrow: "Contact us",
    formTitle: "Sponsorship inquiry",
    formLabels: {
      orgName: "Organization name",
      orgPlaceholder: "Company or institution name",
      contactName: "Contact name",
      contactPlaceholder: "Full name",
      email: "Email",
      tier: "Tier of interest",
      message: "Additional details",
      messagePlaceholder: "Tell us about your sponsorship goals and the kind of presence you're looking for.",
      submit: "Send inquiry",
    },
    tierOptions: ["Platinum", "Gold", "Silver", "I need a recommendation"],
  },
  fr: {
    badge: "Sponsorship",
    title: "High-trust access to Gulf founders",
    description: "Sponsoring Wosool gives your organization meaningful visibility with a curated group of serious founders inside a trusted, decision-relevant environment.",
    stats: [
      { value: "250+", label: "Verified founders" },
      { value: "SAR 500M+", label: "Capital raised by members" },
      { value: "15", label: "Markets represented" },
      { value: "85%", label: "Decision makers" },
    ],
    currentEyebrow: "Current sponsors",
    currentTitle: "Organizations we're proud to feature",
    tiersEyebrow: "Sponsorship tiers",
    tiersTitle: "Choose the right level of presence",
    tiers: [
      {
        name: "Platinum",
        benefits: [
          "Primary visual presence across the program or event materials and channels.",
          "Priority visibility in major events and selected community initiatives.",
          "Private invitations to high-value founder gatherings.",
          "Regular visibility in newsletters and relevant editorial assets.",
          "Access to curated introduction opportunities within a structured framework.",
        ],
      },
      {
        name: "Gold",
        benefits: [
          "Clear visibility on the site and across sponsored event materials.",
          "Participation in selected events throughout the year.",
          "Recurring placement in newsletters or community content.",
          "Inclusion across partner and sponsor surfaces.",
        ],
      },
      {
        name: "Silver",
        benefits: [
          "Listed on the site within the sponsor category.",
          "Opportunity for sponsored content or introductory brand presence when relevant.",
          "Presence across sponsor-facing community surfaces.",
        ],
      },
    ],
    formEyebrow: "Contact us",
    formTitle: "Sponsorship inquiry",
    formLabels: {
      orgName: "Organization name",
      orgPlaceholder: "Company or institution name",
      contactName: "Contact name",
      contactPlaceholder: "Full name",
      email: "Email",
      tier: "Tier of interest",
      message: "Additional details",
      messagePlaceholder: "Tell us about your sponsorship goals and the kind of presence you're looking for.",
      submit: "Send inquiry",
    },
    tierOptions: ["Platinum", "Gold", "Silver", "I need a recommendation"],
  },
}
