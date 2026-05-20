"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminPartner } from "@/lib/admin"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"

const emptyForm = {
  name: "",
  description: "",
  website: "",
  logo_url: "",
  type: "ecosystem",
  status: "prospective",
  sector: "",
  contact_name: "",
  contact_email: "",
  is_public: true,
  display_order: "0",
}

export default function AdminPartnersPage() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<AdminPartner[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminPartner | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)

  const load = useCallback(() =>
    api.get<AdminCollectionResponse<AdminPartner>>("/admin/partners", { params: { search: search || undefined } })
      .then((response) => {
        setPartners(response.data)
        setMeta(response.meta)
      })
      .catch((err: Error) => toast(err.message, "error")), [search, toast])

  useEffect(() => {
    load()
  }, [load])

  const openEditor = (partner?: AdminPartner) => {
    setEditing(partner ?? null)
    setForm(partner ? {
      name: partner.name,
      description: partner.description || "",
      website: partner.website || "",
      logo_url: partner.logo_url || "",
      type: partner.type,
      status: partner.status,
      sector: partner.sector || "",
      contact_name: partner.contact_name || "",
      contact_email: partner.contact_email || "",
      is_public: partner.is_public,
      display_order: String(partner.display_order),
    } : emptyForm)
    setOpen(true)
  }

  const save = async () => {
    const payload = { ...form, display_order: Number(form.display_order) }
    if (editing) await api.put(`/admin/partners/${editing.id}`, payload)
    else await api.post("/admin/partners", payload)
    toast(`Partner ${editing ? "updated" : "created"}.`, "success")
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
    await load()
  }

  const destroy = async (partner: AdminPartner) => {
    if (!window.confirm(`Delete ${partner.name}?`)) return
    await api.delete(`/admin/partners/${partner.id}`)
    toast("Partner deleted.", "success")
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partners</h2>
          <p className="text-gray-500 text-sm mt-1">Manage ecosystem and strategic partner records.</p>
        </div>
        <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-2" />Add Partner</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Partners", value: meta.total || 0 },
          { label: "Confirmed", value: meta.confirmed || 0 },
          { label: "Prospective", value: meta.prospective || 0 },
          { label: "Partner Types", value: meta.types || 0 },
        ].map((item) => <Card key={item.label}><CardContent className="pt-6"><p className="text-3xl font-bold text-gray-900">{item.value}</p><p className="text-sm text-gray-500 mt-1">{item.label}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search partners..." className="pl-10" /></div>
            <Button variant="outline" size="sm" onClick={load}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Partner Records</h3></CardHeader>
        <CardContent className="space-y-4">
          {partners.map((partner) => (
            <div key={partner.id} className="flex items-start justify-between rounded-xl border border-gray-100 p-4">
              <div>
                <p className="font-medium text-gray-900">{partner.name}</p>
                <p className="text-sm text-gray-500 mt-1">{partner.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">{partner.type}</Badge>
                  <Badge variant={partner.status === "confirmed" ? "success" : "warning"}>{partner.status}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEditor(partner)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => destroy(partner)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit partner" : "Add partner"}</DialogTitle>
            <DialogDescription>Manage publicly visible partner records from the production admin panel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Sector" value={form.sector} onChange={(event) => setForm((current) => ({ ...current, sector: event.target.value }))} />
              <Input placeholder="Website" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
              <Input placeholder="Logo URL" value={form.logo_url} onChange={(event) => setForm((current) => ({ ...current, logo_url: event.target.value }))} />
              <Input placeholder="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
              <Input placeholder="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} />
              <Input placeholder="Contact name" value={form.contact_name} onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))} />
              <Input placeholder="Contact email" value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
