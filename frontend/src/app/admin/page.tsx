"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { type AdminDashboardResponse, formatDate } from "@/lib/admin"
import {
  Users,
  Building2,
  CalendarDays,
  Star,
  PlusCircle,
  FileText,
  Settings,
} from "lucide-react"

const quickActions = [
  { icon: PlusCircle, label: "Add Company", href: "/admin/companies" },
  { icon: FileText, label: "Review Apps", href: "/admin/members" },
  { icon: CalendarDays, label: "Create Event", href: "/admin/events" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<AdminDashboardResponse>("/admin/dashboard")
      .then(setDashboard)
      .catch((err: Error) => setError(err.message))
  }, [])

  const stats = dashboard ? [
    { label: "Total Members", value: dashboard.stats.total_members, change: `${dashboard.stats.pending_applications} pending`, icon: Users, color: "text-blue-600" },
    { label: "Active Founders", value: dashboard.stats.active_founders, change: `${dashboard.stats.open_programs} open programs`, icon: Star, color: "text-amber-600" },
    { label: "Companies", value: dashboard.stats.companies, change: `${dashboard.stats.published_news} published articles`, icon: Building2, color: "text-emerald-600" },
    { label: "Events This Month", value: dashboard.stats.events_this_month, change: "Live seeded schedule", icon: CalendarDays, color: "text-purple-600" },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome to the Wosool admin panel.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                <Badge variant="secondary" className="text-xs">{change}</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Applications</h3>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/members">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recent_applications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{application.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {application.company_name || "Independent"} · {application.sector || "—"} · {application.stage || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(application.created_at)}</span>
                      <Badge variant={application.status === "approved" ? "success" : application.status === "rejected" ? "destructive" : application.status === "waitlisted" ? "outline" : "warning"}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map(({ icon: Icon, label, href }) => (
                <Button
                  key={label}
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Link href={href}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs">{label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard?.activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-amber-400" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      {item.notes || `${item.action} on ${item.entity_type} #${item.entity_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.admin_name || "Admin"} · {formatDate(item.created_at, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
