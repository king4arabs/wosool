"use client"

type Tab = "all" | "asks" | "offers"

export function FeedFilterBar({
  tab,
  onTab,
  sector,
  onSector,
  counts,
}: {
  tab: Tab
  onTab: (tab: Tab) => void
  sector: string
  onSector: (sector: string) => void
  counts: { all: number; asks: number; offers: number }
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        <button onClick={() => onTab("all")} className={`${tab === "all" ? "bg-[#3B52D4] text-white" : "text-slate-600 hover:bg-slate-50"} px-3 py-1.5 rounded-md text-xs font-semibold transition-colors`}>
          كل التحديثات <span className={`${tab === "all" ? "bg-[#2E44C8] text-slate-200" : "bg-slate-100 text-slate-500"} px-1 rounded text-[10px] font-mono mr-1`}>{counts.all}</span>
        </button>
        <button onClick={() => onTab("asks")} className={`${tab === "asks" ? "bg-[#3B52D4] text-white" : "text-slate-600 hover:bg-slate-50"} px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />طلبات الدعم <span className={`${tab === "asks" ? "bg-[#2E44C8] text-slate-200" : "bg-slate-100 text-slate-500"} px-1 rounded text-[10px] font-mono mr-1`}>{counts.asks}</span>
        </button>
        <button onClick={() => onTab("offers")} className={`${tab === "offers" ? "bg-[#3B52D4] text-white" : "text-slate-600 hover:bg-slate-50"} px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />عروض المعرفة <span className={`${tab === "offers" ? "bg-[#2E44C8] text-slate-200" : "bg-slate-100 text-slate-500"} px-1 rounded text-[10px] font-mono mr-1`}>{counts.offers}</span>
        </button>
      </div>
      <div className="flex items-center gap-2 min-w-[200px] border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
        <label className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">القطاع:</label>
        <select value={sector} onChange={(e) => onSector(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer">
          <option value="">جميع القطاعات التشغيلية</option>
          <option value="fintech">التقنية المالية (FinTech)</option>
          <option value="saas">البرمجيات المؤسسية (SaaS)</option>
          <option value="ai">الذكاء الاصطناعي والبيانات (AI)</option>
        </select>
      </div>
    </div>
  )
}
