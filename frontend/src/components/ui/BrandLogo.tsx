"use client"

import Image from "next/image"
import { useState } from "react"
import { EoaLogo } from "@/components/eoa/Logo"
import { brandLogoSource } from "@/lib/brand-logos"
import styles from "./BrandLogo.module.css"

// Original raster canvases include large transparent margins. SVG's viewBox
// frames their visible artwork plus clear space without altering the artwork.
const frames: Record<string, { width: number; height: number; viewBox: string }> = {
  '/startup-directory/kitopi-logo.png': { width: 4000, height: 1542, viewBox: '326 242 3349 1053' },
  '/startup-directory/salla-logo.png': { width: 1500, height: 1500, viewBox: '321 164 858 1173' },
}

/** Display original logo colors and alpha in a stable, uncropped contain box. */
export function BrandLogo({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  const source = brandLogoSource(src)
  const eo = source && ['/partners/eo-riyadh.png', '/partners/eo-riyadh-inverse.png', '/partners/eo-riyadh-supplied.png'].includes(source)
  const frame = source ? frames[source] : undefined

  return <span className={`${styles.logo} ${className}`} data-brand-logo data-compact={source === '/startup-directory/rasan-logo.png' || undefined}>
    {eo ? <EoaLogo inverse={source === '/partners/eo-riyadh-inverse.png'} className={styles.eo} /> : source && failed !== source ? frame ? <svg
      className={styles.framed}
      viewBox={frame.viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={name}
    ><image href={source} width={frame.width} height={frame.height} onError={() => setFailed(source)} /></svg> : <Image
      src={source}
      alt={name}
      fill
      sizes="(max-width: 600px) 160px, 190px"
      className={styles.image}
      unoptimized
      onError={() => setFailed(source)}
    /> : <span className={styles.fallback}>{name}</span>}
  </span>
}
