"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Handshake,
  PlusCircle,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import { summarizeApplicationPipeline } from "@/lib/admin-overview"
import { api } from "@/lib/api"
import { type AdminDashboardResponse, formatDate } from "@/lib/admin"
import { useLocale } from "@/lib/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { dateLocale } from "@/lib/date-locale"

const copy = {
  ar: {
    eyebrow: "مركز القيادة والتشغيل",
    title: "نظرة شاملة على وصول",
    description: "تابع المجتمع والشركات والبرامج وطلبات الانضمام من مساحة تشغيل واحدة مبنية للقرارات اليومية.",
    refresh: "تحديث البيانات",
    loading: "جارٍ تحميل لوحة الإدارة…",
    retry: "إعادة المحاولة",
    stale: "تُعرض آخر بيانات متاحة وقد تكون بحاجة إلى تحديث.",
    stats: {
      members: "إجمالي الأعضاء",
      founders: "المؤسسون النشطون",
      companies: "الشركات",
      events: "فعاليات هذا الشهر",
      pending: "طلبات قيد الانتظار",
      programs: "برامج مفتوحة",
      news: "مقالات منشورة",
      month: "الشهر الحالي",
    },
    pipeline: "مسار طلبات العضوية",
    pipelineBody: "حالة الطلبات من الإرسال إلى القرار النهائي.",
    recent: "أحدث طلبات الانضمام",
    viewAll: "عرض جميع الطلبات",
    noApplications: "لا توجد طلبات حديثة.",
    actions: "إجراءات سريعة",
    activity: "السجل التشغيلي",
    noActivity: "لا توجد أنشطة إدارية حديثة.",
    independent: "مستقل",
    admin: "الإدارة",
  },
  en: {
    eyebrow: "OPERATIONS COMMAND CENTER",
    title: "A complete view of Wosool",
    description: "Monitor the community, companies, programs and applications from one operational workspace built for daily decisions.",
    refresh: "Refresh data",
    loading: "Loading the administration dashboard…",
    retry: "Try again",
    stale: "The last available data is shown and may need refreshing.",
    stats: {
      members: "Total members",
      founders: "Active founders",
      companies: "Companies",
      events: "Events this month",
      pending: "Pending applications",
      programs: "Open programs",
      news: "Published articles",
      month: "Current month",
    },
    pipeline: "Membership application pipeline",
    pipelineBody: "Application movement from submission to a final decision.",
    recent: "Recent membership applications",
    viewAll: "View all applications",
    noApplications: "No recent applications.",
    actions: "Quick actions",
    activity: "Operational activity",
    noActivity: "No recent administrative activity.",
    independent: "Independent",
    admin: "Admin",
  },
} as const

const quickActions = [
  { icon: PlusCircle, ar: "إضافة شركة", en: "Add company", href: "/admin/companies" },
  { icon: FileText, ar: "مراجعة الطلبات", en: "Review applications", href: "/admin/members" },
  { icon: CalendarDays, ar: "إنشاء فعالية", en: "Create event", href: "/admin/events" },
  { icon: Sparkles, ar: "اقتراح توافق", en: "Create match", href: "/admin/matches" },
  { icon: Handshake, ar: "إدارة التعارف", en: "Route introductions", href: "/admin/intros" },
  { icon: Star, ar: "عمليات EOA", en: "EOA operations", href: "/eoa/admin" },
  { icon: Users, ar: "إدارة العلاقات CRM", en: "Relationships CRM", href: "/admin/crm" },
  { icon: FileText, ar: "العلاقات العامة والإعلام", en: "Public relations", href: "/admin/pr" },
  { icon: BarChart3, ar: "التحليلات", en: "Analytics", href: "/admin/analytics" },
  { icon: Settings, ar: "الإعدادات", en: "Settings", href: "/admin/settings" },
] as const

const statusCopy: Record<string, { ar: string; en: string }> = {
  submitted: { ar: "تم الإرسال", en: "Submitted" },
  reviewing: { ar: "قيد المراجعة", en: "Reviewing" },
  request_more_info: { ar: "معلومات إضافية", en: "More info" },
  approved: { ar: "مقبول", en: "Approved" },
  waitlisted: { ar: "قائمة الانتظار", en: "Waitlisted" },
  rejected: { ar: "غير مقبول", en: "Not approved" },
}

function statusVariant(status: string) {
  if (status === "approved") return "success" as const
  if (status === "rejected") return "destructive" as const
  if (status === "waitlisted") return "outline" as const
  return "warning" as const
}

export default function AdminPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const t = copy[locale]
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionSearch, setActionSearch] = useState("")
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<AdminDashboardResponse>("/admin/dashboard", { signal })
      if (!signal?.aborted) { setDashboard(response); setUpdatedAt(new Date()) }
    } catch (loadError) {
      if (!signal?.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const stats = dashboard ? [
    { label: t.stats.members, value: dashboard.stats.total_members, detail: `${dashboard.stats.pending_applications} ${t.stats.pending}`, icon: Users, accent: "bg-[var(--brand-blue)]" },
    { label: t.stats.founders, value: dashboard.stats.active_founders, detail: `${dashboard.stats.open_programs} ${t.stats.programs}`, icon: Star, accent: "bg-[var(--brand-pink)]" },
    { label: t.stats.companies, value: dashboard.stats.companies, detail: `${dashboard.stats.published_news} ${t.stats.news}`, icon: Building2, accent: "bg-[var(--brand-green)]" },
    { label: t.stats.events, value: dashboard.stats.events_this_month, detail: t.stats.month, icon: CalendarDays, accent: "bg-[var(--brand-orange)]" },
  ] : []

  const summary = useMemo(() => summarizeApplicationPipeline(dashboard?.application_pipeline), [dashboard?.application_pipeline])
  const pipeline = summary.entries
  const pipelineTotal = summary.total
  const visibleActions = quickActions.filter(action => `${action.ar} ${action.en}`.toLowerCase().includes(actionSearch.trim().toLowerCase()))

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-[var(--radius-hero)] bg-[var(--brand-navy)] px-6 py-5 text-white shadow-[var(--shadow-raised)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(61,70,242,.58),transparent_36%),radial-gradient(circle_at_0%_100%,rgba(255,52,110,.20),transparent_30%)]" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--brand-light-blue)]">{t.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{t.title}</h2>
            <p className="mt-4 text-sm leading-8 text-white/72 sm:text-base">{t.description}</p>{updatedAt && <p className="mt-3 text-xs text-indigo-200">{ar ? "آخر تحديث: " : "Last refreshed: "}{updatedAt.toLocaleTimeString(dateLocale(ar, "en-GB"), {hour:"2-digit", minute:"2-digit", timeZone:"Asia/Riyadh"})} · {ar ? "الرياض" : "Riyadh"}</p>}
          </div>
          <Button type="button" variant="outline" className="min-h-12 border-white/25 bg-white/10 font-bold text-white hover:bg-white hover:text-[var(--brand-navy)]" disabled={loading} onClick={() => void load()}>
            {loading ? <Clock3 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <CheckCircle2 className="h-4 w-4" />}
            {t.refresh}
          </Button>
        </div>
      </header>

      {loading && !dashboard && <p role="status" className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">{t.loading}</p>}
      {error && (
        <div role="alert" className="rounded-[var(--radius-card)] border border-[var(--error-border)] bg-[var(--error-bg)] p-5 text-sm text-[var(--error-text)]">
          <p>{error}</p>
          {dashboard && <p className="mt-2">{t.stale}</p>}
          <Button type="button" variant="outline" className="mt-4" disabled={loading} onClick={() => void load()}>{t.retry}</Button>
        </div>
      )}

      <section aria-labelledby="admin-priorities" className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-widest text-indigo-600">{ar ? 'الخطوة التالية' : 'NEXT TO ACTION'}</p><h2 id="admin-priorities" className="mt-2 text-xl font-bold text-slate-950">{ar ? 'ما يحتاج انتباهك' : 'Needs your attention'}</h2></div><p className="text-xs leading-6 text-slate-500">{ar ? 'ابدأ بالطلبات المتأخرة والرسائل والمتابعات المستحقة.' : 'Start with older applications, unanswered messages and follow-ups due.'}</p></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{[
          {href:'/admin/members',count:dashboard ? summary.overdue : '—',title:ar?'طلبات تجاوزت 14 يوماً':'Applications older than 14 days',body:ar?'طلبات جديدة أو قيد المراجعة تحتاج متابعة.':'Submitted or reviewing applications needing follow-up.',tone:'bg-amber-50 text-amber-950 border-amber-100'},
          {href:'/admin/messages',count:dashboard?.operations?.open_messages ?? '—',title:ar?'رسائل دون رد':'Unanswered messages',body:ar?'راجع الاستفسارات الواردة وأغلق ما تم التعامل معه.':'Review incoming inquiries and mark handled messages.',tone:'bg-sky-50 text-sky-950 border-sky-100'},
          {href:'/admin/crm?due=1',count:dashboard?.operations?.crm_due ?? '—',title:ar?'متابعات علاقات مستحقة':'CRM follow-ups due',body:ar?'مواعيد اليوم والمتابعات المتأخرة للعلاقات المفتوحة.':'Today’s and overdue follow-ups for open relationships.',tone:'bg-rose-50 text-rose-950 border-rose-100'},
          {href:'/admin/pr?due=1',count:dashboard?.operations?.pr_due ?? '—',title:ar?'متابعات إعلامية مستحقة':'PR follow-ups due',body:ar?'تابع العروض والفرص الإعلامية المفتوحة.':'Follow up on open pitches and media opportunities.',tone:'bg-violet-50 text-violet-950 border-violet-100'},
          {href:'/admin/founders',count:dashboard?.stats.unclaimed_founders ?? '—',title:ar?'ملفات بانتظار التفعيل':'Profiles awaiting activation',body:ar?'تحقق من المستلم وأرسل دعوة شخصية.':'Verify the recipient and send a personal invitation.',tone:'bg-indigo-50 text-indigo-950 border-indigo-100'},
          {href:'/admin/founders',count:dashboard?.stats.pending_founder_invitations ?? '—',title:ar?'دعوات سارية':'Open founder invitations',body:ar?'راجع الدعوات التي لم تنته صلاحيتها بعد.':'Review invitations that have not yet expired.',tone:'bg-emerald-50 text-emerald-950 border-emerald-100'},
        ].map(item=><Link key={item.title} href={item.href} className={`rounded-2xl border p-5 transition hover:border-indigo-400 ${item.tone}`}><div className="flex justify-between gap-3"><strong className="text-3xl font-bold">{item.count}</strong><ArrowUpRight size={18}/></div><h3 className="mt-3 text-sm font-bold">{item.title}</h3><p className="mt-2 text-xs leading-6 opacity-75">{item.body}</p></Link>)}</div>
      </section>
      {dashboard?.operations && <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="follow-ups-title"><div className="flex flex-wrap justify-between gap-3"><h2 id="follow-ups-title" className="text-xl font-bold">{ar ? 'جدول المتابعة المستحقة' : 'Due follow-up schedule'}</h2><p className="text-sm text-slate-500">{dashboard.operations.public_members} {ar ? 'عضو ظاهر في الدليل' : 'members visible in directory'} · {dashboard.operations.upcoming_events} {ar ? 'فعاليات خلال 7 أيام' : 'events in the next 7 days'}</p></div>{dashboard.operations.follow_ups.length ? <ul className="mt-4 divide-y divide-slate-100">{dashboard.operations.follow_ups.map(item => <li key={item.id}><Link href={`/admin/${item.kind}?record=${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl py-4 text-sm hover:bg-slate-50"><div><strong className="text-indigo-700">{item.name}</strong><p className="mt-1 text-xs text-slate-500">{item.organization} · {item.owner?.name ?? (ar ? 'دون مسؤول' : 'Unassigned')}</p></div><span className="font-semibold text-slate-600">{item.kind.toUpperCase()} · {item.follow_up_on}</span></Link></li>)}</ul> : <p className="mt-4 text-sm text-slate-500">{ar ? 'لا توجد متابعات مستحقة اليوم.' : 'No follow-ups are due today.'}</p>}</section>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={ar ? "مؤشرات المنصة" : "Platform metrics"}>
        {stats.map(({ label, value, detail, icon: Icon, accent }) => (
          <article key={label} className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 motion-reduce:transform-none">
            <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} aria-hidden="true" />
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--action-bg)]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">{detail}</span>
            </div>
            <strong className="mt-6 block text-4xl font-extrabold tracking-tight text-[var(--text-strong)]" dir="ltr">{value.toLocaleString(dateLocale(ar, "en-US"))}</strong>
            <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">{label}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h3 className="text-xl font-extrabold text-[var(--text-strong)]">{t.pipeline}</h3><p className="mt-2 text-sm text-[var(--text-muted)]">{t.pipelineBody}</p></div>
            <strong className="rounded-full bg-[var(--surface-blue)] px-4 py-2 text-sm text-[var(--action-bg)]" dir="ltr">{pipelineTotal}</strong>
          </div>
          <div className="mt-7 space-y-4">
            {dashboard && pipelineTotal > 0 ? pipeline.map(([status, value]) => {
              const percent = pipelineTotal ? Math.round((value / pipelineTotal) * 100) : 0
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold"><span>{statusCopy[status]?.[locale] ?? status.replaceAll("_", " ")}</span><span dir="ltr">{value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--action-bg)]" style={{ width: `${percent}%` }} /></div>
                </div>
              )
            }) : <p className="text-sm text-[var(--text-muted)]">{dashboard ? t.noApplications : t.loading}</p>}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="text-xl font-extrabold text-[var(--text-strong)]">{t.actions}</h3>
          <label className="mt-4 block text-xs font-semibold text-slate-600">{ar ? "البحث في الإجراءات" : "Find an action"}<input type="search" value={actionSearch} onChange={event=>setActionSearch(event.target.value)} placeholder={ar ? "الطلبات، الشركات، الفعاليات…" : "Applications, companies, events…"} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"/></label>
          {!visibleActions.length && <p role="status" className="mt-4 text-sm text-slate-500">{ar ? "لا توجد إجراءات مطابقة." : "No matching actions."}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {visibleActions.map(({ icon: Icon, ar: arLabel, en, href }) => (
              <Link key={href} href={href} className="group flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 font-bold text-[var(--text)] transition-colors hover:border-[var(--action-bg)] hover:bg-[var(--surface-blue)]">
                <Icon className="h-5 w-5 text-[var(--action-bg)]" aria-hidden="true" /><span className="flex items-end justify-between gap-2 text-xs leading-5">{ar ? arLabel : en}<ArrowUpRight className="h-3.5 w-3.5 opacity-55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transform-none" /></span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] p-5 sm:p-6">
            <h3 className="text-xl font-extrabold text-[var(--text-strong)]">{t.recent}</h3>
            <Link href="/admin/members" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--action-bg)] hover:underline">{t.viewAll}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {dashboard && !dashboard.recent_applications.length && <p className="p-6 text-sm text-[var(--text-muted)]">{dashboard ? t.noApplications : t.loading}</p>}
            {dashboard?.recent_applications.map((application) => (
              <article key={application.id} className="grid gap-4 p-5 transition-colors hover:bg-[var(--surface-soft)] sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div className="min-w-0"><Link href="/admin/members" className="font-extrabold text-[var(--text-strong)] hover:text-[var(--action-bg)]">{application.full_name}</Link><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{application.company_name || t.independent} · {application.sector || "—"} · {application.stage || "—"}</p></div>
                <div className="flex flex-wrap items-center gap-3"><time className="text-xs text-[var(--text-subtle)]" dateTime={application.created_at}>{formatDate(application.created_at)}</time><Badge variant={statusVariant(application.status)}>{statusCopy[application.status]?.[locale] ?? application.status}</Badge></div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="text-xl font-extrabold text-[var(--text-strong)]">{t.activity}</h3>
          <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:start-[7px] before:top-2 before:w-px before:bg-[var(--border-soft)]">
            {dashboard && !dashboard.activity.length && <li className="text-sm text-[var(--text-muted)]">{t.noActivity}</li>}
            {dashboard?.activity.map((item) => (
              <li key={item.id} className="relative ps-7"><span className="absolute start-0 top-1.5 h-[15px] w-[15px] rounded-full border-4 border-[var(--surface)] bg-[var(--action-bg)] shadow-[0_0_0_1px_var(--border-soft)]" /><p className="text-xs font-semibold leading-6 text-[var(--text)]">{item.notes || `${item.action} · ${item.entity_type} #${item.entity_id}`}</p><p className="mt-1 text-[10px] text-[var(--text-subtle)]">{item.admin_name || t.admin} · {formatDate(item.created_at, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p></li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
