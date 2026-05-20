"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IntroductionRequest, IntroRoutingStatus } from "@/types/platform"

interface IntroRouterLedgerProps {
  initialInbound: IntroductionRequest[]
  initialOutbound: IntroductionRequest[]
}

const statusStyles: Record<IntroRoutingStatus, string> = {
  INTRO_PENDING: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  INTRO_APPROVED: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  ROUTE_EXPIRED: "text-slate-300 border-slate-500/30 bg-slate-500/10",
  DECLINED: "text-rose-300 border-rose-500/30 bg-rose-500/10",
}

export default function IntroRouterLedger({ initialInbound, initialOutbound }: IntroRouterLedgerProps) {
  const [inbound, setInbound] = useState<IntroductionRequest[]>(initialInbound)
  const [outbound, setOutbound] = useState<IntroductionRequest[]>(initialOutbound)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const inboundRows = inbound.map((item) => ({ ...item, direction: "inbound" as const }))
    const outboundRows = outbound.map((item) => ({ ...item, direction: "outbound" as const }))
    return [...inboundRows, ...outboundRows].sort((a, b) => (b.id - a.id))
  }, [inbound, outbound])

  async function patchStatus(id: number, action: "approve" | "decline"): Promise<void> {
    setBusyId(id)
    setError(null)

    try {
      const res = await fetch(`/api/v1/member/introductions/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${action} route`)
      }

      const next = payload?.data as IntroductionRequest | undefined
      if (!next) throw new Error("Invalid introduction response")

      setInbound((curr) => curr.map((item) => (item.id === id ? next : item)))
      setOutbound((curr) => curr.map((item) => (item.id === id ? next : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected request error")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="border-[#1E293B] bg-[#121826] text-slate-100">
      <CardHeader>
        <CardTitle>Intro Router Ledger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400">No intro requests yet.</p>
        ) : (
          rows.map((row) => (
            <div key={`${row.direction}-${row.id}`} className="rounded-lg border border-[#1E293B] bg-[#0B0F19] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {row.direction === "inbound" ? row.source_founder?.legal_name || "Founder" : row.target_founder?.legal_name || "Founder"}
                  </p>
                  <p className="text-xs text-slate-400">{row.direction === "inbound" ? "Inbound route" : "Outbound route"}</p>
                </div>
                <span className={`rounded-md border px-2 py-1 text-xs ${statusStyles[row.routing_status]}`}>
                  {row.routing_status}
                </span>
              </div>
              <p className="text-sm text-slate-300">{row.payload_context_brief}</p>
              <div className="mt-3 flex items-center gap-2">
                {row.routing_status === "INTRO_PENDING" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "approve")}
                      className="bg-[#0EA5E9] text-[#0B0F19] hover:bg-[#38bdf8]"
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => patchStatus(row.id, "decline")}
                      variant="outline"
                      className="border-[#1E293B] text-slate-200 hover:bg-[#1E293B]"
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
