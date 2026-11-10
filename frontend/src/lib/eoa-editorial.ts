import type { EoaProgram } from './eoa'

export type EoaFaq = {
  question_en: string
  question_ar: string
  answer_en: string
  answer_ar: string
  visible: boolean
}

export type EoaOperator = {
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  website: string | null
  visible: boolean
}

export type EoaEditorial = {
  version: number
  status?: 'draft' | 'published'
  source_reference?: string | null
  operator: EoaOperator | null
  faqs: EoaFaq[]
  updated_at?: string | null
}

export type EoaPartnerRole = 'operator' | 'enabler' | 'supporter'
export type EoaEditorialProgram = EoaProgram & {
  editorial?: EoaEditorial | null
  partner_roles?: Record<string, EoaPartnerRole>
}

export const defaultEoaFaqs: EoaFaq[] = [
  {
    question_en: 'Who is EO Accelerator designed for?',
    question_ar: 'لمن صُمم برنامج EO Accelerator؟',
    answer_en: 'EO Accelerator serves business owners and founders with annual gross business revenue from US$250,000 to below US$1 million. The Riyadh team reviews eligibility and fit through the application process.',
    answer_ar: 'يخدم البرنامج أصحاب الأعمال والمؤسسين الذين تتراوح إيرادات شركاتهم السنوية الإجمالية بين 250 ألف دولار وأقل من مليون دولار. يراجع فريق الرياض الأهلية وملاءمة البرنامج ضمن إجراءات التقديم.',
    visible: true,
  },
  {
    question_en: 'What will I work on in EO Accelerator?',
    question_ar: 'ما الذي سأعمل عليه في برنامج EO Accelerator؟',
    answer_en: 'The learning framework covers Cash, Strategy, People and Execution, with learning days and accountability groups to help you apply the ideas in your business.',
    answer_ar: 'يغطي إطار التعلم النقد والاستراتيجية والأفراد والتنفيذ، من خلال أيام تعلم ومجموعات مساءلة تساعدك على تطبيق الأفكار في شركتك.',
    visible: true,
  },
  {
    question_en: 'How do I apply through Wosool?',
    question_ar: 'كيف أتقدم من خلال وصول؟',
    answer_en: 'Create an account, verify your email and complete your founder and company profile. When applications are open, submit your application and follow its progress in your account.',
    answer_ar: 'أنشئ حسابك ووثّق بريدك الإلكتروني وأكمل معلوماتك ومعلومات شركتك. عند فتح التقديم، أرسل طلبك وتابع حالته من حسابك.',
    visible: true,
  },
  {
    question_en: 'How long is the program and what is the time commitment?',
    question_ar: 'ما مدة البرنامج والالتزام الزمني؟',
    answer_en: 'EO Accelerator follows a two-year curriculum with annual participation and renewal. Expect four quarterly Learning Days each year and monthly accountability groups of 4–6 participants. Riyadh may admit new intakes every six months when confirmed; intake frequency does not shorten the program.',
    answer_ar: 'يقدم EO Accelerator منهجاً لمدة عامين مع مشاركة وتجديد سنويين، وأربعة أيام تعلم سنوياً ومجموعات مساءلة شهرية تضم 4–6 مشاركين. قد تستقبل الرياض دفعات كل ستة أشهر عند تأكيدها؛ ولا يختصر ذلك مدة البرنامج.',
    visible: true,
  },
  {
    question_en: 'What are the participation fees?',
    question_ar: 'ما رسوم المشاركة؟',
    answer_en: 'The Riyadh annual package is US$4,000: US$1,750 global dues and US$2,250 local dues. The sponsorship model allocates US$2,000 to the sponsor and US$2,000 to the participant. The reduced participant amount applies after sponsorship is confirmed. Fees are aligned to the approved start date through 30 June; leadership confirms the payable amount before payment.',
    answer_ar: 'الباقة السنوية للرياض 4,000 دولار: 1,750 دولار للرسوم العالمية و2,250 دولار للرسوم المحلية. يخصص نموذج الرعاية 2,000 دولار للراعي و2,000 دولار للمشارك بعد تأكيد الرعاية. تُحتسب الرسوم وفق البداية المعتمدة وحتى 30 يونيو، ويؤكد الفريق المبلغ المستحق قبل الدفع.',
    visible: true,
  },
  {
    question_en: 'Where and when do Riyadh sessions take place?',
    question_ar: 'أين ومتى تُعقد جلسات الرياض؟',
    answer_en: 'The cohort schedule confirms the venue, dates and format for each session. Your account shows the sessions assigned to your cohort after enrollment.',
    answer_ar: 'يوضح جدول الدفعة مقر كل جلسة وتاريخها وطريقة انعقادها. يعرض حسابك الجلسات المخصصة لدفعتك بعد تفعيل المشاركة.',
    visible: true,
  },
  {
    question_en: 'Does completing Accelerator give me EO membership?',
    question_ar: 'هل إكمال المسرّعة يمنحني عضوية EO؟',
    answer_en: 'EOA participants and graduates can apply to EO once they meet all joining requirements and pass the chapter admission process. A six-month progress review is not EOA graduation, and program participation does not provide automatic EO membership.',
    answer_ar: 'يمكن للمشاركين والخريجين التقدم إلى EO عند استيفاء جميع شروط الانضمام واجتياز قبول الفرع. مراجعة التقدم بعد ستة أشهر ليست تخرجاً من EOA، والمشاركة لا تمنح عضوية EO تلقائياً.',
    visible: true,
  },
  {
    question_en: 'Where will I find my cohort activities?',
    question_ar: 'أين أجد أنشطة دفعتي؟',
    answer_en: 'After enrollment, your account provides the assigned learning sessions, accountability group, resources and progress milestones.',
    answer_ar: 'بعد تفعيل مشاركتك، يعرض حسابك جلسات التعلم ومجموعة المساءلة والموارد ومراحل التقدم المخصصة لك.',
    visible: true,
  },
  {
    "question_en": "What should I prepare before applying?",
    "question_ar": "ما الذي أجهزه قبل التقديم؟",
    "answer_en": "Have your founder profile, company details and current annual revenue information ready. Check the eligibility page, then complete the application using accurate, up-to-date information.",
    "answer_ar": "جهّز ملفك كمؤسس وبيانات شركتك ومعلومات الإيرادات السنوية الحالية. راجع صفحة الأهلية، ثم أكمل الطلب بمعلومات دقيقة ومحدثة.",
    "visible": true
  },
  {
    "question_en": "Can I apply if my company is below the revenue requirement?",
    "question_ar": "هل يمكنني التقديم إذا كانت إيرادات شركتي أقل من الحد المطلوب؟",
    "answer_en": "Review the published revenue requirement before applying. If your company is not yet in that range, contact the team about fit and explore Wosool events and founder community activities.",
    "answer_ar": "راجع شرط الإيرادات المنشور قبل التقديم. إذا لم تصل شركتك إلى النطاق المطلوب، تواصل مع الفريق بشأن ملاءمة البرنامج واستكشف فعاليات وصول وأنشطة مجتمع المؤسسين.",
    "visible": true
  },
  {
    "question_en": "How can I check my application status?",
    "question_ar": "كيف أتابع حالة طلبي؟",
    "answer_en": "Sign in with the account you used to apply and open the EO Accelerator area in your dashboard. Check the status shown there and contact the program team if you need clarification.",
    "answer_ar": "سجّل الدخول بالحساب الذي استخدمته للتقديم وافتح مساحة مسرّعة EO في لوحتك. راجع حالة الطلب الظاهرة وتواصل مع فريق البرنامج إذا احتجت إلى توضيح.",
    "visible": true
  },
  {
    "question_en": "Are sessions in person or online?",
    "question_ar": "هل الجلسات حضورية أم عبر الإنترنت؟",
    "answer_en": "Below 10 paid participants, programs use global virtual Learning Days. At 10–14, an assigned trainer delivers virtual Learning Days; at 15 or more, the program becomes eligible for in-person Learning Days. Local accountability groups meet monthly; check the confirmed calendar for venues and access.",
    "answer_ar": "أقل من 10 مشاركين مسددين: أيام تعلم افتراضية عالمية. من 10 إلى 14: أيام تعلم افتراضية مع مدرب مخصص. من 15 فأكثر: تأهل لأيام تعلم حضورية. تجتمع مجموعات المساءلة المحلية شهرياً؛ راجع التقويم المؤكد للمقار وروابط الحضور.",
    "visible": true
  },
  {
    "question_en": "What if I cannot attend a session?",
    "question_ar": "ماذا أفعل إذا تعذّر عليّ حضور جلسة؟",
    "answer_en": "Tell the program team as early as possible and check the requirements for your cohort. Ask about available resources or follow-up; a recording or replacement session is not guaranteed.",
    "answer_ar": "أبلغ فريق البرنامج مبكرًا وراجع متطلبات دفعتك. اسأل عن الموارد أو المتابعة المتاحة؛ لا يُضمن توفر تسجيل أو جلسة بديلة.",
    "visible": true
  },
  {
    "question_en": "Does the program guarantee investment or US$1 million in revenue?",
    "question_ar": "هل يضمن البرنامج الاستثمار أو تحقيق إيرادات مليون دولار؟",
    "answer_en": "No. The program supports you through learning, coaching and accountability. Business outcomes and investment decisions depend on your company and the parties involved.",
    "answer_ar": "لا. يدعمك البرنامج بالتعلم والتوجيه والمساءلة. تعتمد نتائج الأعمال وقرارات الاستثمار على شركتك والأطراف المعنية.",
    "visible": true
  },
  {
    "question_en": "Can I choose a mentor from the EO network cards?",
    "question_ar": "هل يمكنني اختيار مرشد من بطاقات شبكة EO؟",
    "answer_en": "Use the cards to learn about EO people, their chapters and experience. Ask the program team about mentoring arrangements for your cohort; a listing does not confirm availability or an assignment.",
    "answer_ar": "استخدم البطاقات للتعرف على أشخاص من EO وفروعهم وخبراتهم. اسأل فريق البرنامج عن ترتيبات الإرشاد لدفعتك؛ لا يعني ظهور الشخص توفره أو تعيينه مرشدًا لك.",
    "visible": true
  },
  {
    "question_en": "Can my organisation support or sponsor the program?",
    "question_ar": "هل يمكن لجهتي دعم البرنامج أو رعايته؟",
    "answer_en": "Yes. Contact the program team and choose the partnership or sponsorship inquiry type. Describe your organisation and the support you can offer so the team can discuss the next step.",
    "answer_ar": "نعم. تواصل مع فريق البرنامج واختر نوع الاستفسار «شراكة» أو «رعاية». عرّف بجهتك والدعم الذي يمكنك تقديمه لبحث الخطوة التالية مع الفريق.",
    "visible": true
  },
  {"question_en": "Can a sponsor pay my participation fees?", "question_ar": "هل يمكن للراعي دفع رسوم مشاركتي؟", "answer_en": "Yes. A confirmed sponsor can cover the agreed contribution. Sponsorship pays the dues; global dues are not waived. The team confirms coverage and any remaining participant payment before activation.", "answer_ar": "نعم، يغطي الراعي المؤكد المساهمة المتفق عليها. الرعاية تسدد الرسوم ولا تعفي من الرسوم العالمية. يؤكد الفريق التغطية والمبلغ المتبقي قبل التفعيل.", "visible": true},
  {"question_en": "When does paid participation begin?", "question_ar": "متى تبدأ المشاركة المدفوعة؟", "answer_en": "Local acceptance, EO approval, payment and participation activation are separate steps. Your approved start date should align with a ready program and available learning. Do not pay from an unverified link.", "answer_ar": "القبول المحلي واعتماد EO والسداد وتفعيل المشاركة خطوات منفصلة. تتوافق البداية المعتمدة مع جاهزية البرنامج والتعلم. لا تسدد عبر رابط غير موثق.", "visible": true},
  {"question_en": "Can business partners both join?", "question_ar": "هل يمكن للشركاء في الشركة الانضمام؟", "answer_en": "Each owner or business partner applies separately and pays individual participant fees. Venture-backed businesses may request review of the official privately raised funding criterion of US$250,000–999,999.", "answer_ar": "يتقدم كل مالك أو شريك بطلب منفصل ويسدد رسوم مشاركته. ويمكن للشركات المدعومة استثمارياً طلب مراجعة معيار التمويل الخاص البالغ 250,000–999,999 دولار.", "visible": true},
  {"question_en": "How are accountability coaches selected?", "question_ar": "كيف يتم اختيار مدربي المساءلة؟", "answer_en": "Coaches are current EO members with business-scaling experience, a 12-month commitment, training and regular check-ins. Published global network profiles are not appointments to your group.", "answer_ar": "المدربون أعضاء حاليون في EO لديهم خبرة في تنمية الأعمال والتزام لمدة 12 شهراً وتدريب ومتابعة منتظمة. الملفات المنشورة للشبكة العالمية لا تعني التعيين لمجموعتك.", "visible": true},
]

/** Explicitly import missing suggestions without changing existing answers or visibility. */
export function suggestedEoaFaqs(existing: EoaFaq[]) {
  return defaultEoaFaqs.filter(faq => !existing.some(row => row.question_en === faq.question_en || row.question_ar === faq.question_ar)).slice(0, Math.max(0, 30 - existing.length))
}

export function eoaFaqs(editorial?: EoaEditorial | null) {
  const core = defaultEoaFaqs.filter(faq => ['How long is the program and what is the time commitment?', 'Does completing Accelerator give me EO membership?', 'What are the participation fees?', 'Are sessions in person or online?'].includes(faq.question_en))
  const others = editorial ? editorial.faqs.filter(faq => faq.visible) : defaultEoaFaqs
  const added = defaultEoaFaqs.slice(16).filter(faq => !others.some(item => item.question_en === faq.question_en || item.question_ar === faq.question_ar))
  return [...core, ...others.filter(faq => !core.some(item => item.question_en === faq.question_en || item.question_ar === faq.question_ar)), ...added]
}

export function safeEoaWebsite(value: string | null | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}
