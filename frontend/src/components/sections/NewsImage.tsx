"use client"

import { useState } from "react"
import { Newspaper } from "lucide-react"
import { safeNewsUrl } from "@/lib/news-feed"

export function NewsImage({ src, alt, eager = false }: { src?: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState<string>()
  const image = safeNewsUrl(src) || (src?.startsWith("/") && !src.startsWith("//") ? src : undefined)
  return <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-[var(--surface-soft)] text-[var(--text-muted)]">
    {image && failed !== image ?
      // Publisher images are external; no server-side image proxy.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt} width={960} height={600} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailed(image)} /> :
      <Newspaper size={48} aria-label={alt} />}
  </div>
}
