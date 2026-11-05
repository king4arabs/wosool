import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  Compass,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react"
import { normalizeSearch } from './faq-search'

export const adminServiceDescriptions: Record<string, [string, string]> = {
  '/admin': ['الأولويات والمؤشرات وآخر النشاطات.', 'Priorities, key figures and recent activity.'],
  '/admin/services': ['ابحث عن جميع أدوات الإدارة في مكان واحد.', 'Find every management tool in one place.'],
  '/admin/members': ['مراجعة الطلبات ومتابعة قرارات العضوية.', 'Review applications and membership decisions.'],
  '/admin/founders': ['الملفات الشخصية وتفعيل الحسابات.', 'Manage profiles and account activation.'],
  '/admin/companies': ['بيانات الشركات وروابطها ومؤسسوها.', 'Company details, links and founders.'],
  '/admin/scorecards': ['عرض بطاقات التقييم وتحديثها.', 'Review and update founder scorecards.'],
  '/admin/matches': ['اقتراح العلاقات ومراجعة التوافق.', 'Manage matching suggestions.'],
  '/admin/intros': ['طلبات التعارف ومتابعة حالتها.', 'Track introductions and their status.'],
  '/admin/messages': ['الاستفسارات الواردة ومتابعة الردود.', 'Incoming inquiries and replies.'],
  '/admin/chat': ['الإشراف على محادثات المجتمع.', 'Moderate community conversations.'],
  '/admin/events': ['الفعاليات والتسجيلات والحضور.', 'Events, registrations and attendance.'],
  '/admin/programs': ['البرامج والطلبات والمشاركون.', 'Programs, applications and participants.'],
  '/eoa/admin': ['الدفعات والجلسات والمشاركون وفريق المسرّعة.', 'Accelerator cohorts, sessions, participants and team.'],
  '/admin/opportunities': ['فرص الدعم ومصادر منظومة ريادة الأعمال.', 'Support opportunities and ecosystem resources.'],
  '/admin/partners': ['بيانات الشركاء والشعارات والروابط.', 'Partner details, logos and links.'],
  '/admin/sponsors': ['الرعاة وبيانات التواصل معهم.', 'Sponsors and their contact details.'],
  '/admin/news': ['إدارة الأخبار والمقالات المنشورة.', 'Manage news and published articles.'],
  '/admin/analytics': ['المؤشرات والاتجاهات وتصدير التقارير.', 'Metrics, trends and report exports.'],
  '/admin/crm': ['جهات التواصل والمسؤولون والمتابعات.', 'Contacts, owners and follow-ups.'],
  '/admin/pr': ['العلاقات الإعلامية والحملات والتغطيات.', 'Media relationships, campaigns and coverage.'],
  '/admin/privacy-requests': ['مراجعة طلبات الخصوصية والبيانات.', 'Review privacy and data requests.'],
  '/admin/settings': ['إعدادات الموقع والتشغيل.', 'Website and operational settings.'],
}

export function filterAdminServices(query: string, locale: 'ar' | 'en') {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return adminGroups.map(group => ({ ...group, items: group.items.filter(item => {
    const haystack = normalizeSearch([adminLabels.ar.nav[item.href], adminLabels.en.nav[item.href], adminLabels[locale].groups[group.key], ...(adminServiceDescriptions[item.href] ?? [])].join(' '))
    return terms.every(term => haystack.includes(term))
  }) })).filter(group => group.items.length)
}

export const adminLabels = {
  ar: {
    panel: "مركز إدارة وصول",
    subtitle: "المجتمع · الشركات · المسرّعة",
    navigation: "قائمة إدارة وصول",
    visit: "عرض الموقع",
    language: "اللغة",
    fallback: "الإدارة",
    groups: {
      community: "المجتمع",
      operations: "العمليات",
      growth: "النمو والمحتوى",
      system: "النظام",
    },
    nav: {
      "/admin": "نظرة عامة",
      "/admin/services": "دليل الخدمات",
      "/admin/members": "طلبات العضوية",
      "/admin/founders": "المؤسسون",
      "/admin/companies": "الشركات",
      "/admin/scorecards": "بطاقات التقييم",
      "/admin/matches": "التوافق الذكي",
      "/admin/intros": "طلبات التعارف",
      "/admin/messages": "رسائل التواصل",
      "/admin/chat": "إشراف المحادثات",
      "/admin/events": "الفعاليات",
      "/admin/programs": "البرامج",
      "/eoa/admin": "عمليات EOA",
      "/admin/opportunities": "مصادر المنظومة",
      "/admin/partners": "الشركاء",
      "/admin/sponsors": "الرعاة",
      "/admin/news": "الأخبار والمحتوى",
      "/admin/analytics": "التحليلات",
      "/admin/crm": "إدارة العلاقات CRM",
      "/admin/pr": "العلاقات العامة والإعلام",
      "/admin/privacy-requests": "طلبات الخصوصية",
      "/admin/settings": "الإعدادات",
    },
  },
  en: {
    panel: "Wosool Command Center",
    subtitle: "Community · Companies · Accelerator",
    navigation: "Wosool administration",
    visit: "View site",
    language: "Language",
    fallback: "Administration",
    groups: {
      community: "Community",
      operations: "Operations",
      growth: "Growth & content",
      system: "System",
    },
    nav: {
      "/admin": "Overview",
      "/admin/services": "All services",
      "/admin/members": "Membership requests",
      "/admin/founders": "Founders",
      "/admin/companies": "Companies",
      "/admin/scorecards": "Scorecards",
      "/admin/matches": "Smart matching",
      "/admin/intros": "Introductions",
      "/admin/messages": "Contact messages",
      "/admin/chat": "Chat moderation",
      "/admin/events": "Events",
      "/admin/programs": "Programs",
      "/eoa/admin": "EOA operations",
      "/admin/opportunities": "Ecosystem sources",
      "/admin/partners": "Partners",
      "/admin/sponsors": "Sponsors",
      "/admin/news": "News & content",
      "/admin/analytics": "Analytics",
      "/admin/crm": "Relationships CRM",
      "/admin/pr": "Public relations",
      "/admin/privacy-requests": "Privacy requests",
      "/admin/settings": "Settings",
    },
  },
} as const

export type AdminRoute = keyof typeof adminLabels.en.nav

type NavigationGroup = {
  key: keyof typeof adminLabels.en.groups
  items: Array<{ href: AdminRoute; icon: LucideIcon }>
}

export const adminGroups: NavigationGroup[] = [
  {
    key: "community",
    items: [
      { href: "/admin", icon: LayoutDashboard },
      { href: "/admin/services", icon: Compass },
      { href: "/admin/members", icon: UserRoundCheck },
      { href: "/admin/founders", icon: Users },
      { href: "/admin/companies", icon: Building2 },
      { href: "/admin/scorecards", icon: ClipboardList },
      { href: "/admin/matches", icon: Sparkles },
      { href: "/admin/intros", icon: Handshake },
      { href: "/admin/messages", icon: Inbox },
      { href: "/admin/chat", icon: MessageCircle },
    ],
  },
  {
    key: "operations",
    items: [
      { href: "/admin/events", icon: CalendarDays },
      { href: "/admin/programs", icon: GraduationCap },
      { href: "/eoa/admin", icon: Trophy },
    ],
  },
  {
    key: "growth",
    items: [
      { href: "/admin/crm", icon: Users },
      { href: "/admin/pr", icon: Newspaper },
      { href: "/admin/opportunities", icon: Compass },
      { href: "/admin/partners", icon: Handshake },
      { href: "/admin/sponsors", icon: BadgeCheck },
      { href: "/admin/news", icon: Newspaper },
      { href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    key: "system",
    items: [
      { href: "/admin/privacy-requests", icon: ShieldCheck },
      { href: "/admin/settings", icon: Settings },
    ],
  },
]

export function adminRouteActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

