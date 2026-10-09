import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { EoaNav } from '@/components/eoa/Shared'
export const metadata: Metadata = {
  title: 'EO Riyadh Accelerator | مسرّعة رواد الأعمال',
  description:
    'EO Riyadh Accelerator connects founders globally and supports growth toward US$1 million in annual revenue and EO membership readiness. تعلّم ونمو وعلاقات عالمية للمؤسسين.',
  alternates: { canonical: '/EOA' },
  openGraph: {
    title: 'EO Riyadh Accelerator',
    description: 'Saudi Founders. Global Connections. Extraordinary Growth. مؤسسون سعوديون. علاقات عالمية. نمو استثنائي.',
    url: '/EOA', siteName: 'Wosool', type: 'website', locale: 'ar_SA', alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary', title: 'EO Riyadh Accelerator',
    description: 'Saudi Founders. Global Connections. Extraordinary Growth.',
  },
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <div className="eoa">
        <EoaNav />
        {children}
      </div>
    </PublicLayout>
  )
}
