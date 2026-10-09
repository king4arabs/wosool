import type { Metadata } from 'next'
import { Coach } from '@/components/eoa/Coach'
export const metadata: Metadata = {
  title: 'EO Accelerator coach workspace',
  robots: { index: false, follow: false },
  alternates: { canonical: '/EOA/coach' },
}
export default function Page() {
  return <Coach />
}
