'use client'

import { BrandLogo } from '@/components/ui/BrandLogo'
import type { PartnerLogo } from '@/lib/partner-logos'
import styles from './PartnerLogoMarquee.module.css'

/** Physical rightward movement is identical in Arabic and English. */
export function PartnerLogoMarquee({ partners, label }: { partners: (PartnerLogo & { monochrome?: boolean })[]; label: string }) {
  if (!partners.length) return null
  return <div className={styles.viewport} role="region" aria-label={label} data-partner-marquee>
    <div className={styles.track} style={{ animationDuration: `${Math.max(32, partners.length * 6)}s` }}>
      {[0, 1].map(copy => <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
        {partners.map(partner => <a key={partner.id} href={partner.website} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : 0} className={styles.slot} aria-label={partner.name_ar || partner.name_en}>
          <BrandLogo src={partner.logo_path} name={partner.name_ar || partner.name_en} className={`${styles.logo} ${partner.monochrome ? styles.monochrome : ''}`} loading="eager" />
          <span className={styles.name}>{partner.name_ar || partner.name_en}</span>
        </a>)}
      </div>)}
    </div>
  </div>
}
