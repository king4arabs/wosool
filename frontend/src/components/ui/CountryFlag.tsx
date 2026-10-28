"use client"

import Image from 'next/image'
import { countryCode, countryName } from '@/lib/directory-geography'

/** Local vectors stay sharp at compact sizes and work without a third-party CDN. */
export function CountryFlag({ code, locale }: { code?: string; locale: 'ar' | 'en' }) {
  const valid = countryCode(code)
  if (!valid) return null
  const label = countryName(valid, locale)
  return <Image src={`/flags/${valid.toLowerCase()}.svg`} width={28} height={21} alt={label} title={label} unoptimized />
}
