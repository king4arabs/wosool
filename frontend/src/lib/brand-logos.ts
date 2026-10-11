import { publicWebsite } from './community-display'

// Resolve legacy API records to reviewed, local transparent artwork as well as
// updating the editorial snapshots. This requires no production data migration.
const transparentSources: Record<string, string> = {
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

/** Original white wordmarks need the existing themed dark header for contrast. */
export function brandLogoNeedsDarkSurface(src?: string) {
  return brandLogoSource(src) === '/startup-directory/rasan-logo.png'
}
