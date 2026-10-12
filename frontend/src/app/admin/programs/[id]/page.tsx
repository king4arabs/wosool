"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ProgramOperationsPanel } from "@/components/admin/ProgramOperationsPanel"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"

// The Arabic tab name is the panel key ProgramOperationsPanel expects.
const TABS = [
  { key: "نظرة عامة", en: "Overview" },
  { key: "الطلبات", en: "Applications" },
  { key: "المشاركون", en: "Participants" },
  { key: "الدفعات", en: "Cohorts" },
  { key: "الجلسات", en: "Sessions" },
  { key: "الحضور", en: "Attendance" },
  { key: "التقدم", en: "Progress" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const COHORT_STATUSES = [
  ["draft", "مسودة", "Draft"],
  ["open", "مفتوحة", "Open"],
  ["full", "مكتملة العدد", "Full"],
  ["active", "نشطة", "Active"],
  ["completed", "منتهية", "Completed"],
  ["cancelled", "ملغاة", "Cancelled"],
] as const

const SESSION_TYPES = [
  ["workshop", "ورشة", "Workshop"],
  ["office_hour", "ساعات مكتبية", "Office hours"],
  ["mentorship", "إرشاد", "Mentorship"],
  ["lecture", "محاضرة", "Lecture"],
  ["roundtable", "طاولة مستديرة", "Roundtable"],
  ["demo", "عرض", "Demo"],
  ["review", "مراجعة", "Review"],
  ["check_in", "متابعة", "Check-in"],
] as const

type ApplicationRow = {
  id: number
  applicant_name?: string
  email?: string
  sector?: string
  company_stage?: string
  status: string
  submitted_at?: string
}

type CohortRow = { id: number; name: string; code?: string; status: string; capacity?: number | null; starts_at?: string | null }
type SessionRow = { id: number; title: string; session_type: string; starts_at?: string | null; duration_minutes?: number | null }

export default function AdminProgramManagePage() {
  const params = useParams<{ id: string }>()
  const programId = params?.id
  const { toast } = useToast()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const t = useCallback((arabic: string, english: string) => (ar ? arabic : english), [ar])

  const [tab, setTab] = useState<TabKey>("الطلبات")
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])

  const [cohortForm, setCohortForm] = useState({ name: "", code: "", status: "draft", capacity: "", starts_at: "" })
  const [sessionForm, setSessionForm] = useState({ title: "", session_type: "workshop", starts_at: "", duration_minutes: "60", description: "" })

  const loadApplications = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: ApplicationRow[] }>(`/admin/programs/${programId}/applications`)
      setApplications(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر تحميل الطلبات", "Could not load applications"), "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast, t])

  const loadCohorts = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: CohortRow[] }>(`/admin/programs/${programId}/cohorts`)
      setCohorts(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر تحميل الدفعات", "Could not load cohorts"), "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast, t])

  const loadSessions = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: SessionRow[] }>(`/admin/programs/${programId}/sessions`)
      setSessions(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر تحميل الجلسات", "Could not load sessions"), "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast, t])

  useEffect(() => {
    if (tab === "الطلبات") void loadApplications()
    if (tab === "الدفعات") void loadCohorts()
    if (tab === "الجلسات") void loadSessions()
  }, [tab, loadApplications, loadCohorts, loadSessions])

  const actions = useMemo(() => ([
    { key: "accept", label: t("قبول", "Accept") },
    { key: "reject", label: t("رفض", "Reject") },
    { key: "waitlist", label: t("انتظار", "Waitlist") },
    { key: "request_more_info", label: t("طلب معلومات", "Request info") },
    { key: "enroll", label: t("إلحاق", "Enroll") },
  ]), [t])

  async function updateApplication(id: number, action: string) {
    if (!programId) return
    try {
      await api.patch(`/admin/programs/${programId}/applications/${id}`, { action })
      toast(t("تم تحديث الطلب", "Application updated"), "success")
      await loadApplications()
    } catch (e) {
      toast(e instanceof Error ? e.message : t("فشل تحديث الطلب", "Could not update the application"), "error")
    }
  }

  async function createCohort() {
    if (!programId) return
    try {
      await api.post(`/admin/programs/${programId}/cohorts`, {
        ...cohortForm,
        capacity: cohortForm.capacity ? Number(cohortForm.capacity) : null,
        starts_at: cohortForm.starts_at || null,
      })
      toast(t("تم إنشاء الدفعة", "Cohort created"), "success")
      setCohortForm({ name: "", code: "", status: "draft", capacity: "", starts_at: "" })
      await loadCohorts()
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر إنشاء الدفعة", "Could not create the cohort"), "error")
    }
  }

  async function createSession() {
    if (!programId) return
    try {
      await api.post(`/admin/programs/${programId}/sessions`, {
        ...sessionForm,
        duration_minutes: Number(sessionForm.duration_minutes || 60),
      })
      toast(t("تم إنشاء الجلسة", "Session created"), "success")
      setSessionForm({ title: "", session_type: "workshop", starts_at: "", duration_minutes: "60", description: "" })
      await loadSessions()
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر إنشاء الجلسة", "Could not create the session"), "error")
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">{t("إدارة البرنامج", "Manage program")}</h2>
      <Link href="/admin/programs" className="inline-flex min-h-11 items-center text-[#3B52D4] underline">{t("بيانات البرامج وإعداداتها", "Program details and settings")}</Link>
      <div className="flex flex-wrap gap-2">{TABS.map((entry) => <Button key={entry.key} size="sm" variant={tab === entry.key ? "default" : "outline"} aria-pressed={tab === entry.key} onClick={() => setTab(entry.key)}>{ar ? entry.key : entry.en}</Button>)}</div>

      {tab === "الطلبات" && (
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center"><h2 className="font-bold">{t("طلبات البرنامج", "Program applications")}</h2><a className="text-sm text-blue-600 underline" href={`/api/v1/admin/programs/${programId}/applications/export`}>{t("تصدير CSV", "Export CSV")}</a></div>
          {loading ? <p className="text-sm text-slate-500">{t("جارٍ التحميل…", "Loading…")}</p> : null}
          {(applications || []).length === 0 ? <p className="text-sm text-slate-500">{t("لا توجد طلبات.", "No applications.")}</p> : null}
          {(applications || []).map((a) => (
            <div key={a.id} className="border rounded-lg p-3 flex flex-col gap-2">
              <div className="flex justify-between"><div><p className="font-semibold">{a.applicant_name || "—"}</p><p className="text-xs text-slate-500">{a.email} • {a.sector || "—"} • {a.company_stage || "—"}</p></div><span className="text-xs">{a.status}</span></div>
              <div className="flex flex-wrap gap-2">{actions.map((action) => <Button key={action.key} size="sm" variant="outline" onClick={() => updateApplication(a.id, action.key)}>{action.label}</Button>)}</div>
            </div>
          ))}
        </CardContent></Card>
      )}

      {tab === "الدفعات" && (
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="font-bold">{t("إدارة الدفعات", "Cohorts")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder={t("اسم الدفعة", "Cohort name")} aria-label={t("اسم الدفعة", "Cohort name")} value={cohortForm.name} onChange={(e) => setCohortForm((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder={t("رمز الدفعة", "Cohort code")} aria-label={t("رمز الدفعة", "Cohort code")} value={cohortForm.code} onChange={(e) => setCohortForm((p) => ({ ...p, code: e.target.value }))} />
            <Input placeholder={t("السعة", "Capacity")} aria-label={t("السعة", "Capacity")} inputMode="numeric" value={cohortForm.capacity} onChange={(e) => setCohortForm((p) => ({ ...p, capacity: e.target.value }))} />
            <Select value={cohortForm.status} aria-label={t("حالة الدفعة", "Cohort status")} onChange={(e) => setCohortForm((p) => ({ ...p, status: e.target.value }))}>{COHORT_STATUSES.map(([value, arabic, english]) => <option key={value} value={value}>{ar ? arabic : english}</option>)}</Select>
          </div>
          <Button onClick={createCohort}>{t("إضافة دفعة", "Add cohort")}</Button>
          <div className="space-y-2">{cohorts.map((c) => <div key={c.id} className="border rounded-lg p-3 text-sm">{c.name} ({c.code || "—"}) • {c.status} • {t("السعة", "Capacity")}: {c.capacity || "—"}</div>)}</div>
        </CardContent></Card>
      )}

      {tab === "الجلسات" && (
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="font-bold">{t("جلسات البرنامج", "Program sessions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder={t("عنوان الجلسة", "Session title")} aria-label={t("عنوان الجلسة", "Session title")} value={sessionForm.title} onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))} />
            <Select value={sessionForm.session_type} aria-label={t("نوع الجلسة", "Session type")} onChange={(e) => setSessionForm((p) => ({ ...p, session_type: e.target.value }))}>{SESSION_TYPES.map(([value, arabic, english]) => <option key={value} value={value}>{ar ? arabic : english}</option>)}</Select>
            <Input type="datetime-local" aria-label={t("موعد البداية", "Start time")} value={sessionForm.starts_at} onChange={(e) => setSessionForm((p) => ({ ...p, starts_at: e.target.value }))} />
            <Input placeholder={t("المدة بالدقائق", "Duration (minutes)")} aria-label={t("المدة بالدقائق", "Duration (minutes)")} inputMode="numeric" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm((p) => ({ ...p, duration_minutes: e.target.value }))} />
          </div>
          <Textarea placeholder={t("وصف الجلسة", "Session description")} aria-label={t("وصف الجلسة", "Session description")} value={sessionForm.description} onChange={(e) => setSessionForm((p) => ({ ...p, description: e.target.value }))} />
          <Button onClick={createSession}>{t("إضافة جلسة", "Add session")}</Button>
          <div className="space-y-2">{sessions.map((s) => <div key={s.id} className="border rounded-lg p-3 text-sm">{s.title} • {s.session_type} • {s.starts_at ? new Date(s.starts_at).toLocaleString(ar ? "ar-SA" : "en-GB", { timeZone: "Asia/Riyadh" }) : "—"}</div>)}</div>
        </CardContent></Card>
      )}

      {!["الطلبات", "الدفعات", "الجلسات"].includes(tab) ? (
        <ProgramOperationsPanel programId={programId} panel={tab} />
      ) : null}
    </div>
  )
}
