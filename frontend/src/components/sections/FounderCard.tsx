"use client"

import Link from "next/link"
import type { Founder } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { getInitials } from "@/lib/utils"

const stageColors: Record<string, { bg: string; text: string }> = {
  "Pre-seed":        { bg: "#F0FDF4", text: "#166534" },
  "ما قبل البذرة":   { bg: "#F0FDF4", text: "#166534" },
  Seed:              { bg: "#EFF6FF", text: "#1d4ed8" },
  "البذرة":          { bg: "#EFF6FF", text: "#1d4ed8" },
  "Series A":        { bg: "#FFF7ED", text: "#9a3412" },
  "السلسلة A":       { bg: "#FFF7ED", text: "#9a3412" },
  "Scale-up":        { bg: "#FAF5FF", text: "#6b21a8" },
  "التوسّع":         { bg: "#FAF5FF", text: "#6b21a8" },
  Exited:            { bg: "#F8FAFC", text: "#475569" },
  "مؤسس متخارج":    { bg: "#F8FAFC", text: "#475569" },
}

interface FounderCardProps {
  founder: Founder
}

export function FounderCard({ founder }: FounderCardProps) {
  const { locale, direction } = useLocale()
  const initials = getInitials(founder.name)
  const stagePill = stageColors[founder.stage] ?? { bg: "#EEF1FF", text: "#3B52D4" }

  const copy = {
    ar: { verified: "موثّق", needs: "يبحث عن", offers: "يقدّم", connect: "تواصل" },
    en: { verified: "Verified", needs: "Needs", offers: "Offers", connect: "Connect" },
    fr: { verified: "Vérifié",  needs: "Recherche", offers: "Apporte", connect: "Contacter" },
  }[locale]

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  return (
    <div
      className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "0 8px 32px -4px rgba(59,82,212,0.12), 0 2px 8px -2px rgba(15,22,40,0.04)"
        el.style.borderColor = "rgba(59,82,212,0.22)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = "0 2px 12px -2px rgba(15,22,40,0.06)"
        el.style.borderColor = "rgba(226,232,240,0.8)"
      }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#3B52D4]/60 to-transparent" />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Avatar + name row */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-[#EEF1FF]">
            <AvatarFallback className="bg-[#EEF1FF] text-[#3B52D4] text-sm font-black">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 truncate">{founder.name}</h3>
              {founder.isVerified && (
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{ background: "#EEF1FF", color: "#3B52D4" }}
                >
                  <span className="w-1 h-1 rounded-full bg-[#3B52D4]" />
                  {copy.verified}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">{founder.companyName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-400">{founder.location}</span>
            </div>
          </div>

          {/* Score pill */}
          <div
            className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
            style={{ background: "#FFF7ED" }}
          >
            <Sparkles className="h-2.5 w-2.5" style={{ color: "#ea580c" }} />
            <span className="text-[10px] font-black" style={{ color: "#ea580c" }}>{founder.score}</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{founder.tagline}</p>

        {/* Sector + Stage */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EEF1FF] text-[#3B52D4] border border-[#E4E7F0]">
            {founder.sector}
          </span>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
            style={{
              background: stagePill.bg,
              color: stagePill.text,
              borderColor: stagePill.bg,
            }}
          >
            {founder.stage}
          </span>
        </div>

        {/* Needs & Offers */}
        {(founder.needs.length > 0 || founder.offers.length > 0) && (
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            {founder.needs.length > 0 && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-px shrink-0">
                  {copy.needs}
                </span>
                <span className="text-[10px] text-slate-600 leading-relaxed">
                  {founder.needs.slice(0, 2).join("، ")}
                </span>
              </div>
            )}
            {founder.offers.length > 0 && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-px shrink-0">
                  {copy.offers}
                </span>
                <span className="text-[10px] text-slate-600 leading-relaxed">
                  {founder.offers.slice(0, 2).join("، ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5">
        <Link
          href={`/founders/${founder.slug}`}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white transition-all hover:border-[#3B52D4]/40 hover:text-[#3B52D4] hover:bg-[#EEF1FF]/40"
        >
          {copy.connect}
          <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
