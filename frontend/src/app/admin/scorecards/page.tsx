"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type AdminScorecard = {
  id: number
  founder_name?: string | null
  founder_profile_id: number
  founder_uid?: string | null
  founder_slug?: string | null
  founder_status?: string | null
  founder_is_public: boolean
  user_email?: string | null
  email_verified: boolean
  invitation_email?: string | null
  aggregate_score: number
  momentum: number
  growth: number
  readiness: number
  support_delta: number
  updated_at?: string
}

type AdminScorecardsResponse = {
  data: AdminScorecard[]
  meta: { current_page: number; total: number; per_page: number }
}

export default function AdminScorecardsPage() {
  const [items, setItems] = useState<AdminScorecard[]>([])
  const [selected, setSelected] = useState<AdminScorecard | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [evidence, setEvidence] = useState("")
  const [recipientVerified, setRecipientVerified] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [override, setOverride] = useState({
    aggregate_score: "",
    momentum: "",
    growth: "",
    readiness: "",
    support_delta: "",
    override_note: "",
  })
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (currentPage: number) => {
    try {
      const res = await api.get<AdminScorecardsResponse>("/admin/scorecards", { params: { page: currentPage } })
      setItems(res.data)
      setPage(currentPage)
      setTotal(res.meta.total)
      setSelected((current) => res.data.find((item) => item.id === current?.id) ?? null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load scorecards")
    }
  }, [])

  const sendEmail = async () => {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (selected.user_email) {
        await api.post(`/admin/scorecards/${selected.id}/verify-email`)
        setNotice("Verification email accepted by the mail transport. Check delivery through your mail provider.")
      } else {
        await api.post(`/admin/founders/${selected.founder_profile_id}/invite`, {
          email: recipientEmail,
          recipient_evidence: evidence,
          recipient_verified: recipientVerified,
        })
        setNotice("Activation invitation accepted by the mail transport. Check delivery through your mail provider.")
        setEvidence("")
        setRecipientVerified(false)
      }
      await load(page)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send email")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load(1)
  }, [load])

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
      await load(page)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply override")
    }
  }

  const choose = (item: AdminScorecard) => {
    setSelected(item)
    setRecipientEmail(item.invitation_email ?? "")
    setEvidence("")
    setRecipientVerified(false)
    setNotice(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Scorecards</h2>
        <p className="text-sm text-gray-500 mt-1">Admin override controls and auditable adjustments.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Founder Scorecards</h3></CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                <button type="button" onClick={() => choose(item)} className="w-full text-left hover:underline">
                  <span className="text-sm font-semibold text-gray-900">{item.founder_name || `Founder #${item.founder_profile_id}`}</span>
                  {item.founder_uid && <code dir="ltr" className="mt-1 block break-all text-[11px] text-slate-500">{item.founder_uid}</code>}
                  <span className="block text-xs text-gray-500">Aggregate: {item.aggregate_score} · Momentum: {item.momentum} · Growth: {item.growth}</span>
                </button>
                {item.founder_slug ? <Link className="text-sm underline" href={item.founder_is_public && item.founder_status === "active" ? `/founders/${item.founder_slug}` : `/admin/founders?search=${encodeURIComponent(item.founder_slug)}`}>View profile</Link> : null}
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} · {total} scorecards</span>
              <Button variant="outline" disabled={page * 20 >= total} onClick={() => void load(page + 1)}>Next</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Override Panel</h3></CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <p className="text-sm text-gray-600">Selected: <span className="font-semibold text-gray-900">{selected.founder_name || `Founder #${selected.id}`}</span></p>
                {selected.founder_uid && <p className="break-all text-xs text-slate-600">Founder ID: <code dir="ltr">{selected.founder_uid}</code></p>}
                {selected.founder_slug ? <Link className="inline-block text-sm underline" href={selected.founder_is_public && selected.founder_status === "active" ? `/founders/${selected.founder_slug}` : `/admin/founders?search=${encodeURIComponent(selected.founder_slug)}`}>View founder profile</Link> : null}
                {selected.user_email ? (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-sm">{selected.user_email} · {selected.email_verified ? "Email verified" : "Email unverified"}</p>
                    {!selected.email_verified && selected.founder_status === "active" ? <Button disabled={busy} onClick={() => void sendEmail()}>Send verification email</Button> : null}
                  </div>
                ) : selected.founder_slug && selected.founder_status === "active" ? (
                  <form className="space-y-2 border-t pt-3" onSubmit={(event) => { event.preventDefault(); void sendEmail() }}>
                    <p className="text-sm">Unclaimed profile · Invite the verified founder to activate their account.</p>
                    <label className="block text-sm">Founder email<Input type="email" required maxLength={255} value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} /></label>
                    <label className="block text-sm">How was this recipient verified?<textarea className="w-full rounded border p-2" required minLength={10} maxLength={2000} value={evidence} onChange={(event) => setEvidence(event.target.value)} /></label>
                    <label className="flex gap-2 text-sm"><input type="checkbox" required checked={recipientVerified} onChange={(event) => setRecipientVerified(event.target.checked)} />I verified this address belongs to the founder or their authorized administrator.</label>
                    <Button type="submit" disabled={busy}>Send activation invitation</Button>
                  </form>
                ) : null}
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
