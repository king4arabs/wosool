'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocale } from '@/lib/locale'
import { publicWebsite } from '@/lib/community-display'
import { getInitials } from '@/lib/utils'
import styles from './profile-cards.module.css'

export type ProfileCardData = {
  company: string; logo?: string; logoTone?: 'dark'; companyBrief?: string; website?: string
  founder?: string; portrait?: string; role?: string; founderBrief?: string
  location?: string; sector?: string; href?: string; founderHref?: string
  founderSocials?: { label: string; url: string }[]; companySocials?: { label: string; url: string }[]
  businessType?: string; focusArea?: string; websiteVerifiedAt?: string
  revenue?: { summary: string; period: string; source: string; financialStatement: boolean }
  ecosystemSources?: { label: string; relationship: string; url: string }[]
  assetCredit?: string; sources?: string[]; reviewedAt?: string; reviewDue?: boolean
}
function safeImage(src?: string) { return src?.startsWith('/') && !src.startsWith('//') ? src : publicWebsite(src) }
function Portrait({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const image = safeImage(src)
  return <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-indigo-700">{image && !failed ? <Image src={image} alt={name} width={56} height={56} className="h-full w-full object-cover" unoptimized={!image.startsWith('/')} onError={() => setFailed(true)} /> : getInitials(name)}</span>
}
export function ProfileCard({ data }: { data: ProfileCardData }) {
  const { locale } = useLocale(); const ar = locale === 'ar'
  const website = publicWebsite(data.website)
  const socialLinks = (items: ProfileCardData['founderSocials'], owner: string) => items?.filter(s => publicWebsite(s.url)).map(s => <a key={`${owner}-${s.url}`} href={publicWebsite(s.url)} target="_blank" rel="noopener noreferrer" aria-label={`${owner} — ${s.label}`}>{s.label}<span className="sr-only"> {ar ? '(نافذة جديدة)' : '(new tab)'}</span></a>)
  return <article className={styles.card}>
    <div className={[styles.logoArea, data.logoTone === 'dark' ? styles.darkLogo : ''].join(' ')}><Avatar className={styles.logo}><AvatarImage src={safeImage(data.logo)} alt={data.company} className="object-contain" loading="lazy" /><AvatarFallback className="rounded-none bg-transparent font-bold text-slate-700">{data.company}</AvatarFallback></Avatar></div>
    <div className={styles.body}>
      <div><h3 className={styles.title}>{data.company}</h3><p className={styles.location}>{data.location}</p></div>
      <p className={styles.brief}>{data.companyBrief || (ar ? 'لم تُضف نبذة الشركة بعد.' : 'Company introduction not yet provided.')}</p>
      {data.founder && <><div className={styles.person}><Portrait key={data.portrait ?? data.founder} src={data.portrait} name={data.founder} /><div><h4>{data.founder}</h4>{data.role && <p>{data.role}</p>}</div></div><p className={styles.brief}>{data.founderBrief || (ar ? 'اكتشف المزيد في ملف المؤسس.' : 'Discover more in the founder’s profile.')}</p></>}
      <div className="flex flex-wrap gap-2">{data.businessType && <p className={styles.sector}>{data.businessType}</p>}{data.sector && <p className={styles.sector}>{data.sector}</p>}</div>
      {data.focusArea && <p className={styles.brief}><strong>{ar ? 'مجال التركيز: ' : 'Focus: '}</strong>{data.focusArea}</p>}
      {data.revenue && <p className="text-xs font-semibold text-emerald-800">{ar ? 'يتوفر مصدر للإيرادات' : 'Revenue source available'}</p>}
      <div className={styles.links}>
        {website && <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`${data.company} — ${ar ? 'الموقع، نافذة جديدة' : 'website, new tab'}`}><span dir="ltr">{new URL(website).hostname.replace(/^www\./, '')}</span> ↗</a>}
        {!!data.companySocials?.length && <div><span>{ar ? 'الشركة:' : 'Company:'}</span>{socialLinks(data.companySocials, data.company)}</div>}
        {!!data.founderSocials?.length && <div><span>{ar ? 'المؤسس:' : 'Founder:'}</span>{socialLinks(data.founderSocials, data.founder ?? '')}</div>}
      </div>
      <details className={styles.details}><summary>{ar ? 'المزيد والتفاصيل' : 'More details'}</summary><p>{data.companyBrief}</p>
        {data.revenue && <div><strong>{ar ? 'دليل الإيرادات' : 'Revenue evidence'}</strong><p>{data.revenue.summary}</p><p>{ar ? 'الفترة: ' : 'Period: '}{data.revenue.period}</p><a href={publicWebsite(data.revenue.source)} target="_blank" rel="noopener noreferrer">{data.revenue.financialStatement ? (ar ? 'القوائم المالية' : 'Financial statement') : (ar ? 'المصدر المنشور' : 'Published report')} ↗</a></div>}
        {data.ecosystemSources?.filter(s=>publicWebsite(s.url)).map(s=><p key={s.url}><a href={publicWebsite(s.url)} target="_blank" rel="noopener noreferrer">{s.label} ↗</a> — {s.relationship}</p>)}
        {data.websiteVerifiedAt && <p>{ar ? 'مراجعة الموقع: ' : 'Website reviewed: '}<time dateTime={data.websiteVerifiedAt}>{data.websiteVerifiedAt}</time></p>}
        {data.founderBrief && <p>{data.founderBrief}</p>}{data.sources?.filter(s => publicWebsite(s)).map((url,i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{ar ? 'المصدر' : 'Source'} {i+1} ↗</a>)}{data.assetCredit && <p>{data.assetCredit}</p>}{data.reviewedAt && <p>{ar ? 'آخر مراجعة:' : 'Last reviewed:'} <time dateTime={data.reviewedAt}>{data.reviewedAt}</time>{data.reviewDue && (ar ? ' — حان موعد المراجعة' : ' — review due')}</p>}</details>
      {data.href && <Link className={styles.profileLink} href={data.href}>{ar ? 'ملف الشركة' : 'Company profile'}</Link>}
      {data.founderHref && <Link className={styles.profileLink} href={data.founderHref}>{ar ? 'ملف المؤسس' : 'Founder profile'}</Link>}
    </div>
  </article>
}
