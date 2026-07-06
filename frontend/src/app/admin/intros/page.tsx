"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type AdminIntro = {
  id: number
  routing_status: "INTRO_PENDING" | "INTRO_APPROVED" | "ROUTE_EXPIRED" | "DECLINED"
  payload_context_brief: string
  tracking_notes?: string | null
  source_founder?: { legal_name?: string }
  target_founder?: { legal_name?: string }
  created_at?: string
}

type AdminIntroResponse = {
  data: AdminIntro[]
  meta: { total: number; pending: number; approved: number; expired: number; declined: number }
}

export default function AdminIntrosPage() {
  const [items, setItems] = useState<AdminIntro[]>([])
  const [meta, setMeta] = useState<AdminIntroResponse["meta"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await api.get<AdminIntroResponse>("/admin/intros")
      setItems(res.data)
      setMeta(res.meta)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load intros")
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; state updates happen after await
    void load()
  }, [])

  const updateStatus = async (id: number, routing_status: AdminIntro["routing_status"]) => {
    try {
      await api.patch(`/admin/intros/${id}`, { routing_status })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update intro")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Intros</h2>
        <p className="text-sm text-gray-500 mt-1">Admin moderation for introduction routes.</p>
      </div>

      {meta ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ["Total", meta.total],
            ["Pending", meta.pending],
            ["Approved", meta.approved],
            ["Expired", meta.expired],
            ["Declined", meta.declined],
          ].map(([label, value]) => (
            <Card key={String(label)}><CardContent className="pt-5"><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold">{value}</p></CardContent></Card>
          ))}
        </div>
      ) : null}

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Route Ledger</h3></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {item.source_founder?.legal_name || "Founder"} → {item.target_founder?.legal_name || "Founder"}
                </p>
                <Badge variant="secondary">{item.routing_status}</Badge>
              </div>
              <p className="text-sm text-gray-600">{item.payload_context_brief}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "INTRO_APPROVED")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "DECLINED")}>Decline</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "ROUTE_EXPIRED")}>Expire</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
