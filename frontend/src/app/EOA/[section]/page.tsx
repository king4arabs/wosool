import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EoaContent } from '@/components/eoa/Content'
const sections = [
  'about',
  'program',
  'eligibility',
  'partners',
  'faq',
  'contact',
  'learning',
  'leadership',
  'privacy',
]
const titles: Record<string, string> = {
  about: 'عن البرنامج | About',
  program: 'هيكل البرنامج | Program',
  eligibility: 'الأهلية والرسوم | Eligibility & fees',
  partners: 'الشركاء | Partners',
  faq: 'الأسئلة الشائعة | FAQ',
  contact: 'تواصل معنا | Contact',
  learning: 'التعلم والفعاليات | Learning & events',
  leadership: 'قيادة البرنامج | Leadership',
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
    alternates: { canonical: `/EOA/${section}` },
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
