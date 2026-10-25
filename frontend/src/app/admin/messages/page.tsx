"use client"

import { useCallback, useEffect, useState } from "react"
import { Mail, RotateCcw, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type ContactCategory, type InboxMessage, type InboxResponse, type InboxStatus, inboxParams, replyHref } from "@/lib/contact-inbox"
import { useLocale } from "@/lib/locale"
import { dateLocale } from "@/lib/date-locale"

const categories: { value: ContactCategory; ar: string; en: string }[] = [
  { value: "general", ar: "سؤال عام", en: "General question" },
  { value: "founder-support", ar: "دعم المؤسسين", en: "Founder support" },
  { value: "partnerships", ar: "شراكة", en: "Partnership" },
  { value: "sponsorship", ar: "رعاية", en: "Sponsorship" },
  { value: "media", ar: "إعلام", en: "Media" },
  { value: "office-hours", ar: "جلسة مع الفريق", en: "Time with the team" },
]

const copy = {
  ar: {
    title: "رسائل التواصل",
    lead: "كل ما يصل من صفحة التواصل. ردّ من بريدك، ثم علّم الرسالة بأنه تم الرد عليها حتى يعرف بقية الفريق.",
    open: "بانتظار الرد", answered: "تم الرد", all: "الكل", status: "الحالة", category: "التصنيف", allCategories: "كل التصنيفات",
    refresh: "تحديث", reply: "رد بالبريد", markAnswered: "تم الرد", reopen: "إعادة فتح",
    answeredBy: (name: string, date: string) => `تم الرد بواسطة ${name} في ${date}`,
    empty: "لا توجد رسائل بهذه التصفية.", loading: "جارٍ التحميل…", failed: "تعذر تحميل الرسائل.", saveFailed: "تعذر حفظ الحالة.",
    previous: "السابق", next: "التالي", page: (n: number, of: number) => `صفحة ${n} من ${of}`,
  },
  en: {
    title: "Contact messages",
    lead: "Everything sent from the contact page. Reply from your email, then mark the message answered so the rest of the team knows.",
    open: "Waiting for a reply", answered: "Answered", all: "All", status: "Status", category: "Category", allCategories: "All categories",
    refresh: "Refresh", reply: "Reply by email", markAnswered: "Mark answered", reopen: "Reopen",
    answeredBy: (name: string, date: string) => `Answered by ${name} on ${date}`,
    empty: "No messages match this filter.", loading: "Loading…", failed: "Could not load messages.", saveFailed: "Could not save the status.",
    previous: "Previous", next: "Next", page: (n: number, of: number) => `Page ${n} of ${of}`,
  },
} as const

export default function AdminMessagesPage() {
  const { locale } = useLocale()
  const lang = locale === "ar" ? "ar" : "en"
  const t = copy[lang]
  const { toast } = useToast()
  const [status, setStatus] = useState<InboxStatus>("open")
  const [category, setCategory] = useState<ContactCategory | "">("")
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<InboxResponse | null>(null)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)

  const date = useCallback((value: string | null) => value
    ? new Intl.DateTimeFormat(dateLocale(lang === "ar", "en-GB"), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(new Date(value))
    : "—", [lang])

  const load = useCallback(async () => {
    try {
      setResult(await api.get<InboxResponse>("/admin/contact-messages", { params: inboxParams(status, category, page) }))
      setError("")
    } catch {
      setError(t.failed)
    }
  }, [status, category, page, t.failed])

  useEffect(() => {
    void load()
  }, [load])

  async function setAnswered(message: InboxMessage, answered: boolean) {
    setBusyId(message.id)
    try {
      await api.patch(`/admin/contact-messages/${message.id}`, { answered })
      await load()
    } catch (e) {
      toast(e instanceof Error ? e.message : t.saveFailed, "error")
    } finally {
      setBusyId(null)
    }
  }

  const statuses: [InboxStatus, string, number | undefined][] = [
    ["open", t.open, result?.meta.open],
    ["answered", t.answered, result?.meta.answered],
    ["", t.all, undefined],
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-[var(--text)]">{t.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t.lead}</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => void load()}>{t.refresh}</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div role="group" aria-label={t.status} className="flex flex-wrap gap-2">
            {statuses.map(([value, label, count]) => (
              <Button key={value || "all"} size="sm" className="shrink-0" variant={status === value ? "default" : "outline"} aria-pressed={status === value}
                onClick={() => { setStatus(value); setPage(1) }}>
                {label}{count !== undefined ? ` (${count})` : ""}
              </Button>
            ))}
          </div>
          <Select aria-label={t.category} className="sm:max-w-60" value={category}
            onChange={(event) => { setCategory(event.target.value as ContactCategory | ""); setPage(1) }}>
            <option value="">{t.allCategories}</option>
            {categories.map((item) => <option key={item.value} value={item.value}>{item[lang]}</option>)}
          </Select>
        </CardContent>
      </Card>

      {error ? <p role="alert" className="rounded-lg bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">{error}</p> : null}
      {!result && !error ? <p className="text-sm text-[var(--text-muted)]">{t.loading}</p> : null}
      {result && result.data.length === 0 ? <Card><CardContent className="pt-5 text-sm text-[var(--text-muted)]">{t.empty}</CardContent></Card> : null}

      <div className="space-y-3">
        {result?.data.map((message) => (
          <Card key={message.id}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-[var(--text)]"><bdi>{message.subject}</bdi></h3>
                  <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                    <bdi>{message.name}</bdi>{message.company ? <> · <bdi>{message.company}</bdi></> : null} · <bdi dir="ltr">{message.email}</bdi>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Badge variant="secondary">{message.category_label[lang]}</Badge>
                  <Badge variant={message.responded_at ? "success" : "warning"}>{message.responded_at ? t.answered : t.open}</Badge>
                </div>
              </div>
              <p className="whitespace-pre-line break-words text-sm leading-7 text-[var(--text)]"><bdi>{message.message}</bdi></p>
              <p className="text-xs text-[var(--text-muted)]">
                <time dateTime={message.created_at ?? undefined}>{date(message.created_at)}</time>
                {message.responded_at ? ` · ${t.answeredBy(message.responded_by?.name ?? "—", date(message.responded_at))}` : null}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <a href={replyHref(message)}><Mail className="size-4" aria-hidden />{t.reply}</a>
                </Button>
                {message.responded_at ? (
                  <Button size="sm" variant="outline" className="shrink-0" disabled={busyId === message.id} onClick={() => void setAnswered(message, false)}>
                    <RotateCcw className="size-4" aria-hidden />{t.reopen}
                  </Button>
                ) : (
                  <Button size="sm" className="shrink-0" disabled={busyId === message.id} onClick={() => void setAnswered(message, true)}>
                    <Check className="size-4" aria-hidden />{t.markAnswered}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {result && result.meta.last_page > 1 ? (
        <nav className="flex flex-wrap items-center gap-3" aria-label={t.page(page, result.meta.last_page)}>
          <Button size="sm" variant="outline" className="shrink-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t.previous}</Button>
          <span className="text-sm text-[var(--text-muted)]">{t.page(page, result.meta.last_page)}</span>
          <Button size="sm" variant="outline" className="shrink-0" disabled={page >= result.meta.last_page} onClick={() => setPage((p) => p + 1)}>{t.next}</Button>
        </nav>
      ) : null}
    </div>
  )
}
