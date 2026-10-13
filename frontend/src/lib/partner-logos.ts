import { brandLogoSource } from './brand-logos'
import { boardExternalUrl } from './eoa-board'

export type PartnerLogo = {
  id: string | number
  name_ar: string
  name_en: string
  website?: string
  logo_path?: string
}

// Owner-requested display list (2026-10-11). Shown whenever the public API has no
// published partners to display (outage or empty list, owner instruction 2026-10-13);
// published API partners take priority. Sources: docs/PARTNER-CAROUSEL-2026-10-11.md.
const eo: PartnerLogo = { id: 'eo-riyadh', name_ar: 'EO الرياض', name_en: 'EO Riyadh', website: 'https://eoriyadh.org/', logo_path: '/partners/eo-riyadh.png' }
const garage: PartnerLogo = { id: 'the-garage', name_ar: 'الكراج', name_en: 'The Garage', website: 'https://thegarage.sa/', logo_path: '/partners/the-garage.png' }
const misk: PartnerLogo = { id: 'misk', name_ar: 'مؤسسة مسك', name_en: 'Misk Foundation', website: 'https://misk.org.sa/en/', logo_path: '/partners/misk.svg' }
const code: PartnerLogo = { id: 'code', name_ar: 'مركز ريادة الأعمال الرقمية · كود', name_en: 'CODE · Digital Entrepreneurship', website: 'https://mcit.gov.sa/code', logo_path: '/partners/code.png' }
const lamarka: PartnerLogo = { id: 'lamarka', name_ar: 'لاماركا', name_en: 'LAMARKA', website: 'https://www.lamarka.com/', logo_path: '/partners/lamarka.png' }
const humain: PartnerLogo = { id: 'humain', name_ar: 'هيوماين', name_en: 'HUMAIN', website: 'https://www.humain.com/', logo_path: '/partners/humain.svg' }
const cipherVentures: PartnerLogo = { id: 'cipher-ventures', name_ar: 'سايفر فينتشرز', name_en: 'Cipher Ventures', website: 'https://www.cipherventures.sa/', logo_path: 'https://github.com/user-attachments/assets/b9cb90be-b844-4ec2-b8a7-8612ae762ea9' }
const rdia: PartnerLogo = { id: 'rdia', name_ar: 'هيئة تنمية البحث والتطوير والابتكار', name_en: 'Research, Development and Innovation Authority', website: 'https://www.rdia.gov.sa/', logo_path: '/partners/rdia.svg' }

export const communityPartnerLogos = [eo, garage, misk, code, cipherVentures, rdia]
export const acceleratorPartnerLogos = [eo, garage, misk, code, lamarka, humain, cipherVentures, rdia]

/** Canonical artwork prevents an old hotlink and its local copy appearing twice. */
export function uniquePartnerLogos(partners: PartnerLogo[], includeEo = false): PartnerLogo[] {
  const unique = new Map<string, PartnerLogo>()
  for (const partner of [...(includeEo ? [eo] : []), ...partners]) {
    if (!partner.name_ar?.trim() && !partner.name_en?.trim()) continue
    const logo = brandLogoSource(partner.logo_path)
    const website = boardExternalUrl(partner.website) ?? undefined
    const key = logo || (website ? new URL(website).hostname.replace(/^www\./, '') : String(partner.id))
    unique.set(key, { ...partner, logo_path: logo, website })
  }
  return [...unique.values()]
}

/** Published partners when there are any; otherwise the owner's display list, so the strip is never empty. */
export function partnersToDisplay(published: PartnerLogo[] | null | undefined, fallback: PartnerLogo[]): PartnerLogo[] {
  return published && published.some(partner => partner.logo_path) ? published : fallback
}
