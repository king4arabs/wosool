"use client"

import Link from "next/link"
import type { Program } from "@/types"
import { Clock, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale"

const categoryMap: Record<string, { icon: string; color: string; bg: string }> = {
  Onboarding:     { icon: "🚀", color: "#3B52D4", bg: "#EEF1FF" },
  "Peer Learning":{ icon: "🤝", color: "#0891b2", bg: "#E0F2FE" },
  Growth:         { icon: "📈", color: "#059669", bg: "#D1FAE5" },
  Fundraising:    { icon: "💡", color: "#7c3aed", bg: "#EDE9FE" },
}

interface ProgramCardProps {
  program: Program
}

export function ProgramCard({ program }: ProgramCardProps) {
  const { locale, direction } = useLocale()
  const cat = categoryMap[program.category] ?? { icon: "📋", color: "#3B52D4", bg: "#EEF1FF" }
  const copy = {
    ar: { open: "مفتوح", closed: "قريبًا", learnMore: "عرض البرنامج" },
    en: { open: "Open", closed: "Coming soon", learnMore: "View program" },
    fr: { open: "Ouvert", closed: "Bientôt", learnMore: "Voir le programme" },
  }[locale]
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  return (
    <div
      className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px -4px rgba(59,82,212,0.12), 0 2px 8px -2px rgba(15,22,40,0.04)"
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,82,212,0.22)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px -2px rgba(15,22,40,0.06)"
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "rgba(226,232,240,0.8)"
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full transition-all duration-300"
        style={{ background: program.isOpen ? `linear-gradient(90deg,${cat.color},transparent)` : "#E2E8F0" }}
      />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: cat.bg }}
            aria-hidden="true"
          >
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={
                  program.isOpen
                    ? { background: "#DCFCE7", color: "#166534" }
                    : { background: "#F1F5F9", color: "#64748b" }
                }
              >
                {program.isOpen && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                {program.isOpen ? copy.open : copy.closed}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-snug">{program.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{program.description}</p>

        {/* Stage tags */}
        <div className="flex flex-wrap gap-1.5">
          {program.targetStage.map((stage) => (
            <span
              key={stage}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50"
            >
              {stage}
            </span>
          ))}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{program.duration}</span>
        </div>

        {/* Benefits */}
        <ul className="space-y-1.5">
          {program.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0 mt-px"
                style={{ color: cat.color }}
              />
              <span className="leading-snug">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-6">
        <Link
          href={program.slug === "eo-riyadh-accelerator" ? "/EOA" : `/programs/${program.slug}`}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all border"
          style={
            program.isOpen
              ? {
                  background: "#3B52D4",
                  color: "#fff",
                  borderColor: "#3B52D4",
                  boxShadow: "0 4px 12px -2px rgba(59,82,212,0.3)",
                }
              : {
                  background: "white",
                  color: "#64748b",
                  borderColor: "#E2E8F0",
                }
          }
        >
          {copy.learnMore}
          <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
