import type { Metadata } from 'next'
import { Account } from '@/components/eoa/Account'
import { safeRedirect } from '@/lib/navigation'
export const metadata: Metadata = {
  title: 'EO Accelerator account',
  robots: { index: false, follow: false },
  alternates: { canonical: '/eoa/account' },
}
export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string | string[]; redirect?: string | string[] }> }) {
  const { mode, redirect } = await searchParams
  const target = safeRedirect(typeof redirect === 'string' ? redirect : null, '/eoa/account')
  return <Account initialMode={mode === 'login' ? 'login' : 'register'} redirectTo={target.startsWith('/eoa/account') ? undefined : target} />
}
