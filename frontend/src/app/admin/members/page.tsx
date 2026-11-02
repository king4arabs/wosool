"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminApplication, type AdminCollectionResponse, formatDate } from "@/lib/admin"
import { adminApplications, applicationAllCount, applicationPage, applicationRange, applicationStatuses, applicationStatusLabel } from "@/lib/admin-applications"
import { useLocale } from "@/lib/locale"

type ReviewState = {
  status: AdminApplication["status"]
  admin_notes: string
}

export default function AdminMembersPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminApplications(locale)
  const statusLabel = (status: AdminApplication["status"]) => applicationStatusLabel(locale, status)
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminApplication | null>(null)
  const [form, setForm] = useState<ReviewState>({ status: "submitted", admin_notes: "" })
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const latestRequest = useRef(0)

  const loadApplications = useCallback(async () => {
    const request = ++latestRequest.current
    try {
      const response = await api.get<AdminCollectionResponse<AdminApplication>>("/admin/applications", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
        },
      })
      // A slower earlier request must not replace the results of a newer search, filter or page.
      if (request !== latestRequest.current) return
      setApplications(response.data)
      setMeta(response.meta)
      setLoaded(true)
    } catch (err) {
      if (request !== latestRequest.current) return
      toast(err instanceof Error && err.message ? err.message : copy.loadFailed, "error")
    }
  }, [search, status, page, toast, copy.loadFailed])

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  const position = applicationPage(meta, applications.length)

  const openReview = (application: AdminApplication) => {
    setSelected(application)
    setForm({
      status: application.status,
      admin_notes: application.admin_notes || "",
    })
  }

  const saveReview = async () => {
    if (!selected) return

    setSaving(true)
    try {
      const response = await api.patch<{ data: AdminApplication; notification_accepted?: boolean | null }>(`/admin/applications/${selected.id}`, form)
      const updated = response.data
      setSelected(updated)
      toast(response.notification_accepted === false ? copy.savedMailFailed : copy.saved, response.notification_accepted === false ? "error" : "success")
      await loadApplications()
    } catch (err) {
      toast(err instanceof Error && err.message ? err.message : copy.saveFailed, "error")
    } finally {
      setSaving(false)
    }
  }

  const copyInviteLink = async () => {
    if (!selected?.invite_url) {
      toast(copy.noInviteYet, "error")
      return
    }

    try {
      await navigator.clipboard.writeText(selected.invite_url)
      toast(copy.copied, "success")
    } catch {
      toast(copy.copyFailed, "error")
    }
  }

  const sendInvitation = async () => {
    if (!selected) return
    setSending(true)
    try {
      const response = await api.post<{ data: AdminApplication }>(`/admin/applications/${selected.id}/invite`)
      setSelected(response.data)
      toast(copy.inviteQueued, "success")
      await loadApplications()
    } catch (err) {
      toast(err instanceof Error && err.message ? err.message : copy.inviteFailed, "error")
    } finally {
      setSending(false)
    }
  }

  const waitingCount = useMemo(() => (meta.submitted || 0) + (meta.reviewing || 0) + (meta.request_more_info || 0), [meta])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{copy.intro}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadApplications()}>
          {copy.refresh}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-gray-600">{copy.totalAll}</p><p className="text-xl font-bold">{applicationAllCount(meta)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-600">{copy.waiting}</p><p className="text-xl font-bold">{waitingCount}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-600">{statusLabel("approved")}</p><p className="text-xl font-bold">{meta.approved || 0}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-600">{statusLabel("rejected")}</p><p className="text-xl font-bold">{meta.rejected || 0}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <form
            role="search"
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              const next = searchInput.trim()
              setPage(1)
              if (next === search && page === 1) void loadApplications()
              else setSearch(next)
            }}
          >
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={copy.searchLabel}
              aria-label={copy.searchLabel}
            />
            <Select aria-label={copy.statusFilter} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
              <option value="">{copy.allStatuses}</option>
              {applicationStatuses.map((option) => (
                <option key={option} value={option}>{statusLabel(option)}</option>
              ))}
            </Select>
            <Button type="submit" className="shrink-0">{copy.search}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{copy.listTitle}</h3>
          <p className="text-sm text-gray-600" aria-live="polite">{applicationRange(locale, position)}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th scope="col" className="text-start px-4 py-3">{copy.applicant}</th>
                  <th scope="col" className="text-start px-4 py-3">{copy.company}</th>
                  <th scope="col" className="text-start px-4 py-3">{copy.status}</th>
                  <th scope="col" className="text-start px-4 py-3">{copy.submittedAt}</th>
                  <th scope="col" className="text-start px-4 py-3">{copy.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{application.full_name}</p>
                      <p className="text-xs text-gray-600"><span dir="ltr">{application.email}</span></p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{application.company_name || "—"}</p>
                      <p className="text-xs text-gray-600">{application.sector || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={application.status === "approved" ? "success" : application.status === "rejected" ? "destructive" : "warning"}>
                        {statusLabel(application.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(application.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => openReview(application)}>
                        {copy.review}<span className="sr-only"> {application.full_name}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {loaded && applications.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">{copy.empty}</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {position.lastPage > 1 ? (
            <nav aria-label={copy.pagination} className="flex items-center justify-between gap-3 border-t px-4 py-3">
              <Button size="sm" variant="outline" disabled={position.page <= 1} onClick={() => setPage(position.page - 1)}>{copy.previous}</Button>
              <span className="text-sm text-gray-600">{position.page} / {position.lastPage}</span>
              <Button size="sm" variant="outline" disabled={position.page >= position.lastPage} onClick={() => setPage(position.page + 1)}>{copy.next}</Button>
            </nav>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{copy.dialogTitle}: {selected?.full_name}</DialogTitle>
            <DialogDescription>{copy.dialogDescription}</DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info label={copy.fullName} value={selected.full_name} />
                <Info label={copy.email} value={selected.email} ltr />
                <Info label={copy.phone} value={selected.phone} ltr />
                <Info label={copy.location} value={selected.location} />
                <Info label={copy.company} value={selected.company_name} />
                <Info label={copy.companyWebsite} value={selected.company_website} ltr />
                <Info label={copy.sector} value={selected.sector} />
                <Info label={copy.stage} value={selected.stage} />
                <Info label={copy.linkedin} value={selected.linkedin_url} ltr />
                <Info label={copy.referralSource} value={selected.referral_source} />
                <Info label={copy.referrerName} value={selected.referrer_name} />
                <Info label={copy.lastReview} value={selected.reviewer?.name ? `${selected.reviewer.name} - ${formatDate(selected.reviewed_at)}` : copy.notReviewed} />
              </div>

              {selected.onboarding_data && <>
                <div className="flex gap-4">
                  {selected.onboarding_data.avatar_url && <Image src={selected.onboarding_data.avatar_url} alt={copy.founderPhoto} width={96} height={96} unoptimized className="h-24 w-24 rounded-2xl object-cover" />}
                  {selected.onboarding_data.logo_url && <Image src={selected.onboarding_data.logo_url} alt={copy.companyLogo} width={160} height={96} unoptimized className="h-24 w-40 rounded-2xl border bg-white p-3 object-contain" />}
                </div>
                <Info label={copy.position} value={selected.onboarding_data.position} />
                <Info label={copy.country} value={selected.onboarding_data.country_code} />
                <Info label={copy.foundedYear} value={selected.onboarding_data.founded_year ? String(selected.onboarding_data.founded_year) : null} />
                <Info label={copy.teamSize} value={selected.onboarding_data.team_size ? String(selected.onboarding_data.team_size) : null} />
                <LongInfo label={copy.founderBio} value={selected.onboarding_data.bio} />
                <LongInfo label={copy.companyDescription} value={selected.onboarding_data.company_description} />
              </>}
              <LongInfo label={copy.motivation} value={selected.motivation} />
              <LongInfo label={copy.offer} value={selected.what_you_offer} />
              <LongInfo label={copy.need} value={selected.what_you_need} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="application-status" className="mb-2 block text-sm font-medium text-gray-700">{copy.status}</label>
                  <Select id="application-status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminApplication["status"] }))}>
                    {applicationStatuses.map((option) => (
                      <option key={option} value={option}>{statusLabel(option)}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label htmlFor="application-invite-link" className="mb-2 block text-sm font-medium text-gray-700">{copy.inviteLink}</label>
                  <div className="flex gap-2">
                    <Input id="application-invite-link" value={selected.invite_url || copy.invitePending} readOnly dir={selected.invite_url ? "ltr" : undefined} />
                    <Button variant="outline" onClick={copyInviteLink} disabled={!selected.invite_url}>{copy.copy}</Button>
                  </div>
                  {selected.invite_sent_at ? (
                    <p className="mt-1 text-xs text-emerald-700">{copy.inviteAccepted} {formatDate(selected.invite_sent_at)}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="application-admin-notes" className="mb-2 block text-sm font-medium text-gray-700">{copy.adminNotes}</label>
                <Textarea
                  id="application-admin-notes"
                  value={form.admin_notes}
                  onChange={(event) => setForm((current) => ({ ...current, admin_notes: event.target.value }))}
                  placeholder={copy.adminNotesPlaceholder}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>{copy.close}</Button>
                {selected.status === "approved" && <Button variant="outline" onClick={sendInvitation} loading={sending} disabled={saving}>{selected.invite_sent_at ? copy.resendInvite : copy.sendInvite}</Button>}
                <Button onClick={saveReview} loading={saving}>{copy.save}</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value, ltr }: { label: string; value?: string | null; ltr?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-sm text-gray-900 break-words">{ltr && value ? <span dir="ltr">{value}</span> : value || "—"}</p>
    </div>
  )
}

function LongInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-wrap">{value || "—"}</p>
    </div>
  )
}
