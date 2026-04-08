"use client"

import type { Partner } from "@/types"
import { ExternalLink } from "lucide-react"

interface PartnerLogoSliderProps {
  partners: Partner[]
}

export function PartnerLogoSlider({ partners }: PartnerLogoSliderProps) {
  // Duplicate items for seamless infinite scroll effect
  const duplicated = [...partners, ...partners]

  return (
    <div className="relative overflow-hidden py-8">
      <div className="flex animate-scroll gap-12 items-center">
        {duplicated.map((partner, idx) => {
          const initials = partner.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()

          return (
            <a
              key={`${partner.id}-${idx}`}
              href={partner.website || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
              title={partner.name}
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="h-16 w-auto max-w-[140px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                />
              ) : (
                <div className="h-16 w-32 rounded-xl bg-white/80 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-[#C9A84C] group-hover:bg-white transition-all duration-300 shadow-sm">
                  {initials}
                </div>
              )}
              <span className="text-xs text-gray-400 group-hover:text-[#C9A84C] transition-colors font-medium">
                {partner.name}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
