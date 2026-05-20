import type { NewsItem } from "@/types"

export type NewsLocale = "ar" | "en" | "fr"

interface LocalizedNewsContent {
  category: string
  title: string
  excerpt: string
  author: string
  authorRole: string
  readTime: string
  body: string[]
  pullQuote?: string
}

const newsContent: Record<string, Record<NewsLocale, LocalizedNewsContent>> = {
  n1: {
    ar: {
      category: "إنجاز عضو",
      title: "ليلى الراشد تغلق جولة سلسلة A بقيمة 18 مليون ريال لصالح Meezan Capital",
      excerpt:
        "نجحت الشركة في تأمين جولة تقودها Wa'ed Ventures لتوسيع منتجات التمويل المتوافق مع الشريعة داخل السوق السعودي.",
      author: "تحرير وصول",
      authorRole: "فريق المحتوى",
      readTime: "4 دقائق",
      pullQuote: "جولة تعكس نضجًا أعلى في بناء منتجات مالية محلية بثقة تنظيمية وسوقية.",
      body: [
        "أعلنت Meezan Capital، الشركة السعودية المتخصصة في الحلول المالية المتوافقة مع الشريعة، عن إغلاق جولة استثمارية من فئة السلسلة A بقيمة 18 مليون ريال سعودي بقيادة Wa'ed Ventures. وتمثل هذه الخطوة محطة مهمة في مسار الشركة بعد فترة من التركيز على تطوير منتجات ائتمانية أكثر ملاءمة للسوق المحلي.",
        "تركز الشركة في مرحلتها المقبلة على توسيع قاعدة العملاء وتحسين سرعة الوصول إلى التمويل للأفراد والمنشآت الصغيرة والمتوسطة، مع الحفاظ على وضوح الامتثال وموثوقية التجربة. وتعد هذه النقطة من العناصر التي تهم السوق السعودي بشكل خاص، حيث يتقاطع الطلب مع الحاجة إلى حلول أكثر بساطة وشفافية.",
        "بالنسبة لمنظومة وصول، يمثل هذا الإنجاز نموذجًا واضحًا لما يحدث عندما يلتقي المنتج الجاد مع شبكة نوعية من الشركاء والمستثمرين. فالقيمة لا تظهر فقط في رأس المال، بل في جودة العلاقات، وسرعة الوصول إلى الخبرة، والانضباط في اتخاذ القرار.",
        "خلال الأشهر المقبلة، ستعمل Meezan Capital على توسيع فريقها التشغيلي، وتعميق شراكاتها المؤسسية، وتسريع خططها لإطلاق منتجات جديدة داخل المملكة. هذه الجولة لا تعكس نمو شركة واحدة فحسب، بل تشير أيضًا إلى تطور أوسع في مشهد التقنية المالية السعودي.",
      ],
    },
    en: {
      category: "Member milestone",
      title: "Layla Al-Rashid closes SAR 18M Series A for Meezan Capital",
      excerpt:
        "Wa'ed Ventures is leading a new round that will help Meezan Capital scale Shariah-compliant credit products across Saudi Arabia.",
      author: "Wosool Editorial",
      authorRole: "Editorial Desk",
      readTime: "4 min read",
      pullQuote: "A milestone that reflects stronger institutional confidence in locally built fintech products.",
      body: [
        "Meezan Capital, the Saudi fintech founded by Layla Al-Rashid, has announced an SAR 18 million Series A round led by Wa'ed Ventures. The round marks an important step in the company’s growth after a focused period of product development around Shariah-compliant credit and financing tools.",
        "The next phase will center on expanding customer reach, improving capital access for consumers and SMEs, and deepening trust through a cleaner and more transparent financial experience. That combination of product clarity and regulatory alignment is especially relevant in the Saudi market.",
        "For the Wosool network, the milestone reflects more than capital raised. It shows what happens when a serious operator is surrounded by high-trust access, sharper market context, and the right institutional relationships at the right moment.",
        "Over the coming months, Meezan Capital plans to grow its operating team, deepen strategic partnerships, and launch additional products tailored to the Saudi market. The announcement is a signal not only for one company, but for the maturity of the Kingdom’s fintech ecosystem overall.",
      ],
    },
    fr: {
      category: "Temps fort membre",
      title: "Layla Al-Rashid boucle une Série A de 18 M SAR pour Meezan Capital",
      excerpt:
        "Wa'ed Ventures mène ce nouveau tour destiné à accélérer le développement de produits financiers conformes à la charia en Arabie saoudite.",
      author: "Wosool Editorial",
      authorRole: "Rédaction",
      readTime: "4 min",
      body: [
        "Meezan Capital, fintech saoudienne fondée par Layla Al-Rashid, a annoncé un tour de Série A de 18 millions de riyals saoudiens mené par Wa'ed Ventures.",
        "La société entend utiliser ce financement pour élargir sa portée commerciale et renforcer l’accès à des produits de crédit conformes à la charia pour les particuliers et les PME.",
        "Pour le réseau Wosool, cette annonce illustre la valeur d’un accompagnement fondé sur la qualité des introductions, la confiance et un meilleur contexte de marché.",
        "Cette levée de fonds constitue également un signal positif pour la maturité croissante de l’écosystème fintech en Arabie saoudite.",
      ],
    },
  },
  n2: {
    ar: {
      category: "أخبار المنظومة",
      title: "المنظومة الريادية السعودية تسجل 1,800 شركة ناشئة نشطة في 2026",
      excerpt:
        "يعكس الرقم الجديد زخمًا متصاعدًا في تأسيس الشركات وبناء المنتجات المدعوم ببرامج التحول ورأس المال الجريء.",
      author: "تحرير وصول",
      authorRole: "فريق المحتوى",
      readTime: "5 دقائق",
      pullQuote: "نمو العدد وحده ليس القصة الكاملة، بل نوعية الشركات والقدرة على البناء المؤسسي.",
      body: [
        "تشير البيانات الحديثة إلى أن عدد الشركات الناشئة النشطة في المملكة وصل إلى 1,800 شركة في 2026، وهو رقم يعكس نموًا متسارعًا في النشاط الريادي، وتوسعًا أوضح في مسارات التمويل والدعم والتشغيل.",
        "هذا النمو لا يأتي من فراغ، بل يتشكل من تداخل عدة عوامل: سياسة عامة داعمة، مؤسسات تمويلية أكثر نضجًا، ومؤسسين يملكون طموحًا أعلى في بناء شركات طويلة الأمد. كما أن بعض القطاعات، مثل التقنية المالية والصحة الرقمية وأدوات الأعمال، تبدو أكثر قدرة على ترجمة هذا الزخم إلى شركات حقيقية قابلة للتوسع.",
        "لكن القيمة الأهم ليست في العدد وحده، بل في نوعية البنية التي تتشكل حول هذه الشركات. فكلما تطورت شبكات الخبرة والوصول والشراكات، ارتفعت فرصة أن تتحول المبادرات المبكرة إلى مؤسسات أكثر صلابة.",
        "بالنسبة للمؤسسين، هذا يعني أن السوق السعودي بات يوفر بيئة أكثر عمقًا من السابق. الفرصة لم تعد فقط في إطلاق فكرة جديدة، بل في بناء شركة تفهم الإيقاع المحلي، وتستفيد من المنظومة، وتتحرك بثقة داخل مرحلة النمو.",
      ],
    },
    en: {
      category: "Ecosystem news",
      title: "Saudi startup ecosystem reaches 1,800 active startups in 2026",
      excerpt:
        "The latest market signal points to stronger startup formation, more active capital, and a maturing support layer around founders.",
      author: "Wosool Editorial",
      authorRole: "Editorial Desk",
      readTime: "5 min read",
      pullQuote: "The real story is not just startup count, but the quality of institutional support forming around it.",
      body: [
        "Saudi Arabia’s startup ecosystem has reached 1,800 active startups in 2026, reflecting a notable expansion in company formation, ecosystem participation, and venture activity across the Kingdom.",
        "The number matters because it signals more than momentum. It points to a market where policy alignment, founder ambition, and institutional capital are increasingly reinforcing one another. Sectors like fintech, healthtech, and business software appear especially well positioned to translate that momentum into durable company-building.",
        "Just as important, the support layer around founders is maturing. Stronger operator communities, more focused programs, and better access to strategic relationships are helping early conviction move faster toward real execution.",
        "For founders building in Saudi Arabia, the takeaway is clear: the market is no longer defined only by opportunity density, but by the increasing availability of infrastructure that helps serious companies scale with confidence.",
      ],
    },
    fr: {
      category: "Actualité écosystème",
      title: "L’écosystème saoudien atteint 1 800 startups actives en 2026",
      excerpt:
        "Ce nouveau signal de marché montre une dynamique plus forte dans la création d’entreprises et l’approfondissement du soutien institutionnel.",
      author: "Wosool Editorial",
      authorRole: "Rédaction",
      readTime: "5 min",
      body: [
        "L’Arabie saoudite compte désormais 1 800 startups actives en 2026, un cap qui reflète une accélération claire de l’activité entrepreneuriale.",
        "Au-delà du volume, cette progression indique un meilleur alignement entre politiques publiques, capital-risque et ambition des fondateurs.",
        "L’élément structurant reste la qualité de la couche d’accompagnement: expertise, accès et relations institutionnelles progressent en parallèle.",
        "Pour les fondateurs, le marché saoudien devient ainsi un environnement plus complet pour construire des entreprises solides et durables.",
      ],
    },
  },
  n3: {
    ar: {
      category: "ملخص فعالية",
      title: "حصاد عشاء مؤسسي وصول في الرياض: 60 محادثة في غرفة واحدة",
      excerpt:
        "جمع العشاء الأخير أعضاء الشبكة في أجواء حميمة ركزت على المحادثات الصريحة، والتحديات المشتركة، والتعارف عالي الجودة.",
      author: "تحرير وصول",
      authorRole: "فريق المجتمع",
      readTime: "3 دقائق",
      pullQuote: "القيمة في مثل هذه اللقاءات ليست كثافة الحضور، بل نوعية الحوار داخل الغرفة.",
      body: [
        "شهد عشاء المؤسسين الأخير في الرياض حضور مجموعة منتقاة من أعضاء الشبكة في أمسية صممت بعناية حول جودة العلاقة لا حجم الحضور. كان الهدف واضحًا: خلق مساحة هادئة تسمح بمحادثات صريحة وعملية بين مؤسسين يواجهون تحديات متقاربة في مراحل نمو مختلفة.",
        "خلال الأمسية، تنقلت النقاشات بين الجاهزية لجمع الاستثمار، وبناء فرق أكثر صلابة، والتنقل بين متطلبات السوق المحلي والفرص الإقليمية. وما ميّز اللقاء أن الحوار لم يكن عامًا أو استعراضيًا، بل قائمًا على تبادل خبرات تشغيلية مباشرة يمكن البناء عليها لاحقًا.",
        "خرجت اللقاءات الخاصة داخل الغرفة بعدد كبير من المقدمات الدافئة والمتابعات العملية التي استمرت بعد الحدث. وهذا يعكس فلسفة وصول في تصميم المساحات الصغيرة ذات القيمة العالية، حيث يمكن للثقة أن تتشكل بسرعة أكبر.",
        "بالنسبة لنا، لا تقاس فعالية اللقاء بعدد الصور أو المقاعد الممتلئة، بل بمدى استمرار المحادثة بعد انتهاء الأمسية. وهذا ما حدث بوضوح في الرياض.",
      ],
    },
    en: {
      category: "Event recap",
      title: "Inside the Riyadh founders dinner: 60 meaningful conversations",
      excerpt:
        "The latest Wosool dinner brought members together for candid conversations, practical insight sharing, and high-quality introductions.",
      author: "Wosool Editorial",
      authorRole: "Community Desk",
      readTime: "3 min read",
      pullQuote: "The value of the room came from honesty, operating depth, and the quality of follow-up after the event.",
      body: [
        "The latest Wosool founders dinner in Riyadh brought together a carefully selected group of members for an evening built around substance rather than scale. The goal was simple: create a room where serious founders could exchange context openly and build trust quickly.",
        "Conversations moved fluidly across fundraising readiness, team-building challenges, market timing, and the realities of building durable companies in Saudi Arabia. What stood out most was the quality of candor in the room.",
        "Several warm introductions and practical follow-ups emerged directly from those conversations, reinforcing the value of designing smaller, more intentional gatherings for operators who benefit from depth rather than visibility.",
        "For Wosool, the evening was another reminder that the best events are not measured by attendance volume alone, but by what continues after the room empties.",
      ],
    },
    fr: {
      category: "Retour d’événement",
      title: "Retour sur le dîner des fondateurs à Riyad: 60 conversations de qualité",
      excerpt:
        "Le dernier dîner Wosool a réuni les membres dans un cadre intime pensé pour les échanges sincères et les introductions utiles.",
      author: "Wosool Editorial",
      authorRole: "Équipe communauté",
      readTime: "3 min",
      body: [
        "Le dernier dîner des fondateurs à Riyad a réuni un groupe sélectionné de membres dans un format volontairement intime.",
        "Les échanges ont porté sur la levée de fonds, la construction d’équipes plus solides et l’exécution dans le contexte saoudien.",
        "Plusieurs introductions ciblées et suivis concrets sont nés directement de la soirée.",
        "Cette rencontre confirme la conviction de Wosool: les meilleurs événements privilégient la profondeur des échanges à la taille de la salle.",
      ],
    },
  },
  n4: {
    ar: {
      category: "تحديث برنامج",
      title: "فتح باب التقديم لدوائر المؤسسين للربع الثاني 2026",
      excerpt:
        "ثماني مجموعات منتقاة، و12 أسبوعًا من المساءلة المنظمة، ومساحة أكثر عمقًا للتعلّم بين النظراء.",
      author: "فريق وصول",
      authorRole: "البرامج",
      readTime: "3 دقائق",
      body: [
        "أطلقنا باب التقديم للدفعة الجديدة من دوائر المؤسسين للربع الثاني 2026.",
        "البرنامج مصمم لمجموعات صغيرة ومتقاربة في المرحلة، بهدف رفع جودة الحوار والمساءلة والتعلّم العملي بين المؤسسين.",
        "تتضمن التجربة 12 أسبوعًا من الجلسات المنظمة، والمقدمات النوعية، والوصول إلى شبكة دعم تشغيلية أوسع.",
      ],
    },
    en: {
      category: "Program update",
      title: "Introducing Founder Circles Q2 2026 — Applications now open",
      excerpt:
        "Eight curated peer groups, 12 weeks of structured accountability, and a deeper layer of founder-to-founder support.",
      author: "Wosool Team",
      authorRole: "Programs",
      readTime: "3 min read",
      body: [
        "Applications are now open for the next Founder Circles cohort for Q2 2026.",
        "The format is built around small peer groups matched by stage and operating context, with the goal of improving accountability and the quality of conversation.",
        "Members will take part in 12 weeks of structured sessions, curated introductions, and a stronger support layer around key operating decisions.",
      ],
    },
    fr: {
      category: "Actualité programme",
      title: "Ouverture des candidatures pour Founder Circles Q2 2026",
      excerpt:
        "Huit groupes de pairs, 12 semaines de travail structuré et une couche d’accompagnement plus profonde entre fondateurs.",
      author: "Wosool Team",
      authorRole: "Programmes",
      readTime: "3 min",
      body: [
        "Les candidatures sont ouvertes pour la nouvelle cohorte Founder Circles du deuxième trimestre 2026.",
        "Le format repose sur de petits groupes de pairs proches en maturité et en contexte d’exécution.",
        "Le programme comprend 12 semaines de sessions structurées, d’introductions ciblées et de soutien opérationnel.",
      ],
    },
  },
  n5: {
    ar: {
      category: "رؤية",
      title: "خمسة أخطاء في جمع الاستثمار يقع فيها مؤسسو الخليج وكيف يمكن تجنبها",
      excerpt:
        "من خلال عشرات المحادثات داخل الشبكة، تظهر أنماط متكررة يمكن تصحيحها مبكرًا قبل دخول الجولة.",
      author: "تحرير وصول",
      authorRole: "رؤى وتحليلات",
      readTime: "6 دقائق",
      body: [
        "من أكثر الأخطاء شيوعًا الدخول إلى الجولة قبل اكتمال وضوح السردية الاستثمارية والبيانات الأساسية.",
        "خطأ آخر يتمثل في الخلط بين شبكة العلاقات وبين جاهزية فعلية للتقدم في مسار جمع الاستثمار.",
        "كما يبالغ بعض المؤسسين في التركيز على العرض التقديمي قبل ضبط الإيقاع التشغيلي والمؤشرات الأساسية.",
        "أفضل طريقة لتجنب هذه الأخطاء هي التحضير المبكر، والحصول على feedback صريح، وبناء غرفة داعمة قبل بدء الجولة رسميًا.",
      ],
    },
    en: {
      category: "Insights",
      title: "5 fundraising mistakes GCC founders make — and how to avoid them",
      excerpt:
        "Across dozens of conversations in our network, the same avoidable patterns continue to appear before a round begins.",
      author: "Wosool Editorial",
      authorRole: "Insights Desk",
      readTime: "6 min read",
      body: [
        "One of the most common mistakes is entering a raise before the investment narrative and core metrics are truly ready.",
        "Another is confusing broad network access with actual fundraising readiness and progression quality.",
        "Founders also tend to over-focus on the deck while under-investing in operating rhythm, diligence preparation, and internal clarity.",
        "The most effective antidote is early preparation, candid feedback, and a stronger pre-round support system around the company.",
      ],
    },
    fr: {
      category: "Analyse",
      title: "5 erreurs de levée de fonds fréquentes chez les fondateurs du Golfe",
      excerpt:
        "Nos échanges avec les membres révèlent plusieurs schémas récurrents qui peuvent être corrigés en amont.",
      author: "Wosool Editorial",
      authorRole: "Analyses",
      readTime: "6 min",
      body: [
        "Une erreur fréquente consiste à lancer une levée sans récit d’investissement clair ni indicateurs suffisamment solides.",
        "Une autre est de confondre accès au réseau et réelle préparation au processus de fundraising.",
        "Les fondateurs surinvestissent parfois le deck, mais pas assez la rigueur opérationnelle et la préparation à la due diligence.",
        "La meilleure réponse reste une préparation en amont, un feedback honnête et un meilleur cercle de soutien avant l’ouverture officielle du tour.",
      ],
    },
  },
  n6: {
    ar: {
      category: "إعلان",
      title: "وصول ترحب بانضمام stc Ventures كراعٍ بلاتيني",
      excerpt:
        "شراكة جديدة تعزز حضور رأس المال المؤسسي داخل الشبكة وتفتح مساحة أوسع للمؤسسين الجادين.",
      author: "فريق وصول",
      authorRole: "الشراكات",
      readTime: "2 دقيقة",
      body: [
        "يسر وصول الإعلان عن انضمام stc Ventures كأول راعٍ بلاتيني للشبكة.",
        "تعكس هذه الخطوة تقاطعًا واضحًا بين طموح المؤسسين وبين الشركاء الذين يضيفون قيمة مؤسسية طويلة الأمد.",
        "الشراكة ستدعم بناء مسارات أكثر عمقًا للمحتوى، واللقاءات، والوصول الاستراتيجي داخل المنظومة.",
      ],
    },
    en: {
      category: "Announcement",
      title: "Wosool welcomes stc Ventures as platinum sponsor",
      excerpt:
        "A new partnership that strengthens institutional capital presence inside the network and expands strategic access for members.",
      author: "Wosool Team",
      authorRole: "Partnerships",
      readTime: "2 min read",
      body: [
        "Wosool is proud to welcome stc Ventures as the network’s first platinum sponsor.",
        "The partnership reflects a stronger alignment between ambitious founders and institutions that can contribute long-term ecosystem value.",
        "It will support a deeper layer of programming, strategic access, and member experiences across the network.",
      ],
    },
    fr: {
      category: "Annonce",
      title: "Wosool accueille stc Ventures comme sponsor platinum",
      excerpt:
        "Un partenariat qui renforce la présence du capital institutionnel au sein du réseau.",
      author: "Wosool Team",
      authorRole: "Partenariats",
      readTime: "2 min",
      body: [
        "Wosool est fier d’accueillir stc Ventures comme premier sponsor platinum du réseau.",
        "Ce partenariat renforce le lien entre les fondateurs ambitieux et les institutions qui apportent une valeur durable à l’écosystème.",
        "Il soutiendra de nouvelles expériences, davantage d’accès stratégique et une programmation plus profonde pour les membres.",
      ],
    },
  },
}

export function getLocalizedNewsContent(item: NewsItem, locale: NewsLocale) {
  const content = newsContent[item.id]?.[locale] ?? newsContent[item.id]?.en

  return {
    ...item,
    title: content?.title ?? item.title,
    excerpt: content?.excerpt ?? item.excerpt,
    category: content?.category ?? item.category,
    author: content?.author ?? item.author,
    authorRole: content?.authorRole ?? "",
    readTime: content?.readTime ?? "",
    body: content?.body ?? [item.content || item.excerpt],
    pullQuote: content?.pullQuote,
  }
}

export function getLocalizedNewsBySlug(items: NewsItem[], slug: string, locale: NewsLocale) {
  const item = items.find((entry) => entry.slug === slug)
  return item ? getLocalizedNewsContent(item, locale) : null
}
