"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminProgram, formatDate, fromCsvLines, toCsvLines } from "@/lib/admin"
import { Search, BookOpen, Users, Clock, Plus, Pencil, Trash2 } from "lucide-react"

type ProgramForm = {
  name: string
  description: string
  category: string
  duration: string
  target_stages: string
  cohort_size: string
  benefits: string
  is_open: boolean
  application_deadline: string
}

const emptyForm: ProgramForm = {
  name: "",
  description: "",
  category: "",
  duration: "",
  target_stages: "",
  cohort_size: "",
  benefits: "",
  is_open: true,
  application_deadline: "",
}

function toForm(program?: AdminProgram | null): ProgramForm {
  if (!program) return emptyForm
  return {
    name: program.name,
    description: program.description || "",
    category: program.category,
    duration: program.duration || "",
    target_stages: toCsvLines(program.target_stages),
    cohort_size: program.cohort_size ? String(program.cohort_size) : "",
    benefits: toCsvLines(program.benefits),
    is_open: program.is_open,
    application_deadline: program.application_deadline ? program.application_deadline.slice(0, 10) : "",
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
    const payload = {
      ...form,
      target_stages: fromCsvLines(form.target_stages),
      cohort_size: form.cohort_size ? Number(form.cohort_size) : null,
      benefits: fromCsvLines(form.benefits),
      application_deadline: form.application_deadline || null,
    }

    try {
      if (editing) {
        await api.put(`/admin/programs/${editing.id}`, payload)
      } else {
        await api.post("/admin/programs", payload)
      }
      toast(`Program ${editing ? "updated" : "created"}.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadPrograms()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save program.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteProgram = async (program: AdminProgram) => {
    if (!window.confirm(`Delete ${program.name}?`)) return
    try {
      await api.delete(`/admin/programs/${program.id}`)
      toast("Program deleted.", "success")
      await loadPrograms()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete program.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
          <p className="text-gray-500 text-sm mt-1">Manage programs, cohorts, and application pipelines.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadPrograms().catch((err: Error) => toast(err.message, "error"))}>Refresh</Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Programs", value: meta.total || 0, icon: BookOpen, color: "text-blue-600" },
          { label: "Open for Applications", value: meta.open || 0, icon: BookOpen, color: "text-emerald-600" },
          { label: "Total Applicants", value: meta.applicants || 0, icon: Users, color: "text-amber-600" },
          { label: "Cohorts", value: meta.cohorts || 0, icon: Users, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
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
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search programs by name or category..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadPrograms().catch((err: Error) => toast(err.message, "error"))}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{program.category}</p>
                </div>
                <Badge variant={program.is_open ? "success" : "secondary"}>{program.is_open ? "Open" : "Closed"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{program.duration || "—"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    <p className="text-xs text-gray-500">Cohort Size</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{program.cohort_size || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(program.application_deadline)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Applicants</p>
                    <p className="text-sm font-bold text-[#0A1628]">{program.applications_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cohorts</p>
                    <p className="text-sm font-bold text-[#0A1628]">{program.cohorts_count || 0}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => openEditor(program)}><Pencil className="h-4 w-4" /></button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => deleteProgram(program)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit program" : "Create program"}</DialogTitle>
            <DialogDescription>Seeded program data can now be maintained from the admin panel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Program name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              <Input placeholder="Duration" value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} />
              <Input placeholder="Cohort size" value={form.cohort_size} onChange={(event) => setForm((current) => ({ ...current, cohort_size: event.target.value }))} />
              <Input placeholder="Target stages (comma separated)" value={form.target_stages} onChange={(event) => setForm((current) => ({ ...current, target_stages: event.target.value }))} />
              <Input type="date" value={form.application_deadline} onChange={(event) => setForm((current) => ({ ...current, application_deadline: event.target.value }))} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <Textarea placeholder="Benefits (comma separated)" value={form.benefits} onChange={(event) => setForm((current) => ({ ...current, benefits: event.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.is_open} onChange={(event) => setForm((current) => ({ ...current, is_open: event.target.checked }))} />
              Open for applications
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveProgram} loading={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
