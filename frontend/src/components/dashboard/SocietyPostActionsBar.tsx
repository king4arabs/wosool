"use client"

export function SocietyPostActionsBar({
  onHelp,
  onSave,
  onReact,
  onComment,
  onReport,
  onMatch,
  onShare,
  loading,
}: {
  onHelp: () => void
  onSave: () => void
  onReact: () => void
  onComment: () => void
  onReport: () => void
  onMatch: () => void
  onShare: () => void
  loading?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onHelp} disabled={loading} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">تقديم مساعدة مباشرة</button>
      <button onClick={onReact} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">تفاعل</button>
      <button onClick={onComment} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">تعليق</button>
      <button onClick={onSave} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">حفظ</button>
      <button onClick={onShare} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">مشاركة</button>
      <button onClick={onMatch} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-[11px] transition-colors disabled:opacity-60">AI Match</button>
      <button onClick={onReport} disabled={loading} className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 border border-rose-200 rounded-md text-[11px] transition-colors disabled:opacity-60">إبلاغ</button>
    </div>
  )
}
