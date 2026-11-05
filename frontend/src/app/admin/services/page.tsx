'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { adminLabels, adminServiceDescriptions, filterAdminServices } from '@/lib/admin-navigation'

export default function AdminServicesPage() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [query, setQuery] = useState('')
  const groups = filterAdminServices(query, locale)
  return <div className="space-y-7" data-admin-services>
    <header className="rounded-3xl bg-[var(--brand-navy)] p-6 text-white sm:p-8">
      <h2 className="text-2xl font-bold">{ar ? 'ماذا تريد أن تدير اليوم؟' : 'What would you like to manage today?'}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{ar ? 'ابحث عن خدمة أو اختر مجال العمل للوصول مباشرة إلى الأداة المناسبة.' : 'Search for a service or choose a work area to open the right tool.'}</p>
      <label className="mt-5 flex min-h-12 max-w-2xl items-center gap-3 rounded-xl bg-white px-4 text-[var(--brand-navy)]"><Search size={19} aria-hidden="true" /><span className="sr-only">{ar ? 'البحث في الخدمات' : 'Search services'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={ar ? 'مثال: الشركاء، CRM، الفعاليات…' : 'Try partners, CRM or events…'} className="w-full min-w-0 bg-transparent py-3 text-base outline-none" /></label>
    </header>
    <p role="status" className="text-sm text-[var(--text-muted)]">{groups.reduce((total, group) => total + group.items.length, 0)} {ar ? 'خدمة متاحة' : 'services available'}</p>
    {groups.map(group => <section key={group.key} aria-labelledby={`service-${group.key}`}>
      <h2 id={`service-${group.key}`} className="mb-4 text-xl font-bold">{adminLabels[locale].groups[group.key]}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{group.items.map(({ href, icon: Icon }) => <Link key={href} href={href} className="group flex min-w-0 items-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 transition-colors hover:border-[var(--brand-blue)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]">
        <span className="rounded-xl bg-[var(--surface-blue)] p-3 text-[var(--brand-blue)]"><Icon size={21} aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><strong className="block text-base">{adminLabels[locale].nav[href]}</strong><span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">{adminServiceDescriptions[href]?.[ar ? 0 : 1]}</span></span><ArrowUpRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
      </Link>)}</div>
    </section>)}
    {!groups.length && <div className="rounded-2xl border bg-white p-8"><p>{ar ? 'لا توجد خدمات مطابقة.' : 'No matching services.'}</p><button type="button" onClick={() => setQuery('')} className="mt-3 min-h-11 font-bold text-[var(--link)]">{ar ? 'مسح البحث' : 'Clear search'}</button></div>}
  </div>
}
