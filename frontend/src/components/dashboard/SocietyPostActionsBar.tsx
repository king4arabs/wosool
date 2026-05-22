"use client"

export function SocietyPostActionsBar({
  onHelp,
  onSave,
  onReactSelect,
  onComment,
  onReportOrDelete,
  onMatch,
  onShare,
  isOwner,
  loading,
}: {
  onHelp: () => void
  onSave: () => void
  onReactSelect: (type: "like" | "insightful" | "support") => void
  onComment: () => void
  onReportOrDelete: () => void
  onMatch: () => void
  onShare: () => void
  isOwner: boolean
  loading?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onHelp} disabled={loading} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">تقديم مساعدة مباشرة</button>
      <div className="relative group">
        <button disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">
          تفاعل
        </button>
        <div className="pointer-events-none absolute -top-12 right-0 z-20 flex translate-y-2 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <button onClick={() => onReactSelect("like")} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">👏 تهنئة</button>
          <button onClick={() => onReactSelect("insightful")} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">🔥 ممتاز</button>
          <button onClick={() => onReactSelect("support")} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">🤝 دعم</button>
        </div>
      </div>
      <button onClick={onComment} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">تعليق</button>
      <button onClick={onSave} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">حفظ</button>
      <button onClick={onShare} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">مشاركة</button>
      <button onClick={onMatch} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">AI Match</button>
      <button onClick={onReportOrDelete} disabled={loading} className={`${isOwner ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200" : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"} font-semibold px-3 py-1.5 border rounded-md text-[11px] transition-colors disabled:opacity-60`}>
        {isOwner ? "حذف المنشور" : "إبلاغ"}
      </button>
    </div>
  )
}
