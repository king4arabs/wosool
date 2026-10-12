import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
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

export function generateStaticParams() {
  return sections.map((section) => ({ section }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  return {
    title: `EO Riyadh Accelerator — ${titles[section] ?? section}`,
    alternates: { canonical: `/eoa/${section}` },
  }
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
