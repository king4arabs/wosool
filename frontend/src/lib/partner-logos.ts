import { brandLogoSource } from './brand-logos'
import { boardExternalUrl } from './eoa-board'

export type PartnerLogo = {
  id: string | number
  name_ar: string
  name_en: string
  website?: string
  logo_path?: string
}

// Owner-requested display list (2026-10-11), used only while the public API is
// unavailable. A successful API response, including an empty list, takes priority.
// Artwork sources and unresolved assets: docs/PARTNER-CAROUSEL-2026-10-11.md.
const eo: PartnerLogo = { id: 'eo-riyadh', name_ar: 'EO الرياض', name_en: 'EO Riyadh', website: 'https://eoriyadh.org/', logo_path: '/partners/eo-riyadh.png' }
const garage: PartnerLogo = { id: 'the-garage', name_ar: 'الكراج', name_en: 'The Garage', website: 'https://thegarage.sa/', logo_path: '/partners/the-garage.png' }
const misk: PartnerLogo = { id: 'misk', name_ar: 'مؤسسة مسك', name_en: 'Misk Foundation', website: 'https://misk.org.sa/en/', logo_path: '/partners/misk.svg' }
const code: PartnerLogo = { id: 'code', name_ar: 'مركز ريادة الأعمال الرقمية · كود', name_en: 'CODE · Digital Entrepreneurship', website: 'https://mcit.gov.sa/code', logo_path: '/partners/code.png' }
const lamarka: PartnerLogo = { id: 'lamarka', name_ar: 'لاماركا', name_en: 'LAMARKA', website: 'https://www.lamarka.com/', logo_path: '/partners/lamarka.png' }
const humain: PartnerLogo = { id: 'humain', name_ar: 'هيوماين', name_en: 'HUMAIN', website: 'https://www.humain.com/', logo_path: '/partners/humain.svg' }

export const communityPartnerLogos = [eo, garage, misk, code]
export const acceleratorPartnerLogos = [eo, garage, misk, code, lamarka, humain]

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
