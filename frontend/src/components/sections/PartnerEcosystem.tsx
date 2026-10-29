'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/locale'
import { PartnerLogoMarquee } from './PartnerLogoMarquee'
import roster from '@/data/partner-ecosystem.json'

const categories = [
  ['all', 'جميع الجهات', 'All organizations'], ['government', 'الجهات الحكومية', 'Government'],
  ['bank', 'البنوك', 'Banks'], ['pif', 'شركات صندوق الاستثمارات العامة', 'PIF companies'],
  ['university', 'الجامعات', 'Universities'], ['vc', 'الاستثمار الجريء', 'Venture capital'],
  ['listed', 'الشركات المدرجة', 'Listed companies'],
] as const

export function PartnerEcosystem() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [category, setCategory] = useState('all')
  const selected = roster.filter(item => category === 'all' || item.category === category)
  const partners = selected.map(item => ({ ...item, name_ar: ar ? item.name_ar : item.name_en }))
  return <section aria-labelledby="partnership-opportunities" className="mt-10 border-t border-slate-200 pt-8">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 id="partnership-opportunities" className="text-xl font-bold text-slate-900">{ar ? 'فرص الشراكة' : 'Partnership opportunities'}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{ar ? 'جهات نتطلع للتعاون معها لخدمة المؤسسين.' : 'Organizations we aspire to collaborate with in support of founders.'}</p></div>
      <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">{roster.length} {ar ? 'جهة' : 'organizations'}</span>
    </div>
    <div role="group" aria-label={ar ? 'تصفية الجهات حسب الفئة' : 'Filter organizations by category'} className="mt-6 flex flex-wrap gap-2">
      {categories.map(([key, arabic, english]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${category === key ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>{ar ? arabic : english} <span className="ms-1">{key === 'all' ? roster.length : roster.filter(item => item.category === key).length}</span></button>)}
    </div>
    <PartnerLogoMarquee key={category} partners={partners} label={ar ? 'جهات فرص الشراكة' : 'Organizations for potential partnerships'} />
    <details className="mt-3 rounded-xl border border-slate-200 px-4 py-3">
      <summary className="min-h-8 cursor-pointer text-sm font-semibold text-indigo-700">{ar ? 'تصفح الجهات' : 'Browse organizations'}</summary>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{selected.map(item => <li key={item.id}><a className="inline-flex min-h-11 items-center text-sm text-slate-600 hover:text-indigo-700 hover:underline" href={item.website} target="_blank" rel="noopener noreferrer">{ar ? item.name_ar : item.name_en}</a></li>)}</ul>
    </details>
  </section>
}
