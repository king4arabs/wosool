"use client"

import { useState } from "react"
import { useLocale } from "@/lib/locale"

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
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const { locale } = useLocale()
  const ar = locale === "ar"
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onHelp} disabled={loading} className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">{ar ? "تقديم مساعدة مباشرة" : "Offer help"}</button>
      <div className="relative">
        <button type="button" onClick={() => setReactionsOpen(value => !value)} aria-expanded={reactionsOpen} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">
          {ar ? "تفاعل" : "React"}
        </button>
        <div hidden={!reactionsOpen} onKeyDown={event => { if (event.key === "Escape") setReactionsOpen(false) }} className="absolute bottom-full start-0 z-20 mb-2 min-w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <button onClick={() => { onReactSelect("like"); setReactionsOpen(false) }} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{ar ? "👏 تهنئة" : "👏 Like"}</button>
          <button onClick={() => { onReactSelect("insightful"); setReactionsOpen(false) }} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{ar ? "🔥 ممتاز" : "🔥 Insightful"}</button>
          <button onClick={() => { onReactSelect("support"); setReactionsOpen(false) }} disabled={loading} className="rounded-full px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{ar ? "🤝 دعم" : "🤝 Support"}</button>
        </div>
      </div>
      <button onClick={onComment} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">{ar ? "تعليق" : "Comment"}</button>
      <button onClick={onSave} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">{ar ? "حفظ" : "Save"}</button>
      <button onClick={onShare} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">{ar ? "مشاركة" : "Share"}</button>
      <button onClick={onMatch} disabled={loading} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 border border-slate-200 rounded-md text-xs transition-colors disabled:opacity-60">{ar ? "اقتراح مؤسسين" : "Find founders"}</button>
      <button onClick={onReportOrDelete} disabled={loading} className={`${isOwner ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200" : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"} font-semibold px-3 py-1.5 border rounded-md text-xs transition-colors disabled:opacity-60`}>
        {isOwner ? (ar ? "حذف المنشور" : "Delete post") : (ar ? "إبلاغ" : "Report")}
      </button>
    </div>
  )
}
