"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ApiError, api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { type ApiFounder } from "@/lib/content-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import {
  adminMatches,
  characterCount,
  fill,
  matchDate,
  matchFieldOrder,
  matchPayload,
  matchReasonMax,
  matchReasonMin,
  matchSaveErrors,
  matchStatusLabel,
  matchStatusVariant,
  matchStatuses,
  matchVisible,
  validateMatchForm,
  type MatchField,
  type MatchFormErrors,
} from "@/lib/admin-matches"

type Match = { id: number; founder_a: ApiFounder; founder_b: ApiFounder; status: string; match_reasons: string[]; created_at: string }
const founderName = (founder: ApiFounder) => founder.name || founder.user?.name || founder.slug
const fieldId: Record<MatchField, string> = { founder_a_id: "match-founder-a", founder_b_id: "match-founder-b", reason: "match-reason" }

function FounderPicker({ field, label, value, exclude, error, disabled, onChange }: {
  field: MatchField
  label: string
  value: ApiFounder | null
  exclude: number | null
  error?: string
  disabled: boolean
  onChange: (value: ApiFounder | null) => void
}) {
  const { locale } = useLocale()
  const copy = adminMatches(locale)
  const id = fieldId[field]
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<ApiFounder[]>([])
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setState("loading")
      api.get<{ data: ApiFounder[] }>("/admin/founders", { params: { search: query.trim() || undefined, status: "active", activation: "active", per_page: 20 }, signal: controller.signal })
        .then(response => { setItems(response.data); setState("ready") })
        .catch(() => { if (!controller.signal.aborted) setState("error") })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])
  // Keep the chosen founder selectable after a new search, and never offer the other picker's choice.
  const options = (value && !items.some(item => item.id === value.id) ? [value, ...items] : items).filter(item => item.id !== exclude)
  const describedBy = error ? `${id}-error` : `${id}-hint`
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="mb-1 font-semibold">{label}<span className="text-red-600"> *<span className="sr-only"> ({copy.required})</span></span></legend>
      <Input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={fill(copy.founderSearchLabel, { label })} placeholder={copy.founderSearch} />
      <Select
        id={id}
        value={value?.id ?? ""}
        aria-label={label}
        aria-required
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={event => onChange(options.find(item => item.id === Number(event.target.value)) ?? null)}
      >
        <option value="">{copy.founderSelect}</option>
        {options.map(item => <option key={item.id} value={item.id}>{founderName(item)}</option>)}
      </Select>
      {error
        ? <p id={`${id}-error`} className="text-xs font-medium text-red-700">{error}</p>
        : <p id={`${id}-hint`} className="text-xs text-gray-500" aria-live="polite">
            {state === "loading" ? copy.foundersLoading : state === "error" ? copy.foundersFailed : options.length === 0 ? copy.foundersEmpty : copy.founderHint}
          </p>}
    </fieldset>
  )
}

export default function AdminMatchesPage() {
  const { locale } = useLocale()
  const copy = adminMatches(locale)
  const { toast } = useToast()
  const [matches, setMatches] = useState<Match[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading")
  const [open, setOpen] = useState(false)
  const [a, setA] = useState<ApiFounder | null>(null)
  const [b, setB] = useState<ApiFounder | null>(null)
  const [reason, setReason] = useState("")
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<MatchFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const latestRequest = useRef(0)

  const load = useCallback(async () => {
    const request = ++latestRequest.current
    setLoadState("loading")
    try {
      const response = await api.get<{ data: Match[] }>("/admin/matches")
      if (request !== latestRequest.current) return
      setMatches(response.data)
      setLoadState("ready")
    } catch {
      if (request === latestRequest.current) setLoadState("error")
    }
  }, [])
  useEffect(() => { void load() }, [load])

  const visible = useMemo(
    () => matches.filter(match => matchVisible({ status: match.status, names: [founderName(match.founder_a), founderName(match.founder_b)], reasons: match.match_reasons }, search, status)),
    [matches, search, status],
  )

  const openDialog = () => {
    setA(null); setB(null); setReason(""); setErrors({}); setFormError(null)
    setOpen(true)
  }

  const clearError = (field: MatchField) => {
    setErrors(previous => (previous[field] ? { ...previous, [field]: undefined } : previous))
    setFormError(null)
  }

  const focusFirst = (found: MatchFormErrors) => {
    const first = matchFieldOrder.find(field => found[field])
    if (first) window.requestAnimationFrame(() => document.getElementById(fieldId[first])?.focus())
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (sending) return
    const form = { founderA: a?.id ?? null, founderB: b?.id ?? null, reason }
    const found = validateMatchForm(locale, form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      focusFirst(found)
      return
    }
    setSending(true); setFormError(null)
    try {
      await api.post("/admin/matches", matchPayload(form))
      setOpen(false)
      toast(copy.saved, "success")
      await load()
    } catch (error) {
      const result = matchSaveErrors(locale, error instanceof ApiError ? error.status : 0, error instanceof ApiError ? error.data : undefined)
      setErrors(result.fields)
      setFormError(result.message)
      focusFirst(result.fields)
    } finally {
      setSending(false)
    }
  }

  const reasonLength = characterCount(reason.trim())
  const reasonDescribedBy = errors.reason ? `${fieldId.reason}-error ${fieldId.reason}-count` : `${fieldId.reason}-hint ${fieldId.reason}-count`
  const filtered = search.trim() !== "" || status !== ""

  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-2xl font-bold">{copy.title}</h2><p className="mt-2 text-slate-600">{copy.intro}</p></div>
      <Button onClick={openDialog}>{copy.suggest}</Button>
    </header>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {matchStatuses.map(key => <div key={key} className="rounded-xl border bg-white p-5"><p className="text-3xl font-bold">{loadState === "ready" ? matches.filter(match => match.status === key).length : "—"}</p><p className="mt-2 text-sm text-slate-600">{matchStatusLabel(locale, key)}</p></div>)}
    </div>
    <div className="flex flex-wrap gap-3">
      <Input className="min-w-0 flex-1" type="search" value={search} onChange={event => setSearch(event.target.value)} aria-label={copy.searchLabel} placeholder={copy.searchLabel} />
      <Select className="sm:w-52" value={status} onChange={event => setStatus(event.target.value)} aria-label={copy.statusLabel}>
        <option value="">{copy.allStatuses}</option>
        {matchStatuses.map(key => <option key={key} value={key}>{matchStatusLabel(locale, key)}</option>)}
      </Select>
    </div>
    <div aria-live="polite">
      {loadState === "loading" && <p className="text-sm text-gray-500">{copy.loading}</p>}
      {loadState === "error" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{copy.loadFailed}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>{copy.retry}</Button>
        </div>
      )}
      {loadState === "ready" && !visible.length && <p className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-600">{filtered && matches.length ? copy.emptyFilter : copy.empty}</p>}
    </div>
    {loadState === "ready" && visible.length > 0 && <ul className="space-y-4">
      {visible.map(match => {
        const date = matchDate(locale, match.created_at)
        return <li key={match.id} className="rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="min-w-0 break-words font-bold">{founderName(match.founder_a)} · {founderName(match.founder_b)}</h3>
            <Badge variant={matchStatusVariant(match.status)}>{matchStatusLabel(locale, match.status)}</Badge>
          </div>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">{match.match_reasons.map((item, index) => <li key={index} dir="auto" className="break-words">{item}</li>)}</ul>
          {date && <p className="mt-3 text-xs text-slate-500"><time dateTime={match.created_at}>{fill(copy.suggestedOn, { date })}</time></p>}
        </li>
      })}
    </ul>}
    <Link className="inline-flex min-h-11 items-center font-semibold text-[#3B52D4] underline" href="/admin/intros">{copy.manageIntros}</Link>
    <Dialog open={open} onOpenChange={value => { if (!sending) setOpen(value) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{copy.dialogTitle}</DialogTitle><DialogDescription>{copy.dialogDescription}</DialogDescription></DialogHeader>
        <form noValidate onSubmit={submit} className="space-y-4">
          <FounderPicker field="founder_a_id" label={copy.founderA} value={a} exclude={b?.id ?? null} error={errors.founder_a_id} disabled={sending} onChange={value => { setA(value); clearError("founder_a_id") }} />
          <FounderPicker field="founder_b_id" label={copy.founderB} value={b} exclude={a?.id ?? null} error={errors.founder_b_id} disabled={sending} onChange={value => { setB(value); clearError("founder_b_id") }} />
          <div className="space-y-1.5">
            <Label htmlFor={fieldId.reason}>{copy.reason}<span className="text-red-600"> *<span className="sr-only"> ({copy.required})</span></span></Label>
            <Textarea id={fieldId.reason} dir="auto" disabled={sending} aria-required aria-invalid={Boolean(errors.reason)} aria-describedby={reasonDescribedBy} value={reason} onChange={event => { setReason(event.target.value); clearError("reason") }} />
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              {errors.reason
                ? <p id={`${fieldId.reason}-error`} className="font-medium text-red-700">{errors.reason}</p>
                : <p id={`${fieldId.reason}-hint`} className="text-gray-500">{fill(copy.reasonHint, { min: matchReasonMin, max: matchReasonMax })}</p>}
              <p id={`${fieldId.reason}-count`} className={reasonLength > matchReasonMax ? "text-red-700" : "text-gray-500"}>{fill(copy.reasonCount, { count: reasonLength, max: matchReasonMax })}</p>
            </div>
          </div>
          {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={sending} onClick={() => setOpen(false)}>{copy.cancel}</Button>
            <Button type="submit" loading={sending}>{copy.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
}
