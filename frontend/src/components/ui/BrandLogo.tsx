"use client"

import Image from "next/image"
import { useState } from "react"
import { EoaLogo } from "@/components/eoa/Logo"
import { brandLogoSource } from "@/lib/brand-logos"
import { publicWebsite } from '@/lib/community-display'
import styles from "./BrandLogo.module.css"

// Original raster canvases include large transparent margins. SVG's viewBox
// frames their visible artwork plus clear space without altering the artwork.
const frames: Record<string, { width: number; height: number; viewBox: string }> = {
  '/partners/code.png': { width: 450, height: 450, viewBox: '58 105 332 222' },
  '/partners/pwc.svg': { width: 70, height: 53, viewBox: '0 12 70 41' },
  '/startup-directory/kitopi-logo.png': { width: 4000, height: 1542, viewBox: '326 242 3349 1053' },
  '/startup-directory/salla-logo.png': { width: 1500, height: 1500, viewBox: '321 164 858 1173' },
}

/** Display original logo colors and alpha in a stable, uncropped contain box. */
export function BrandLogo({ src, name, website, className = "", loading }: { src?: string; name: string; website?: string; className?: string; loading?: 'eager' | 'lazy' }) {
  const [failed, setFailed] = useState<string[]>([])
  const officialWebsite = publicWebsite(website)
  const favicon = officialWebsite ? new URL('/favicon.ico', officialWebsite).href : undefined
  const primarySource = brandLogoSource(src)
  const source = [primarySource, favicon].find(candidate => candidate && !failed.includes(candidate))
  const fail = () => { if (source) setFailed(previous => [...previous, source]) }
  const eo = source && ['/partners/eo-riyadh.png', '/partners/eo-riyadh-inverse.png', '/partners/eo-riyadh-supplied.png'].includes(source)
  const frame = source ? frames[source] : undefined

  return <span className={`${styles.logo} ${className}`} data-brand-logo data-compact={source === '/startup-directory/rasan-logo.png' || undefined}>
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
    /> : <span className={styles.fallback}>{name}</span>}
  </span>
}
