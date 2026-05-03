"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Search, CheckCircle, XCircle, Clock, UserCheck, AlertCircle } from "lucide-react"

type ReviewState = {
  status: AdminApplication["status"]
  admin_notes: string
}

const statusOptions: AdminApplication["status"][] = ["submitted", "reviewing", "approved", "rejected", "waitlisted"]

export default function AdminMembersPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [selected, setSelected] = useState<AdminApplication | null>(null)
  const [form, setForm] = useState<ReviewState>({ status: "submitted", admin_notes: "" })
  const [saving, setSaving] = useState(false)

  const loadApplications = useCallback(async () => {
    const response = await api.get<AdminCollectionResponse<AdminApplication>>("/admin/applications", {
      params: {
        search: search || undefined,
        status: status || undefined,
      },
    })

    setApplications(response.data)
    setMeta(response.meta)
  }, [search, status])

  useEffect(() => {
    loadApplications().catch((err: Error) => toast(err.message, "error"))
  }, [loadApplications, toast])

  const openReview = (application: AdminApplication) => {
    setSelected(application)
    setForm({
      status: application.status,
      admin_notes: application.admin_notes || "",
    })
  }

  const saveReview = async () => {
    if (!selected) {
      return
    }

    setSaving(true)
    try {
      await api.patch(`/admin/applications/${selected.id}`, form)
      toast("Application updated.", "success")
      setSelected(null)
      await loadApplications()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update application.", "error")
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { label: "Total Applications", value: meta.total || 0, icon: AlertCircle, color: "text-blue-600" },
    { label: "Pending Review", value: (meta.submitted || 0) + (meta.reviewing || 0), icon: Clock, color: "text-amber-600" },
    { label: "Approved", value: meta.approved || 0, icon: UserCheck, color: "text-emerald-600" },
    { label: "Rejected", value: meta.rejected || 0, icon: XCircle, color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage membership applications.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadApplications().catch((err: Error) => toast(err.message, "error"))}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadApplications().catch((err: Error) => toast(err.message, "error"))
                  }
                }}
                placeholder="Search applications by name, company, or sector..."
                className="pl-10"
                aria-label="Search applications"
              />
            </div>
            <div className="flex gap-2">
              <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Button variant="outline" size="sm" onClick={() => loadApplications().catch((err: Error) => toast(err.message, "error"))}>
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Applications ({applications.length})</h3>
            <p className="text-sm text-gray-500">
              {(meta.submitted || 0) + (meta.reviewing || 0)} awaiting action
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Applicant</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Stage</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Submitted</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((application) => {
                  const initials = application.full_name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{application.full_name}</p>
                            <p className="text-xs text-gray-400">{application.location || application.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{application.company_name || "Independent"}</p>
                        <p className="text-xs text-gray-400">{application.sector || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{application.stage || "—"}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={application.status === "approved" ? "success" : application.status === "rejected" ? "destructive" : application.status === "waitlisted" ? "outline" : "warning"}>
                          {application.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openReview(application)}>
                            Review
                          </Button>
                          {(application.status === "submitted" || application.status === "reviewing") && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                                aria-label={`Approve ${application.full_name}`}
                                onClick={() => {
                                  setSelected(application)
                                  setForm({ status: "approved", admin_notes: application.admin_notes || "" })
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                aria-label={`Reject ${application.full_name}`}
                                onClick={() => {
                                  setSelected(application)
                                  setForm({ status: "rejected", admin_notes: application.admin_notes || "" })
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review application</DialogTitle>
            <DialogDescription>
              Update status and review notes for {selected?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Company</p>
                <p className="text-sm text-gray-700">{selected?.company_name || "Independent"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Submitted</p>
                <p className="text-sm text-gray-700">{formatDate(selected?.created_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Motivation</p>
              <p className="text-sm text-gray-700">{selected?.motivation || "—"}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminApplication["status"] }))}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
              <div>
                <p className="mb-2 block text-sm font-medium text-gray-700">Last review</p>
                <p className="text-sm text-gray-500">
                  {selected?.reviewer?.name ? `${selected.reviewer.name} · ${formatDate(selected.reviewed_at)}` : "Not reviewed yet"}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Admin notes</label>
              <Textarea
                value={form.admin_notes}
                onChange={(event) => setForm((current) => ({ ...current, admin_notes: event.target.value }))}
                placeholder="Capture context for approvals, waitlists, or next steps."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button onClick={saveReview} loading={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
