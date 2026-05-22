"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

type Registration = {
  user_id: number
  name: string
  company?: string | null
  role?: string | null
  email: string
  attendance_type?: string | null
  registration_status: string
  relevance_score: number
  rsvp_date?: string | null
  checkin_status: string
}

const TABS = [
  "نظرة عامة",
  "التسجيلات",
  "قائمة الانتظار",
  "الحضور",
  "الموافقات",
  "الأجندة",
  "المتحدثون",
  "الموارد",
  "الرسائل",
  "تسجيل الدخول",
  "التقييم",
  "مطابقات الذكاء الاصطناعي",
  "التحليلات",
  "الإعدادات",
] as const

export default function AdminEventManagePage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const eventId = params?.id
  const [tab, setTab] = useState<(typeof TABS)[number]>("التسجيلات")
  const [rows, setRows] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  async function load(status?: string) {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: Registration[] }>(`/admin/events/${eventId}/registrations`, {
        params: { status: status || undefined },
      })
      setRows(res.data ?? [])
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر تحميل التسجيلات.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const map: Record<string, string | undefined> = {
      "قائمة الانتظار": "waitlisted",
      "الحضور": "approved",
      "الموافقات": "pending_approval",
    }
    void load(map[tab])
  }, [tab, eventId])

  const visibleRows = useMemo(() => rows, [rows])

  async function act(userId: number, action: string) {
    if (!eventId) return
    const key = `${userId}:${action}`
    setBusyKey(key)
    try {
      await api.patch(`/admin/events/${eventId}/registrations/${userId}`, { action })
      toast("تم تحديث حالة التسجيل.", "success")
      const map: Record<string, string | undefined> = {
        "قائمة الانتظار": "waitlisted",
        "الحضور": "approved",
        "الموافقات": "pending_approval",
      }
      await load(map[tab])
    } catch (err) {
      toast(err instanceof Error ? err.message : "فشل تنفيذ الإجراء.", "error")
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">إدارة الفعالية</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <Button key={entry} size="sm" variant={tab === entry ? "default" : "outline"} onClick={() => setTab(entry)}>
            {entry}
          </Button>
        ))}
      </div>

      {tab !== "التسجيلات" && tab !== "قائمة الانتظار" && tab !== "الحضور" && tab !== "الموافقات" ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          قسم {tab} مفعّل ضمن سير العمل وجاهز للاستكمال التدريجي لهذه الفعالية.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">الحاضر</th>
                <th className="text-left px-4 py-3">الشركة</th>
                <th className="text-left px-4 py-3">الدور</th>
                <th className="text-left px-4 py-3">البريد الإلكتروني</th>
                <th className="text-left px-4 py-3">نوع الحضور</th>
                <th className="text-left px-4 py-3">الحالة</th>
                <th className="text-left px-4 py-3">مدى الصلة</th>
                <th className="text-left px-4 py-3">تاريخ التسجيل</th>
                <th className="text-left px-4 py-3">حالة الدخول</th>
                <th className="text-left px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">جارٍ التحميل...</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">لا توجد تسجيلات.</td></tr>
              ) : visibleRows.map((row) => (
                <tr key={row.user_id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.company || "—"}</td>
                  <td className="px-4 py-3">{row.role || "—"}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.attendance_type || "—"}</td>
                  <td className="px-4 py-3">{row.registration_status}</td>
                  <td className="px-4 py-3">{row.relevance_score}%</td>
                  <td className="px-4 py-3">{row.rsvp_date ? new Date(row.rsvp_date).toLocaleString("ar-SA") : "—"}</td>
                  <td className="px-4 py-3">{row.checkin_status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:approve`} onClick={() => act(row.user_id, "approve")}>قبول</Button>
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:reject`} onClick={() => act(row.user_id, "reject")}>رفض</Button>
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:waitlist`} onClick={() => act(row.user_id, "waitlist")}>انتظار</Button>
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:checkin`} onClick={() => act(row.user_id, "checkin")}>تأكيد حضور</Button>
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:no_show`} onClick={() => act(row.user_id, "no_show")}>عدم حضور</Button>
                      <Button size="sm" variant="outline" disabled={busyKey === `${row.user_id}:cancel`} onClick={() => act(row.user_id, "cancel")}>إلغاء</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div>
        <a href={`/api/v1/admin/events/${eventId}/registrations/export`} className="text-sm text-blue-600 underline">تصدير CSV</a>
      </div>
    </div>
  )
}
