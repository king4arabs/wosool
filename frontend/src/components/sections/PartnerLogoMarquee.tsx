'use client'

import { BrandLogo } from '@/components/ui/BrandLogo'
import type { PartnerLogo } from '@/lib/partner-logos'
import styles from './PartnerLogoMarquee.module.css'

/** Physical rightward movement is identical in Arabic and English. */
export function PartnerLogoMarquee({ partners, label }: { partners: (PartnerLogo & { monochrome?: boolean })[]; label: string }) {
  if (!partners.length) return null
  // Fill wide screens even when a search leaves only a few matches. Extra copies
  // are decorative; each organization appears only once in the keyboard order.
  const repetitions = Math.max(1, Math.ceil(8 / partners.length))
  const slots = Array.from({ length: repetitions }, () => partners).flat()
  return <div className={styles.viewport} role="region" aria-label={label} data-partner-marquee>
    <div className={styles.track} style={{ animationDuration: `${Math.max(32, slots.length * 6)}s` }}>
      {[0, 1].map(copy => <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined} data-partner-copy={copy === 0 ? 'primary' : 'duplicate'}>
        {slots.map((partner, index) => <a key={`${partner.id}-${index}`} href={partner.website} target="_blank" rel="noopener noreferrer" tabIndex={copy || index >= partners.length ? -1 : 0} aria-hidden={index >= partners.length ? true : undefined} data-partner-id={partner.id} className={styles.slot} aria-label={partner.name_ar || partner.name_en}>
          <BrandLogo src={partner.logo_path} name={partner.name_ar || partner.name_en} className={`${styles.logo} ${partner.monochrome ? styles.monochrome : ''}`} loading="eager" />
          <span className={styles.name}>{partner.name_ar || partner.name_en}</span>
        </a>)}
      </div>)}
    </div>
  </div>
}
