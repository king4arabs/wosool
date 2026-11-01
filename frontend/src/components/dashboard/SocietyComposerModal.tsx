"use client"

import { useId, type FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLocale } from "@/lib/locale"
import { SOCIETY_SECTORS, societyFeed, societySectorLabel, type SocietySector } from "@/lib/society-feed"

export type SocietyPostForm = {
  post_type: "ask" | "offer"
  title: string
  content: string
  sector: SocietySector
  priority: "normal" | "urgent"
}

const field = "w-full min-h-11 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-[#3B52D4] focus:outline-none focus:ring-2 focus:ring-[#3B52D4]/30"
const label = "mb-1 block text-xs font-semibold text-slate-700"

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
  const { locale } = useLocale()
  const copy = societyFeed(locale)
  const id = useId()
  const errorId = `${id}-error`

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{copy.composerTitle}</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">{copy.composerSubtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" aria-describedby={submitError ? errorId : undefined}>
          <fieldset>
            <legend className={label}>{copy.postType}</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["ask", "offer"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.post_type === type}
                  onClick={() => setForm({ ...form, post_type: type })}
                  className={`${form.post_type === type ? "border-2 border-[#3B52D4] bg-[#EEF1FF]" : "border border-slate-200 bg-white"} min-h-11 rounded-xl p-3 text-sm font-bold text-slate-900`}
                >
                  {type === "ask" ? copy.ask : copy.offer}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${id}-title`} className={label}>{copy.postTitle}</label>
            <input id={`${id}-title`} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={220} className={field} />
          </div>
          <div>
            <label htmlFor={`${id}-content`} className={label}>{copy.postContent}</label>
            <textarea id={`${id}-content`} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required maxLength={10000} className={`${field} h-28 resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-sector`} className={label}>{copy.sectorLabel}</label>
              <select id={`${id}-sector`} value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value as SocietySector })} className={field}>
                {SOCIETY_SECTORS.map(sector => <option key={sector} value={sector}>{societySectorLabel(locale, sector)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-priority`} className={label}>{copy.priority}</label>
              <select id={`${id}-priority`} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as SocietyPostForm["priority"] })} className={field}>
                <option value="normal">{copy.normal}</option>
                <option value="urgent">{copy.urgent}</option>
              </select>
            </div>
          </div>

          {submitError ? <p id={errorId} role="alert" className="text-sm font-medium text-rose-700">{submitError}</p> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">{copy.cancel}</button>
            <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-[#3B52D4] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2E44C8] disabled:opacity-60">
              {submitting ? copy.publishing : copy.publish}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
