"use client"

import type { FormEvent } from "react"
import { X } from "lucide-react"

export type SocietyPostForm = {
  post_type: "ask" | "offer"
  title: string
  content: string
  sector: "fintech" | "saas" | "ai"
  priority: "normal" | "urgent"
}

export function SocietyComposerModal({
  open,
  form,
  setForm,
  onClose,
  onSubmit,
  submitting,
  submitError,
}: {
  open: boolean
  form: SocietyPostForm
  setForm: (next: SocietyPostForm) => void
  onClose: () => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  submitting: boolean
  submitError?: string | null
}) {
  if (!open) return null

  return (
    <div id="postModal" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 antialiased">
      <div className="bg-white w-full max-w-xl rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">إضافة منشور تشغيلي جديد</h2>
            <p className="text-xs text-slate-500 mt-0.5">وضّح طلبك أو خبرتك لتسهيل التواصل مع أعضاء المجتمع.</p>
          </div>
          <button id="closeModalX" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, post_type: "ask" })} className={`${form.post_type === "ask" ? "border-2 border-[#3B52D4] bg-[#EEF1FF]" : "border border-slate-200 bg-white"} p-3 rounded-xl text-xs font-bold`}>طلب دعم</button>
            <button type="button" onClick={() => setForm({ ...form, post_type: "offer" })} className={`${form.post_type === "offer" ? "border-2 border-[#3B52D4] bg-[#EEF1FF]" : "border border-slate-200 bg-white"} p-3 rounded-xl text-xs font-bold`}>عرض قيمة</button>
          </div>

          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs" placeholder="عنوان المنشور" />
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required className="w-full h-28 resize-none bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs" placeholder="تفاصيل المنشور" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value as SocietyPostForm["sector"] })} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option value="fintech">FinTech</option>
              <option value="saas">SaaS</option>
              <option value="ai">AI</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as SocietyPostForm["priority"] })} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option value="normal">عادي</option>
              <option value="urgent">حرج</option>
            </select>
          </div>

          {submitError ? <p className="text-xs text-rose-600 font-medium">{submitError}</p> : null}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button id="closeModalBtn" type="button" onClick={onClose} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs">إلغاء</button>
            <button type="submit" disabled={submitting} className="bg-[#3B52D4] hover:bg-[#2E44C8] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-xs font-semibold">
              {submitting ? "جارٍ النشر..." : "نشر ومزامنة الـ Scorecard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
