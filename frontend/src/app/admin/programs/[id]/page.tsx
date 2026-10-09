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

const TABS = ["نظرة عامة", "الطلبات", "المشاركون", "الدفعات", "الجلسات", "الحضور", "التقدم"] as const

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

  const [tab, setTab] = useState<(typeof TABS)[number]>("الطلبات")
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
      toast(e instanceof Error ? e.message : "تعذر تحميل الطلبات", "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast])

  const loadCohorts = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: CohortRow[] }>(`/admin/programs/${programId}/cohorts`)
      setCohorts(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر تحميل الدفعات", "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast])

  const loadSessions = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await api.get<{ data: SessionRow[] }>(`/admin/programs/${programId}/sessions`)
      setSessions(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر تحميل الجلسات", "error")
    } finally {
      setLoading(false)
    }
  }, [programId, toast])

  useEffect(() => {
    if (tab === "الطلبات") void loadApplications()
    if (tab === "الدفعات") void loadCohorts()
    if (tab === "الجلسات") void loadSessions()
  }, [tab, loadApplications, loadCohorts, loadSessions])

  const actions = useMemo(() => ([
    { key: "accept", label: "قبول" },
    { key: "reject", label: "رفض" },
    { key: "waitlist", label: "انتظار" },
    { key: "request_more_info", label: "طلب معلومات" },
    { key: "enroll", label: "إلحاق" },
  ]), [])

  async function updateApplication(id: number, action: string) {
    if (!programId) return
    try {
      await api.patch(`/admin/programs/${programId}/applications/${id}`, { action })
      toast("تم تحديث الطلب", "success")
      await loadApplications()
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل تحديث الطلب", "error")
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
      toast("تم إنشاء الدفعة", "success")
      setCohortForm({ name: "", code: "", status: "draft", capacity: "", starts_at: "" })
      await loadCohorts()
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر إنشاء الدفعة", "error")
    }
  }

  async function createSession() {
    if (!programId) return
    try {
      await api.post(`/admin/programs/${programId}/sessions`, {
        ...sessionForm,
        duration_minutes: Number(sessionForm.duration_minutes || 60),
      })
      toast("تم إنشاء الجلسة", "success")
      setSessionForm({ title: "", session_type: "workshop", starts_at: "", duration_minutes: "60", description: "" })
      await loadSessions()
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر إنشاء الجلسة", "error")
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">إدارة البرنامج</h1><Link href="/admin/programs" className="inline-flex min-h-11 items-center text-[#3B52D4] underline">بيانات البرامج وإعداداتها</Link>
      <div className="flex flex-wrap gap-2">{TABS.map((t) => <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t}</Button>)}</div>

      {tab === "الطلبات" && (
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center"><h2 className="font-bold">طلبات البرنامج</h2><a className="text-sm text-blue-600 underline" href={`/api/v1/admin/programs/${programId}/applications/export`}>تصدير CSV</a></div>
          {loading ? <p className="text-sm text-slate-500">جارٍ التحميل...</p> : null}
          {(applications || []).length === 0 ? <p className="text-sm text-slate-500">لا توجد طلبات.</p> : null}
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
          <h2 className="font-bold">إدارة الدفعات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder="اسم الدفعة" value={cohortForm.name} onChange={(e) => setCohortForm((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="رمز الدفعة" value={cohortForm.code} onChange={(e) => setCohortForm((p) => ({ ...p, code: e.target.value }))} />
            <Input placeholder="السعة" value={cohortForm.capacity} onChange={(e) => setCohortForm((p) => ({ ...p, capacity: e.target.value }))} />
            <Select value={cohortForm.status} onChange={(e) => setCohortForm((p) => ({ ...p, status: e.target.value }))}><option value="draft">مسودة</option><option value="open">مفتوح</option><option value="full">مكتمل العدد</option><option value="active">نشط</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option></Select>
          </div>
          <Button onClick={createCohort}>إضافة دفعة</Button>
          <div className="space-y-2">{cohorts.map((c) => <div key={c.id} className="border rounded-lg p-3 text-sm">{c.name} ({c.code || "—"}) • {c.status} • السعة: {c.capacity || "—"}</div>)}</div>
        </CardContent></Card>
      )}

      {tab === "الجلسات" && (
        <Card><CardContent className="p-4 space-y-4">
          <h2 className="font-bold">جلسات البرنامج</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder="عنوان الجلسة" value={sessionForm.title} onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))} />
            <Select value={sessionForm.session_type} onChange={(e) => setSessionForm((p) => ({ ...p, session_type: e.target.value }))}><option value="workshop">ورشة</option><option value="office_hour">ساعات مكتبية</option><option value="mentorship">إرشاد</option><option value="lecture">محاضرة</option><option value="roundtable">طاولة مستديرة</option><option value="demo">عرض</option><option value="review">مراجعة</option><option value="check_in">متابعة</option></Select>
            <Input type="datetime-local" value={sessionForm.starts_at} onChange={(e) => setSessionForm((p) => ({ ...p, starts_at: e.target.value }))} />
            <Input placeholder="المدة بالدقائق" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm((p) => ({ ...p, duration_minutes: e.target.value }))} />
          </div>
          <Textarea placeholder="وصف الجلسة" value={sessionForm.description} onChange={(e) => setSessionForm((p) => ({ ...p, description: e.target.value }))} />
          <Button onClick={createSession}>إضافة جلسة</Button>
          <div className="space-y-2">{sessions.map((s) => <div key={s.id} className="border rounded-lg p-3 text-sm">{s.title} • {s.session_type} • {s.starts_at ? new Date(s.starts_at).toLocaleString("ar-SA") : "—"}</div>)}</div>
        </CardContent></Card>
      )}

      {!["الطلبات", "الدفعات", "الجلسات"].includes(tab) ? (
        <ProgramOperationsPanel programId={programId} panel={tab} />
      ) : null}
    </div>
  )
}
