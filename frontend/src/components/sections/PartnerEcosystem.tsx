'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { filterPartnerOrganizations, partnerDiscoveryOrder } from '@/lib/partner-discovery'
import { PartnerLogoMarquee } from './PartnerLogoMarquee'
import roster from '@/data/partner-ecosystem.json'

export function PartnerEcosystem({ visitSeed }: { visitSeed: number }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [search, setSearch] = useState('')
  const selected = filterPartnerOrganizations(partnerDiscoveryOrder(roster, visitSeed), 'all', search)
  const partners = selected.map(item => ({ ...item, name_ar: ar ? item.name_ar : item.name_en }))

  return <section id="partner-ecosystem" aria-labelledby="partnership-opportunities" className="scroll-mt-24 bg-white px-4 py-10 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="partnership-opportunities" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{ar ? 'فرص الشراكة' : 'Partnership opportunities'}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{ar ? 'نفخر بشركاء يتعامل معهم المؤسسين وتتوسع بهم تطلعات العلاقات والأعمال' : 'We are proud of the partners founders work with, broadening their connections and business opportunities.'}</p>
        </div>
        <div className="w-full lg:w-80 lg:shrink-0">
          <label htmlFor="partner-search" className="mb-2 block text-sm font-semibold text-slate-700">{ar ? 'ابحث عن جهة' : 'Find an organization'}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
            <input id="partner-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={ar ? 'اسم الجهة بالعربية أو الإنجليزية' : 'Name in Arabic or English'} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pe-3 ps-10 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20" />
          </div>
        </div>
      </div>

      {search && <button type="button" onClick={() => setSearch('')} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><X className="h-4 w-4" aria-hidden="true" />{ar ? 'مسح البحث' : 'Clear search'}</button>}

      {selected[0] ? <>
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-1 py-3 sm:px-3" data-partner-results data-visit-ready={visitSeed ? 'true' : 'false'}>
          <PartnerLogoMarquee partners={partners} label={ar ? 'جهات فرص الشراكة' : 'Organizations for potential partnerships'} />
        </div>
      </> : <div role="status" className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="font-bold text-slate-900">{ar ? 'لا توجد جهات تطابق بحثك' : 'No organizations match your search'}</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">{ar ? 'جرّب اسمًا آخر بالعربية أو الإنجليزية.' : 'Try another name in Arabic or English.'}</p>
      </div>}
    </div>
  </section>
}
