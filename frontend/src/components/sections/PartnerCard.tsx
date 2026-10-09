"use client"

import type { Partner } from "@/types"
import { ExternalLink } from "lucide-react"
import { getPartnerStatusLabel } from "@/data/localized-seed"
import { useLocale } from "@/lib/locale"

interface PartnerCardProps {
  partner: Partner
}

const statusStyle: Record<Partner["status"], { bg: string; text: string; border: string }> = {
  Confirmed:           { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  Prospective:         { bg: "#FFF7ED", text: "#9a3412", border: "#FED7AA" },
  "Ecosystem-Aligned": { bg: "#EEF1FF", text: "#3B52D4", border: "#E4E7F0" },
  "Past Collaborator": { bg: "#F8FAFC", text: "#64748b", border: "#E2E8F0" },
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const { locale } = useLocale()
  const initials = partner.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const statusLabel = getPartnerStatusLabel(partner.status, locale)
  const s = statusStyle[partner.status]
  const visitLabel = locale === "ar" ? "زيارة الموقع" : "Visit website"

  return (
    <div
      className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
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
      {/* Logo + name */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="h-12 w-12 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] flex items-center justify-center text-sm font-black text-[#3B52D4] shrink-0"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-slate-900 truncate">{partner.name}</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{partner.sector}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
          {partner.type}
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full border"
          style={{ background: s.bg, color: s.text, borderColor: s.border }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1 mb-4">
        {partner.description}
      </p>

      {/* Website link */}
      {partner.website && (
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B52D4] hover:underline transition-colors"
        >
          {visitLabel}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
