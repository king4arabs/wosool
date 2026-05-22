"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

type ProgramDetails = {
  id: number
  name: string
  title?: string
  slug: string
  short_description?: string | null
  full_description?: string | null
  program_type?: string | null
  category?: string | null
  tags?: string[]
  cover_image_url?: string | null
  visibility?: string
  status_flow?: string
  objective?: string | null
  who_it_is_for?: string | null
  expected_outcomes?: string | null
  duration?: string | null
  format?: string | null
  language?: string | null
  city_region?: string | null
  capacity?: number | null
  application_deadline?: string | null
  starts_at?: string | null
  ends_at?: string | null
  eligibility_criteria?: string[]
  application_process?: string[]
  faqs?: Array<{ q: string; a: string }>
  cohorts?: Array<{ id: number; name: string; status: string; starts_at?: string | null; ends_at?: string | null }>
  sessions?: Array<{ id: number; title: string; description?: string | null; session_type?: string; starts_at?: string | null; duration_minutes?: number | null; location?: string | null; online_link?: string | null }>
  resources?: Array<{ id: number; title: string; resource_type?: string; url?: string | null }>
}

type ProgramApplicationStatus = {
  status: string
}

const statusLabel: Record<string, string> = {
  draft: "مسودة",
  pending_review: "بانتظار المراجعة",
  published: "منشور",
  applications_open: "التقديم مفتوح",
  applications_closed: "التقديم مغلق",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  archived: "مؤرشف",
  submitted: "تم الإرسال",
  pending_review_application: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
  waitlisted: "قائمة الانتظار",
  withdrawn: "منسحب",
  enrolled: "ملتحق",
}

function ctaFromStatus(program: ProgramDetails | null, applicationStatus: string | null): string {
  if (applicationStatus === "submitted" || applicationStatus === "pending_review") return "الطلب قيد المراجعة"
  if (applicationStatus === "accepted") return "تم القبول"
  if (applicationStatus === "rejected") return "تم الرفض"
  if (applicationStatus === "waitlisted") return "في قائمة الانتظار"
  if (applicationStatus === "enrolled") return "أنت ملتحق"

  if (!program) return "تقديم"
  if (program.visibility === "invite_only") return "طلب دعوة"
  if (program.status_flow === "applications_closed") return "التقديم مغلق"
  if (program.status_flow === "completed") return "البرنامج مكتمل"

  return "قدّم الآن"
}

export default function ProgramDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const { toast } = useToast()

  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)

  const [form, setForm] = useState({
    motivation: "",
    relevant_experience: "",
    why_join: "",
    current_challenge: "",
    expected_outcome: "",
    company_stage: "",
    sector: "",
    team_size: "",
    current_traction: "",
    fundraising_status: "",
    availability_confirmed: true,
    consent_share_profile: true,
    attachment_path: "",
  })

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      api.get<{ data: ProgramDetails }>(`/programs/${slug}`),
      api.get<{ data: Array<ProgramApplicationStatus & { program: { slug: string } }> }>("/member/program-applications").catch(() => ({ data: [] })),
    ])
      .then(([programRes, applicationsRes]) => {
        setProgram(programRes.data)
        const mine = (applicationsRes.data || []).find((item) => item.program?.slug === slug)
        setApplicationStatus(mine?.status ?? null)
      })
      .catch((err: Error) => toast(err.message, "error"))
      .finally(() => setLoading(false))
  }, [slug, toast])

  const canApply = useMemo(() => {
    if (!program) return false
    if (applicationStatus && !["withdrawn", "rejected"].includes(applicationStatus)) return false
    return !["applications_closed", "completed", "cancelled", "archived"].includes(program.status_flow || "")
  }, [program, applicationStatus])

  async function submitApplication() {
    if (!program) return
    setSubmitting(true)
    try {
      const res = await api.post<{ message: string; data: { status: string } }>(`/member/programs/${program.slug}/apply`, form)
      toast(res.message || "تم إرسال الطلب", "success")
      setApplicationStatus(res.data?.status || "pending_review")
      setIsApplyOpen(false)
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "تعذر إرسال الطلب", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-500">جارٍ تحميل تفاصيل البرنامج...</div>
  if (!program) return <div className="py-16 text-center text-rose-600">لم يتم العثور على البرنامج.</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{program.program_type || program.category || "برنامج"}</Badge>
            <Badge variant="secondary">{statusLabel[program.status_flow || ""] || (program.status_flow || "—")}</Badge>
            {program.format ? <Badge variant="outline">{program.format}</Badge> : null}
          </div>
          <h1 className="text-3xl font-black text-slate-900">{program.title || program.name}</h1>
          <p className="text-slate-600">{program.short_description || program.full_description || ""}</p>
          <div className="text-xs text-slate-500">
            {program.city_region || "—"} • {program.duration || "—"} • {program.language === "ar" ? "العربية" : (program.language || "")}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardContent className="p-5"><h2 className="font-bold mb-2">نظرة عامة</h2><p className="text-sm text-slate-600 whitespace-pre-wrap">{program.full_description || ""}</p></CardContent></Card>
          <Card><CardContent className="p-5"><h2 className="font-bold mb-2">لمن هذا البرنامج</h2><p className="text-sm text-slate-600 whitespace-pre-wrap">{program.who_it_is_for || "سيتم إضافة التفاصيل قريبًا."}</p></CardContent></Card>
          <Card><CardContent className="p-5"><h2 className="font-bold mb-2">المخرجات المتوقعة</h2><p className="text-sm text-slate-600 whitespace-pre-wrap">{program.expected_outcomes || "سيتم إضافة التفاصيل قريبًا."}</p></CardContent></Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold mb-3">الجلسات</h2>
              <div className="space-y-3">
                {(program.sessions || []).length === 0 ? <p className="text-sm text-slate-500">لا توجد جلسات منشورة بعد.</p> : null}
                {(program.sessions || []).map((session) => (
                  <div key={session.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-sm">{session.title}</p>
                    <p className="text-xs text-slate-500">{session.session_type || "جلسة"} {session.starts_at ? `• ${new Date(session.starts_at).toLocaleString("ar-SA")}` : ""}</p>
                    {session.description ? <p className="text-sm text-slate-600 mt-1">{session.description}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold mb-3">الموارد</h2>
              <div className="space-y-2">
                {(program.resources || []).length === 0 ? <p className="text-sm text-slate-500">لا توجد موارد بعد.</p> : null}
                {(program.resources || []).map((resource) => (
                  <a key={resource.id} href={resource.url || "#"} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
                    {resource.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold">الانضمام</h3>
              <p className="text-xs text-slate-500">آخر موعد للتقديم: {program.application_deadline ? new Date(program.application_deadline).toLocaleDateString("ar-SA") : "غير محدد"}</p>
              <Button className="w-full" disabled={!canApply || submitting} onClick={() => setIsApplyOpen(true)}>{ctaFromStatus(program, applicationStatus)}</Button>
              {applicationStatus ? <p className="text-xs text-slate-500">حالة طلبك: {statusLabel[applicationStatus] || applicationStatus}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>طلب الانضمام للبرنامج</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="لماذا تريد الانضمام؟" value={form.why_join || form.motivation} onChange={(e) => setForm((p) => ({ ...p, why_join: e.target.value, motivation: e.target.value }))} />
            <Textarea placeholder="ما هو التحدي الحالي؟" value={form.current_challenge} onChange={(e) => setForm((p) => ({ ...p, current_challenge: e.target.value }))} />
            <Textarea placeholder="ما النتيجة التي تتوقعها؟" value={form.expected_outcome} onChange={(e) => setForm((p) => ({ ...p, expected_outcome: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="مرحلة الشركة" value={form.company_stage} onChange={(e) => setForm((p) => ({ ...p, company_stage: e.target.value }))} />
              <Input placeholder="القطاع" value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} />
              <Input placeholder="حجم الفريق" value={form.team_size} onChange={(e) => setForm((p) => ({ ...p, team_size: e.target.value }))} />
              <Input placeholder="حالة التمويل" value={form.fundraising_status} onChange={(e) => setForm((p) => ({ ...p, fundraising_status: e.target.value }))} />
            </div>
            <Textarea placeholder="الزخم الحالي / التراكشن" value={form.current_traction} onChange={(e) => setForm((p) => ({ ...p, current_traction: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.availability_confirmed} onChange={(e) => setForm((p) => ({ ...p, availability_confirmed: e.target.checked }))} /> أؤكد التفرغ الزمني للبرنامج</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.consent_share_profile} onChange={(e) => setForm((p) => ({ ...p, consent_share_profile: e.target.checked }))} /> أوافق على مشاركة ملفي مع فريق البرنامج</label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsApplyOpen(false)}>إلغاء</Button>
              <Button onClick={submitApplication} disabled={submitting}>{submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
