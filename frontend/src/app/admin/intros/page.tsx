"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import {
  adminIntros,
  fill,
  introActions,
  introDate,
  introFilterCount,
  introQuery,
  introStatusLabel,
  introStatusVariant,
  introStatuses,
  type AdminIntro,
  type AdminIntroMeta,
  type AdminIntroResponse,
  type IntroFilter,
  type IntroStatus,
} from "@/lib/admin-intros"
import { useLocale } from "@/lib/locale"

const filters: IntroFilter[] = ["all", ...introStatuses]

export default function AdminIntrosPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminIntros(locale)
  const [filter, setFilter] = useState<IntroFilter>("all")
  const [items, setItems] = useState<AdminIntro[]>([])
  const [meta, setMeta] = useState<AdminIntroMeta | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [loadingMore, setLoadingMore] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const latestRequest = useRef(0)
  const currentFilter = useRef(filter)

  // Reads the filter through a ref so a reload after a status change that started under an
  // earlier filter still loads the filter shown now; a slower earlier response is ignored.
  const load = useCallback(async (nextPage = 1) => {
    const request = ++latestRequest.current
    if (nextPage === 1) setStatus("loading")
    else setLoadingMore(true)
    try {
      const response = await api.get<AdminIntroResponse>(introQuery(currentFilter.current, nextPage))
      if (request !== latestRequest.current) return
      setItems((previous) => (nextPage === 1 ? response.data : [...previous, ...response.data]))
      setMeta(response.meta)
      setPage(nextPage)
      setHasMore(Boolean(response.links?.next))
      setStatus("ready")
    } catch {
      if (request !== latestRequest.current) return
      if (nextPage === 1) setStatus("error")
      else toast(copy.loadFailed, "error")
    } finally {
      if (request === latestRequest.current) setLoadingMore(false)
    }
  }, [copy.loadFailed, toast])

  useEffect(() => {
    currentFilter.current = filter
    void load(1)
  }, [filter, load])

  const names = (item: AdminIntro) => ({
    source: item.source_founder?.legal_name || copy.founder,
    target: item.target_founder?.legal_name || copy.founder,
  })

  const updateStatus = async (item: AdminIntro, next: IntroStatus) => {
    const confirmText = next === "INTRO_APPROVED" ? copy.confirmApprove : next === "DECLINED" ? copy.confirmDecline : copy.confirmExpire
    if (!window.confirm(fill(confirmText, names(item)))) return
    setBusyId(item.id)
    try {
      await api.patch(`/admin/intros/${item.id}`, { routing_status: next })
      toast(copy.updated, "success")
      await load(1)
    } catch {
      toast(copy.updateFailed, "error")
    } finally {
      setBusyId(null)
    }
  }

  const actionLabel = (next: IntroStatus) => (next === "INTRO_APPROVED" ? copy.approve : next === "DECLINED" ? copy.decline : copy.expire)
  const filterLabel = (value: IntroFilter) => (value === "all" ? copy.all : introStatusLabel(locale, value))
  const filteredTotal = introFilterCount(meta, filter) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">{copy.intro}</p>
      </div>

      <div role="group" aria-label={copy.filterLabel} className="flex flex-wrap gap-2">
        {filters.map((value) => {
          const count = introFilterCount(meta, value)
          const active = filter === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B52D4] ${active ? "border-[#1F2A6B] bg-[#1F2A6B] text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}
            >
              <span>{filterLabel(value)}</span>
              {count !== null ? <span className={`tabular-nums ${active ? "text-white/80" : "text-gray-500"}`}>{count}</span> : null}
            </button>
          )
        })}
      </div>

      {status === "loading" ? (
        <p role="status" className="text-sm text-gray-600">{copy.loading}</p>
      ) : status === "error" ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{copy.loadFailed}</span>
          <Button size="sm" variant="outline" className="min-h-11" onClick={() => void load(1)}>{copy.retry}</Button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600">
          {filter === "all" ? copy.empty : copy.emptyFilter}
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => {
              const { source, target } = names(item)
              const sent = introDate(locale, item.created_at)
              const expires = item.routing_status === "INTRO_PENDING" ? introDate(locale, item.expires_at) : null
              const actions = introActions(item.routing_status)
              const busy = busyId === item.id
              const hintId = `intro-${item.id}-approve-hint`
              return (
                <li key={item.id}>
                  <Card>
                    <CardContent className="space-y-3 pt-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <dl className="grid min-w-0 grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
                          <dt className="text-gray-500">{copy.requestedBy}</dt>
                          <dd className="min-w-0 break-words font-semibold text-gray-900">{source}</dd>
                          <dt className="text-gray-500">{copy.requestedOf}</dt>
                          <dd className="min-w-0 break-words font-semibold text-gray-900">{target}</dd>
                        </dl>
                        <Badge variant={introStatusVariant(item.routing_status)}>{introStatusLabel(locale, item.routing_status)}</Badge>
                      </div>
                      {sent || expires ? (
                        <p className="text-xs text-gray-600">
                          {[sent ? fill(copy.requestedOn, { date: sent }) : null, expires ? fill(copy.expiresOn, { date: expires }) : null].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold text-gray-500">{copy.message}</p>
                        <p dir="auto" className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{item.payload_context_brief?.trim() || copy.noMessage}</p>
                      </div>
                      {item.tracking_notes?.trim() ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{copy.note}</p>
                          <p dir="auto" className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{item.tracking_notes}</p>
                        </div>
                      ) : null}
                      {actions.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {actions.map((next) => (
                              <Button
                                key={next}
                                size="sm"
                                variant="outline"
                                className="min-h-11"
                                disabled={busy}
                                aria-describedby={next === "INTRO_APPROVED" ? hintId : undefined}
                                onClick={() => void updateStatus(item, next)}
                              >
                                {actionLabel(next)}
                              </Button>
                            ))}
                          </div>
                          {actions.includes("INTRO_APPROVED") ? <p id={hintId} className="text-xs text-gray-600">{copy.approveHint}</p> : null}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" aria-live="polite">{fill(copy.shown, { shown: items.length, total: Math.max(filteredTotal, items.length) })}</p>
            {hasMore ? (
              <Button variant="outline" className="min-h-11" disabled={loadingMore} onClick={() => void load(page + 1)}>{copy.loadMore}</Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
