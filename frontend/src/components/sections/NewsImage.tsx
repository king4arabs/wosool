"use client"

import { useState } from "react"
import { Newspaper } from "lucide-react"
import { safeNewsUrl } from "@/lib/news-feed"

/**
 * Publisher image when available; otherwise a typographic tile naming the source,
 * so stories without artwork still read as deliberate rather than broken.
 */
export function NewsImage({ src, alt, eager = false, label, aspect = "aspect-[16/10]" }: { src?: string; alt: string; eager?: boolean; label?: string; aspect?: string }) {
  const [failed, setFailed] = useState<string>()
  const image = safeNewsUrl(src) || (src?.startsWith("/") && !src.startsWith("//") ? src : undefined)
  return <div className={`relative flex ${aspect} w-full items-center justify-center overflow-hidden bg-[var(--surface-soft)] text-[var(--text-muted)]`}>
    {image && failed !== image ?
      // Publisher images are external; no server-side image proxy.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt} width={960} height={600} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-contain object-center p-3 sm:p-4" onError={() => setFailed(image)} /> :
      <div role="img" aria-label={alt} className="flex h-full w-full flex-col items-start justify-end gap-2 bg-[linear-gradient(135deg,var(--surface-inverse),color-mix(in_srgb,var(--surface-inverse)_70%,var(--brand-blue,#3B52D4)))] p-5 text-[var(--on-dark)]">
        <Newspaper size={28} aria-hidden="true" className="opacity-70" />
        {label && <span className="text-lg font-extrabold leading-tight">{label}</span>}
      </div>}
  </div>
}
