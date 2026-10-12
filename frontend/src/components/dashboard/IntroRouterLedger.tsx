"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { IntroductionRequest, IntroRoutingStatus } from "@/types/platform"
import { parseIntroductionRequest } from "@/types/platform"
import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { dashboardDictionary } from "@/lib/dashboard-i18n"

interface IntroRouterLedgerProps {
  locale: DashboardLocale
  /** Optional server-provided rows; when omitted the ledger loads its own data. */
  initialInbound?: IntroductionRequest[]
  initialOutbound?: IntroductionRequest[]
  /** Called after a status change so parents can refresh counters/credits. */
  onChange?: () => void
}

type IntroductionsResponse = {
  data?: { inbound?: unknown[]; outbound?: unknown[] }
}

const statusStyle: Record<IntroRoutingStatus, { bg: string; text: string; border: string }> = {
  INTRO_PENDING: { bg: "#FFFBEB", text: "#92400e", border: "#FDE68A" },
  INTRO_APPROVED: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  ROUTE_EXPIRED: { bg: "#F8FAFC", text: "#64748b", border: "#E2E8F0" },
  DECLINED: { bg: "#FFF1F2", text: "#9f1239", border: "#FECDD3" },
}

function parseRows(rows: unknown[] | undefined): IntroductionRequest[] {
  return (rows ?? []).map(parseIntroductionRequest).filter((row): row is IntroductionRequest => row !== null)
}

/**
 * Member-facing introduction ledger.
 * Inbound pending requests can be accepted or declined by the target founder;
 * outbound pending requests can be withdrawn by the requester; accepted routes link to messages.
 */
export default function IntroRouterLedger({ initialInbound, initialOutbound, locale, onChange }: IntroRouterLedgerProps) {
  const copy = dashboardDictionary[locale].intro
  const selfLoading = initialInbound === undefined && initialOutbound === undefined
  const [inbound, setInbound] = useState<IntroductionRequest[]>(initialInbound ?? [])
  const [outbound, setOutbound] = useState<IntroductionRequest[]>(initialOutbound ?? [])
  const [loading, setLoading] = useState(selfLoading)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<IntroductionsResponse>("/member/introductions", { headers: { "X-Locale": locale } })
      setInbound(parseRows(response.data?.inbound))
      setOutbound(parseRows(response.data?.outbound))
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unexpectedError)
    } finally {
      setLoading(false)
    }
  }, [copy.unexpectedError, locale])

  useEffect(() => {
    if (selfLoading) void load()
  }, [load, selfLoading])

  const rows = useMemo(() => {
    const inboundRows = inbound.map((item) => ({ ...item, direction: "inbound" as const }))
    const outboundRows = outbound.map((item) => ({ ...item, direction: "outbound" as const }))
    return [...inboundRows, ...outboundRows].sort((a, b) => b.id - a.id)
  }, [inbound, outbound])

  async function patchStatus(id: number, action: "approve" | "decline"): Promise<void> {
    setBusyId(id)
    setError(null)
    try {
      const payload = await api.patch<{ data?: unknown }>(`/member/introductions/${id}/${action}`, undefined, {
        headers: { "X-Locale": locale },
      })
      const next = parseIntroductionRequest(payload?.data)
      if (!next) throw new Error(copy.invalidResponse)
      setInbound((curr) => curr.map((item) => (item.id === id ? next : item)))
      setOutbound((curr) => curr.map((item) => (item.id === id ? next : item)))
      onChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failedAction)
    } finally {
      setBusyId(null)
    }
  }

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", { day: "numeric", month: "short" }),
    [locale],
  )

  return (
    <section
      aria-labelledby="intro-ledger-title"
      aria-busy={loading}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.05)" }}
    >
      <div>
        <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#3B52D4] mb-2">
          {copy.badge}
        </div>
        <h2 id="intro-ledger-title" className="text-sm font-black text-slate-900">{copy.title}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 font-medium">{copy.loading}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 font-medium">{copy.noRequests}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const s = statusStyle[row.routing_status]
            const statusLabel = row.routing_status === "INTRO_PENDING"
              ? copy.pending
              : row.routing_status === "INTRO_APPROVED"
                ? copy.approved
                : row.routing_status === "ROUTE_EXPIRED"
                  ? copy.expired
                  : copy.declined
            const name = row.direction === "inbound"
              ? row.source_founder?.legal_name || copy.founderFallback
              : row.target_founder?.legal_name || copy.founderFallback
            const pending = row.routing_status === "INTRO_PENDING"
            return (
              <li key={`${row.direction}-${row.id}`} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 break-words">{name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {row.direction === "inbound" ? copy.inboundRoute : copy.outboundRoute}
                      {pending && row.expires_at ? ` · ${copy.expiresOn} ${dateFormatter.format(new Date(row.expires_at))}` : ""}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-extrabold"
                    style={{ background: s.bg, color: s.text, borderColor: s.border }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {row.payload_context_brief && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-line break-words">{row.payload_context_brief}</p>
                )}

                {pending && row.direction === "inbound" && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "approve")}
                      className="min-h-10 px-4 rounded-lg text-xs font-bold bg-[#3B52D4] text-white hover:bg-[#2E44C8] transition-colors disabled:opacity-50"
                    >
                      {copy.approve}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "decline")}
                      className="min-h-10 px-4 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {copy.decline}
                    </button>
                  </div>
                )}

                {pending && row.direction === "outbound" && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-500">{copy.awaitingResponse}</span>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "decline")}
                      className="min-h-10 px-4 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {copy.withdraw}
                    </button>
                  </div>
                )}

                {row.routing_status === "INTRO_APPROVED" && (
                  <Link
                    href="/dashboard/messages"
                    className="inline-flex min-h-10 items-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    {copy.openMessages}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-xs text-red-600 font-medium">
          <span>{error}</span>
          {selfLoading && (
            <button type="button" onClick={() => void load()} className="underline underline-offset-2">
              {copy.retry}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
