"use client"

import { useState } from "react"
import { PageHero, heroPrimary, heroSecondary } from "@/components/sections/PageHero"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Search } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FounderShowcase } from "@/components/sections/CommunityShowcase"
import type { FounderRegionFilter } from "@/lib/founder-filters"
import { type FounderCardProfile } from "@/components/sections/FounderCard"
import { foundersPageCopy } from "@/data/localized-seed"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { getFounderSpotlights } from "@/lib/founder-spotlight"
import { useLocale } from "@/lib/locale"
import { usePublicCollection } from "@/lib/use-public-collection"
import styles from "../home.module.css"

export default function FoundersPage() {
  const { locale } = useLocale()
  return <FounderDirectory key={locale} />
}

function FounderDirectory() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const copy = foundersPageCopy[locale]
  const collection = usePublicCollection<ApiFounder>("/founders", 24)
  const isSpotlight = collection.snapshotAllowed
  const founders: FounderCardProfile[] = isSpotlight
    ? getFounderSpotlights(locale)
    : collection.items.map(mapFounder)
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("")
  const [stage, setStage] = useState("")
  const [location, setLocation] = useState("")
  // Kept here because the showcase below is remounted whenever the search or dropdowns change.
  const [region, setRegion] = useState<FounderRegionFilter>("all")
  const Arrow = ar ? ArrowLeft : ArrowRight
  const featured = isSpotlight ? [] : founders.filter(founder => founder.isFeatured)
  const hasFilters = Boolean(search || sector || stage || location || region !== 'all')
  const filtered = founders.filter(founder => {
    const query = search.trim().toLocaleLowerCase(locale)
    const haystack = [founder.name, founder.companyName, founder.tagline, founder.bio, founder.position].filter(Boolean).join(' ').toLocaleLowerCase(locale)
    return (!query || haystack.includes(query)) && (!sector || founder.sector === sector) && (!stage || founder.stage === stage) && (!location || founder.location === location)
  })
  const options = (key: 'sector' | 'stage' | 'location') => [...new Set(founders.map(founder => founder[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale))
  const control = "min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
  const label = "grid min-w-0 gap-2 text-xs font-bold text-[var(--text)]"
  const filtersKey = `${isSpotlight}-${search}-${sector}-${stage}-${location}`

  return <PublicLayout><div className={styles.home} dir={direction} lang={locale}>
    <PageHero
      eyebrow={isSpotlight ? ar ? 'مؤسسون من السعودية والعالم' : 'Founders from Saudi Arabia and beyond' : copy.badge}
      title={isSpotlight ? ar ? 'المؤسسون وشركاتهم' : 'Founders and their companies' : copy.title}
      description={isSpotlight ? ar ? 'اكتشف المؤسسين وشركاتهم وخبراتهم في السعودية والخليج والعالم.' : 'Discover founders, their companies and their experience across Saudi Arabia, the Gulf and beyond.' : copy.description}
      actions={<><a href="#founder-directory" className={heroPrimary}>{ar ? 'تصفّح المؤسسين' : 'Browse founders'}<Arrow size={17} aria-hidden="true" /></a><Link href="/apply" className={heroSecondary}>{ar ? 'قدّم طلب العضوية' : 'Apply for membership'}</Link></>}
    />
    {collection.error && <div className={`${styles.container} ${styles.availability}`} role="status"><span>{ar ? 'ملفات أعضاء المجتمع غير متاحة مؤقتًا.' : 'Community member profiles are temporarily unavailable.'}</span><button type="button" disabled={collection.loading} onClick={collection.retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></div>}

    {featured.length > 0 && <section className={`${styles.container} ${styles.section}`} aria-labelledby="featured-founders-title">
      <p className={styles.eyebrow}>{copy.featuredEyebrow}</p><h2 id="featured-founders-title">{copy.featuredTitle}</h2>
      <FounderShowcase founders={featured} showFilters={false} />
    </section>}

    <section id="founder-directory" className={`${styles.container} ${styles.section}`} aria-labelledby="founder-results-title" style={{ scrollMarginTop: 100 }}>
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{isSpotlight ? ar ? 'أعمال وخبرات من المنطقة' : 'BUSINESSES AND EXPERIENCE FROM THE REGION' : copy.directoryEyebrow}</p><h2 id="founder-results-title">{isSpotlight ? ar ? 'استكشف ملفات المؤسسين' : 'Explore founder profiles' : copy.directoryTitle}</h2></div><Link className={styles.textLink} href="/startups">{ar ? 'دليل الشركات الناشئة' : 'Startup directory'}<Arrow size={17} aria-hidden="true" /></Link></div>
      <div className="mt-7 grid min-w-0 gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:p-5 lg:grid-cols-2">
        <label className={label}><span>{copy.searchAria}</span><span className="relative flex min-w-0 items-center"><Search size={17} aria-hidden="true" className="pointer-events-none absolute start-3 text-[var(--text-muted)]" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.searchPlaceholder} className={`${control} ps-10`} /></span></label>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className={label}><span>{ar ? 'القطاع' : 'Sector'}</span><select value={sector} onChange={event => setSector(event.target.value)} className={control}><option value="">{copy.sectors[0]}</option>{options('sector').map(value => <option value={value} key={value}>{value}</option>)}</select></label>
          <label className={label}><span>{ar ? 'الموقع' : 'Location'}</span><select value={location} onChange={event => setLocation(event.target.value)} className={control}><option value="">{copy.locations[0]}</option>{options('location').map(value => <option value={value} key={value}>{value}</option>)}</select></label>
          {options('stage').length > 0 && <label className={label}><span>{ar ? 'المرحلة' : 'Stage'}</span><select value={stage} onChange={event => setStage(event.target.value)} className={control}><option value="">{copy.stages[0]}</option>{options('stage').map(value => <option value={value} key={value}>{value}</option>)}</select></label>}
        </div>
        {hasFilters && <button type="button" className="min-h-11 justify-self-start px-3 text-sm font-bold text-[var(--action-bg)] underline underline-offset-4" onClick={() => { setSearch(''); setSector(''); setStage(''); setLocation(''); setRegion('all') }}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>}
      </div>
      {collection.loading && founders.length === 0 ? <p role="status" className="py-8 text-center">{ar ? 'جارٍ تحميل الملفات العامة…' : 'Loading public profiles…'}</p> : <FounderShowcase key={filtersKey} founders={filtered} showFilters={false} region={region} onRegionChange={setRegion} />}
      {!isSpotlight && collection.hasMore && <div className="mt-7 text-center"><button type="button" className={styles.secondary} disabled={collection.loading} onClick={collection.loadMore}>{collection.loading ? ar ? 'جارٍ التحميل…' : 'Loading…' : ar ? 'تحميل المزيد من المؤسسين' : 'Load more founders'}</button></div>}
      {!isSpotlight && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5"><p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">{ar ? 'بعض الملفات الكاملة متاحة للأعضاء فقط. سجّل دخولك للوصول إلى التفاصيل والتواصل المباشر.' : 'Some full profiles are available to members only. Sign in to access details and direct introductions.'}</p><Link className={styles.secondary} href="/login">{copy.login}<Arrow size={16} aria-hidden="true" /></Link></div>}
    </section>

    <section className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-14" aria-labelledby="founder-join-title"><div className="mx-auto max-w-3xl text-center"><p className={styles.eyebrow}>{ar ? 'مجتمع من المؤسسين إلى المؤسسين' : 'A FOUNDER-TO-FOUNDER COMMUNITY'}</p><h2 id="founder-join-title">{copy.ctaTitle}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">{copy.ctaBody}</p><div className={`${styles.actions} justify-center`}><Link className={styles.primary} href="/apply">{copy.apply}</Link><Link className={styles.secondary} href="/contact">{copy.contact}</Link></div></div></section>
  </div></PublicLayout>
}
