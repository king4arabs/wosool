"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminProgram, fromCsvLines, toCsvLines } from "@/lib/admin"
import { Search, BookOpen, Users, Plus, Pencil, Trash2 } from "lucide-react"

type ProgramForm = {
  name: string
  title: string
  slug: string
  short_description: string
  full_description: string
  program_type: string
  category: string
  tags: string
  visibility: string
  status_flow: string
  objective: string
  who_it_is_for: string
  expected_outcomes: string
  duration: string
  format: string
  language: string
  city_region: string
  capacity: string
  application_deadline: string
  starts_at: string
  ends_at: string
  is_open: boolean
}

const emptyForm: ProgramForm = {
  name: "",
  title: "",
  slug: "",
  short_description: "",
  full_description: "",
  program_type: "Founder Onboarding Track",
  category: "onboarding",
  tags: "",
  visibility: "members_only",
  status_flow: "draft",
  objective: "",
  who_it_is_for: "",
  expected_outcomes: "",
  duration: "",
  format: "cohort-based",
  language: "ar",
  city_region: "",
  capacity: "",
  application_deadline: "",
  starts_at: "",
  ends_at: "",
  is_open: true,
}

function toForm(program?: AdminProgram | null): ProgramForm {
  if (!program) return emptyForm
  return {
    ...emptyForm,
    name: program.name || "",
    title: program.title || program.name || "",
    slug: program.slug || "",
    short_description: program.short_description || program.description || "",
    full_description: program.full_description || program.description || "",
    program_type: program.program_type || "Founder Onboarding Track",
    category: program.category || "",
    tags: toCsvLines(program.tags),
    visibility: program.visibility || "members_only",
    status_flow: program.status_flow || "draft",
    objective: program.objective || "",
    who_it_is_for: program.who_it_is_for || "",
    expected_outcomes: program.expected_outcomes || "",
    duration: program.duration || "",
    format: program.format || "cohort-based",
    language: program.language || "ar",
    city_region: program.city_region || "",
    capacity: program.capacity ? String(program.capacity) : "",
    application_deadline: program.application_deadline ? program.application_deadline.slice(0, 10) : "",
    starts_at: program.starts_at ? program.starts_at.slice(0, 16) : "",
    ends_at: program.ends_at ? program.ends_at.slice(0, 16) : "",
    is_open: program.is_open,
  }
}

export default function AdminProgramsPage() {
  const { toast } = useToast()
  const [programs, setPrograms] = useState<AdminProgram[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminProgram | null>(null)
  const [form, setForm] = useState<ProgramForm>(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadPrograms = useCallback(async () => {
    const response = await api.get<AdminCollectionResponse<AdminProgram>>("/admin/programs", {
      params: { search: search || undefined },
    })
    setPrograms(response.data)
    setMeta(response.meta)
  }, [search])

  useEffect(() => {
    loadPrograms().catch((err: Error) => toast(err.message, "error"))
  }, [loadPrograms, toast])

  const openEditor = (program?: AdminProgram) => {
    setEditing(program || null)
    setForm(toForm(program))
    setOpen(true)
  }

  const saveProgram = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: fromCsvLines(form.tags),
        capacity: form.capacity ? Number(form.capacity) : null,
        application_deadline: form.application_deadline || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        description: form.short_description,
      }

      if (editing) {
        await api.put(`/admin/programs/${editing.id}`, payload)
      } else {
        await api.post("/admin/programs", payload)
      }
      toast(`${editing ? "تم تحديث" : "تم إنشاء"} البرنامج.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadPrograms()
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر حفظ البرنامج.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteProgram = async (program: AdminProgram) => {
    if (!window.confirm(`هل تريد حذف برنامج: ${program.name}؟`)) return
    try {
      await api.delete(`/admin/programs/${program.id}`)
      toast("تم حذف البرنامج.", "success")
      await loadPrograms()
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر حذف البرنامج.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">البرامج</h2>
          <p className="text-gray-500 text-sm mt-1">إنشاء وإدارة البرامج والطلبات والدفعات.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadPrograms().catch((err: Error) => toast(err.message, "error"))}>تحديث</Button>
          <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-2" />إنشاء برنامج</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي البرامج", value: meta.total || 0, icon: BookOpen, color: "text-blue-600" },
          { label: "التقديم مفتوح", value: meta.open || 0, icon: BookOpen, color: "text-emerald-600" },
          { label: "إجمالي المتقدمين", value: meta.applicants || 0, icon: Users, color: "text-amber-600" },
          { label: "الدفعات", value: meta.cohorts || 0, icon: Users, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-6"><Icon className={`h-5 w-5 ${color}`} /><p className="text-3xl font-bold mt-2">{value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث باسم البرنامج أو الفئة..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadPrograms().catch((err: Error) => toast(err.message, "error"))}>بحث</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold text-gray-900">{program.title || program.name}</h3><p className="text-xs text-gray-400 mt-0.5">{program.program_type || program.category}</p></div>
                <Badge variant={program.is_open ? "success" : "secondary"}>{program.is_open ? "مفتوح" : "مغلق"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.short_description || program.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-4">
                  <div><p className="text-xs text-gray-400">طلبات</p><p className="text-sm font-bold text-[#0A1628]">{program.applications_count || 0}</p></div>
                  <div><p className="text-xs text-gray-400">دفعات</p><p className="text-sm font-bold text-[#0A1628]">{program.cohorts_count || 0}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/programs/${program.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">إدارة</Link>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => openEditor(program)}><Pencil className="h-4 w-4" /></button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => deleteProgram(program)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل برنامج" : "إنشاء برنامج"}</DialogTitle>
            <DialogDescription>سيتم نشر هذه البيانات مباشرة في صفحة البرنامج ولوحات الأعضاء.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="اسم البرنامج" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <Input placeholder="عنوان العرض" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
              <Input placeholder="نوع البرنامج" value={form.program_type} onChange={(e) => setForm((p) => ({ ...p, program_type: e.target.value }))} />
              <Input placeholder="الفئة" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
              <Input placeholder="المدة" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
              <Select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}>
                <option value="public">عام</option><option value="members_only">للأعضاء</option><option value="founder_only">للمؤسسين</option><option value="invite_only">بدعوة</option><option value="application_required">يتطلب تقديم</option>
              </Select>
              <Select value={form.status_flow} onChange={(e) => setForm((p) => ({ ...p, status_flow: e.target.value }))}>
                <option value="draft">مسودة</option><option value="pending_review">بانتظار المراجعة</option><option value="published">منشور</option><option value="applications_open">التقديم مفتوح</option><option value="applications_closed">التقديم مغلق</option><option value="active">نشط</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option><option value="archived">مؤرشف</option>
              </Select>
              <Select value={form.format} onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}>
                <option value="online">عن بعد</option><option value="in-person">حضوري</option><option value="hybrid">هجين</option><option value="self-paced">ذاتي</option><option value="cohort-based">دفعات</option>
              </Select>
              <Input placeholder="المنطقة/المدينة" value={form.city_region} onChange={(e) => setForm((p) => ({ ...p, city_region: e.target.value }))} />
              <Input placeholder="السعة" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
              <Input type="date" value={form.application_deadline} onChange={(e) => setForm((p) => ({ ...p, application_deadline: e.target.value }))} />
            </div>
            <Input placeholder="وسوم (مفصولة بفاصلة)" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
            <Textarea placeholder="وصف مختصر" value={form.short_description} onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))} />
            <Textarea placeholder="وصف تفصيلي" value={form.full_description} onChange={(e) => setForm((p) => ({ ...p, full_description: e.target.value }))} />
            <Textarea placeholder="هدف البرنامج" value={form.objective} onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))} />
            <Textarea placeholder="لمن هذا البرنامج" value={form.who_it_is_for} onChange={(e) => setForm((p) => ({ ...p, who_it_is_for: e.target.value }))} />
            <Textarea placeholder="المخرجات المتوقعة" value={form.expected_outcomes} onChange={(e) => setForm((p) => ({ ...p, expected_outcomes: e.target.value }))} />
            <div className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_open} onChange={(e) => setForm((p) => ({ ...p, is_open: e.target.checked }))} /> التقديم مفتوح</div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={saveProgram} loading={saving}>حفظ</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
