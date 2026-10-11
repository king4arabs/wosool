'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './Logo.module.css'

/** Frame the original transparent chapter artwork with clear space on every side. */
export function EoaLogo({
  inverse = false,
  className = '',
  priority = false,
}: {
  inverse?: boolean
  className?: string
  priority?: boolean
}) {
  const src = inverse ? '/partners/eo-riyadh-inverse.png' : '/partners/eo-riyadh.png'
  const [failed, setFailed] = useState<string | null>(null)
  // Alpha bounds plus 160px of transparent clear space; no artwork is cropped.
  const canvas = inverse ? { width: 6665, left: 1557, frame: 3515 } : { width: 6666, left: 1548, frame: 3534 }
  return (
    <span className={`eoa-logo ${styles.logo} ${className}`} data-inverse={inverse} style={{ aspectRatio: `${canvas.frame} / 1359` }}>
      {failed === src ? <span className={styles.fallback}>EO Riyadh</span> : <Image
        src={src}
        alt="EO Riyadh"
        width={canvas.width}
        height={3201}
        sizes="(max-width: 600px) 320px, 400px"
        priority={priority}
        className={styles.canvas}
        style={{ width: `${canvas.width / canvas.frame * 100}%`, left: `${-canvas.left / canvas.frame * 100}%`, top: `${-921 / 1359 * 100}%` }}
        onError={() => setFailed(src)}
      />}
    </span>
  )
}
