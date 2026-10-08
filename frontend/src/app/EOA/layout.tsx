import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { EoaNav } from '@/components/eoa/Shared'
export const metadata: Metadata = {
  title: 'EO Riyadh Accelerator | مسرّعة رواد الأعمال',
  description:
    'Wosool — Founders to Founders. Discover EO Riyadh Accelerator, check eligibility and prepare your application. وصول بوابتك الرقمية إلى EO Riyadh Accelerator.',
  alternates: { canonical: '/EOA' },
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
