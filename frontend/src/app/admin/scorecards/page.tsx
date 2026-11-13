"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { ApiError, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/lib/locale"
import {
  adminScorecards,
  emailAction,
  emptyOverrideForm,
  fieldErrors,
  fill,
  formatUpdated,
  founderLabel,
  founderProfileLink,
  overridePayload,
  pageCount,
  scoreFields,
  scoreRanges,
  scorecardFieldId,
  sendErrorMessage,
  validateInvite,
  validateOverride,
  type AdminScorecard,
  type InviteErrors,
  type InviteField,
  type InviteForm,
  type OverrideErrors,
  type OverrideField,
  type OverrideForm,
} from "@/lib/admin-scorecards"

type AdminScorecardsResponse = {
  data: AdminScorecard[]
  meta: { current_page: number; total: number; per_page: number }
}

type Message = { kind: "success" | "error"; text: string } | null

const emptyInvite: InviteForm = { email: "", recipient_evidence: "", recipient_verified: false }
const overrideFields: OverrideField[] = [...scoreFields, "override_note"]
const inviteFields: InviteField[] = ["email", "recipient_evidence", "recipient_verified"]

export default function AdminScorecardsPage() {
  const { locale } = useLocale()
  const copy = adminScorecards(locale)
  const [items, setItems] = useState<AdminScorecard[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(20)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [override, setOverride] = useState<OverrideForm>(emptyOverrideForm)
  const [overrideErrors, setOverrideErrors] = useState<OverrideErrors>({})
  const [invite, setInvite] = useState<InviteForm>(emptyInvite)
  const [inviteErrors, setInviteErrors] = useState<InviteErrors>({})
  const [busy, setBusy] = useState<"override" | "email" | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const requestRef = useRef(0)
  const busyRef = useRef(false)
  // Fields are disabled while a request runs and a disabled input cannot take focus, so the first
  // invalid field is focused only once the form is enabled again.
  const [focusField, setFocusField] = useState<OverrideField | InviteField | null>(null)

  useEffect(() => {
    if (!focusField || busy) return
    document.getElementById(scorecardFieldId(focusField))?.focus()
    setFocusField(null)
  }, [focusField, busy])

  const selected = items.find((item) => item.id === selectedId) ?? null

  const load = useCallback(async (currentPage: number) => {
    const request = ++requestRef.current
    setStatus("loading")
    try {
      const res = await api.get<AdminScorecardsResponse>("/admin/scorecards", { params: { page: currentPage } })
      if (request !== requestRef.current) return
      setItems(res.data)
      setPage(res.meta.current_page ?? currentPage)
      setTotal(res.meta.total)
      setPerPage(res.meta.per_page || 20)
      setStatus("ready")
    } catch {
      if (request === requestRef.current) setStatus("error")
    }
  }, [])

  useEffect(() => {
    void load(1)
  }, [load])

  const choose = (item: AdminScorecard) => {
    setSelectedId(item.id)
    setOverride(emptyOverrideForm)
    setOverrideErrors({})
    setInvite({ ...emptyInvite, email: item.invitation_email ?? "" })
    setInviteErrors({})
    setMessage(null)
  }

  const start = (kind: "override" | "email") => {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(kind)
    setMessage(null)
    return true
  }

  const finish = () => {
    busyRef.current = false
    setBusy(null)
  }

  const applyOverride = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const found = validateOverride(locale, override)
    setOverrideErrors(found)
    if (Object.keys(found).length > 0) {
      const first = overrideFields.find((field) => found[field])
      if (first) setFocusField(first)
      setMessage({ kind: "error", text: found.form && !first ? found.form : copy.checkFields })
      return
    }
    if (!start("override")) return
    try {
      await api.patch(`/admin/scorecards/${selected.id}/override`, overridePayload(override))
      setOverride(emptyOverrideForm)
      setMessage({ kind: "success", text: copy.applied })
      await load(page)
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? fieldErrors(overrideFields, (err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
        : {}
      setOverrideErrors(apiErrors)
      const first = overrideFields.find((field) => apiErrors[field])
      if (first) setFocusField(first)
      setMessage({ kind: "error", text: first ? copy.checkFields : copy.applyFailed })
    } finally {
      finish()
    }
  }

  const sendVerification = async () => {
    if (!selected || !start("email")) return
    try {
      await api.post(`/admin/scorecards/${selected.id}/verify-email`)
      setMessage({ kind: "success", text: copy.verificationSent })
      await load(page)
    } catch (err) {
      setMessage({ kind: "error", text: sendErrorMessage(locale, err instanceof ApiError ? err.status : null) })
    } finally {
      finish()
    }
  }

  const sendInvite = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const found = validateInvite(locale, invite)
    setInviteErrors(found)
    const firstInvalid = inviteFields.find((field) => found[field])
    if (firstInvalid) {
      setFocusField(firstInvalid)
      setMessage({ kind: "error", text: copy.checkFields })
      return
    }
    if (!start("email")) return
    try {
      await api.post(`/admin/founders/${selected.founder_profile_id}/invite`, {
        email: invite.email.trim(),
        recipient_evidence: invite.recipient_evidence.trim(),
        recipient_verified: invite.recipient_verified,
      })
      setInvite((current) => ({ ...current, recipient_evidence: "", recipient_verified: false }))
      setMessage({ kind: "success", text: copy.inviteSent })
      await load(page)
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? fieldErrors(inviteFields, (err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
        : {}
      setInviteErrors(apiErrors)
      const first = inviteFields.find((field) => apiErrors[field])
      if (first) setFocusField(first)
      setMessage({ kind: "error", text: first ? copy.checkFields : sendErrorMessage(locale, err instanceof ApiError ? err.status : null) })
    } finally {
      finish()
    }
  }

  const fieldMessage = (id: string, error?: string, hint?: string): ReactNode => (
    <>
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs font-medium text-red-700">{error}</p>}
    </>
  )

  const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

  const scoreInput = (name: (typeof scoreFields)[number]) => {
    const id = scorecardFieldId(name)
    const { min, max } = scoreRanges[name]
    // A left-to-right isolate keeps "1–100" in order inside Arabic text.
    const hint = `\u2066${min}–${max}\u2069`
    return (
      <div key={name} className="space-y-1">
        <Label htmlFor={id}>{copy.scores[name]}</Label>
        <Input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={override[name]}
          disabled={busy !== null}
          placeholder={selected ? String(selected[name]) : undefined}
          aria-invalid={Boolean(overrideErrors[name])}
          aria-describedby={describedBy(id, overrideErrors[name], hint)}
          onChange={(event) => setOverride((current) => ({ ...current, [name]: event.target.value }))}
        />
        {fieldMessage(id, overrideErrors[name], hint)}
      </div>
    )
  }

  const pages = pageCount(total, perPage)
  const action = selected ? emailAction(selected) : "none"
  const selectedLink = selected ? founderProfileLink(selected) : null
  const noteId = scorecardFieldId("override_note")
  const emailId = scorecardFieldId("email")
  const evidenceId = scorecardFieldId("recipient_evidence")
  const verifiedId = scorecardFieldId("recipient_verified")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{copy.intro}</p>
      </div>

      <div aria-live="polite">
        {message ? (
          <div
            role={message.kind === "error" ? "alert" : "status"}
            className={message.kind === "error"
              ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">{copy.listTitle}</h3></CardHeader>
          <CardContent className="space-y-2">
            {status === "loading" && items.length === 0 ? <p role="status" className="text-sm text-gray-500">{copy.loading}</p> : null}
            {status === "error" ? (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{copy.loadFailed}</span>
                <Button variant="outline" onClick={() => void load(page)}>{copy.retry}</Button>
              </div>
            ) : null}
            {status === "ready" && items.length === 0 ? <p className="text-sm text-gray-500">{copy.empty}</p> : null}
            {items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item) => {
                  const name = founderLabel(locale, item)
                  const link = founderProfileLink(item)
                  const isSelected = item.id === selectedId
                  const updated = formatUpdated(locale, item.updated_at)
                  return (
                    <li key={item.id} className={isSelected ? "rounded-lg border-2 border-[#3B52D4] bg-[#3B52D4]/5 p-3" : "rounded-lg border border-gray-200 p-3"}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => choose(item)}
                        className="block min-h-11 w-full text-start hover:underline"
                      >
                        <span className="text-sm font-semibold text-gray-900" dir="auto">{name}</span>
                        {isSelected ? <span className="ms-2 text-xs font-medium text-[#1F2A6B]">{copy.selected}</span> : null}
                        {item.founder_uid ? <code dir="ltr" className="mt-1 block break-all text-[11px] text-slate-500">{item.founder_uid}</code> : null}
                        <span className="mt-1 block text-xs text-gray-600">
                          {copy.scores.aggregate_score}: {item.aggregate_score} · {copy.scores.momentum}: {item.momentum} · {copy.scores.growth}: {item.growth}
                        </span>
                        {updated ? <span className="block text-xs text-gray-600">{fill(copy.updated, { date: updated })}</span> : null}
                      </button>
                      {link ? <Link className="mt-1 inline-block text-sm underline" href={link.href}>{link.isPublic ? copy.viewProfile : copy.viewInAdmin}</Link> : null}
                    </li>
                  )
                })}
              </ul>
            ) : null}
            {total > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button variant="outline" disabled={page <= 1 || status === "loading"} onClick={() => void load(page - 1)}>{copy.previous}</Button>
                <span className="text-sm text-gray-500">{fill(copy.pageSummary, { page, pages, total })}</span>
                <Button variant="outline" disabled={page >= pages || status === "loading"} onClick={() => void load(page + 1)}>{copy.next}</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">{copy.panelTitle}</h3></CardHeader>
          <CardContent className="space-y-5">
            {selected ? (
              <>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-900" dir="auto">{founderLabel(locale, selected)}</p>
                  {selected.founder_uid ? <p className="break-all text-xs text-slate-600">{copy.founderId}: <code dir="ltr">{selected.founder_uid}</code></p> : null}
                  {selectedLink ? <Link className="inline-block text-sm underline" href={selectedLink.href}>{selectedLink.isPublic ? copy.viewProfile : copy.viewInAdmin}</Link> : null}
                </div>

                <section aria-labelledby="scorecard-current" className="space-y-2">
                  <h4 id="scorecard-current" className="text-sm font-semibold text-gray-900">{copy.currentScores}</h4>
                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {scoreFields.map((field) => (
                      <div key={field} className="rounded-lg bg-gray-50 px-3 py-2">
                        <dt className="text-xs text-gray-500">{copy.scores[field]}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{selected[field]}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {action !== "none" ? (
                  <section aria-labelledby="scorecard-account" className="space-y-3 border-t pt-4">
                    <h4 id="scorecard-account" className="text-sm font-semibold text-gray-900">{copy.accountTitle}</h4>
                    {selected.user_email ? (
                      <p className="text-sm text-gray-700">
                        <span dir="ltr">{selected.user_email}</span> · {selected.email_verified ? copy.emailVerified : copy.emailUnverified}
                      </p>
                    ) : null}
                    {action === "verify" ? (
                      <Button disabled={busy !== null} onClick={() => void sendVerification()}>
                        {busy === "email" ? copy.sending : copy.sendVerification}
                      </Button>
                    ) : null}
                    {action === "inactive" ? <p className="text-sm text-gray-600">{copy.inactiveProfile}</p> : null}
                    {action === "invite" ? (
                      <form className="space-y-3" noValidate onSubmit={(event) => void sendInvite(event)}>
                        <p className="text-sm text-gray-600">{copy.unclaimed}</p>
                        <div className="space-y-1">
                          <Label htmlFor={emailId}>{copy.inviteEmail}<span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span></Label>
                          <Input
                            id={emailId}
                            type="email"
                            dir="ltr"
                            autoComplete="off"
                            required
                            value={invite.email}
                            disabled={busy !== null}
                            aria-invalid={Boolean(inviteErrors.email)}
                            aria-describedby={describedBy(emailId, inviteErrors.email)}
                            onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))}
                          />
                          {fieldMessage(emailId, inviteErrors.email)}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={evidenceId}>{copy.inviteEvidence}<span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span></Label>
                          <Textarea
                            id={evidenceId}
                            dir="auto"
                            rows={3}
                            required
                            value={invite.recipient_evidence}
                            disabled={busy !== null}
                            aria-invalid={Boolean(inviteErrors.recipient_evidence)}
                            aria-describedby={describedBy(evidenceId, inviteErrors.recipient_evidence, copy.inviteEvidenceHint)}
                            onChange={(event) => setInvite((current) => ({ ...current, recipient_evidence: event.target.value }))}
                          />
                          {fieldMessage(evidenceId, inviteErrors.recipient_evidence, copy.inviteEvidenceHint)}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={verifiedId} className="flex min-h-11 items-start gap-2 text-sm text-gray-700">
                            <input
                              id={verifiedId}
                              type="checkbox"
                              className="mt-1 h-4 w-4"
                              checked={invite.recipient_verified}
                              disabled={busy !== null}
                              aria-invalid={Boolean(inviteErrors.recipient_verified)}
                              aria-describedby={describedBy(verifiedId, inviteErrors.recipient_verified)}
                              onChange={(event) => setInvite((current) => ({ ...current, recipient_verified: event.target.checked }))}
                            />
                            <span>{copy.inviteConfirm}</span>
                          </label>
                          {fieldMessage(verifiedId, inviteErrors.recipient_verified)}
                        </div>
                        <Button type="submit" disabled={busy !== null}>{busy === "email" ? copy.sending : copy.sendInvite}</Button>
                      </form>
                    ) : null}
                  </section>
                ) : null}

                <form className="space-y-3 border-t pt-4" noValidate onSubmit={(event) => void applyOverride(event)} aria-labelledby="scorecard-override">
                  <h4 id="scorecard-override" className="text-sm font-semibold text-gray-900">{copy.overrideTitle}</h4>
                  <p className="text-xs text-gray-500">{copy.overrideHint}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {scoreFields.map(scoreInput)}
                  </div>
                  {overrideErrors.form ? <p className="text-xs font-medium text-red-700">{overrideErrors.form}</p> : null}
                  <div className="space-y-1">
                    <Label htmlFor={noteId}>{copy.overrideNote}<span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span></Label>
                    <Textarea
                      id={noteId}
                      dir="auto"
                      rows={3}
                      required
                      value={override.override_note}
                      disabled={busy !== null}
                      aria-invalid={Boolean(overrideErrors.override_note)}
                      aria-describedby={describedBy(noteId, overrideErrors.override_note, copy.overrideNoteHint)}
                      onChange={(event) => setOverride((current) => ({ ...current, override_note: event.target.value }))}
                    />
                    {fieldMessage(noteId, overrideErrors.override_note, copy.overrideNoteHint)}
                  </div>
                  <Button type="submit" disabled={busy !== null}>{busy === "override" ? copy.applying : copy.apply}</Button>
                </form>
              </>
            ) : (
              <p className="text-sm text-gray-500">{copy.noSelection}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
