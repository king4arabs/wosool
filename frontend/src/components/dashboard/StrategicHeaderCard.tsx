"use client"
import type { ReactNode } from "react"

export function StrategicHeaderCard({
  badge,
  title,
  subtitle,
  cta,
}: {
  badge: string
  title: string
  subtitle: string
  cta?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" />
          <span className="text-[10px] font-bold text-[#3B52D4] uppercase tracking-wider">{badge}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {cta}
    </div>
  )
}
