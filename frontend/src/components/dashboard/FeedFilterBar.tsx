"use client"

import { useId } from "react"
import { useLocale } from "@/lib/locale"
import { SOCIETY_SECTORS, societyFeed, societySectorLabel, type SocietyCounts, type SocietyTab } from "@/lib/society-feed"

export function FeedFilterBar({
  tab,
  onTab,
  sector,
  onSector,
  counts,
}: {
  tab: SocietyTab
  onTab: (tab: SocietyTab) => void
  sector: string
  onSector: (sector: string) => void
  counts: Partial<SocietyCounts>
}) {
  const sectorId = useId()
  const { locale } = useLocale()
  const copy = societyFeed(locale)
  const tabs: { value: SocietyTab; label: string; dot?: string }[] = [
    { value: "all", label: copy.tabAll },
    { value: "asks", label: copy.tabAsks, dot: "bg-rose-500" },
    { value: "offers", label: copy.tabOffers, dot: "bg-emerald-500" },
  ]
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center shadow-sm">
      <div role="group" aria-label={copy.tabsLabel} className="flex flex-wrap items-center gap-1">
        {tabs.map(item => {
          const active = tab === item.value
          const total = counts[item.value]
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onTab(item.value)}
              className={`${active ? "bg-[#3B52D4] text-white" : "text-slate-700 hover:bg-slate-50"} min-h-11 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5`}
            >
              {item.dot ? <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${item.dot}`} /> : null}
              {item.label}
              {typeof total === "number" ? <span className={`${active ? "bg-[#2E44C8] text-white" : "bg-slate-100 text-slate-600"} px-1.5 rounded text-xs font-sans ms-1`}>{total}</span> : null}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2 md:min-w-[220px] border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
        <label htmlFor={sectorId} className="text-xs font-bold text-slate-600 whitespace-nowrap">{copy.sectorLabel}</label>
        <select id={sectorId} value={sector} onChange={(e) => onSector(e.target.value)} className="w-full min-h-11 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer">
          <option value="">{copy.allSectors}</option>
          {SOCIETY_SECTORS.map(value => <option key={value} value={value}>{societySectorLabel(locale, value)}</option>)}
        </select>
      </div>
    </div>
  )
}
