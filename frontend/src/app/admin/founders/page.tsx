"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminFounder, formatDate } from "@/lib/admin"
import { Search } from "lucide-react"

const statusVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  active: "success",
  pending: "warning",
  suspended: "secondary",
}

export default function AdminFoundersPage() {
  const [founders, setFounders] = useState<AdminFounder[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() =>
    api.get<AdminCollectionResponse<AdminFounder>>("/admin/founders", {
      params: { search: search || undefined },
    })
      .then((response) => {
        setFounders(response.data)
        setMeta(response.meta)
      })
      .catch((err: Error) => setError(err.message)), [search])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Founders</h2>
        <p className="text-gray-500 text-sm mt-1">Review member founder profiles, visibility, and score coverage.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search founders by name, sector, or tagline..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: meta.total || 0 },
          { label: "Active", value: meta.active || 0 },
          { label: "Pending", value: meta.pending || 0 },
          { label: "Featured", value: meta.featured || 0 },
        ].map((item) => (
          <Card key={item.label}><CardContent className="pt-6"><p className="text-3xl font-bold text-gray-900">{item.value}</p><p className="text-sm text-gray-500 mt-1">{item.label}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Founder Directory</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Founder</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Score</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {founders.map((founder) => {
                  const initials = (founder.name || "F").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
                  return (
                    <tr key={founder.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{founder.name || founder.slug}</p>
                            <p className="text-xs text-gray-400">{founder.location || founder.sector || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{founder.companies?.[0]?.name || "—"}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[founder.status] ?? "secondary"}>{founder.status}</Badge></td>
                      <td className="px-6 py-4 text-gray-700">{founder.scorecard?.overall_score ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(founder.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
