"use client"

import { MapPin, ArrowLeft, ArrowRight, Rocket } from "lucide-react"
import type { Entrepreneur } from "@/types/entrepreneur"
import { CartoonAvatar } from "@/components/avatars/CartoonAvatar"
import { useLocale } from "@/lib/locale"

const stageColors: Record<string, { bg: string; text: string }> = {
  Idea:        { bg: "#F8FAFC", text: "#475569" },
  Prototype:   { bg: "#FDF4FF", text: "#86198F" },
  MVP:         { bg: "#F0F9FF", text: "#0369A1" },
  "Pre-Seed":  { bg: "#F0FDF4", text: "#166534" },
  Seed:        { bg: "#EFF6FF", text: "#1D4ED8" },
  "Series A":  { bg: "#FFF7ED", text: "#9A3412" },
  Growth:      { bg: "#FAF5FF", text: "#6B21A8" },
}

interface EntrepreneurCardProps {
  entrepreneur: Entrepreneur
  onViewProfile: (entrepreneur: Entrepreneur) => void
}

export function EntrepreneurCard({ entrepreneur, onViewProfile }: EntrepreneurCardProps) {
  const { locale, direction } = useLocale()
  const stagePill = stageColors[entrepreneur.startupStage] ?? { bg: "#EEF1FF", text: "#3B52D4" }
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight
  const viewProfileLabel = locale === "ar" ? "عرض الملف" : "View Profile"
  const avatarAlt = `Cartoon avatar of ${entrepreneur.fullName}, entrepreneur from ${entrepreneur.country}.`

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#3B52D4]/25 hover:shadow-[0_8px_32px_-4px_rgba(59,82,212,0.12)]"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Avatar + identity */}
        <div className="flex items-start gap-3">
          <CartoonAvatar
            seed={entrepreneur.id}
            gender={entrepreneur.avatar.gender}
            alt={avatarAlt}
            size={52}
            className="ring-2 ring-[#EEF1FF]"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-black text-slate-900">{entrepreneur.fullName}</h3>
            <p className="flex items-center gap-1 truncate text-xs font-bold text-[#3B52D4]">
              <Rocket className="h-3 w-3 shrink-0" aria-hidden="true" />
              {entrepreneur.startupName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              {entrepreneur.city}, {entrepreneur.country}
            </p>
          </div>
        </div>

        {/* Short bio */}
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
          {entrepreneur.shortBio}
        </p>

        {/* Sector + stage */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-2.5 py-1 text-xs font-bold text-[#3B52D4]">
            {entrepreneur.sector}
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-bold"
            style={{ background: stagePill.bg, color: stagePill.text, borderColor: stagePill.bg }}
          >
            {entrepreneur.startupStage}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-3">
          {entrepreneur.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => onViewProfile(entrepreneur)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-[#3B52D4]/40 hover:bg-[#EEF1FF]/40 hover:text-[#3B52D4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B52D4]"
          aria-label={`${viewProfileLabel}: ${entrepreneur.fullName}`}
        >
          {viewProfileLabel}
          <ArrowIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
