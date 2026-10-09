"use client"

import Link from "next/link"

export function SocietyAutoUpdateBanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: string }) {
  return (
    <div className="bg-slate-100/60 border border-dashed border-slate-300 rounded-xl p-4 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-start gap-3">
        <span className="bg-[#3B52D4]/10 text-[#2E44C8] border border-[#3B52D4]/20 px-2 py-1 rounded font-sans font-bold text-xs mt-0.5 whitespace-nowrap">إنجاز تلقائي</span>
        <div>
          <p className="text-slate-800 font-semibold text-xs leading-relaxed">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Link href="/dashboard/scorecard" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors text-center whitespace-nowrap">{cta}</Link>
    </div>
  )
}
