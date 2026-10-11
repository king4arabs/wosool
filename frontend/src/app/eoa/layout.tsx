import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { EoaNav } from '@/components/eoa/Shared'
import './eoa-upgrade.css'

export const metadata: Metadata = {
  title: 'EO Riyadh Accelerator | Global Connections. Extraordinary Growth.',
  description:
    'Join a founder-led journey in Riyadh to strengthen your business, grow your leadership and scale toward US$1M+ annual revenue through practical learning and global entrepreneurial connections.',
  alternates: { canonical: '/eoa' },
  openGraph: {
    title: 'EO Riyadh Accelerator',
    description:
      'Riyadh-based Founders. Global Connections. Extraordinary Growth.',
    url: '/eoa',
    siteName: 'Wosool',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    images: [
      {
        url: '/eoa/riyadh-hero.webp',
        alt: 'Riyadh — EO Riyadh Accelerator',
        width: 1600,
        height: 844,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EO Riyadh Accelerator',
    description:
      'Riyadh-based Founders. Global Connections. Extraordinary Growth.',
    images: ['/eoa/riyadh-hero.webp'],
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
