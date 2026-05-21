"use client"

import { SocietyPostActionsBar } from "@/components/dashboard/SocietyPostActionsBar"

export type SocietyPost = {
  id: number
  post_type: "ask" | "offer"
  title: string
  content: string
  sector?: string | null
  priority?: "normal" | "urgent"
  author?: {
    name?: string | null
    company?: { name?: string | null; sector?: string | null } | null
  } | null
  counts?: { comments?: number; reactions?: number; help_offers?: number } | null
}

export function SocietyPostCard({
  post,
  onHelp,
  onSave,
  onReact,
  onComment,
  onShare,
  onReport,
  onMatch,
  loading,
}: {
  post: SocietyPost
  onHelp: () => void
  onSave: () => void
  onReact: () => void
  onComment: () => void
  onShare: () => void
  onReport: () => void
  onMatch: () => void
  loading?: boolean
}) {
  const isAsk = post.post_type === "ask"
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">{post.author?.name ?? "Founder"}</h3>
              <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">{post.author?.company?.name ?? "Wosool"}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{post.author?.company?.sector ?? post.sector ?? "General"}</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border uppercase shrink-0 ${isAsk ? "bg-rose-50 text-rose-700 border-rose-200/60" : "bg-emerald-50 text-emerald-700 border-emerald-200/60"}`}>
          {isAsk ? "طلب دعم" : "عرض قيمة"}
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        <h4 className="font-bold text-slate-800 text-sm">{post.title}</h4>
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-slate-100 pt-3.5 text-xs">
        <div className="text-slate-400 text-[11px]">
          التفاعلات: <span className="font-mono font-bold text-slate-700">{post.counts?.reactions ?? 0}</span> • التعليقات: <span className="font-mono font-bold text-slate-700">{post.counts?.comments ?? 0}</span>
        </div>
        <SocietyPostActionsBar onHelp={onHelp} onSave={onSave} onReact={onReact} onComment={onComment} onShare={onShare} onReport={onReport} onMatch={onMatch} loading={loading} />
      </div>
    </div>
  )
}
