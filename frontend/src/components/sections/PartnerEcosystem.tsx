'use client'

import { useState } from 'react'
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { filterPartnerOrganizations, partnerDiscoveryOrder } from '@/lib/partner-discovery'
import { PartnerLogoMarquee } from './PartnerLogoMarquee'
import roster from '@/data/partner-ecosystem.json'

const categories = [
  ['all', 'جميع الجهات', 'All organizations'], ['government', 'الجهات الحكومية', 'Government'],
  ['bank', 'البنوك', 'Banks'], ['pif', 'شركات صندوق الاستثمارات العامة', 'PIF companies'],
  ['university', 'الجامعات', 'Universities'], ['vc', 'الاستثمار الجريء', 'Venture capital'],
  ['listed', 'الشركات المدرجة', 'Listed companies'],
] as const

export function PartnerEcosystem({ visitSeed }: { visitSeed: number }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const selected = filterPartnerOrganizations(partnerDiscoveryOrder(roster, visitSeed), category, search)
  const partners = selected.map(item => ({ ...item, name_ar: ar ? item.name_ar : item.name_en }))
  const hasFilters = Boolean(search || category !== 'all')
  const categoryLabel = (key: string) => {
    const item = categories.find(item => item[0] === key)
    return item ? item[ar ? 1 : 2] : ''
  }
  const reset = () => { setSearch(''); setCategory('all') }

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

      <div className="mt-6 md:hidden">
        <label htmlFor="partner-category" className="mb-2 block text-sm font-semibold text-slate-700">{ar ? 'الفئة' : 'Category'}</label>
        <select id="partner-category" value={category} onChange={event => setCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-2 focus:outline-indigo-600">
          {categories.map(([key, arabic, english]) => <option key={key} value={key}>{ar ? arabic : english}</option>)}
        </select>
      </div>
      <div role="group" aria-label={ar ? 'تصفية الجهات حسب الفئة' : 'Filter organizations by category'} className="mt-6 hidden flex-wrap gap-2 md:flex">
        {categories.map(([key, arabic, english]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${category === key ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}>{ar ? arabic : english}</button>)}
      </div>
      {hasFilters && <button type="button" onClick={reset} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><X className="h-4 w-4" aria-hidden="true" />{ar ? 'مسح البحث والتصفية' : 'Clear search and filters'}</button>}

      {selected[0] ? <>
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-1 py-3 sm:px-3" data-partner-results data-visit-ready={visitSeed ? 'true' : 'false'}>
          <PartnerLogoMarquee partners={partners} label={ar ? 'جهات فرص الشراكة' : 'Organizations for potential partnerships'} />
        </div>
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 [&::-webkit-details-marker]:hidden">
            {ar ? 'تصفح الجهات وروابطها' : 'Browse organizations and websites'}
            <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map(item => <li key={item.id}>
              <a className="flex h-full min-h-20 items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600" href={item.website} target="_blank" rel="noopener noreferrer">
                <span><span className="block text-sm font-semibold leading-6">{ar ? item.name_ar : item.name_en}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{categoryLabel(item.category)}</span></span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{ar ? 'يفتح في نافذة جديدة' : 'Opens in a new tab'}</span>
              </a>
            </li>)}
          </ul>
        </details>
      </> : <div role="status" className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="font-bold text-slate-900">{ar ? 'لا توجد جهات تطابق بحثك' : 'No organizations match your search'}</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">{ar ? 'جرّب اسمًا آخر أو اختر فئة مختلفة.' : 'Try another name or choose a different category.'}</p>
      </div>}
    </div>
  </section>
}
