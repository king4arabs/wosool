"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { type ApiFounder } from "@/lib/content-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Match = { id: number; founder_a: ApiFounder; founder_b: ApiFounder; status: string; match_reasons: string[]; created_at: string }
const founderName = (founder: ApiFounder) => founder.name || founder.user?.name || founder.slug

function FounderPicker({ label, value, onChange }: { label: string; value: ApiFounder | null; onChange: (value: ApiFounder | null) => void }) {
  const { locale } = useLocale()
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<ApiFounder[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api.get<{ data: ApiFounder[] }>("/admin/founders", { params: { search: query, status: "active", per_page: 20 }, signal: controller.signal }).then(response => { setItems(response.data); setError(null) }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load founders") })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])
  const options = value && !items.some(item => item.id === value.id) ? [value, ...items] : items
  return <fieldset className="space-y-2"><legend className="mb-2 font-semibold">{label}</legend><Input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={`${label}: ${locale === "ar" ? "بحث بالاسم" : "Search by name"}`} placeholder={locale === "ar" ? "بحث بالاسم" : "Search by name"} /><Select required value={value?.id ?? ""} aria-label={label} onChange={event => onChange(options.find(item => item.id === Number(event.target.value)) ?? null)}><option value="">{locale === "ar" ? "اختر المؤسس" : "Select founder"}</option>{options.map(item => <option key={item.id} value={item.id}>{founderName(item)}</option>)}</Select>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}</fieldset>
}

export default function AdminMatchesPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [matches, setMatches] = useState<Match[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [a, setA] = useState<ApiFounder | null>(null)
  const [b, setB] = useState<ApiFounder | null>(null)
  const [reason, setReason] = useState("")
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const labels: Record<string, string> = ar ? { suggested: "مقترح", accepted: "مقبول", connected: "متصل", declined: "مرفوض" } : { suggested: "Suggested", accepted: "Accepted", connected: "Connected", declined: "Declined" }
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { const response = await api.get<{ data: Match[] }>("/admin/matches", { signal }); if (!signal?.aborted) setMatches(response.data) }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : "Unable to load matches") }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  const visible = useMemo(() => matches.filter(match => (!status || match.status === status) && [founderName(match.founder_a), founderName(match.founder_b), ...match.match_reasons].join(" ").toLowerCase().includes(search.trim().toLowerCase())), [matches, search, status])
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!a || !b || sending) return
    setSending(true); setFormError(null)
    try { await api.post("/admin/matches", { founder_a_id: a.id, founder_b_id: b.id, reason: reason.trim() }); setOpen(false); setA(null); setB(null); setReason(""); await load() }
    catch (error) { setFormError(error instanceof Error ? error.message : "Unable to suggest match") }
    finally { setSending(false) }
  }
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{ar ? "تعارف المؤسسين" : "Founder matches"}</h1><p className="mt-2 text-slate-600">{ar ? "اقترح علاقات مناسبة وتابع قرارات المؤسسين وطلبات التعارف." : "Suggest useful connections and follow founder responses and introduction requests."}</p></div><Button onClick={() => { setOpen(true); setFormError(null) }}>{ar ? "اقتراح تعارف" : "Suggest match"}</Button></header>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Object.entries(labels).map(([key, label]) => <div key={key} className="rounded-xl border bg-white p-5"><p className="text-3xl font-bold">{loading ? "—" : matches.filter(match => match.status === key).length}</p><p className="mt-2 text-sm text-slate-600">{label}</p></div>)}</div>
    <div className="flex flex-wrap gap-3"><Input className="min-w-0 flex-1" type="search" value={search} onChange={event => setSearch(event.target.value)} aria-label={ar ? "بحث" : "Search"} placeholder={ar ? "ابحث باسم المؤسس أو سبب الترشيح" : "Search founders or match reasons"} /><Select className="sm:w-52" value={status} onChange={event => setStatus(event.target.value)} aria-label={ar ? "الحالة" : "Status"}><option value="">{ar ? "جميع الحالات" : "All statuses"}</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></div>
    {loading && <p role="status">{ar ? "جارٍ التحميل…" : "Loading…"}</p>}
    {error && <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => void load()}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {!loading && !error && <div className="space-y-4">{!visible.length && <p className="rounded-xl border bg-white p-6">{ar ? "لا توجد نتائج مطابقة." : "No matching connections."}</p>}{visible.map(match => <article key={match.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{founderName(match.founder_a)} · {founderName(match.founder_b)}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{labels[match.status] ?? match.status}</span></div><ul className="mt-3 list-inside list-disc text-sm text-slate-600">{match.match_reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul><time className="mt-3 block text-xs text-slate-500">{new Date(match.created_at).toLocaleDateString(ar ? "ar-SA" : "en-GB")}</time></article>)}</div>}
    <Link className="inline-flex min-h-11 items-center font-semibold text-[#3B52D4] underline" href="/admin/intros">{ar ? "إدارة طلبات التعارف" : "Manage introduction requests"}</Link>
    <Dialog open={open} onOpenChange={value => { if (!sending) setOpen(value) }}><DialogContent><DialogHeader><DialogTitle>{ar ? "اقتراح تعارف" : "Suggest a match"}</DialogTitle><DialogDescription>{ar ? "اختر مؤسسين مختلفين واشرح قيمة التعارف. يختار المؤسسون قبول المقترح أو رفضه." : "Choose two different founders and explain the value of connecting. Founders decide whether to accept or decline."}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><FounderPicker label={ar ? "المؤسس الأول" : "First founder"} value={a} onChange={setA} /><FounderPicker label={ar ? "المؤسس الثاني" : "Second founder"} value={b} onChange={setB} /><label className="block font-semibold" htmlFor="match-reason">{ar ? "سبب الترشيح" : "Reason"}</label><Textarea id="match-reason" required minLength={10} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} />{formError && <p role="alert" className="text-rose-700">{formError}</p>}<Button type="submit" loading={sending} disabled={!a || !b || a.id === b.id || reason.trim().length < 10}>{ar ? "حفظ المقترح" : "Save suggestion"}</Button></form></DialogContent></Dialog>
  </div>
}
