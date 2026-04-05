import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { founders } from "@/data/seed"
import {
  Users,
  Building2,
  CalendarDays,
  Star,
  CheckCircle,
  Clock,
  PlusCircle,
  FileText,
  Settings,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Total Members", value: "247", change: "+12 this month", icon: Users, color: "text-blue-600" },
  { label: "Active Founders", value: "183", change: "+8 this month", icon: Star, color: "text-amber-600" },
  { label: "Companies", value: "156", change: "+6 this month", icon: Building2, color: "text-emerald-600" },
  { label: "Events This Month", value: "4", change: "2 upcoming", icon: CalendarDays, color: "text-purple-600" },
]

const recentApplications = founders.slice(0, 4).map((f) => ({
  name: f.name,
  company: f.companyName,
  stage: f.stage,
  sector: f.sector,
  date: "2 days ago",
  status: "pending" as const,
}))

const activityLog = [
  { action: "Layla Al-Rashid joined the network", time: "1h ago", type: "member" },
  { action: "Founder Circle Q3 cohort created", time: "3h ago", type: "program" },
  { action: "Omar Al-Farsi profile verified", time: "5h ago", type: "verification" },
  { action: "stc Ventures added as Platinum Sponsor", time: "1d ago", type: "sponsor" },
  { action: "New event: AI in the GCC Roundtable", time: "2d ago", type: "event" },
]

const quickActions = [
  { icon: PlusCircle, label: "Add Founder", href: "/admin/founders" },
  { icon: FileText, label: "Review Applications", href: "/admin/members" },
  { icon: CalendarDays, label: "Create Event", href: "/admin/events" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome to the Wosool admin panel.</p>
      </div>

      {/* Stats */}
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
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Pending Applications</h3>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/members">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.map(({ name, company, stage, sector, date, status }) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500">{company} · {sector} · {stage}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{date}</span>
                      <Badge variant={status === "pending" ? "warning" : "success"}>
                        {status}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log + Quick Actions */}
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
              <h3 className="font-semibold text-gray-900">Activity Log</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityLog.map(({ action, time, type }) => (
                <div key={action} className="flex items-start gap-3">
                  <div
                    className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      type === "member"
                        ? "bg-blue-400"
                        : type === "program"
                        ? "bg-purple-400"
                        : type === "verification"
                        ? "bg-emerald-400"
                        : type === "sponsor"
                        ? "bg-amber-400"
                        : "bg-gray-400"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
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
