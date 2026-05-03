"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminCompany } from "@/lib/admin"
import { Search, Building2, ExternalLink, Pencil, Trash2 } from "lucide-react"

type CompanyForm = {
  name: string
  description: string
  website: string
  sector: string
  stage: string
  location: string
  country_code: string
  founded_year: string
  team_size: string
  status: string
  is_hiring: boolean
  is_fundraising: boolean
  is_collaborating: boolean
  is_featured: boolean
  is_public: boolean
}

const emptyForm: CompanyForm = {
  name: "",
  description: "",
  website: "",
  sector: "",
  stage: "",
  location: "",
  country_code: "",
  founded_year: "",
  team_size: "",
  status: "active",
  is_hiring: false,
  is_fundraising: false,
  is_collaborating: false,
  is_featured: false,
  is_public: true,
}

function toForm(company?: AdminCompany | null): CompanyForm {
  if (!company) {
    return emptyForm
  }

  return {
    name: company.name,
    description: company.description || "",
    website: company.website || "",
    sector: company.sector || "",
    stage: company.stage || "",
    location: company.location || "",
    country_code: company.country_code || "",
    founded_year: company.founded_year ? String(company.founded_year) : "",
    team_size: company.team_size ? String(company.team_size) : "",
    status: company.status,
    is_hiring: company.is_hiring,
    is_fundraising: company.is_fundraising,
    is_collaborating: company.is_collaborating,
    is_featured: company.is_featured,
    is_public: company.is_public,
  }
}

export default function AdminCompaniesPage() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminCompany | null>(null)
  const [form, setForm] = useState<CompanyForm>(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadCompanies = useCallback(async () => {
    const response = await api.get<AdminCollectionResponse<AdminCompany>>("/admin/companies", {
      params: { search: search || undefined },
    })
    setCompanies(response.data)
    setMeta(response.meta)
  }, [search])

  useEffect(() => {
    loadCompanies().catch((err: Error) => toast(err.message, "error"))
  }, [loadCompanies, toast])

  const openEditor = (company?: AdminCompany) => {
    setEditing(company || null)
    setForm(toForm(company))
    setOpen(true)
  }

  const saveCompany = async () => {
    setSaving(true)

    const payload = {
      ...form,
      country_code: form.country_code || null,
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      team_size: form.team_size ? Number(form.team_size) : null,
      website: form.website || null,
    }

    try {
      if (editing) {
        await api.put(`/admin/companies/${editing.id}`, payload)
      } else {
        await api.post("/admin/companies", payload)
      }

      toast(`Company ${editing ? "updated" : "created"}.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadCompanies()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save company.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteCompany = async (company: AdminCompany) => {
    if (!window.confirm(`Delete ${company.name}?`)) {
      return
    }

    try {
      await api.delete(`/admin/companies/${company.id}`)
      toast("Company deleted.", "success")
      await loadCompanies()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete company.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="text-gray-500 text-sm mt-1">Manage companies in the Wosool network.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadCompanies().catch((err: Error) => toast(err.message, "error"))}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => openEditor()}>
            + Add Company
          </Button>
        </div>
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
                    loadCompanies().catch((err: Error) => toast(err.message, "error"))
                  }
                }}
                placeholder="Search companies by name, sector, or location..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadCompanies().catch((err: Error) => toast(err.message, "error"))}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Companies ({meta.total || companies.length})</h3>
            <p className="text-sm text-gray-500">
              {meta.hiring || 0} hiring · {meta.fundraising || 0} fundraising
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Founders</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Sector</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Stage</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-400">{company.location || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {company.founders?.map((founder) => founder.user?.name).filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4"><Badge variant="secondary">{company.sector || "—"}</Badge></td>
                    <td className="px-6 py-4"><Badge variant="outline">{company.stage || "—"}</Badge></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={company.status === "active" ? "success" : "secondary"}>{company.status}</Badge>
                        {company.is_hiring && <Badge variant="secondary">Hiring</Badge>}
                        {company.is_fundraising && <Badge variant="warning">Fundraising</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => openEditor(company)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteCompany(company)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit company" : "Create company"}</DialogTitle>
            <DialogDescription>Maintain seeded company records and public company listings.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Company name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Website" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
              <Input placeholder="Sector" value={form.sector} onChange={(event) => setForm((current) => ({ ...current, sector: event.target.value }))} />
              <Input placeholder="Stage" value={form.stage} onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value }))} />
              <Input placeholder="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              <Input placeholder="Country code" value={form.country_code} onChange={(event) => setForm((current) => ({ ...current, country_code: event.target.value.toUpperCase() }))} />
              <Input placeholder="Founded year" value={form.founded_year} onChange={(event) => setForm((current) => ({ ...current, founded_year: event.target.value }))} />
              <Input placeholder="Team size" value={form.team_size} onChange={(event) => setForm((current) => ({ ...current, team_size: event.target.value }))} />
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">active</option>
                <option value="pending">pending</option>
                <option value="suspended">suspended</option>
                <option value="archived">archived</option>
              </Select>
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["is_hiring", "Hiring"],
                ["is_fundraising", "Fundraising"],
                ["is_collaborating", "Collaborating"],
                ["is_featured", "Featured"],
                ["is_public", "Public"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form[key as keyof CompanyForm] as boolean}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveCompany} loading={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
