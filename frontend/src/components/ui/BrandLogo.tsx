"use client"

import Image from "next/image"
import { useState } from "react"
import { EoaLogo } from "@/components/eoa/Logo"
import { brandLogoSource, reviewedCompanyLogo, brandLogoNeedsDarkSurface, logoPixelsNeedDarkSurface } from "@/lib/brand-logos"
import { publicWebsite } from '@/lib/community-display'
import styles from "./BrandLogo.module.css"

// Original raster canvases include large transparent margins. SVG's viewBox
// frames their visible artwork plus clear space without altering the artwork.
const frames: Record<string, { width: number; height: number; viewBox: string }> = {
  '/company-logos/abwaab.jpg': { width: 768, height: 324, viewBox: '146 86 348 154' },
  '/partner-ecosystem/monshaat-official.png': { width: 1080, height: 1080, viewBox: '36 181 1008 718' },
  '/partners/code.png': { width: 450, height: 450, viewBox: '58 105 332 222' },
  '/partners/pwc.svg': { width: 70, height: 53, viewBox: '0 12 70 41' },
  '/startup-directory/kitopi-logo.png': { width: 4000, height: 1542, viewBox: '326 242 3349 1053' },
  '/startup-directory/salla-logo.png': { width: 1500, height: 1500, viewBox: '321 164 858 1173' },
}

/** Display original logo colors and alpha in a stable, uncropped contain box. */
export function BrandLogo({ src, name, website, className = "", loading }: { src?: string; name: string; website?: string; className?: string; loading?: 'eager' | 'lazy' }) {
  const [detectedDarkSource, setDetectedDarkSource] = useState<string>()
  const [failed, setFailed] = useState<string[]>([])
  const officialWebsite = publicWebsite(website)
  const favicon = officialWebsite ? new URL('/favicon.ico', officialWebsite).href : undefined
  const primarySource = brandLogoSource(src)
  const source = [primarySource, reviewedCompanyLogo(website), favicon].find(candidate => candidate && !failed.includes(candidate))
  const fail = () => { if (source) setFailed(previous => [...previous, source]) }
  const inspectContrast = (image: HTMLImageElement) => {
    if (!source || !image.naturalWidth || !image.naturalHeight) return
    // Do not request cross-origin access or change how external images load.
    if (new URL(image.currentSrc || image.src, window.location.href).origin !== window.location.origin) return
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, 32, 32)
      if (logoPixelsNeedDarkSurface(context.getImageData(0, 0, 32, 32).data)) setDetectedDarkSource(source)
    } catch { /* An unreadable image retains its reviewed surface. */ }
  }
  const dark = brandLogoNeedsDarkSurface(source) || detectedDarkSource === source && Boolean(source)
  const eo = source && ['/partners/eo-riyadh.png', '/partners/eo-riyadh-inverse.png', '/partners/eo-riyadh-supplied.png'].includes(source)
  const frame = source ? frames[source] : undefined

  return <span className={`${styles.logo} ${dark ? styles.darkSurface : ''} ${className}`} data-brand-logo data-logo-tone={dark ? 'dark' : 'light'} data-compact={source === '/startup-directory/rasan-logo.png' || undefined}>
    {eo ? <EoaLogo inverse={source === '/partners/eo-riyadh-inverse.png'} className={styles.eo} loading={loading} /> : source ? frame ? <svg
      className={styles.framed}
      viewBox={frame.viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={name}
    ><image href={source} width={frame.width} height={frame.height} onError={fail} /></svg> : <Image
      src={source}
      alt={name}
      fill
      sizes="(max-width: 600px) 160px, 190px"
      className={`${styles.image} ${source === favicon ? styles.favicon : ''}`}
      unoptimized
      loading={loading}
      onError={fail}
      onLoad={event => inspectContrast(event.currentTarget)}
    /> : <span className={styles.fallback}>{name}</span>}
  </span>
}
