"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "كتاب المؤسسين", labelEn: "Feed" },
  { href: "/dashboard/profile", icon: User, label: "ملفي الشخصي", labelEn: "My Profile" },
  { href: "/dashboard/company", icon: Building2, label: "شركتي", labelEn: "My Company" },
  { href: "/dashboard/scorecard", icon: Star, label: "التقييم", labelEn: "Scorecard" },
  { href: "/dashboard/community", icon: Users, label: "المجتمع", labelEn: "Community" },
  { href: "/dashboard/matches", icon: Sparkles, label: "التوافق", labelEn: "Matches" },
  { href: "/dashboard/events", icon: CalendarDays, label: "الفعاليات", labelEn: "Events" },
  { href: "/dashboard/programs", icon: GraduationCap, label: "البرامج", labelEn: "Programs" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "الرسائل", labelEn: "Messages" },
  { href: "/dashboard/settings", icon: Settings, label: "الإعدادات", labelEn: "Settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  const displayName = user?.name ?? "Member"
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-700 text-sm font-bold">جاري التحميل…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      {/* Ambient radial glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(59,82,212,0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(59,82,212,0.04), transparent 35%)",
        }}
      />

      {/* Sidebar — glass panel, light */}
      <aside
        className="hidden lg:flex flex-col w-72 fixed top-0 left-0 bottom-0 z-50 p-4"
        aria-label="Dashboard navigation"
      >
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF1FF] border border-[#E4E7F0]">
                <svg className="h-5 w-5 text-[#3B52D4]" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M120 160c-33.1 0-60 26.9-60 60s26.9 60 60 60c11.3 0 21.9-3.1 31-8.5l68.5 68.5c-5.4 9.1-8.5 19.7-8.5 31 0 33.1 26.9 60 60 60s60-26.9 60-60c0-11.3-3.1-21.9-8.5-31l68.5-68.5c9.1 5.4 19.7 8.5 31 8.5 33.1 0 60-26.9 60-60s-26.9-60-60-60-60 26.9-60 60c0 11.3 3.1 21.9 8.5 31l-68.5 68.5c-9.1-5.4-19.7-8.5-31-8.5s-21.9 3.1-31 8.5L151 222.5c5.4-9.1 8.5-19.7 8.5-31 0-33.1-26.9-60-60-60z" />
                  <circle cx="430" cy="190" r="50" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-base font-black tracking-tight text-slate-900">
                  WOSOOL
                  <span className="text-[9px] font-extrabold text-[#3B52D4] bg-[#EEF1FF] px-1.5 py-0.5 rounded border border-[#E4E7F0]">
                    وصول
                  </span>
                </div>
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  لوحة إدارة الشبكة
                </div>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                  pathname === href
                    ? "bg-[#EEF1FF] text-[#3B52D4] border-r-4 border-[#3B52D4]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" />
                <p className="text-[11px] font-extrabold text-slate-800">{displayName}</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:mr-72 flex flex-col relative z-10">
        {/* Top bar */}
        <header
          className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
          style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.04)" }}
        >
          <div className="flex items-center gap-4 flex-1">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ابحث في الشبكة…"
              className="bg-transparent text-xs text-slate-700 w-full focus:outline-none placeholder:text-slate-400 font-medium max-w-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
              مباشر ومؤمن
            </div>
            <button
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#3B52D4] rounded-full" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#EEF1FF] text-[#3B52D4] text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
