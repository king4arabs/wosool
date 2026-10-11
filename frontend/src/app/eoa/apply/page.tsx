import type { Metadata } from 'next'
import { Application } from '@/components/eoa/Application'
export const metadata: Metadata = {
  title: 'Apply to EO Accelerator',
  robots: { index: false, follow: false },
  alternates: { canonical: '/eoa/apply' },
}
export default function Page() {
  return <Application />
}
