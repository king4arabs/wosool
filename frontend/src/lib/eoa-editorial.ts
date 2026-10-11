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
    answer_en: 'The Riyadh cohort runs for six months of coaching, training and prestigious activities. New cohort rounds begin every six months. Graduates continue in the alumni program with follow-ups and startup growth support.',
    answer_ar: 'تمتد دفعة الرياض ستة أشهر من التوجيه والتدريب والأنشطة المرموقة. تنطلق جولة جديدة كل ستة أشهر، ويواصل الخريجون الاستفادة من المتابعة ودعم نمو الشركات الناشئة.',
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
]

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
