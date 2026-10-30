"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { PageHero, heroPrimary, heroSecondary } from "@/components/sections/PageHero"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Search } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FounderShowcase } from "@/components/sections/CommunityShowcase"
import { matchesFounderSearch, type FounderRegionFilter } from "@/lib/founder-filters"
import { createFounderMixStore } from "@/lib/founder-discovery"
import { countryRegion, directoryCountryGroups, founderCountry, isDirectoryRecordVisible } from '@/lib/directory-geography'
import { type FounderCardProfile } from "@/components/sections/FounderCard"
import { foundersPageCopy } from "@/data/localized-seed"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { getFounderSpotlights } from "@/lib/founder-spotlight"
import { useLocale } from "@/lib/locale"
import { usePublicCollection } from "@/lib/use-public-collection"
import { useLinkedFounderSlug } from "@/lib/use-linked-founder-slug"
import { exactLinkedFounderCards } from "@/lib/founder-card-links"
import styles from "../home.module.css"

export default function FoundersPage() {
  const { locale } = useLocale()
  const [visitStore] = useState(createFounderMixStore)
  const visitSeed = useSyncExternalStore(visitStore.subscribe, visitStore.getSnapshot, visitStore.getServerSnapshot)
  return <FounderDirectory key={locale} visitSeed={visitSeed} />
}

function FounderDirectory({ visitSeed }: { visitSeed: number }) {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const copy = foundersPageCopy[locale]
  const [search, setSearch] = useState("")
  const [settledSearch, setSettledSearch] = useState('')
  const searchPending = search.trim() !== settledSearch
  useEffect(() => { const timer = window.setTimeout(() => setSettledSearch(search.trim()), 250); return () => window.clearTimeout(timer) }, [search])
  const [sector, setSector] = useState("")
  const [stage, setStage] = useState("")
  const [location, setLocation] = useState("")
  const linkedSlug = useLinkedFounderSlug()
  // Kept here because the showcase below is remounted whenever the search or dropdowns change.
  const [region, setRegion] = useState<FounderRegionFilter>("all")
  const params = new URLSearchParams({ facets: '1' })
  for (const [key, value] of Object.entries({ search: settledSearch, sector, stage, country: location, region: region === 'all' ? '' : region })) if (value) params.set(key, value)
  if (linkedSlug) params.set('slug', linkedSlug)
  const collection = usePublicCollection<ApiFounder>(`/founders?${params}`, 24)
  const isSpotlight = collection.snapshotAllowed && !linkedSlug
  const founders: FounderCardProfile[] = (isSpotlight ? getFounderSpotlights(locale) : collection.items.map(mapFounder)).filter(isDirectoryRecordVisible)
  const countries = directoryCountryGroups(locale)
  const Arrow = ar ? ArrowLeft : ArrowRight
  const featured = isSpotlight ? [] : founders.filter(founder => founder.isFeatured)
  const hasFilters = Boolean(linkedSlug || search || sector || stage || location || region !== 'all')
  // The API searches both languages and every public linked company. Rechecking
  // only the translated card would incorrectly remove valid server matches.
  // Guard the deep link on the client as well: older API releases may ignore
  // the new slug parameter, but must never present an unrelated founder card.
  const filtered = searchPending ? [] : linkedSlug
    ? exactLinkedFounderCards(founders, linkedSlug)
    : isSpotlight ? founders.filter(founder =>
      matchesFounderSearch(founder, search) && (!sector || founder.sector === sector) && (!stage || founder.stage === stage) && (!location || founderCountry(founder) === location)
    ) : founders
  const options = (key: 'sector' | 'stage') => [...new Set([
    ...(key === 'sector' ? collection.meta.sectors?.map(item => item[locale]) ?? [] : collection.meta.stages ?? []),
    ...founders.map(founder => founder[key]),
    key === 'sector' ? sector : stage,
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b, locale))
  function changeRegion(value: FounderRegionFilter) { setLocation(''); setRegion(value) }
  const control = "min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
  const label = "grid min-w-0 gap-2 text-xs font-bold text-[var(--text)]"
  const filtersKey = `${isSpotlight}-${linkedSlug}-${search}-${sector}-${stage}-${location}`

  return <PublicLayout><div className={styles.home} dir={direction} lang={locale}>
    <PageHero
      eyebrow={isSpotlight ? ar ? 'مؤسسون من السعودية والعالم' : 'Founders from Saudi Arabia and beyond' : copy.badge}
      title={copy.title}
      description={isSpotlight ? ar ? 'اكتشف المؤسسين وشركاتهم وخبراتهم في السعودية والخليج والعالم.' : 'Discover founders, their companies and their experience across Saudi Arabia, the Gulf and beyond.' : copy.description}
      actions={<><a href="#founder-directory" className={heroPrimary}>{ar ? 'تصفّح المؤسسين' : 'Browse founders'}<Arrow size={17} aria-hidden="true" /></a><Link href="/apply" className={heroSecondary}>{ar ? 'قدّم طلب العضوية' : 'Apply for membership'}</Link></>}
    />
    {collection.error && <div className={`${styles.container} ${styles.availability}`} role="status"><span>{ar ? 'ملفات أعضاء المجتمع غير متاحة مؤقتًا.' : 'Community member profiles are temporarily unavailable.'}</span><button type="button" disabled={collection.loading} onClick={collection.retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></div>}

    {featured.length > 0 && <section className={`${styles.container} ${styles.section}`} aria-labelledby="featured-founders-title">
      <p className={styles.eyebrow}>{copy.featuredEyebrow}</p><h2 id="featured-founders-title">{copy.featuredTitle}</h2>
      <FounderShowcase founders={featured} showFilters={false} visitSeed={visitSeed} focusLinkedFounder={false} />
    </section>}

    <section id="founder-directory" className={`${styles.container} ${styles.section}`} aria-labelledby="founder-results-title" style={{ scrollMarginTop: 100 }}>
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{isSpotlight ? ar ? 'أعمال وخبرات من المنطقة' : 'BUSINESSES AND EXPERIENCE FROM THE REGION' : copy.directoryEyebrow}</p><h2 id="founder-results-title">{isSpotlight ? ar ? 'استكشف ملفات المؤسسين' : 'Explore founder profiles' : copy.directoryTitle}</h2></div><Link className={styles.textLink} href="/startups">{ar ? 'دليل الشركات الناشئة' : 'Startup directory'}<Arrow size={17} aria-hidden="true" /></Link></div>
      {linkedSlug && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950"><p role="status">{collection.loading
        ? ar ? 'جارٍ البحث عن بطاقة المؤسس…' : 'Finding the founder card…'
        : filtered.length
        ? ar ? 'ملف المؤسس' : 'Founder profile'
        : ar ? 'هذا الملف غير متاح في الدليل العام حالياً.' : 'This profile is not currently available in the public directory.'}</p><Link href="/founders#founder-directory" className="inline-flex min-h-11 items-center font-bold underline">{ar ? 'عرض جميع المؤسسين' : 'Browse all founders'}</Link></div>}
      <div className="mt-7 grid min-w-0 gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 sm:p-5 lg:grid-cols-2">
        <label className={label}><span>{copy.searchAria}</span><span className="relative flex min-w-0 items-center"><Search size={17} aria-hidden="true" className="pointer-events-none absolute start-3 text-[var(--text-muted)]" /><input type="search" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.searchPlaceholder} className={`${control} ps-10`} /></span></label>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className={label}><span>{ar ? 'القطاع' : 'Sector'}</span><select value={sector} onChange={event => setSector(event.target.value)} className={control}><option value="">{copy.sectors[0]}</option>{options('sector').map(value => <option value={value} key={value}>{value}</option>)}</select></label>
          <label className={label}><span>{ar ? 'الدولة' : 'Country'}</span><select value={location} onChange={event => { const value = event.target.value; setLocation(value); setRegion(value ? countryRegion(value) : 'all') }} className={control}><option value="">{ar ? 'جميع الدول' : 'All countries'}</option>{countries.map(group => <optgroup label={group.label} key={group.region}>{group.countries.map(country => <option value={country.code} key={country.code}>{country.label}</option>)}</optgroup>)}</select></label>
          {options('stage').length > 0 && <label className={label}><span>{ar ? 'المرحلة' : 'Stage'}</span><select value={stage} onChange={event => setStage(event.target.value)} className={control}><option value="">{copy.stages[0]}</option>{options('stage').map(value => <option value={value} key={value}>{value}</option>)}</select></label>}
        </div>
        {linkedSlug ? <Link href="/founders#founder-directory" className="min-h-11 justify-self-start px-3 text-sm font-bold text-[var(--action-bg)] underline underline-offset-4">{ar ? 'العودة إلى الدليل' : 'Back to directory'}</Link> : hasFilters && <button type="button" className="min-h-11 justify-self-start px-3 text-sm font-bold text-[var(--action-bg)] underline underline-offset-4" onClick={() => { setSearch(''); setSector(''); setStage(''); setLocation(''); setRegion('all') }}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>}
      </div>
      {(searchPending || collection.loading && founders.length === 0) && <p role="status" className="py-8 text-center">{ar ? 'جارٍ تحميل الملفات العامة…' : 'Loading public profiles…'}</p>}
      <FounderShowcase key={filtersKey} founders={filtered} showFilters={false} region={region} onRegionChange={changeRegion} visitSeed={visitSeed} allRegions loading={searchPending || collection.loading && !founders.length} />
      {!isSpotlight && collection.hasMore && <div className="mt-7 text-center"><button type="button" className={styles.secondary} disabled={collection.loading} onClick={collection.loadMore}>{collection.loading ? ar ? 'جارٍ التحميل…' : 'Loading…' : ar ? 'تحميل المزيد من المؤسسين' : 'Load more founders'}</button></div>}
      {!isSpotlight && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5"><p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">{ar ? 'بعض الملفات الكاملة متاحة للأعضاء فقط. سجّل دخولك للوصول إلى التفاصيل والتواصل المباشر.' : 'Some full profiles are available to members only. Sign in to access details and direct introductions.'}</p><Link className={styles.secondary} href="/login">{copy.login}<Arrow size={16} aria-hidden="true" /></Link></div>}
    </section>

    <section className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-14" aria-labelledby="founder-join-title"><div className="mx-auto max-w-3xl text-center"><p className={styles.eyebrow}>{ar ? 'مجتمع من المؤسسين إلى المؤسسين' : 'A FOUNDER-TO-FOUNDER COMMUNITY'}</p><h2 id="founder-join-title">{copy.ctaTitle}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">{copy.ctaBody}</p><div className={`${styles.actions} justify-center`}><Link className={styles.primary} href="/apply">{copy.apply}</Link><Link className={styles.secondary} href="/contact">{copy.contact}</Link></div></div></section>
  </div></PublicLayout>
}
