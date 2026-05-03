"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  Sparkles,
  CalendarDays,
  GraduationCap,
  Handshake,
  Newspaper,
  BarChart3,
  Settings,
  Trophy,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { AdminGuard } from "@/components/admin/AdminGuard"

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/founders", icon: Trophy, label: "Founders" },
  { href: "/admin/companies", icon: Building2, label: "Companies" },
  { href: "/admin/scorecards", icon: Star, label: "Scorecards" },
  { href: "/admin/matches", icon: Sparkles, label: "Matches" },
  { href: "/admin/events", icon: CalendarDays, label: "Events" },
  { href: "/admin/programs", icon: GraduationCap, label: "Programs" },
  { href: "/admin/partners", icon: Handshake, label: "Partners" },
  { href: "/admin/sponsors", icon: Trophy, label: "Sponsors" },
  { href: "/admin/news", icon: Newspaper, label: "News" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD"

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <aside
          className="hidden lg:flex flex-col w-64 bg-[#1E293B] text-white fixed top-0 left-0 bottom-0 z-50"
          aria-label="Admin navigation"
        >
          <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Wosool</span>
              <span className="text-xs bg-red-500 text-white rounded px-1.5 py-0.5 font-medium">
                Admin
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {adminNavItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                  pathname === href
                    ? "bg-[#C9A84C] text-[#0A1628]"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-red-500 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name ?? "Admin User"}</p>
                <p className="text-xs text-gray-400">{user?.email ?? "Super Admin"}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64 flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-red-100 text-red-700 rounded px-2 py-1 font-semibold">
                Admin Panel
              </span>
              <h1 className="text-base font-semibold text-gray-700">
                {adminNavItems.find((n) => n.href === pathname)?.label ?? "Admin"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← View Site
              </Link>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-red-500 text-white">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  )
}
