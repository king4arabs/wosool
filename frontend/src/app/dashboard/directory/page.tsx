"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Founder } from "@/types"

export default function FounderDirectoryPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const [search, setSearch] = useState(query)
  const [filter, setFilter] = useState(query)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [items, setItems] = useState<Array<Founder & { userId?: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [target, setTarget] = useState<Founder | null>(null)
  const [brief, setBrief] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => { setSearch(query); setFilter(query); setPage(1) }, [query])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(null)
    api.get<{ data: ApiFounder[]; meta?: { last_page?: number } }>("/founders", {
      params: { search: filter, page, per_page: 12 }, headers: { "X-Locale": locale }, signal: controller.signal,
    }).then(response => {
      setItems(response.data.map(item => ({ ...mapFounder(item), userId: item.user?.id })))
      setLastPage(response.meta?.last_page ?? 1)
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load founders") })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filter, page, locale, attempt])

  async function introduce(event: FormEvent) {
    event.preventDefault()
    if (!target || sending) return
    setSending(true); setSendError(null)
    try {
      await api.post("/member/introductions", { target_founder_id: Number(target.id), payload_context_brief: brief.trim() })
      toast(ar ? "تم إرسال طلب التعارف. تابع حالته في صفحة التعارف." : "Introduction requested. Follow its status in Matches.", "success")
      setTarget(null); setBrief("")
    } catch (error) { setSendError(error instanceof Error ? error.message : "Unable to send introduction") }
    finally { setSending(false) }
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-2xl font-bold">{ar ? "دليل المؤسسين" : "Founder directory"}</h1><p className="mt-2 text-slate-600">{ar ? "اكتشف أعضاء المجتمع واطلب التعارف لمناقشة فرص التعاون." : "Discover community members and request an introduction to discuss collaboration."}</p></header>
    <form role="search" className="flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setPage(1); setFilter(search.trim()) }}>
      <Input className="min-w-0 flex-1" type="search" value={search} onChange={event => setSearch(event.target.value)} aria-label={ar ? "البحث عن مؤسس" : "Search founders"} placeholder={ar ? "ابحث بالاسم أو الخبرة" : "Search by name or experience"} />
      <Button type="submit">{ar ? "بحث" : "Search"}</Button>
    </form>
    {loading && <p role="status">{ar ? "جارٍ تحميل المؤسسين…" : "Loading founders…"}</p>}
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p>{error}</p><Button variant="outline" className="mt-3" onClick={() => setAttempt(value => value + 1)}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {!loading && !error && <>
      {!items.length && <p className="rounded-xl border bg-white p-6">{ar ? "لا توجد نتائج مطابقة." : "No matching founders."}</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(founder => <article key={founder.id} className="flex min-w-0 flex-col rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">{founder.name}</h2><p className="mt-2 text-slate-600">{founder.companyName}</p>
        <p className="my-4 text-sm leading-relaxed">{founder.tagline || founder.bio}</p>
        <p className="mb-5 text-sm text-slate-500">{[founder.location, founder.sector, founder.stage].filter(Boolean).join(" · ")}</p>
        <div className="mt-auto flex flex-wrap gap-3">
          {founder.userId !== Number(user?.id) && <Button onClick={() => { setTarget(founder); setBrief(""); setSendError(null) }}>{ar ? "طلب تعارف" : "Request introduction"}</Button>}
          <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[#3B52D4]" href="/dashboard/matches">{ar ? "متابعة الطلبات" : "Track requests"}</Link>
        </div>
      </article>)}</div>
      <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={ar ? "صفحات الدليل" : "Directory pages"}>
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{ar ? "السابق" : "Previous"}</Button>
        <span>{ar ? `صفحة ${page} من ${lastPage}` : `Page ${page} of ${lastPage}`}</span>
        <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage(value => value + 1)}>{ar ? "التالي" : "Next"}</Button>
      </nav>
    </>}
    <Dialog open={!!target} onOpenChange={open => { if (!open && !sending) setTarget(null) }}><DialogContent>
      <DialogHeader><DialogTitle>{ar ? `طلب تعارف مع ${target?.name ?? ""}` : `Introduction to ${target?.name ?? ""}`}</DialogTitle><DialogDescription>{ar ? "اشرح هدف التواصل والموضوع الذي تود مناقشته. يصل الطلب للمراجعة قبل بدء التواصل." : "Describe why you would like to connect and what you want to discuss. Requests are reviewed before a connection is made."}</DialogDescription></DialogHeader>
      <form onSubmit={introduce} className="space-y-4"><label className="block text-sm font-semibold" htmlFor="intro-brief">{ar ? "هدف التعارف" : "Reason for introduction"}</label><Textarea id="intro-brief" required minLength={20} maxLength={4000} value={brief} onChange={event => setBrief(event.target.value)} />
        {sendError && <p role="alert" className="text-rose-700">{sendError}</p>}<Button type="submit" loading={sending} disabled={brief.trim().length < 20}>{ar ? "إرسال الطلب" : "Send request"}</Button>
      </form>
    </DialogContent></Dialog>
  </div>
}
