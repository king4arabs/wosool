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
    answer_en: 'The Riyadh cohort lasts six months, with coaching, training and cohort activities. A new round begins every six months. After graduation, the alumni program offers follow-ups and support as you continue working on your business.',
    answer_ar: 'تمتد دفعة الرياض ستة أشهر وتشمل التوجيه والتدريب وأنشطة الدفعة. تنطلق جولة جديدة كل ستة أشهر. بعد التخرج، يمكنك متابعة العمل على شركتك من خلال برنامج الخريجين.',
    visible: true,
  },
  {
    question_en: 'What are the participation fees?',
    question_ar: 'ما رسوم المشاركة؟',
    answer_en: 'The annual EO global program fee is US$1,750, plus any local chapter fees. Riyadh fees, sponsorship contributions and payment arrangements are shared after confirmation by program leadership.',
    answer_ar: 'تبلغ رسوم برنامج EO العالمية 1,750 دولاراً سنوياً، إضافة إلى رسوم الفرع المحلية إن وجدت. تُعلن رسوم الرياض ومساهمات الرعاية وترتيبات السداد بعد تأكيدها من قيادة البرنامج.',
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
    answer_en: 'EOA participants, founders and alumni can apply to EO once they meet all joining requirements and pass its admission and chapter-review process. Reaching US$1 million is a growth goal; cohort graduation alone does not grant EO membership.',
    answer_ar: 'يمكن لمشاركي EOA والمؤسسين والخريجين التقدم إلى EO بعد استيفاء جميع شروط الانضمام واجتياز إجراءات القبول ومراجعة الفرع. الوصول إلى مليون دولار هدف للنمو؛ ولا يمنح التخرج وحده عضوية EO.',
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
    "answer_en": "Check each session in the cohort schedule for its delivery format, venue or joining link. Do not assume every session uses the same format.",
    "answer_ar": "راجع كل جلسة في جدول الدفعة لمعرفة طريقة انعقادها ومقرها أو رابط الانضمام. قد تختلف طريقة الحضور بين جلسة وأخرى.",
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
]

/** Explicitly import missing suggestions without changing existing answers or visibility. */
export function suggestedEoaFaqs(existing: EoaFaq[]) {
  return defaultEoaFaqs.filter(faq => !existing.some(row => row.question_en === faq.question_en || row.question_ar === faq.question_ar)).slice(0, Math.max(0, 30 - existing.length))
}

export function eoaFaqs(editorial?: EoaEditorial | null) {
  const core = defaultEoaFaqs.filter(faq => ['How long is the program and what is the time commitment?', 'Does completing Accelerator give me EO membership?'].includes(faq.question_en))
  const others = editorial ? editorial.faqs.filter(faq => faq.visible) : defaultEoaFaqs
  return [...core, ...others.filter(faq => !core.some(item => item.question_en === faq.question_en || item.question_ar === faq.question_ar))]
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
