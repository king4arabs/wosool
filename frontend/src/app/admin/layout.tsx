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
  MessageCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { useLocale } from "@/lib/locale"

const adminLabels = {
  ar: {
    nav: {
      "/admin": "نظرة عامة",
      "/admin/members": "طلبات العضوية",
      "/admin/founders": "المؤسسون",
      "/admin/companies": "الشركات",
      "/admin/scorecards": "التقييمات",
      "/admin/matches": "التوافق",
      "/admin/intros": "التعريفات",
      "/admin/events": "الفعاليات",
      "/admin/programs": "البرامج",
      "/admin/partners": "الشركاء",
      "/admin/sponsors": "الرعاة",
      "/admin/news": "الأخبار",
      "/admin/chat": "إشراف المحادثات",
      "/admin/analytics": "التحليلات",
      "/admin/settings": "الإعدادات",
    },
    panel: "لوحة الأدمن",
    management: "الإدارة",
    site: "عرض الموقع",
    fallback: "الإدارة",
  },
  en: {
    nav: {
      "/admin": "Overview",
      "/admin/members": "Membership Requests",
      "/admin/founders": "Founders",
      "/admin/companies": "Companies",
      "/admin/scorecards": "Scorecards",
      "/admin/matches": "Matches",
      "/admin/intros": "Introductions",
      "/admin/events": "Events",
      "/admin/programs": "Programs",
      "/admin/partners": "Partners",
      "/admin/sponsors": "Sponsors",
      "/admin/news": "News",
      "/admin/chat": "Chat Moderation",
      "/admin/analytics": "Analytics",
      "/admin/settings": "Settings",
    },
    panel: "Admin Panel",
    management: "Management",
    site: "View Site",
    fallback: "Admin",
  },
} as const

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard },
  { href: "/admin/members", icon: Users },
  { href: "/admin/founders", icon: Trophy },
  { href: "/admin/companies", icon: Building2 },
  { href: "/admin/scorecards", icon: Star },
  { href: "/admin/matches", icon: Sparkles },
  { href: "/admin/intros", icon: Handshake },
  { href: "/admin/events", icon: CalendarDays },
  { href: "/admin/programs", icon: GraduationCap },
  { href: "/admin/partners", icon: Handshake },
  { href: "/admin/sponsors", icon: Trophy },
  { href: "/admin/news", icon: Newspaper },
  { href: "/admin/chat", icon: MessageCircle },
  { href: "/admin/analytics", icon: BarChart3 },
  { href: "/admin/settings", icon: Settings },
] as const

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { locale } = useLocale()
  const activeLocale = locale === "en" ? "en" : "ar"
  const copy = adminLabels[activeLocale]

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD"

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50" dir={activeLocale === "ar" ? "rtl" : "ltr"}>
        <aside
          className="hidden lg:flex flex-col w-64 bg-[#1E293B] text-white fixed top-0 right-0 bottom-0 z-50"
          aria-label="Admin navigation"
        >
          <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Wosool</span>
              <span className="text-xs bg-red-500 text-white rounded px-1.5 py-0.5 font-medium">
                {copy.management}
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {adminNavItems.map(({ href, icon: Icon }) => (
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
                {copy.nav[href]}
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

        <div className="flex-1 lg:mr-64 flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-red-100 text-red-700 rounded px-2 py-1 font-semibold">
                {copy.panel}
              </span>
              <h1 className="text-base font-semibold text-gray-700">
                {(copy.nav as Record<string, string>)[pathname] ?? copy.fallback}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {copy.site}
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
