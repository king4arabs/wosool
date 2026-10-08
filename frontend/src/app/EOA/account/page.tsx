import type { Metadata } from 'next'
import { Account } from '@/components/eoa/Account'
export const metadata: Metadata = {
  title: 'EO Accelerator account',
  robots: { index: false, follow: false },
  alternates: { canonical: '/EOA/account' },
}
export default function Page() {
  return <Account />
}
