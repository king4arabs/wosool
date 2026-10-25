import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { EoaContent } from '@/components/eoa/Content'

const sections = [
  'about',
  'alumni',
  'program',
  'eligibility',
  'perks',
  'partners',
  'faq',
  'contact',
  'learning',
  'leadership',
  'mentors',
  'privacy',
]

const titles: Record<string, string> = {
  about: 'عن البرنامج | About',
  alumni: 'الخريجون | Alumni',
  program: 'هيكل البرنامج | Program',
  eligibility: 'الأهلية والرسوم | Eligibility & fees',
  perks: 'المزايا | Perks',
  partners: 'الشركاء | Partners',
  faq: 'الأسئلة الشائعة | FAQ',
  contact: 'تواصل معنا | Contact',
  learning: 'التعلم والفعاليات | Learning & events',
  leadership: 'قيادة البرنامج | Leadership',
  mentors: 'المرشدون والمدربون | Mentors & coaches',
  privacy: 'الخصوصية | Privacy',
}

const descriptions: Record<string, string> = {
  about: 'تعرّف على مسرّعة EO الرياض وبرنامج نمو المؤسسين على مدى ستة أشهر من التعلم والتوجيه وتبادل الخبرات.',
  alumni: 'مجتمع خريجي مسرّعة EO الرياض: متابعة النمو والعلاقات والتعلم بعد إكمال البرنامج.',
  program: 'اكتشف برنامج مسرّعة EO الرياض لمدة ستة أشهر ومحاور النقد والاستراتيجية والأفراد والتنفيذ.',
  eligibility: 'راجع شروط الأهلية والرسوم وخطوات التقديم إلى مسرّعة EO الرياض ومتطلبات الانضمام.',
  perks: 'اكتشف مزايا مسرّعة EO الرياض وفرص التعلم والتواصل ودعم نمو الشركات.',
  partners: 'تعرّف على شركاء مسرّعة EO الرياض وأدوارهم في دعم المؤسسين والبرنامج.',
  faq: 'إجابات عن مدة مسرّعة EO الرياض والأهلية والرسوم والتقديم وعلاقة البرنامج بعضوية EO.',
  contact: 'تواصل مع فريق مسرّعة EO الرياض للاستفسار عن البرنامج والتقديم والشراكات.',
  learning: 'اكتشف محاور التعلم واللقاءات والزيارات وتجارب تبادل الخبرة في مسرّعة EO الرياض.',
  leadership: 'تعرّف على قيادة مسرّعة EO الرياض وفريق التشغيل ومسؤوليات دعم المؤسسين.',
  mentors: 'تعرّف على المرشدين والمستشارين وخبرات رواد الأعمال من مجتمع EO حول العالم.',
  privacy: 'اطّلع على سياسة خصوصية مسرّعة EO الرياض وكيفية استخدام بيانات الطلبات والحسابات.',
}

export function generateStaticParams() {
  return sections.map((section) => ({ section }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  if (!sections.includes(section)) notFound()
  return pageMetadata(`EO Riyadh Accelerator — ${titles[section]}`, descriptions[section], `/eoa/${section}`)
}

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!sections.includes(section)) notFound()
  return <EoaContent section={section} />
}
