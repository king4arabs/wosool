"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"
import { dateLocale } from "@/lib/date-locale"

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
  { key: "registrations", status: undefined, ar: "التسجيلات", en: "Registrations" },
  { key: "waitlist", status: "waitlisted", ar: "قائمة الانتظار", en: "Waitlist" },
  { key: "attendance", status: "approved", ar: "الحضور", en: "Attendance" },
  { key: "approvals", status: "pending_approval", ar: "الموافقات", en: "Approvals" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const ACTIONS = [
  { key: "approve", ar: "قبول", en: "Approve" },
  { key: "reject", ar: "رفض", en: "Reject" },
  { key: "waitlist", ar: "انتظار", en: "Waitlist" },
  { key: "checkin", ar: "تأكيد حضور", en: "Check in" },
  { key: "no_show", ar: "عدم حضور", en: "No-show" },
  { key: "cancel", ar: "إلغاء", en: "Cancel" },
] as const

function statusFor(tab: TabKey) {
  return TABS.find((entry) => entry.key === tab)?.status
}

export default function AdminEventManagePage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const t = useCallback((arabic: string, english: string) => (ar ? arabic : english), [ar])
  const eventId = params?.id
  const [tab, setTab] = useState<TabKey>("registrations")
  const [rows, setRows] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const load = useCallback(async (status?: string) => {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: Registration[] }>(`/admin/events/${eventId}/registrations`, {
        params: { status: status || undefined },
      })
      setRows(res.data ?? [])
    } catch (err) {
      toast(err instanceof Error ? err.message : t("تعذر تحميل التسجيلات.", "Could not load registrations."), "error")
    } finally {
      setLoading(false)
    }
  }, [eventId, toast, t])

  useEffect(() => {
    void load(statusFor(tab))
  }, [tab, load])

  const visibleRows = useMemo(() => rows, [rows])

  async function act(userId: number, action: string) {
    if (!eventId) return
    const key = `${userId}:${action}`
    setBusyKey(key)
    try {
      await api.patch(`/admin/events/${eventId}/registrations/${userId}`, { action })
      toast(t("تم تحديث حالة التسجيل.", "Registration updated."), "success")
      await load(statusFor(tab))
    } catch (err) {
      toast(err instanceof Error ? err.message : t("فشل تنفيذ الإجراء.", "The action failed."), "error")
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t("إدارة الفعالية", "Manage event")}</h2>
      <Link href="/admin/events" className="inline-flex min-h-11 items-center text-[#3B52D4] underline">{t("بيانات الفعاليات وإعداداتها", "Event details and settings")}</Link>
      <div className="flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <Button key={entry.key} size="sm" variant={tab === entry.key ? "default" : "outline"} aria-pressed={tab === entry.key} onClick={() => setTab(entry.key)}>
            {ar ? entry.ar : entry.en}
          </Button>
        ))}
      </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-start px-4 py-3">{t("الحاضر", "Attendee")}</th>
                <th className="text-start px-4 py-3">{t("الشركة", "Company")}</th>
                <th className="text-start px-4 py-3">{t("الدور", "Role")}</th>
                <th className="text-start px-4 py-3">{t("البريد الإلكتروني", "Email")}</th>
                <th className="text-start px-4 py-3">{t("نوع الحضور", "Attendance")}</th>
                <th className="text-start px-4 py-3">{t("الحالة", "Status")}</th>
                <th className="text-start px-4 py-3">{t("مدى الصلة", "Relevance")}</th>
                <th className="text-start px-4 py-3">{t("تاريخ التسجيل", "Registered")}</th>
                <th className="text-start px-4 py-3">{t("حالة الدخول", "Check-in")}</th>
                <th className="text-start px-4 py-3">{t("الإجراءات", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">{t("جارٍ التحميل…", "Loading…")}</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">{t("لا توجد تسجيلات.", "No registrations.")}</td></tr>
              ) : visibleRows.map((row) => (
                <tr key={row.user_id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.company || "—"}</td>
                  <td className="px-4 py-3">{row.role || "—"}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.attendance_type || "—"}</td>
                  <td className="px-4 py-3">{row.registration_status}</td>
                  <td className="px-4 py-3">{row.relevance_score}%</td>
                  <td className="px-4 py-3">{row.rsvp_date ? new Date(row.rsvp_date).toLocaleString(dateLocale(ar, "en-GB"), { timeZone: "Asia/Riyadh" }) : "—"}</td>
                  <td className="px-4 py-3">{row.checkin_status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ACTIONS.map((action) => (
                        <Button key={action.key} size="sm" variant="outline" className="whitespace-nowrap" disabled={busyKey === `${row.user_id}:${action.key}`} onClick={() => act(row.user_id, action.key)}>
                          {ar ? action.ar : action.en}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      <div>
        <a href={`/api/v1/admin/events/${eventId}/registrations/export`} className="text-sm text-blue-600 underline">{t("تصدير CSV", "Export CSV")}</a>
      </div>
    </div>
  )
}
