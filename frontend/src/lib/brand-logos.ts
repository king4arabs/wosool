import companyLogos from '../data/company-logos.json'
import { publicWebsite } from './community-display'

// Resolve legacy API records to reviewed, local transparent artwork as well as
// updating the editorial snapshots. This requires no production data migration.
const transparentSources: Record<string, string> = {
  'https://thegarage.sa/assets/images/logo/logo.png': '/partners/the-garage.png',
  'https://brand.misk.org.sa/wp-content/uploads/2025/06/Misk_P_H_RGB.svg': '/partners/misk.svg',
  'https://www.humain.com/content/dam/PIF-Humain/hero-logos/humain-logo.svg': '/partners/humain.svg',
  'https://www.rdia.gov.sa/images/logo.svg': '/partners/rdia.svg',
  '/partners/eo-riyadh-supplied.png': '/partners/eo-riyadh.png',
  'https://naua.tech/assets/images/partners/code.png': '/partners/code.png',
  'https://www.armadaiq.com/_next/static/media/Lamarka.69833ab9.png': '/partners/lamarka.png',
  '/startup-directory/canva-logo.webp': '/startup-directory/canva-logo.svg',
  'https://logowik.com/content/uploads/images/foodics9346.jpg': '/startup-directory/foodics-logo.svg',
  'https://egyptinnovate-prod-upload-bucket.obs.af-north-1.myhuaweicloud.com/37927/01KKTFAHN3XAV1PBSE3GSDCVCZ.jpg': '/startup-directory/paymob-logo.svg',
  'https://rasan.sa/_assets/imgs/kCL0EjSWHz-112.jpeg': '/startup-directory/rasan-logo.png',
  'https://swarmrobotics.io/_app/immutable/assets/swarm-logo.5jvVSQNz.svg': '/startup-directory/swarm-logo.svg',
  'https://jahezgroup.com/wp-content/uploads/2025/07/Jahez-Logo-Red-EN-768x191.webp': '/startup-directory/jahez-logo.webp',
}

export function brandLogoSource(src?: string) {
  const candidate = src?.startsWith('/') && !src.startsWith('//') && !src.includes('\\') ? src : publicWebsite(src)
  return candidate ? transparentSources[candidate] || candidate : undefined
}

/** Exact official host matching prevents similarly named companies receiving the wrong logo. */
export function reviewedCompanyLogo(website?: string) {
  const safe = publicWebsite(website)
  if (!safe) return undefined
  const host = new URL(safe).hostname.toLowerCase().replace(/^www\./, '')
  return companyLogos.find(logo => new URL(logo.website).hostname.toLowerCase().replace(/^www\./, '') === host)?.src
}

/** Original white wordmarks need the existing themed dark header for contrast. */
export function brandLogoNeedsDarkSurface(src?: string, website?: string) {
  const source = brandLogoSource(src) || reviewedCompanyLogo(website)
  return ['/startup-directory/rasan-logo.png', '/partners/lamarka.png'].includes(source ?? '') || companyLogos.some(logo => logo.src === source && logo.tone === 'dark')
}
