import { brandLogoSource } from './brand-logos'
import { publicWebsite } from './community-display'

const logos: Record<string, string> = {
  'eoriyadh.org': '/partners/eo-riyadh.png',
  'thegarage.sa': '/partners/the-garage.png',
  'rdia.gov.sa': '/partners/rdia.svg',
  'misk.org.sa': '/partners/misk.svg',
  'mcit.gov.sa': '/partner-ecosystem/mcit.svg',
  'monshaat.gov.sa': '/partner-ecosystem/monshaat-official.png',
  'ntdp.mcit.gov.sa': '/partners/ntdp.svg',
  'ntdp.gov.sa': '/partners/ntdp.svg',
  'lamarka.com': '/partners/lamarka.png',
  'humain.com': '/partners/humain.svg',
}

/** Resolve missing legacy logos without changing an administrator's uploaded artwork. */
export function eoaOrganizationLogo(organization: { website?: string; logo_path?: string | null }) {
  const supplied = brandLogoSource(organization.logo_path ?? undefined)
  if (supplied) return supplied
  const website = publicWebsite(organization.website)
  if (!website) return undefined
  const url = new URL(website)
  const host = url.hostname.replace(/^www\./, '')
  if (host === 'mcit.gov.sa' && /^\/code\/?$/.test(url.pathname)) return '/partners/code.png'
  return logos[host]
}
