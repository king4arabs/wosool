"use client"

import { useMemo, useState } from "react"
import type { IntroductionRequest, IntroRoutingStatus } from "@/types/platform"
import type { DashboardLocale } from "@/lib/dashboard-i18n"
import { dashboardDictionary } from "@/lib/dashboard-i18n"

interface IntroRouterLedgerProps {
  initialInbound: IntroductionRequest[]
  initialOutbound: IntroductionRequest[]
  locale: DashboardLocale
}

const statusStyle: Record<IntroRoutingStatus, { bg: string; text: string; border: string }> = {
  INTRO_PENDING:  { bg: "#FFFBEB", text: "#92400e", border: "#FDE68A" },
  INTRO_APPROVED: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  ROUTE_EXPIRED:  { bg: "#F8FAFC", text: "#64748b", border: "#E2E8F0" },
  DECLINED:       { bg: "#FFF1F2", text: "#9f1239", border: "#FECDD3" },
}

export default function IntroRouterLedger({ initialInbound, initialOutbound, locale }: IntroRouterLedgerProps) {
  const copy = dashboardDictionary[locale].intro
  const [inbound, setInbound]   = useState<IntroductionRequest[]>(initialInbound)
  const [outbound, setOutbound] = useState<IntroductionRequest[]>(initialOutbound)
  const [busyId, setBusyId]     = useState<number | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const rows = useMemo(() => {
    const inboundRows  = inbound.map((item)  => ({ ...item, direction: "inbound"  as const }))
    const outboundRows = outbound.map((item) => ({ ...item, direction: "outbound" as const }))
    return [...inboundRows, ...outboundRows].sort((a, b) => b.id - a.id)
  }, [inbound, outbound])

  async function patchStatus(id: number, action: "approve" | "decline"): Promise<void> {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch(`/api/v1/member/introductions/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: { Accept: "application/json", "X-Locale": locale },
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(payload?.message || copy.failedAction)
      const next = payload?.data as IntroductionRequest | undefined
      if (!next) throw new Error(copy.invalidResponse)
      setInbound((curr)  => curr.map((item)  => (item.id === id ? next : item)))
      setOutbound((curr) => curr.map((item) => (item.id === id ? next : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unexpectedError)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4"
      style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.05)" }}
    >
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#3B52D4] mb-2">
          {copy.badge}
        </div>
        <h3 className="text-sm font-black text-slate-900">{copy.title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-400 font-medium">{copy.noRequests}</p>
        </div>
      ) : (
        <div className="space-y-3">
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
            return (
              <div
                key={`${row.direction}-${row.id}`}
                className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-black text-slate-900">{name}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {row.direction === "inbound" ? copy.inboundRoute : copy.outboundRoute}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold"
                    style={{ background: s.bg, color: s.text, borderColor: s.border }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {row.payload_context_brief && (
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{row.payload_context_brief}</p>
                )}

                {row.routing_status === "INTRO_PENDING" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "approve")}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#3B52D4] text-white hover:bg-[#2E44C8] transition-colors disabled:opacity-50"
                    >
                      {copy.approve}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "decline")}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {copy.decline}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}
