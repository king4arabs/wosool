"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type AdminScorecard = {
  id: number
  founder_name?: string | null
  aggregate_score: number
  momentum: number
  growth: number
  readiness: number
  support_delta: number
  updated_at?: string
}

type AdminScorecardsResponse = {
  data: AdminScorecard[]
}

export default function AdminScorecardsPage() {
  const [items, setItems] = useState<AdminScorecard[]>([])
  const [selected, setSelected] = useState<AdminScorecard | null>(null)
  const [override, setOverride] = useState({
    aggregate_score: "",
    momentum: "",
    growth: "",
    readiness: "",
    support_delta: "",
    override_note: "",
  })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await api.get<AdminScorecardsResponse>("/admin/scorecards")
      setItems(res.data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load scorecards")
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; state updates happen after await
    void load()
  }, [])

  const applyOverride = async () => {
    if (!selected) return

    try {
      await api.patch(`/admin/scorecards/${selected.id}/override`, {
        aggregate_score: override.aggregate_score ? Number(override.aggregate_score) : undefined,
        momentum: override.momentum ? Number(override.momentum) : undefined,
        growth: override.growth ? Number(override.growth) : undefined,
        readiness: override.readiness ? Number(override.readiness) : undefined,
        support_delta: override.support_delta ? Number(override.support_delta) : undefined,
        override_note: override.override_note,
      })
      setOverride({ aggregate_score: "", momentum: "", growth: "", readiness: "", support_delta: "", override_note: "" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply override")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Scorecards</h2>
        <p className="text-sm text-gray-500 mt-1">Admin override controls and auditable adjustments.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Founder Scorecards</h3></CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">{item.founder_name || `Founder #${item.id}`}</p>
                <p className="text-xs text-gray-500">Aggregate: {item.aggregate_score} · Momentum: {item.momentum} · Growth: {item.growth}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Override Panel</h3></CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <p className="text-sm text-gray-600">Selected: <span className="font-semibold text-gray-900">{selected.founder_name || `Founder #${selected.id}`}</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Aggregate" value={override.aggregate_score} onChange={(e) => setOverride((c) => ({ ...c, aggregate_score: e.target.value }))} />
                  <Input placeholder="Momentum" value={override.momentum} onChange={(e) => setOverride((c) => ({ ...c, momentum: e.target.value }))} />
                  <Input placeholder="Growth" value={override.growth} onChange={(e) => setOverride((c) => ({ ...c, growth: e.target.value }))} />
                  <Input placeholder="Readiness" value={override.readiness} onChange={(e) => setOverride((c) => ({ ...c, readiness: e.target.value }))} />
                  <Input placeholder="Support Delta" value={override.support_delta} onChange={(e) => setOverride((c) => ({ ...c, support_delta: e.target.value }))} />
                </div>
                <Input placeholder="Override note (required)" value={override.override_note} onChange={(e) => setOverride((c) => ({ ...c, override_note: e.target.value }))} />
                <Button onClick={applyOverride}>Apply Override</Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a scorecard to apply an override.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
