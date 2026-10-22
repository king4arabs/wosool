/** Editorial program plan. Dates are proposed; operational details remain TBD. */
export const PROGRAM_START = "2026-10-12"
export const PROGRAM_END = "2027-05-09"
export const RAMADAN_BREAK_START = "2027-02-08"
export const RAMADAN_BREAK_END = "2027-03-09"
export const ONLINE_ANCHOR = "2026-10-16"

export type CalendarLocale = "ar" | "en"
export type ProgramTrack = "learning" | "visit" | "peer" | "online"
export type CalendarKind = ProgramTrack | "holiday" | "international" | "break" | "milestone" | "published"
export type Bilingual = Record<CalendarLocale, string>
export const bilingual = (en: string, ar: string): Bilingual => ({ en, ar })

export const programTracks: Record<ProgramTrack, { title: Bilingual; cadence: Bilingual; audience: Bilingual; description: Bilingual }> = {
  learning: {
    title: bilingual("Founder growth lab", "مختبر نمو المؤسسين"),
    cadence: bilingual("Every Wednesday", "كل أربعاء"),
    audience: bilingual("Founders & startup teams", "المؤسسون وفرق الشركات الناشئة"),
    description: bilingual("Explore one growth topic, work through a practical exercise, and leave with an action to apply in your startup.", "موضوع نمو جديد، وتطبيق عملي، وخطوة قابلة للتنفيذ داخل شركتك الناشئة."),
  },
  visit: {
    title: bilingual("Inside the business", "من داخل الأعمال"),
    cadence: bilingual("Every Saturday", "كل سبت"),
    audience: bilingual("Founders & startup teams", "المؤسسون وفرق الشركات الناشئة"),
    description: bilingual("A different site-visit program each week: explore operations, discuss decisions with the host team, and capture lessons for your business. Host and venue TBD.", "برنامج زيارة مختلف كل أسبوع: استكشاف العمليات، ومناقشة القرارات مع فريق الجهة المضيفة، واستخلاص دروس لشركتك. الجهة والموقع يُحددان لاحقًا."),
  },
  peer: {
    title: bilingual("EOA peer-to-peer", "EOA: من مؤسس إلى مؤسس"),
    cadence: bilingual("Every Sunday", "كل أحد"),
    audience: bilingual("EOA cohort participants", "مشاركو دفعة EOA"),
    description: bilingual("A confidential cohort conversation: share experience, work through a founder challenge, and agree on next-week commitments. Facilitator and groups TBD.", "حوار سري داخل الدفعة لتبادل الخبرات، ومناقشة تحدٍ يواجه المؤسسين، وتحديد التزامات الأسبوع التالي. الميسّر والمجموعات يُحددون لاحقًا."),
  },
  online: {
    title: bilingual("Cohort online learning", "التعلّم الرقمي للدفعة"),
    cadence: bilingual("Alternate Fridays · every 2 weeks", "الجمعة كل أسبوعين"),
    audience: bilingual("EOA cohort participants", "مشاركو دفعة EOA"),
    description: bilingual("A focused online workshop for the cohort, with a practical business deliverable. Trainer, time, and joining link TBD.", "ورشة رقمية مركّزة للدفعة تنتهي بمخرج عملي للشركة. المدرّب والوقت ورابط الانضمام يُحددون لاحقًا."),
  },
}

// Ordered learning journey: foundations → customers → cash → people → execution → scale.
export const learningTopics = [
  bilingual("Growth diagnosis & the $1M revenue roadmap", "تشخيص النمو وخارطة الوصول إلى مليون دولار إيرادات"),
  bilingual("Customer discovery: interviews that reveal demand", "اكتشاف العملاء: مقابلات تكشف الطلب الحقيقي"),
  bilingual("Ideal customer profile & market segmentation", "العميل المثالي وتقسيم السوق"),
  bilingual("Value proposition & competitive positioning", "عرض القيمة والتموضع التنافسي"),
  bilingual("Business model design & revenue streams", "تصميم نموذج الأعمال ومصادر الإيرادات"),
  bilingual("Pricing experiments & willingness to pay", "تجارب التسعير والاستعداد للدفع"),
  bilingual("Unit economics: CAC, LTV & contribution margin", "اقتصاديات الوحدة: تكلفة الاستحواذ وقيمة العميل وهامش المساهمة"),
  bilingual("Cash flow forecasting & runway planning", "التنبؤ بالتدفق النقدي وتخطيط السيولة"),
  bilingual("Building a repeatable sales pipeline", "بناء مسار مبيعات قابل للتكرار"),
  bilingual("Founder-led B2B sales & enterprise procurement", "مبيعات المؤسس للشركات وفهم المشتريات المؤسسية"),
  bilingual("Growth experiments & acquisition channels", "تجارب النمو وقنوات اكتساب العملاء"),
  bilingual("Brand storytelling & founder credibility", "قصة العلامة وبناء مصداقية المؤسس"),
  bilingual("Activation, onboarding & customer success", "تفعيل العملاء وتهيئتهم ونجاحهم"),
  bilingual("Retention, churn & expansion revenue", "الاحتفاظ بالعملاء وتقليل التسرّب وتوسيع الإيرادات"),
  bilingual("Product-market fit & product prioritization", "ملاءمة المنتج للسوق وترتيب أولويات المنتج"),
  bilingual("AI workflows that improve team productivity", "تطبيقات الذكاء الاصطناعي لرفع إنتاجية الفريق"),
  bilingual("Data dashboards & the weekly growth scorecard", "لوحات البيانات وبطاقة النمو الأسبوعية"),
  bilingual("Hiring the first leadership team", "توظيف الفريق القيادي الأول"),
  bilingual("Culture, delegation & founder time management", "الثقافة والتفويض وإدارة وقت المؤسس"),
  bilingual("OKRs & a 90-day execution rhythm", "الأهداف والنتائج الرئيسية وخطة تنفيذ ٩٠ يومًا"),
  bilingual("Operational systems & quality at scale", "أنظمة التشغيل والجودة أثناء التوسع"),
  bilingual("Risk, cybersecurity & business continuity", "المخاطر والأمن السيبراني واستمرارية الأعمال"),
  bilingual("Strategic partnerships & distribution", "الشراكات الاستراتيجية وقنوات التوزيع"),
  bilingual("Fundraising readiness & investor communication", "الجاهزية للتمويل والتواصل مع المستثمرين"),
  bilingual("GCC expansion & market-entry experiments", "التوسع الخليجي وتجارب دخول الأسواق"),
  bilingual("Growth review, alumni goals & the EO pathway", "مراجعة النمو وأهداف الخريجين ومسار الانضمام إلى EO"),
]

export const visitTopics = [
  bilingual("Innovation hub: mapping the startup support journey", "مركز ابتكار: استكشاف رحلة دعم الشركات الناشئة"),
  bilingual("Product studio: from customer insight to prototype", "استوديو منتجات: من فهم العميل إلى النموذج الأولي"),
  bilingual("Retail concept: observing customers on the floor", "مفهوم تجزئة: مراقبة تجربة العميل في الموقع"),
  bilingual("Brand studio: turning positioning into an experience", "استوديو علامات: تحويل التموضع إلى تجربة"),
  bilingual("Subscription business: recurring revenue operations", "شركة اشتراكات: تشغيل الإيرادات المتكررة"),
  bilingual("E-commerce operation: merchandising & conversion", "عمليات تجارة إلكترونية: العرض والتحويل"),
  bilingual("Fulfilment centre: the economics of every order", "مركز تنفيذ طلبات: اقتصاديات كل طلب"),
  bilingual("Finance operations: cash collection & controls", "عمليات مالية: التحصيل والرقابة النقدية"),
  bilingual("Sales team: pipeline reviews in practice", "فريق مبيعات: مراجعة المسار البيعي عمليًا"),
  bilingual("B2B supplier: navigating procurement & contracts", "مورد للشركات: المشتريات والعقود"),
  bilingual("Growth studio: how experiments are designed", "استوديو نمو: تصميم التجارب وقياسها"),
  bilingual("Media production: building a founder content engine", "إنتاج إعلامي: بناء منظومة محتوى للمؤسس"),
  bilingual("Customer support centre: service recovery systems", "مركز خدمة عملاء: أنظمة معالجة مشكلات الخدمة"),
  bilingual("Hospitality operation: loyalty & repeat business", "عمليات ضيافة: الولاء وتكرار الشراء"),
  bilingual("Software team: product discovery & release cycles", "فريق برمجيات: اكتشاف المنتج ودورات الإطلاق"),
  bilingual("Automation lab: practical AI & robotics workflows", "مختبر أتمتة: تطبيقات الذكاء الاصطناعي والروبوتات"),
  bilingual("Analytics team: turning metrics into decisions", "فريق تحليلات: تحويل المؤشرات إلى قرارات"),
  bilingual("Talent operation: hiring & onboarding systems", "عمليات مواهب: أنظمة التوظيف والتهيئة"),
  bilingual("Founder-led SME: delegation on the ground", "منشأة يقودها مؤسس: التفويض على أرض الواقع"),
  bilingual("Project delivery office: execution & accountability", "مكتب إدارة مشاريع: التنفيذ والمساءلة"),
  bilingual("Manufacturing site: lean processes & quality", "موقع تصنيع: كفاءة العمليات والجودة"),
  bilingual("Security operations: resilience & incident response", "عمليات أمنية: المرونة والاستجابة للحوادث"),
  bilingual("Distribution centre: channel & partner operations", "مركز توزيع: تشغيل القنوات والشركاء"),
  bilingual("Investment team: understanding the diligence process", "فريق استثمار: فهم إجراءات الفحص النافي للجهالة"),
  bilingual("Export operation: readiness for regional markets", "عمليات تصدير: الجاهزية للأسواق الإقليمية"),
  bilingual("Scale-up business: lessons from a growth journey", "شركة في مرحلة توسع: دروس من رحلة النمو"),
]

export const peerTopics = [
  bilingual("Growth baselines & accountability agreements", "خط الأساس للنمو واتفاقات المساءلة"),
  bilingual("What customer conversations changed for us", "ما الذي غيّرته حوارات العملاء لدينا؟"),
  bilingual("Choosing which customers to serve first", "اختيار العملاء ذوي الأولوية"),
  bilingual("Testing our positioning with fellow founders", "اختبار تموضعنا مع مؤسسين آخرين"),
  bilingual("Revenue-model assumptions under review", "مراجعة افتراضات نموذج الإيرادات"),
  bilingual("Pricing decisions & lessons from objections", "قرارات التسعير ودروس اعتراضات العملاء"),
  bilingual("Our unit-economics blind spots", "الجوانب الخفية في اقتصاديات الوحدة"),
  bilingual("Cash pressures & practical founder responses", "ضغوط السيولة واستجابات المؤسسين العملية"),
  bilingual("Pipeline obstacles & next sales commitments", "عقبات المبيعات والتزامات الخطوة التالية"),
  bilingual("Learning from a difficult B2B deal", "التعلّم من صفقة صعبة بين الشركات"),
  bilingual("Growth experiments: wins, misses & next tests", "تجارب النمو: النجاحات والإخفاقات والاختبار التالي"),
  bilingual("Telling our company story with clarity", "سرد قصة الشركة بوضوح"),
  bilingual("Customer onboarding friction clinic", "عيادة تحديات تهيئة العملاء"),
  bilingual("Retention challenges & customer feedback", "تحديات الاحتفاظ وملاحظات العملاء"),
  bilingual("Saying no: product-priority trade-offs", "قول لا: المفاضلة بين أولويات المنتج"),
  bilingual("AI adoption: sharing measurable results", "تبنّي الذكاء الاصطناعي: مشاركة نتائج قابلة للقياس"),
  bilingual("Metrics that changed a business decision", "مؤشرات غيّرت قرارًا في الشركة"),
  bilingual("Hiring mistakes & leadership lessons", "أخطاء التوظيف ودروس القيادة"),
  bilingual("Delegation, founder energy & boundaries", "التفويض وطاقة المؤسس وحدود العمل"),
  bilingual("Quarterly priorities & commitment check-in", "الأولويات الفصلية ومراجعة الالتزامات"),
  bilingual("Operational bottlenecks & shared experience", "اختناقات التشغيل وتبادل الخبرات"),
  bilingual("Resilience through a difficult week", "المرونة خلال أسبوع صعب"),
  bilingual("Partnership decisions & lessons learned", "قرارات الشراكات والدروس المستفادة"),
  bilingual("Funding choices & founder expectations", "خيارات التمويل وتوقعات المؤسس"),
  bilingual("Regional expansion: assumptions to validate", "التوسع الإقليمي: افتراضات تحتاج إلى تحقق"),
  bilingual("Cohort reflection & alumni accountability", "تأملات الدفعة ومساءلة الخريجين"),
]

export const onlineTopics = [
  bilingual("Build your baseline growth dashboard", "بناء لوحة مؤشرات النمو الأساسية"),
  bilingual("Design a customer interview & evidence log", "تصميم مقابلة عميل وسجل أدلة"),
  bilingual("Build a pricing & unit-economics worksheet", "إعداد ورقة التسعير واقتصاديات الوحدة"),
  bilingual("Create a 13-week cash flow forecast", "إعداد توقع التدفقات النقدية لـ١٣ أسبوعًا"),
  bilingual("Set up a CRM pipeline & follow-up playbook", "إعداد مسار إدارة العملاء ودليل المتابعة"),
  bilingual("Design a measurable acquisition experiment", "تصميم تجربة استحواذ قابلة للقياس"),
  bilingual("Map onboarding & a retention action plan", "رسم رحلة التهيئة وخطة الاحتفاظ بالعملاء"),
  bilingual("Prototype an AI workflow with human review", "بناء نموذج سير عمل بالذكاء الاصطناعي ومراجعة بشرية"),
  bilingual("Build a hiring scorecard & interview plan", "إعداد بطاقة تقييم التوظيف وخطة المقابلات"),
  bilingual("Draft your next 90-day OKR plan", "صياغة خطة الأهداف والنتائج لـ٩٠ يومًا"),
  bilingual("Map one process & its operational risks", "توثيق عملية تشغيلية ومخاطرها"),
  bilingual("Prepare an investor update & data-room checklist", "إعداد تحديث للمستثمرين وقائمة غرفة البيانات"),
  bilingual("Present your growth review & alumni action plan", "عرض مراجعة النمو وخطة عمل الخريجين"),
]
