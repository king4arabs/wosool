'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import type { EoaPartner, Organization } from '@/lib/eoa'
import { eoaOrganizationsForDiscovery, filterEoaOrganizations, type EoaOrganizationCategory, type EoaOrganizationRegion } from '@/lib/eoa-partner-discovery'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { PartnerCarousel } from './PartnerCarousel'
import styles from './PartnerExplorer.module.css'

const categories: { id: EoaOrganizationCategory | 'all'; ar: string; en: string }[] = [
  { id: 'all', ar: 'جميع الجهات', en: 'All organizations' },
  { id: 'government', ar: 'الجهات الحكومية', en: 'Government' },
  { id: 'bank', ar: 'البنوك', en: 'Banks' },
  { id: 'pif', ar: 'شركات الصندوق', en: 'PIF companies' },
  { id: 'university', ar: 'الجامعات', en: 'Universities' },
  { id: 'vc', ar: 'المستثمرون', en: 'Investors' },
  { id: 'listed', ar: 'الشركات المدرجة', en: 'Listed companies' },
  { id: 'additional', ar: 'جهات أخرى', en: 'Other organizations' },
]
const regions: { id: EoaOrganizationRegion | 'all'; ar: string; en: string }[] = [
  { id: 'all', ar: 'جميع المناطق', en: 'All regions' },
  { id: 'saudi', ar: 'السعودية', en: 'Saudi Arabia' },
  { id: 'gcc', ar: 'الخليج', en: 'GCC' },
  { id: 'mena', ar: 'الشرق الأوسط وشمال أفريقيا', en: 'MENA' },
  { id: 'world', ar: 'عالمي', en: 'Global' },
]
const pageSize = 12

/** An ecosystem directory is for discovery; it does not assert formal partnerships. */
export function EoaPartnerExplorer({ ar, published, confirmed }: {
  ar: boolean
  published: Organization[]
  confirmed: EoaPartner[]
}) {
  const [category, setCategory] = useState<EoaOrganizationCategory | 'all'>('all')
  const [region, setRegion] = useState<EoaOrganizationRegion | 'all'>('all')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(pageSize)

  const organizations = useMemo(() => eoaOrganizationsForDiscovery(published, confirmed), [published, confirmed])
  const selected = useMemo(() => filterEoaOrganizations(organizations, { category, region, query }), [organizations, category, region, query])
  const categoryCounts = useMemo(() => new Map(categories.map(item => [item.id, item.id === 'all' ? organizations.length : organizations.filter(org => org.category === item.id).length])), [organizations])
  const format = (value: number) => new Intl.NumberFormat(ar ? 'ar-u-nu-latn' : 'en').format(value)
  const clear = () => { setCategory('all'); setRegion('all'); setQuery(''); setVisibleCount(pageSize) }
  const selectedCategory = categories.find(item => item.id === category)
  const selectedRegion = regions.find(item => item.id === region)
  const labels = (item: { ar: string; en: string }) => ar ? item.ar : item.en

  return <div className={styles.root} data-eoa-partner-explorer>
    <section id="eoa-logo-slider" className={styles.explorer} aria-labelledby="eoa-explorer-title">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{ar ? 'دليل الاستكشاف' : 'EXPLORE THE ECOSYSTEM'}</p>
          <h2 id="eoa-explorer-title">{ar ? 'جهات تصنع فرصًا للمؤسسين' : 'Organizations to explore'}</h2>
          <p>{ar
            ? 'استعرض الجهات حسب القطاع والموقع، وانتقل إلى مواقعها الرسمية للتعرّف على خدماتها وبرامجها.'
            : 'Explore organizations by sector and location, then visit their official websites to learn about their services and programs.'}</p>
        </div>
        <div className={styles.count} aria-label={ar ? 'عدد الجهات في الدليل' : 'Organizations in the directory'}>
          <strong>{format(organizations.length)}</strong>
          <span>{ar ? 'جهة مدرجة' : 'listed organizations'}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterHead}>
          <label htmlFor="eoa-organization-search">{ar ? 'البحث في الجهات' : 'Search organizations'}</label>
          <div className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input id="eoa-organization-search" type="search" value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(pageSize) }} placeholder={ar ? 'ابحث بالاسم أو الخدمة…' : 'Search by name or service…'} />
            {query && <button type="button" onClick={() => { setQuery(''); setVisibleCount(pageSize) }} aria-label={ar ? 'مسح البحث' : 'Clear search'}><X size={17} aria-hidden="true" /></button>}
          </div>
        </div>
        <div className={styles.filterBlock}>
          <p id="eoa-category-label">{ar ? 'القطاع' : 'Sector'}</p>
          <div className={styles.pills} role="group" aria-labelledby="eoa-category-label">
            {categories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setVisibleCount(pageSize) }}>
              {labels(item)} <span>{format(categoryCounts.get(item.id) ?? 0)}</span>
            </button>)}
          </div>
        </div>
        <div className={styles.filterBlock}>
          <p id="eoa-region-label">{ar ? 'النطاق الجغرافي' : 'Region'}</p>
          <div className={styles.pills} role="group" aria-labelledby="eoa-region-label">
            {regions.map(item => <button key={item.id} type="button" aria-pressed={region === item.id} onClick={() => { setRegion(item.id); setVisibleCount(pageSize) }}>{labels(item)}</button>)}
          </div>
        </div>
      </div>

      <div className={styles.resultsHead} aria-live="polite">
        <span>{ar ? 'الجهات المعروضة:' : 'Matching organizations:'} <strong>{format(selected.length)}</strong></span>
        {(category !== 'all' || region !== 'all' || query) && <button type="button" onClick={clear}>{ar ? 'إعادة ضبط الفلاتر' : 'Reset filters'} <X size={15} aria-hidden="true" /></button>}
      </div>
      {selected.length ? <div className={styles.slider} data-eoa-all-partner-logos>
        <PartnerCarousel partners={selected} ar={ar} includeEo={false} headingId="eoa-directory-carousel-title"
          heading={ar ? 'شعارات الجهات في الدليل' : 'Directory organization logos'}
          allLabel={ar ? 'عرض جميع الشعارات' : 'View all logos'} />
      </div> : <div role="status" className={styles.noResults}>{ar ? 'لا توجد جهات مطابقة لهذه الفلاتر.' : 'No organizations match these filters.'} <button type="button" onClick={clear}>{ar ? 'إظهار الجميع' : 'Show all'}</button></div>}
      <p className={styles.disclaimer}>{ar
        ? 'إدراج الجهات هنا للتعريف بمنظومة ريادة الأعمال ولا يعني وجود شراكة أو رعاية أو عضوية مع مسرّعة EO الرياض. تُعرض الشراكات الرسمية بصورة منفصلة بعد اعتمادها.'
        : 'Directory listings are for ecosystem discovery only; they do not imply a partnership, sponsorship or membership with EO Riyadh Accelerator. Confirmed program partnerships are presented separately.'}</p>
    </section>

    <section id="eoa-ecosystem" className={styles.directorySection} aria-labelledby="eoa-directory-title">
      <div className={styles.directoryHeading}>
        <div>
          <p className={styles.eyebrow}>{ar ? 'الجهات والخدمات' : 'ORGANIZATIONS & SERVICES'}</p>
          <h2 id="eoa-directory-title">{ar ? 'تصفّح دليل الجهات' : 'Browse the organization directory'}</h2>
          <p>{labels(selectedCategory ?? categories[0])} · {labels(selectedRegion ?? regions[0])}</p>
        </div>
        <span className={styles.directoryCount}>{ar ? 'عرض' : 'Showing'} {format(Math.min(selected.length, visibleCount))} / {format(selected.length)}</span>
      </div>
      <div className={styles.cards} data-eoa-curated-organizations>
        {selected.slice(0, visibleCount).map(item => <article key={item.id} className={styles.card}>
          <div className={styles.logoBox}><BrandLogo src={item.logo_path} name={ar ? item.name_ar : item.name_en} website={item.website} /></div>
          <div className={styles.cardBody}>
            <p className={styles.cardCategory}>{labels(categories.find(entry => entry.id === item.category) ?? categories[0])} · {labels(regions.find(entry => entry.id === item.region) ?? regions[0])}</p>
            <h3>{ar ? item.name_ar : item.name_en}</h3>
            {item.support_ar || item.support_en ? <p className={styles.cardSupport}>{ar ? item.support_ar || item.support_en : item.support_en || item.support_ar}</p> : null}
            {item.website && <a className={styles.website} href={item.website} target="_blank" rel="noopener noreferrer">{ar ? 'الموقع الرسمي' : 'Official website'} <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>
        </article>)}
      </div>
      {selected.length > visibleCount && <button type="button" className={styles.showMore} onClick={() => setVisibleCount(count => count + pageSize)}>
        {ar ? 'عرض المزيد من الجهات' : 'Show more organizations'} ({format(selected.length - visibleCount)})
      </button>}
    </section>
  </div>
}
