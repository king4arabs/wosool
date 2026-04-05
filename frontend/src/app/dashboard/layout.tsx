"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Building2,
  Star,
  Users,
  Sparkles,
  CalendarDays,
  GraduationCap,
  MessageCircle,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/company", icon: Building2, label: "My Company" },
  { href: "/dashboard/scorecard", icon: Star, label: "Scorecard" },
  { href: "/dashboard/community", icon: Users, label: "Community" },
  { href: "/dashboard/matches", icon: Sparkles, label: "Matches" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/programs", icon: GraduationCap, label: "Programs" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#F8F5EF]">
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-[#0A1628] text-white fixed top-0 left-0 bottom-0 z-50"
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Wosool</span>
            <span className="text-xs text-[#C9A84C] tracking-widest uppercase">وصول</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
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
              <AvatarFallback className="text-xs">LR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Layla Al-Rashid</p>
              <p className="text-xs text-gray-400 truncate">Meezan Capital</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#0A1628]">
              {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#C9A84C] rounded-full" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">LR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
