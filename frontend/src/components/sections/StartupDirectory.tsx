'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { usePublicCollection } from '@/lib/use-public-collection'
import { CardBrowser } from './CardBrowser'
import { ProfileCard } from './ProfileCard'
import { CollectionStatus } from './CollectionStatus'

export type StartupProfile = {
  asset_credit?: string; id: string; slug: string; region: string; country_code: string; country_en: string; country_ar: string
  company_name_en: string; company_name_ar: string; company_brief_en: string; company_brief_ar: string
  founder_name_en: string; founder_name_ar: string; founder_brief_en: string; founder_brief_ar: string
  role_en: string; role_ar: string; sector_en: string; sector_ar: string
  business_type: 'technology' | 'traditional'; focus_area_en: string; focus_area_ar: string
  logo_url?: string; logo_tone?: 'dark'; portrait_url?: string; website: string; website_verified_at: string
  reviewed_at: string; review_due?: boolean; revenue_status: 'reported' | 'financial_statement'
  revenue_evidence: { summary_en: string; summary_ar: string; period: string; source_url: string }
  ecosystem_sources: { key: string; label: string; relationship_en: string; relationship_ar: string; url: string }[]
  company_socials: { label: string; url: string }[]; founder_socials: { label: string; url: string }[]; sources: string[]
}
const sources = [['misk','Misk','مسك'],['code','CODE by MCIT','كود'],['monshaat','Monshaat','منشآت'],['multiverse','Multiverse by MCIT','ملتيفيرس'],['impact46','Impact46','إمباكت 46'],['falak','Falak','فلك'],['lamarka','Lamarka','لاماركا'],['the-garage','The Garage','الكراج'],['leap','LEAP','ليب'],['gitex','GITEX','جيتكس']]
const regions = [['Saudi Arabia','السعودية'],['GCC','الخليج'],['MENA','الشرق الأوسط وشمال أفريقيا'],['Global','العالم']]
const control = 'min-h-12 min-w-0 rounded-xl border border-slate-300 bg-white px-4'
export function StartupDirectory({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'; const lang = ar ? 'ar' : 'en'
  const Heading = compact ? 'h2' : 'h1'
  const [search, setSearch] = useState(''); const [region, setRegion] = useState('')
  const [sector, setSector] = useState(''); const [businessType, setBusinessType] = useState(''); const [source, setSource] = useState('')
  const params = new URLSearchParams()
  for (const [key,value] of Object.entries({ search: search.trim(), region, sector, business_type: businessType, source })) if (value) params.set(key,value)
  const query = params.toString()
  const collection = usePublicCollection<StartupProfile>(`/startup-directory${query ? `?${query}` : ''}`)
  const typeLabel = (type: string) => type === 'technology' ? (ar ? 'أعمال تقنية' : 'Technology business') : (ar ? 'سلع وخدمات تقليدية' : 'Traditional goods & services')
  function clear() { setSearch(''); setRegion(''); setSector(''); setBusinessType(''); setSource('') }
  return <section className="mx-auto max-w-7xl px-4 py-16" aria-labelledby={compact ? 'startup-preview' : 'startup-heading'}>
    <p className="text-sm font-bold text-blue-700">{ar ? 'من السعودية إلى العالم' : 'From Saudi Arabia to the world'}</p>
    <Heading id={compact ? 'startup-preview' : 'startup-heading'} className="mt-3 text-3xl font-extrabold text-slate-900">{ar ? 'اكتشف الشركات ومؤسسيها' : 'Discover businesses and their founders'}</Heading>
    <p className="mt-4 max-w-3xl text-slate-600 leading-relaxed">{ar ? 'شركات لها مواقع رسمية ودليل منشور على الإيرادات، مرتبة من السعودية إلى العالم. راجع المصدر والفترة في كل بطاقة؛ الإدراج لا يعني العضوية في وصول أو EO.' : 'Businesses with official websites and published revenue evidence, ordered from Saudi Arabia to the world. Check each card’s source and reporting period; inclusion does not imply Wosool or EO membership.'}</p>
    {!compact && <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-2 text-sm">{ar ? 'البحث' : 'Search'}<input type="search" maxLength={120} className={control} value={search} onChange={e=>setSearch(e.target.value)} placeholder={ar ? 'شركة، مؤسس أو مجال تركيز' : 'Company, founder or focus area'} /></label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">{ar ? 'نوع النشاط' : 'Business type'}<select aria-label={ar ? 'نوع النشاط' : 'Business type'} className={control} value={businessType} onChange={e=>setBusinessType(e.target.value)}><option value="">{ar ? 'كل الأنشطة' : 'All business types'}</option>{['technology','traditional'].map(t=><option key={t} value={t}>{typeLabel(t)}</option>)}</select></label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">{ar ? 'المنطقة' : 'Region'}<select aria-label={ar ? 'المنطقة' : 'Region'} className={control} value={region} onChange={e=>setRegion(e.target.value)}><option value="">{ar ? 'كل المناطق' : 'All regions'}</option>{regions.map(([value,label])=><option key={value} value={value}>{ar?label:value}</option>)}</select></label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">{ar ? 'القطاع' : 'Sector'}<select aria-label={ar ? 'القطاع' : 'Sector'} className={control} value={sector} onChange={e=>setSector(e.target.value)}><option value="">{ar ? 'كل القطاعات' : 'All sectors'}</option>{collection.meta.sectors?.map(s=><option key={s.en} value={s.en}>{s[lang]}</option>)}</select></label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">{ar ? 'الجهة أو الفعالية' : 'Program or event'}<select aria-label={ar ? 'الجهة أو الفعالية' : 'Program or event'} className={control} value={source} onChange={e=>setSource(e.target.value)}><option value="">{ar ? 'كل المصادر' : 'All sources'}</option>{sources.map(([key,en,arLabel])=><option key={key} value={key}>{ar?arLabel:en}</option>)}</select></label>
        {query && <button className="self-end min-h-12 px-4 text-blue-700 underline" onClick={clear}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>}
      </div>
      <p className="mt-4 text-sm text-slate-500">{ar ? 'التصنيف حسب المنتج أو الخدمة الأساسية. تتضمن الأدلة إفصاحات مالية وتصريحات منشورة؛ ليست جميع الأرقام مدققة. بعض الجهات لم تكتمل مراجعة شركاتها بعد.' : 'Categories reflect the primary offering. Evidence includes financial disclosures and published reports; figures are not all audited. Some sources still have businesses awaiting review.'}</p>
    </>}
    <CardBrowser key={query} items={collection.items.map(p=>({id:p.slug,content:<ProfileCard data={{
      company:p[`company_name_${lang}`],companyBrief:p[`company_brief_${lang}`],founder:p[`founder_name_${lang}`],
      founderBrief:p[`founder_brief_${lang}`],role:p[`role_${lang}`],sector:p[`sector_${lang}`],location:p[`country_${lang}`],
      logo:p.logo_url,logoTone:p.logo_tone,portrait:p.portrait_url,website:p.website,companySocials:p.company_socials,
      founderSocials:p.founder_socials,sources:p.sources,reviewedAt:p.reviewed_at,reviewDue:p.review_due,assetCredit:p.asset_credit,
      businessType:typeLabel(p.business_type),focusArea:p[`focus_area_${lang}`],websiteVerifiedAt:p.website_verified_at,
      revenue:p.revenue_evidence ? {summary:p.revenue_evidence[`summary_${lang}`],period:p.revenue_evidence.period,source:p.revenue_evidence.source_url,financialStatement:p.revenue_status==='financial_statement'} : undefined,
      ecosystemSources:p.ecosystem_sources?.map(s=>({label:s.label,url:s.url,relationship:s[`relationship_${lang}`]}))
    }}/>}))} />
    <CollectionStatus {...collection} empty={!collection.items.length} emptyMessage={query ? (ar ? 'لا توجد شركات مستوفية للشروط ضمن هذه الفلاتر. جرّب تغيير البحث.' : 'No qualifying businesses match these filters. Try changing your search.') : undefined} />
    <div className="mt-6 flex flex-wrap gap-6 text-blue-700">{compact && <Link className="min-h-11 inline-flex items-center font-bold underline" href="/startups">{ar ? 'استكشف الدليل' : 'Explore the directory'}</Link>}<Link className="min-h-11 inline-flex items-center underline" href="/contact?category=directory-correction">{ar ? 'اقتراح شركة أو تصحيح معلومة' : 'Suggest a company or correction'}</Link></div>
  </section>
}
