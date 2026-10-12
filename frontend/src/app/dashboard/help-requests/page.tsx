"use client"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Clock3, HandHelping, Lightbulb, Loader2, MessageCircle, MessagesSquare, Plus, Search, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import { useLocale, type Locale } from "@/lib/locale"

type Category = "fundraising" | "growth" | "product" | "hiring" | "legal" | "finance" | "technology" | "partnerships" | "marketing" | "operations" | "founder_wellness" | "other"
type Urgency = "low" | "normal" | "high"
type Visibility = "private_admin" | "matched_founders" | "founder_circle" | "community_public"

type MyQuestion = {
  id: number; title: string; description: string; category: Category; urgency: Urgency; status: string
  visibility: Visibility; created_at: string; chat_room_id?: number | null; helpers_count?: number
}
type CommunityQuestion = {
  id: number; title: string; description: string; category: Category; urgency: Urgency; status: string
  created_at: string; requester: { name: string | null }; helpers_count: number; offered_by_me: boolean; chat_room_id: number | null
}
type Page<T> = { data: T[]; current_page?: number; last_page?: number; total?: number }

const L = (locale: Locale, ar: string, en: string) => (locale === "ar" ? ar : en)

const CATEGORIES: Record<Category, [string, string]> = {
  fundraising: ["التمويل", "Fundraising"], growth: ["النمو والمبيعات", "Growth & sales"], product: ["المنتج", "Product"],
  hiring: ["التوظيف", "Hiring"], legal: ["القانون", "Legal"], finance: ["المالية", "Finance"], technology: ["التقنية", "Technology"],
  partnerships: ["الشراكات", "Partnerships"], marketing: ["التسويق", "Marketing"], operations: ["العمليات", "Operations"],
  founder_wellness: ["القيادة والتوازن", "Leadership & wellbeing"], other: ["أخرى", "Other"],
}
const URGENCY: Record<Urgency, [string, string]> = { low: ["غير عاجل", "Not urgent"], normal: ["خلال أيام", "Within days"], high: ["عاجل", "Urgent"] }
const STATUS: Record<string, [string, string, string]> = {
  open: ["بانتظار المساعدة", "Waiting for help", "bg-amber-50 text-amber-800 ring-amber-200"],
  matching: ["نبحث عن مساعدين", "Finding helpers", "bg-amber-50 text-amber-800 ring-amber-200"],
  helpers_invited: ["تمت دعوة مساعدين", "Helpers invited", "bg-indigo-50 text-indigo-800 ring-indigo-200"],
  in_progress: ["قيد النقاش", "In discussion", "bg-indigo-50 text-indigo-800 ring-indigo-200"],
  resolved: ["تم الحل", "Resolved", "bg-emerald-50 text-emerald-800 ring-emerald-200"],
  closed: ["مغلق", "Closed", "bg-slate-100 text-slate-700 ring-slate-200"],
}
const VISIBILITY: Record<Visibility, [string, string, string, string]> = {
  community_public: ["كل أعضاء المجتمع", "All community members", "يظهر لكل الأعضاء في «أسئلة المؤسسين». أفضل خيار لتحصل على أكثر من رأي.", "Shown to every member under Questions from founders. Best for getting several views."],
  founder_circle: ["دائرة المؤسسين", "Founder circle", "يظهر للأعضاء المؤسسين في المجتمع.", "Shown to founder members of the community."],
  matched_founders: ["مؤسسون مقترحون فقط", "Suggested founders only", "نقترح أعضاء خبرتهم قريبة من سؤالك، ولا يراه غيرهم.", "We suggest members whose experience fits your question; nobody else sees it."],
  private_admin: ["فريق وصول فقط", "Wosool team only", "سؤال خاص يراه الفريق فقط، ويرشّح لك من يساعدك.", "Private: only the team sees it and points you to the right people."],
}

function timeAgo(value: string, locale: Locale) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const format = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit)
  return format.format(0, "minute")
}

const errorText = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback

function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "indigo" | "red" }) {
  const tones = { slate: "bg-slate-100 text-slate-700", indigo: "bg-indigo-50 text-indigo-700", red: "bg-red-50 text-red-700" }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>
}

function Expandable({ text, locale }: { text: string; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 240
  return <div>
    <p dir="auto" className={`whitespace-pre-line text-start text-sm leading-7 text-slate-600 ${!open && long ? "line-clamp-3" : ""}`}>{text}</p>
    {long && <button type="button" onClick={() => setOpen(value => !value)} className="mt-1 min-h-9 text-xs font-bold text-indigo-700 hover:underline">{open ? L(locale, "عرض أقل", "Show less") : L(locale, "اقرأ السؤال كاملًا", "Read the full question")}</button>}
  </div>
}

const blankForm = { title: "", description: "", category: "growth" as Category, urgency: "normal" as Urgency, visibility: "community_public" as Visibility, allow_ai_matching: true }

function AskTheCommunity() {
  const { locale, direction } = useLocale()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const tab = params.get("tab") === "mine" ? "mine" : "community"

  const [community, setCommunity] = useState<CommunityQuestion[]>([])
  const [mine, setMine] = useState<MyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [category, setCategory] = useState<Category | "">("")

  const [askOpen, setAskOpen] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const clearError = (key: string) => setErrors(previous => { const next = { ...previous }; delete next[key]; return next })

  const [offerFor, setOfferFor] = useState<CommunityQuestion | null>(null)
  const [note, setNote] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => { const id = window.setTimeout(() => setDebounced(query.trim()), 300); return () => window.clearTimeout(id) }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const [shared, own] = await Promise.all([
        api.get<Page<CommunityQuestion>>("/member/help-requests", { params: { scope: "community", q: debounced || undefined, category: category || undefined, per_page: 50 } }),
        api.get<Page<MyQuestion>>("/member/help-requests", { params: { scope: "mine", per_page: 50 } }),
      ])
      setCommunity(shared.data ?? [])
      setMine(own.data ?? [])
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [debounced, category])

  useEffect(() => { void load() }, [load])

  const setTab = (next: "community" | "mine") => {
    const search = new URLSearchParams(params.toString())
    if (next === "mine") search.set("tab", "mine"); else search.delete("tab")
    router.replace(search.toString() ? `${pathname}?${search}` : pathname, { scroll: false })
  }

  const openMine = useMemo(() => mine.filter(item => !["resolved", "closed"].includes(item.status)).length, [mine])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (form.title.trim().length < 8) nextErrors.title = L(locale, "اكتب سؤالك في جملة واضحة (8 أحرف على الأقل).", "Write your question as one clear sentence (at least 8 characters).")
    if (form.description.trim().length < 30) nextErrors.description = L(locale, "أضف سياقًا كافيًا ليساعدك الآخرون (30 حرفًا على الأقل).", "Add enough context for others to help (at least 30 characters).")
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    try {
      const response = await api.post<{ data: { help_request: MyQuestion } }>("/member/help-requests", { ...form, title: form.title.trim(), description: form.description.trim() })
      const created = response.data?.help_request
      if (created && form.allow_ai_matching && form.visibility !== "private_admin") {
        await api.post(`/member/help-requests/${created.id}/suggest-helpers`).catch(() => undefined)
      }
      toast(L(locale, "نُشر سؤالك وفُتحت له محادثة خاصة.", "Your question is posted and has its own private conversation."), "success")
      setAskOpen(false)
      setForm(blankForm)
      setTab("mine")
      await load()
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? (error.data as { errors?: Record<string, string[]> } | undefined)?.errors : undefined
      if (fieldErrors) setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value[0]])))
      toast(errorText(error, L(locale, "تعذر نشر السؤال. حاول مرة أخرى.", "Couldn't post your question. Please try again.")), "error")
    } finally {
      setSaving(false)
    }
  }

  async function offerHelp() {
    if (!offerFor) return
    setBusyId(offerFor.id)
    try {
      const response = await api.post<{ data: { chat_room_id: number } }>(`/member/help-requests/${offerFor.id}/offer-help`, { note: note.trim() || undefined })
      toast(L(locale, "انضممت إلى محادثة السؤال، وأبلغنا صاحبه.", "You joined the conversation and we let the founder know."), "success")
      setOfferFor(null)
      setNote("")
      router.push(`/dashboard/messages?room=${response.data.chat_room_id}`)
    } catch (error) {
      toast(errorText(error, L(locale, "تعذر إرسال عرض المساعدة.", "Couldn't send your offer to help.")), "error")
    } finally {
      setBusyId(null)
    }
  }

  async function updateMine(item: MyQuestion, change: "resolve" | "reopen" | Visibility) {
    setBusyId(item.id)
    try {
      if (change === "resolve") await api.post(`/member/help-requests/${item.id}/resolve`)
      else if (change === "reopen") await api.patch(`/member/help-requests/${item.id}`, { status: "open" })
      else await api.patch(`/member/help-requests/${item.id}`, { visibility: change })
      toast(change === "resolve" ? L(locale, "رائع! علّمنا السؤال «تم الحل».", "Great — marked as resolved.") : L(locale, "تم التحديث.", "Updated."), "success")
      await load()
    } catch (error) {
      toast(errorText(error, L(locale, "تعذر التحديث.", "Couldn't update.")), "error")
    } finally {
      setBusyId(null)
    }
  }

  const tabButton = (id: "community" | "mine", label: string, count: number) => <button type="button" role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} id={`tab-${id}`} onClick={() => setTab(id)}
    className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${tab === id ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
    {label}<span className={`rounded-full px-2 text-xs ${tab === id ? "bg-indigo-50 text-indigo-700" : "bg-slate-200/70"}`}>{count}</span>
  </button>

  const field = "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"

  return <div dir={direction} lang={locale} className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-indigo-600">{L(locale, "من مؤسس إلى مؤسس", "FOUNDER TO FOUNDER")}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{L(locale, "اسأل المجتمع", "Ask the community")}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">{L(locale, "اطرح سؤالًا عمليًا عن التمويل أو التوظيف أو التسعير أو التوسع، وساعد مؤسسين آخرين بخبرتك. لكل سؤال محادثة خاصة.", "Ask a practical question about fundraising, hiring, pricing or expansion, and help other founders with what you know. Every question gets its own private conversation.")}</p>
      </div>
      <button type="button" onClick={() => { setErrors({}); setAskOpen(true) }} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"><Plus size={18} aria-hidden="true" />{L(locale, "اطرح سؤالًا", "Ask a question")}</button>
    </header>

    <div role="tablist" aria-label={L(locale, "الأسئلة", "Questions")} className="inline-flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
      {tabButton("community", L(locale, "أسئلة المؤسسين", "Questions from founders"), community.length)}
      {tabButton("mine", L(locale, "أسئلتي", "My questions"), openMine)}
    </div>

    {failed && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <span>{L(locale, "تعذر تحميل الأسئلة.", "Couldn't load questions.")}</span>
      <button type="button" onClick={() => void load()} className="min-h-10 rounded-lg bg-white px-3 font-bold">{L(locale, "إعادة المحاولة", "Try again")}</button>
    </div>}

    {tab === "community" && <section id="panel-community" role="tabpanel" aria-labelledby="tab-community" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">{L(locale, "ابحث في الأسئلة", "Search questions")}</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={L(locale, "ابحث: تسعير، توظيف، جولة بذرية…", "Search: pricing, hiring, seed round…")} className={`${field} min-h-12 ps-11`} />
        </label>
        <label className="block">
          <span className="sr-only">{L(locale, "المجال", "Topic")}</span>
          <select value={category} onChange={event => setCategory(event.target.value as Category | "")} className={`${field} min-h-12`}>
            <option value="">{L(locale, "كل المجالات", "All topics")}</option>
            {Object.entries(CATEGORIES).map(([id, [ar, en]]) => <option key={id} value={id}>{L(locale, ar, en)}</option>)}
          </select>
        </label>
      </div>

      {loading && <div className="space-y-3" aria-hidden="true">{[0, 1, 2].map(index => <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-100" />)}</div>}

      {!loading && !failed && community.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <MessagesSquare size={36} aria-hidden="true" className="mx-auto text-indigo-500" />
        <p className="mt-3 font-bold text-slate-900">{debounced || category ? L(locale, "لا توجد أسئلة مطابقة.", "No matching questions.") : L(locale, "لا توجد أسئلة مفتوحة الآن.", "No open questions right now.")}</p>
        <p className="mt-1 text-sm text-slate-600">{L(locale, "كن أول من يسأل، فغالبًا هناك مؤسس مرّ بالتجربة نفسها.", "Be the first to ask — chances are another founder has been there.")}</p>
        <button type="button" onClick={() => setAskOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"><Plus size={16} aria-hidden="true" />{L(locale, "اطرح سؤالًا", "Ask a question")}</button>
      </div>}

      {!loading && <ul className="space-y-3">
        {community.map(item => <li key={item.id}>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm sm:p-6" aria-labelledby={`question-${item.id}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="indigo">{L(locale, ...CATEGORIES[item.category] ?? CATEGORIES.other)}</Chip>
              {item.urgency === "high" && <Chip tone="red"><Clock3 size={12} aria-hidden="true" />{L(locale, ...URGENCY.high)}</Chip>}
              {item.offered_by_me && <Chip><CheckCircle2 size={12} aria-hidden="true" />{L(locale, "تساعد في هذا السؤال", "You're helping")}</Chip>}
            </div>
            <h2 id={`question-${item.id}`} dir="auto" className="text-start mt-3 text-lg font-bold leading-8 text-slate-950">{item.title}</h2>
            <div className="mt-2"><Expandable text={item.description} locale={locale} /></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                {item.requester.name || L(locale, "عضو في وصول", "A Wosool member")} · <time dateTime={item.created_at}>{timeAgo(item.created_at, locale)}</time>
                {" · "}<span className="inline-flex items-center gap-1"><Users size={12} aria-hidden="true" />{item.helpers_count ? L(locale, `${item.helpers_count} يساعدون`, `${item.helpers_count} helping`) : L(locale, "لا أحد يساعد بعد", "No helpers yet")}</span>
              </p>
              {item.offered_by_me && item.chat_room_id
                ? <Link href={`/dashboard/messages?room=${item.chat_room_id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800 hover:border-indigo-400"><MessageCircle size={16} aria-hidden="true" />{L(locale, "فتح المحادثة", "Open conversation")}</Link>
                : <button type="button" onClick={() => { setNote(""); setOfferFor(item) }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700"><HandHelping size={16} aria-hidden="true" />{L(locale, "أستطيع المساعدة", "I can help")}</button>}
            </div>
          </article>
        </li>)}
      </ul>}
    </section>}

    {tab === "mine" && <section id="panel-mine" role="tabpanel" aria-labelledby="tab-mine" className="space-y-3">
      {loading && <div className="h-40 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />}
      {!loading && !failed && mine.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Lightbulb size={36} aria-hidden="true" className="mx-auto text-indigo-500" />
        <p className="mt-3 font-bold text-slate-900">{L(locale, "لم تطرح أي سؤال بعد.", "You haven't asked anything yet.")}</p>
        <p className="mt-1 text-sm text-slate-600">{L(locale, "الأسئلة المحددة تحصل على أفضل الإجابات: ماذا جربت، وما الذي تحتاج أن تقرره؟", "Specific questions get the best answers: what have you tried, and what do you need to decide?")}</p>
        <button type="button" onClick={() => setAskOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"><Plus size={16} aria-hidden="true" />{L(locale, "اطرح سؤالك الأول", "Ask your first question")}</button>
      </div>}
      {!loading && mine.map(item => {
        const status = STATUS[item.status] ?? STATUS.open
        const done = ["resolved", "closed"].includes(item.status)
        return <article key={item.id} className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${done ? "opacity-80" : ""}`} aria-labelledby={`mine-${item.id}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${status[2]}`}>{L(locale, status[0], status[1])}</span>
            <Chip tone="indigo">{L(locale, ...CATEGORIES[item.category] ?? CATEGORIES.other)}</Chip>
            <span className="text-xs text-slate-500"><time dateTime={item.created_at}>{timeAgo(item.created_at, locale)}</time></span>
          </div>
          <h2 id={`mine-${item.id}`} dir="auto" className="text-start mt-3 text-lg font-bold leading-8 text-slate-950">{item.title}</h2>
          <div className="mt-2"><Expandable text={item.description} locale={locale} /></div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600">
              {L(locale, "من يراه:", "Who sees it:")}
              <select value={item.visibility} disabled={done || busyId === item.id} onChange={event => void updateMine(item, event.target.value as Visibility)} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800">
                {(Object.keys(VISIBILITY) as Visibility[]).map(id => <option key={id} value={id}>{L(locale, VISIBILITY[id][0], VISIBILITY[id][1])}</option>)}
              </select>
            </label>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Users size={12} aria-hidden="true" />{L(locale, `${item.helpers_count ?? 0} يساعدون`, `${item.helpers_count ?? 0} helping`)}</span>
            <div className="ms-auto flex flex-wrap gap-2">
              {item.chat_room_id && <Link href={`/dashboard/messages?room=${item.chat_room_id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800 hover:border-indigo-400"><MessageCircle size={16} aria-hidden="true" />{L(locale, "المحادثة", "Conversation")}</Link>}
              {done
                ? <button type="button" disabled={busyId === item.id} onClick={() => void updateMine(item, "reopen")} className="min-h-11 rounded-xl px-4 text-sm font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">{L(locale, "إعادة فتح", "Reopen")}</button>
                : <button type="button" disabled={busyId === item.id} onClick={() => void updateMine(item, "resolve")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{busyId === item.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}{L(locale, "تم الحل", "Mark resolved")}</button>}
            </div>
          </div>
        </article>
      })}
    </section>}

    <p className="text-sm text-slate-500">{L(locale, "لديك سؤال عن استخدام وصول نفسها؟ ", "A question about using Wosool itself? ")}<Link href="/faq" className="font-bold text-indigo-700 hover:underline">{L(locale, "راجع الأسئلة الشائعة", "See the FAQ")}</Link></p>

    <Dialog open={askOpen} onOpenChange={setAskOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{L(locale, "اطرح سؤالًا على المجتمع", "Ask the community")}</DialogTitle>
          <DialogDescription>{L(locale, "أفضل الأسئلة تذكر السياق، وما جربته، والقرار الذي تحتاج اتخاذه.", "The best questions give context, what you've tried, and the decision you need to make.")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5" dir={direction}>
          <div>
            <label htmlFor="q-title" className="text-sm font-bold text-slate-800">{L(locale, "سؤالك", "Your question")}</label>
            <input id="q-title" dir="auto" value={form.title} maxLength={255} onChange={event => { setForm(previous => ({ ...previous, title: event.target.value })); clearError("title") }} aria-invalid={Boolean(errors.title)} aria-describedby="q-title-hint"
              placeholder={L(locale, "مثال: كيف سعّرتم أول عقد مع عميل حكومي؟", "e.g. How did you price your first government contract?")} className={`${field} mt-2 min-h-12 ${errors.title ? "border-red-400" : ""}`} />
            <p id="q-title-hint" className={`mt-1 text-xs ${errors.title ? "text-red-700" : "text-slate-500"}`}>{errors.title || `${form.title.length}/255`}</p>
          </div>
          <div>
            <label htmlFor="q-body" className="text-sm font-bold text-slate-800">{L(locale, "التفاصيل", "Details")}</label>
            <textarea id="q-body" dir="auto" rows={6} value={form.description} maxLength={12000} onChange={event => { setForm(previous => ({ ...previous, description: event.target.value })); clearError("description") }} aria-invalid={Boolean(errors.description)} aria-describedby="q-body-hint"
              placeholder={L(locale, "مرحلة شركتك، ما جربته حتى الآن، وما الذي تريد الوصول إليه.", "Your company's stage, what you've tried so far, and what you want to get to.")} className={`${field} mt-2 py-3 leading-7 ${errors.description ? "border-red-400" : ""}`} />
            <p id="q-body-hint" className={`mt-1 text-xs ${errors.description ? "text-red-700" : "text-slate-500"}`}>{errors.description || L(locale, "لا تشارك أرقامًا سرية أو بيانات عملاء.", "Don't share confidential numbers or customer data.")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-800">{L(locale, "المجال", "Topic")}
              <select value={form.category} onChange={event => setForm(previous => ({ ...previous, category: event.target.value as Category }))} className={`${field} mt-2 min-h-12 font-normal`}>
                {Object.entries(CATEGORIES).map(([id, [ar, en]]) => <option key={id} value={id}>{L(locale, ar, en)}</option>)}
              </select>
            </label>
            <fieldset>
              <legend className="text-sm font-bold text-slate-800">{L(locale, "متى تحتاج الإجابة؟", "How soon do you need it?")}</legend>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                {(Object.keys(URGENCY) as Urgency[]).map(id => <label key={id} className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-xs font-bold ${form.urgency === id ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>
                  <input type="radio" name="urgency" value={id} checked={form.urgency === id} onChange={() => setForm(previous => ({ ...previous, urgency: id }))} className="sr-only" />{L(locale, ...URGENCY[id])}
                </label>)}
              </div>
            </fieldset>
          </div>
          <fieldset>
            <legend className="text-sm font-bold text-slate-800">{L(locale, "من يرى سؤالك؟", "Who can see your question?")}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.keys(VISIBILITY) as Visibility[]).map(id => <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-start transition ${form.visibility === id ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="visibility" value={id} checked={form.visibility === id} onChange={() => setForm(previous => ({ ...previous, visibility: id }))} className="mt-1 h-4 w-4 shrink-0 accent-indigo-600" />
                <span><span className="block text-sm font-bold text-slate-900">{L(locale, VISIBILITY[id][0], VISIBILITY[id][1])}</span><span className="mt-0.5 block text-xs leading-6 text-slate-600">{L(locale, VISIBILITY[id][2], VISIBILITY[id][3])}</span></span>
              </label>)}
            </div>
          </fieldset>
          {form.visibility !== "private_admin" && <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
            <input type="checkbox" checked={form.allow_ai_matching} onChange={event => setForm(previous => ({ ...previous, allow_ai_matching: event.target.checked }))} className="mt-1.5 h-4 w-4 shrink-0 accent-indigo-600" />
            {L(locale, "اقترح عليّ أعضاء تذكر ملفاتهم خبرة في هذا المجال.", "Suggest members whose profiles mention experience in this topic.")}
          </label>}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setAskOpen(false)} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700">{L(locale, "إلغاء", "Cancel")}</button>
            <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}{saving ? L(locale, "جارٍ النشر…", "Posting…") : L(locale, "انشر السؤال", "Post question")}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={Boolean(offerFor)} onOpenChange={value => { if (!value) setOfferFor(null) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{L(locale, "عرض المساعدة", "Offer to help")}</DialogTitle>
          <DialogDescription>{L(locale, "ستنضم إلى المحادثة الخاصة بهذا السؤال، ونبلغ صاحبه بالبريد دون مشاركة عنوانك.", "You'll join this question's private conversation and we'll email the founder — without sharing your address.")}</DialogDescription>
        </DialogHeader>
        {offerFor && <div className="space-y-4" dir={direction}>
          <p dir="auto" className="rounded-xl bg-slate-50 p-3 text-start text-sm font-bold leading-7 text-slate-800">{offerFor.title}</p>
          <label className="block text-sm font-bold text-slate-800" htmlFor="offer-note">{L(locale, "رسالة أولى (اختياري)", "First message (optional)")}</label>
          <textarea id="offer-note" dir="auto" rows={4} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} placeholder={L(locale, "عرّف بتجربتك ذات الصلة باختصار.", "Briefly share your relevant experience.")} className={`${field} py-3 leading-7`} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOfferFor(null)} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700">{L(locale, "إلغاء", "Cancel")}</button>
            <button type="button" onClick={() => void offerHelp()} disabled={busyId === offerFor.id} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{busyId === offerFor.id && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}{L(locale, "انضم إلى المحادثة", "Join the conversation")}</button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>
  </div>
}

export default function HelpRequestsPage() {
  return <Suspense fallback={<div className="mx-auto h-64 max-w-5xl animate-pulse rounded-3xl bg-slate-100" />}><AskTheCommunity /></Suspense>
}
