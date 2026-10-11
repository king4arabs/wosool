"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowUpRight, Search, Sparkles, UsersRound } from "lucide-react"
import { api } from "@/lib/api"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProfileCard } from "@/components/sections/ProfileCard"
import type { Founder } from "@/types"

type DirectoryFounder = Founder & { userId?: number }

export default function FounderDirectoryPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  const [search, setSearch] = useState(initialQuery)
  const [filter, setFilter] = useState(initialQuery)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [items, setItems] = useState<DirectoryFounder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [target, setTarget] = useState<DirectoryFounder | null>(null)
  const [brief, setBrief] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .get<{ data: ApiFounder[]; meta?: { last_page?: number } }>("/founders", {
        params: { search: filter, page, per_page: 12, community: true },
        headers: { "X-Locale": locale },
        signal: controller.signal,
      })
      .then((response) => {
        setItems(
          response.data.map((item) => ({
            ...mapFounder(item),
            userId: item.user?.id,
          })),
        )
        setLastPage(response.meta?.last_page ?? 1)
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load founders",
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, filter, locale, page])

  const resultsLabel = useMemo(
    () =>
      ar
        ? `${items.length} مؤسساً في هذه الصفحة`
        : `${items.length} founders on this page`,
    [ar, items.length],
  )

  async function introduce(event: FormEvent) {
    event.preventDefault()
    if (!target || sending) return

    setSending(true)
    setSendError(null)
    try {
      await api.post("/member/introductions", {
        target_founder_id: Number(target.id),
        payload_context_brief: brief.trim(),
      })
      toast(
        ar
          ? "تم إرسال طلب التعارف. يمكنك متابعة حالته من صفحة التوافق والتعارف."
          : "Introduction requested. Track its status from Matches & Introductions.",
        "success",
      )
      setTarget(null)
      setBrief("")
    } catch (requestError) {
      setSendError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send introduction",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="relative overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border-soft)] bg-[var(--brand-navy)] px-6 py-8 text-white shadow-[var(--shadow-raised)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(61,70,242,.55),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(255,52,110,.18),transparent_30%)]" aria-hidden="true" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--brand-light-blue)]">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              {ar ? "شبكة وصول الموثّقة" : "The trusted Wosool network"}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {ar
                ? "ابحث عن المؤسس المناسب للمحادثة القادمة"
                : "Find the right founder for your next conversation"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/75 sm:text-base">
              {ar
                ? "استكشف الملفات المعتمدة حسب الخبرة والقطاع والمرحلة، ثم اطلب تعارفاً منظماً يوضح سبب التواصل ويحترم خصوصية الطرفين."
                : "Explore approved profiles by experience, sector and stage, then request a structured introduction that explains the purpose and respects both founders’ privacy."}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="min-h-12 border-white/25 bg-white/10 font-bold text-white hover:bg-white hover:text-[var(--brand-navy)]"
          >
            <Link href="/dashboard/matches">
              {ar
                ? "متابعة التوافق والتعارف"
                : "Track matches & introductions"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <form
          role="search"
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setFilter(search.trim())
          }}
        >
          <label className="relative flex-1">
            <span className="sr-only">
              {ar ? "البحث عن مؤسس" : "Search founders"}
            </span>
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <Input
              className="min-h-12 ps-11"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                ar
                  ? "الاسم، الشركة، القطاع أو الخبرة"
                  : "Name, company, sector or expertise"
              }
            />
          </label>
          <Button type="submit" className="min-h-12 px-7 font-bold">
            {ar ? "بحث" : "Search"}
          </Button>
          {filter && (
            <Button
              type="button"
              variant="outline"
              className="min-h-12"
              onClick={() => {
                setSearch("")
                setFilter("")
                setPage(1)
              }}
            >
              {ar ? "مسح" : "Clear"}
            </Button>
          )}
        </form>
        <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]" role="status">
          {resultsLabel}
        </p>
      </section>

      {loading && (
        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          aria-label={ar ? "جارٍ تحميل الملفات" : "Loading profiles"}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-[34rem] animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-soft)] motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-card)] border border-[var(--error-border)] bg-[var(--error-bg)] p-5 text-[var(--error-text)]"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {ar ? "إعادة المحاولة" : "Try again"}
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {!items.length ? (
            <div className="grid min-h-56 place-items-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <div>
                <Sparkles className="mx-auto mb-4 h-7 w-7 text-[var(--action-bg)]" />
                <p className="font-bold">
                  {ar
                    ? "لا توجد نتائج مطابقة حالياً."
                    : "No matching founders right now."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((founder) => (
                <ProfileCard
                  key={founder.id}
                  data={{
                    company:
                      founder.primaryCompany?.name ||
                      founder.companyName ||
                      founder.name,
                    logo: founder.primaryCompany?.logoUrl,
                    companyBrief: founder.primaryCompany?.description,
                    website: founder.primaryCompany?.website,
                    founder: founder.name,
                    portrait: founder.avatarUrl,
                    role: founder.position,
                    founderBrief: founder.bio || founder.tagline,
                    location: founder.location,
                    sector: founder.sector,
                    stage: founder.stage,
                    founderHref: `/founders/${founder.slug}`,
                    href: founder.primaryCompany?.slug
                      ? `/founders/companies/${founder.primaryCompany.slug}`
                      : undefined,
                    founderSocials: [
                      {
                        label: "LinkedIn",
                        url: founder.linkedinUrl ?? "",
                      },
                      { label: "X", url: founder.twitterUrl ?? "" },
                    ].filter((social) => social.url),
                    actions:
                      founder.userId !== Number(user?.id) ? (
                        <Button
                          className="min-h-11 flex-1 font-bold"
                          onClick={() => {
                            setTarget(founder)
                            setBrief("")
                            setSendError(null)
                          }}
                        >
                          {ar
                            ? "طلب تعارف"
                            : "Request introduction"}
                        </Button>
                      ) : undefined,
                  }}
                />
              ))}
            </div>
          )}

          <nav
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-4"
            aria-label={ar ? "صفحات دليل المؤسسين" : "Founder directory pages"}
          >
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              {ar ? "السابق" : "Previous"}
            </Button>
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {ar
                ? `صفحة ${page} من ${lastPage}`
                : `Page ${page} of ${lastPage}`}
            </span>
            <Button
              variant="outline"
              disabled={page >= lastPage}
              onClick={() => setPage((value) => value + 1)}
            >
              {ar ? "التالي" : "Next"}
            </Button>
          </nav>
        </>
      )}

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open && !sending) setTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ar
                ? `طلب تعارف مع ${target?.name ?? ""}`
                : `Introduction to ${target?.name ?? ""}`}
            </DialogTitle>
            <DialogDescription>
              {ar
                ? "اشرح بوضوح سبب التواصل والقيمة التي يمكنك أن تقدمها. يراجع فريق وصول الطلب قبل فتح التواصل المباشر."
                : "Explain the reason for connecting and the value you can offer. Wosool reviews the request before direct contact is opened."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={introduce} className="space-y-4">
            <label
              className="block text-sm font-bold"
              htmlFor="intro-brief"
            >
              {ar ? "هدف التعارف" : "Introduction purpose"}
            </label>
            <Textarea
              id="intro-brief"
              required
              minLength={20}
              maxLength={4000}
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
            />
            <p className="text-xs text-[var(--text-muted)]">
              {brief.length}/4000
            </p>
            {sendError && (
              <p role="alert" className="text-[var(--error-text)]">
                {sendError}
              </p>
            )}
            <Button
              type="submit"
              loading={sending}
              disabled={brief.trim().length < 20}
              className="w-full font-bold"
            >
              {ar
                ? "إرسال طلب التعارف"
                : "Send introduction request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
