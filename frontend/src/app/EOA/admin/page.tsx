import type { Metadata } from 'next'
import { Admin } from '@/components/eoa/Admin'
export const metadata: Metadata = {
  title: 'EO Accelerator administration',
  robots: { index: false, follow: false },
  alternates: { canonical: '/EOA/admin' },
}
export default function Page() {
  return <Admin />
}
