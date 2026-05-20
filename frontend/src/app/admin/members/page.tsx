"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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

type ReviewState = {
  status: AdminApplication["status"]
  admin_notes: string
}

const statusOptions: AdminApplication["status"][] = ["submitted", "reviewing", "request_more_info", "approved", "rejected", "waitlisted"]

const statusLabel: Record<AdminApplication["status"], string> = {
  submitted: "جديد",
  reviewing: "قيد المراجعة",
  request_more_info: "مطلوب معلومات إضافية",
  approved: "مقبول",
  rejected: "مرفوض",
  waitlisted: "قائمة الانتظار",
}

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
    if (!selected) return

    setSaving(true)
    try {
      const response = await api.patch<{ data: AdminApplication }>(`/admin/applications/${selected.id}`, form)
      const updated = response.data
      setSelected(updated)
      toast("تم تحديث الطلب بنجاح", "success")
      await loadApplications()
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر تحديث الطلب", "error")
    } finally {
      setSaving(false)
    }
  }

  const copyInviteLink = async () => {
    if (!selected?.invite_url) {
      toast("لا يوجد رابط دعوة بعد. اعتمد الطلب أولًا.", "error")
      return
    }

    try {
      await navigator.clipboard.writeText(selected.invite_url)
      toast("تم نسخ رابط الدعوة", "success")
    } catch {
      toast("تعذر نسخ الرابط", "error")
    }
  }

  const waitingCount = useMemo(() => (meta.submitted || 0) + (meta.reviewing || 0), [meta])

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مراجعة طلبات العضوية</h2>
          <p className="text-sm text-gray-500 mt-1">راجع بيانات المتقدم، حدّث الحالة، ثم شارك رابط الدعوة الخاص به.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadApplications().catch((err: Error) => toast(err.message, "error"))}>
          تحديث
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-gray-500">إجمالي الطلبات</p><p className="text-xl font-bold">{meta.total || 0}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-500">بانتظار الإجراء</p><p className="text-xl font-bold">{waitingCount}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-500">مقبول</p><p className="text-xl font-bold">{meta.approved || 0}</p></div>
            <div className="rounded-lg border p-3"><p className="text-gray-500">مرفوض</p><p className="text-xl font-bold">{meta.rejected || 0}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && loadApplications().catch((err: Error) => toast(err.message, "error"))}
              placeholder="ابحث بالاسم أو البريد أو الشركة"
            />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">كل الحالات</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{statusLabel[option]}</option>
              ))}
            </Select>
            <Button onClick={() => loadApplications().catch((err: Error) => toast(err.message, "error"))}>بحث</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">قائمة الطلبات ({applications.length})</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right px-4 py-3">المتقدم</th>
                  <th className="text-right px-4 py-3">الشركة</th>
                  <th className="text-right px-4 py-3">الحالة</th>
                  <th className="text-right px-4 py-3">تاريخ التقديم</th>
                  <th className="text-right px-4 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{application.full_name}</p>
                      <p className="text-xs text-gray-500">{application.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{application.company_name || "—"}</p>
                      <p className="text-xs text-gray-500">{application.sector || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={application.status === "approved" ? "success" : application.status === "rejected" ? "destructive" : "warning"}>
                        {statusLabel[application.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(application.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => openReview(application)}>مراجعة</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>مراجعة الطلب: {selected?.full_name}</DialogTitle>
            <DialogDescription>كل معلومات المتقدم + إدارة حالة الطلب + رابط الدعوة الخاص.</DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info label="الاسم الكامل" value={selected.full_name} />
                <Info label="البريد" value={selected.email} />
                <Info label="الهاتف" value={selected.phone} />
                <Info label="الموقع" value={selected.location} />
                <Info label="الشركة" value={selected.company_name} />
                <Info label="موقع الشركة" value={selected.company_website} />
                <Info label="القطاع" value={selected.sector} />
                <Info label="المرحلة" value={selected.stage} />
                <Info label="LinkedIn" value={selected.linkedin_url} />
                <Info label="مصدر الإحالة" value={selected.referral_source} />
                <Info label="اسم المُحيل" value={selected.referrer_name} />
                <Info label="آخر مراجعة" value={selected.reviewer?.name ? `${selected.reviewer.name} - ${formatDate(selected.reviewed_at)}` : "لم تتم مراجعة بعد"} />
              </div>

              <LongInfo label="الدافع للانضمام" value={selected.motivation} />
              <LongInfo label="ما الذي سيقدمه" value={selected.what_you_offer} />
              <LongInfo label="ما الذي يحتاجه" value={selected.what_you_need} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">الحالة</label>
                  <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminApplication["status"] }))}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{statusLabel[option]}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">رابط الدعوة</label>
                  <div className="flex gap-2">
                    <Input value={selected.invite_url || "سيظهر بعد اعتماد الطلب"} readOnly />
                    <Button variant="outline" onClick={copyInviteLink}>نسخ</Button>
                  </div>
                  {selected.invite_sent_at ? (
                    <p className="mt-1 text-xs text-emerald-600">تم تجهيز الإرسال: {formatDate(selected.invite_sent_at)}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">ملاحظات الإدارة</label>
                <Textarea
                  value={form.admin_notes}
                  onChange={(event) => setForm((current) => ({ ...current, admin_notes: event.target.value }))}
                  placeholder="أضف ملاحظات القرار والمتابعة"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>إغلاق</Button>
                <Button onClick={saveReview} loading={saving}>حفظ التحديث</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value || "—"}</p>
    </div>
  )
}

function LongInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-wrap">{value || "—"}</p>
    </div>
  )
}
