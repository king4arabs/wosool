"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminSponsor } from "@/lib/admin"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"

const emptyForm = {
  name: "",
  description: "",
  website: "",
  logo_url: "",
  tier: "community",
  is_active: true,
  contact_name: "",
  contact_email: "",
  contract_start: "",
  contract_end: "",
  display_order: "0",
}

export default function AdminSponsorsPage() {
  const { toast } = useToast()
  const [sponsors, setSponsors] = useState<AdminSponsor[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminSponsor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)

  const load = useCallback(() =>
    api.get<AdminCollectionResponse<AdminSponsor>>("/admin/sponsors", { params: { search: search || undefined } })
      .then((response) => {
        setSponsors(response.data)
        setMeta(response.meta)
      })
      .catch((err: Error) => toast(err.message, "error")), [search, toast])

  useEffect(() => {
    load()
  }, [load])

  const openEditor = (sponsor?: AdminSponsor) => {
    setEditing(sponsor ?? null)
    setForm(sponsor ? {
      name: sponsor.name,
      description: sponsor.description || "",
      website: sponsor.website || "",
      logo_url: sponsor.logo_url || "",
      tier: sponsor.tier,
      is_active: sponsor.is_active,
      contact_name: sponsor.contact_name || "",
      contact_email: sponsor.contact_email || "",
      contract_start: sponsor.contract_start || "",
      contract_end: sponsor.contract_end || "",
      display_order: String(sponsor.display_order),
    } : emptyForm)
    setOpen(true)
  }

  const save = async () => {
    const payload = { ...form, display_order: Number(form.display_order) }
    if (editing) await api.put(`/admin/sponsors/${editing.id}`, payload)
    else await api.post("/admin/sponsors", payload)
    toast(`Sponsor ${editing ? "updated" : "created"}.`, "success")
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
    await load()
  }

  const destroy = async (sponsor: AdminSponsor) => {
    if (!window.confirm(`Delete ${sponsor.name}?`)) return
    await api.delete(`/admin/sponsors/${sponsor.id}`)
    toast("Sponsor deleted.", "success")
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sponsors</h2>
          <p className="text-gray-500 text-sm mt-1">Manage sponsor relationships, tiers, and contract windows.</p>
        </div>
        <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sponsors", value: meta.total || 0 },
          { label: "Active", value: meta.active || 0 },
          { label: "Platinum", value: meta.platinum || 0 },
          { label: "Gold", value: meta.gold || 0 },
        ].map((item) => <Card key={item.label}><CardContent className="pt-6"><p className="text-3xl font-bold text-gray-900">{item.value}</p><p className="text-sm text-gray-500 mt-1">{item.label}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sponsors..." className="pl-10" /></div>
            <Button variant="outline" size="sm" onClick={load}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Sponsor Records</h3></CardHeader>
        <CardContent className="space-y-4">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="flex items-start justify-between rounded-xl border border-gray-100 p-4">
              <div>
                <p className="font-medium text-gray-900">{sponsor.name}</p>
                <p className="text-sm text-gray-500 mt-1">{sponsor.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="gold">{sponsor.tier}</Badge>
                  <Badge variant={sponsor.is_active ? "success" : "secondary"}>{sponsor.is_active ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEditor(sponsor)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => destroy(sponsor)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit sponsor" : "Add sponsor"}</DialogTitle>
            <DialogDescription>Manage sponsor data from the production admin panel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Tier" value={form.tier} onChange={(event) => setForm((current) => ({ ...current, tier: event.target.value }))} />
              <Input placeholder="Website" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
              <Input placeholder="Logo URL" value={form.logo_url} onChange={(event) => setForm((current) => ({ ...current, logo_url: event.target.value }))} />
              <Input placeholder="Contact name" value={form.contact_name} onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))} />
              <Input placeholder="Contact email" value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
              <Input type="date" value={form.contract_start} onChange={(event) => setForm((current) => ({ ...current, contract_start: event.target.value }))} />
              <Input type="date" value={form.contract_end} onChange={(event) => setForm((current) => ({ ...current, contract_end: event.target.value }))} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
