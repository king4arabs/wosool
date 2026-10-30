"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Building2, CalendarDays, Handshake, MessageCircle, RefreshCw, Users, UserRound } from "lucide-react"
import { profileCompletion } from "@/lib/profile-completion"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { parseScorecard, type Scorecard } from "@/types/platform"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import ScorecardWidget from "@/components/dashboard/ScorecardWidget"
import { MyFounderCard, type FounderCardState } from "@/components/dashboard/MyFounderCard"
import { isFounderProfileEligibleForPublicCard } from "@/lib/founder-card-links"
import NextSteps from "@/components/dashboard/NextSteps"
import { applicationHref, applicationStatus, homePrograms, homeSchedule, rsvpStatus, type HomeApplication, type HomeEvent, type StatusTone } from "@/lib/dashboard-home"
import { dateLocale } from "@/lib/date-locale"

interface DashboardData {
  profile_completion?: number
  company_completion?: number
  companies?: Array<{id: number; name: string; sector?: string; stage?: string}>
  intro_requests?: {pending_count: number; inbound_count: number; outbound_count: number}
  recommended_matches?: Array<{id: number; founder_a?: ApiFounder; founder_b?: ApiFounder}>
  upcoming_appointments?: Array<{id: number; scheduled_at: string; type?: string; host_name?: string; guest_name?: string}>
  upcoming_events?: HomeEvent[]
  upcoming_rsvps?: HomeEvent[]
  program_applications?: HomeApplication[]
  recommended_programs?: Array<{id: number; name: string; slug: string; category?: string}>
}
const panel = "min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
const toneClass: Record<StatusTone, string> = {
  confirmed: "bg-emerald-50 text-emerald-800",
  pending: "bg-indigo-50 text-indigo-800",
  waiting: "bg-amber-50 text-amber-900",
  closed: "bg-slate-100 text-slate-700",
  draft: "bg-slate-100 text-slate-700",
}
function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${toneClass[tone]}`}>{label}</span>
}

export default function DashboardPage() {
  const { locale } = useLocale()
  const { user } = useAuth()
  const ar = locale === "ar"
  const [data, setData] = useState<DashboardData | null>(null)
  const [profile, setProfile] = useState<ApiFounder | null>(null)
  const [publicProfile, setPublicProfile] = useState<ApiFounder | null>(null)
  const [cardState, setCardState] = useState<FounderCardState>('checking')
  const [score, setScore] = useState<Scorecard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [updated, setUpdated] = useState<Date | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const options = {signal: controller.signal, headers: {'X-Locale': locale}}
    Promise.allSettled([
      api.get<{data: DashboardData}>('/member/dashboard', options),
      api.get<{data: ApiFounder}>('/member/founder-profile', options),
      api.get<{data: unknown}>('/member/scorecard', options),
    ]).then(([overview, founder, scorecard]) => {
      if (controller.signal.aborted) return
      if (overview.status === 'fulfilled') { setData(overview.value.data); setUpdated(new Date()) }
      if (founder.status === 'fulfilled') {
        const ownedProfile = founder.value.data
        setProfile(ownedProfile)
        if (!isFounderProfileEligibleForPublicCard(ownedProfile)) {
          setCardState('hidden')
        } else {
          // Confirm the published record has the same database identity as this member's
          // profile before enabling links to either public grid; never trust a slug alone.
          void api.get<{data: ApiFounder}>('/founders/' + encodeURIComponent(ownedProfile.slug), options)
            .then(response => {
              if (controller.signal.aborted) return
              const published = response.data
              if (published.id === ownedProfile.id && published.is_public === true && published.status === 'active') {
                setPublicProfile(published)
                setCardState('published')
              } else {
                setCardState('hidden')
              }
            })
            .catch(error => {
              if (!controller.signal.aborted) setCardState(error instanceof ApiError && error.status === 404 ? 'hidden' : 'unavailable')
            })
        }
      } else {
        setCardState(founder.reason instanceof ApiError && founder.reason.status === 404 ? 'missing' : 'unavailable')
      }
      if (scorecard.status === 'fulfilled') setScore(parseScorecard(scorecard.value.data))
      setError([overview, founder, scorecard].some(result => result.status === 'rejected' && !(result.reason instanceof ApiError && result.reason.status === 404)))
      setLoading(false)
    })
    return () => controller.abort()
  }, [locale, attempt])
  const refresh = () => { setLoading(true); setError(false); setPublicProfile(null); setCardState('checking'); setAttempt(n => n + 1) }
  const founder = profile ? mapFounder(profile) : null
  const completion = profile ? profileCompletion(profile) : data?.profile_completion
  const name = founder?.name || user?.name || (ar ? 'المؤسس' : 'Founder')
  const date = (value: string) => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString(dateLocale(ar, "en-GB"), {timeZone:'Asia/Riyadh',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'
  const matches = (data?.recommended_matches ?? []).map(match => {
    const other = String(match.founder_a?.id) === String(profile?.id) ? match.founder_b : match.founder_a
    return other ? mapFounder(other) : null
  }).filter(item => item !== null)
  const schedule = homeSchedule(data?.upcoming_rsvps, data?.upcoming_events, updated?.getTime() ?? Infinity)
  const programs = homePrograms(data?.program_applications, data?.recommended_programs)
  const appointments = data?.upcoming_appointments ?? []
  return <div className="space-y-6" aria-busy={loading}>
    <header className="relative overflow-hidden rounded-3xl bg-[#101035] p-6 text-white sm:p-8">
      <div className="absolute -end-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4"><Avatar className="h-16 w-16 shrink-0 border-2 border-white/25"><AvatarImage src={founder?.avatarUrl} alt={name} /><AvatarFallback className="bg-indigo-600 text-white">{getInitials(name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="text-xs font-bold tracking-widest text-indigo-200">{ar ? 'مساحتك في وصول' : 'YOUR FOUNDER WORKSPACE'}</p><h1 className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">{ar ? `أهلاً، ${name}` : `Welcome, ${name}`}</h1><p className="mt-2 text-sm leading-6 text-indigo-100">{founder?.position || (ar ? 'علاقات مفيدة، وخطوة تالية واضحة.' : 'Meaningful connections. A clear next step.')}</p></div></div>
        <button type="button" onClick={refresh} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />{ar ? 'تحديث' : 'Refresh'}</button>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5"><Link href="/dashboard/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-indigo-950"><Users size={17}/>{ar ? 'اكتشف المؤسسين' : 'Discover founders'}</Link><Link href="/dashboard/messages" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold"><MessageCircle size={17}/>{ar ? 'محادثاتي' : 'My conversations'}</Link>{publicProfile?.slug && <Link href={'/founders/' + encodeURIComponent(publicProfile.slug)} className="inline-flex min-h-11 items-center px-2 text-sm text-indigo-100 underline">{ar ? 'ملفي العام' : 'My public profile'}</Link>}</div>
    </header>
    {error && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">{ar ? 'تعذر تحديث بعض المعلومات. قد تكون البيانات المعروضة أقدم من آخر تغييراتك.' : 'Some information could not be refreshed. Displayed information may be out of date.'}<button className="ms-3 inline-flex min-h-11 items-center font-bold underline" disabled={loading} onClick={refresh}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></div>}
    {loading && !data && <p role="status" className="text-sm text-slate-500">{ar ? 'جارٍ تحميل مساحة عملك…' : 'Loading your workspace…'}</p>}
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label={ar ? 'ملخص حسابك' : 'Your account at a glance'}>{[
      {label:ar?'اكتمال الملف':'Profile complete',value:completion === undefined ? '—' : `${completion}%`,href:'/dashboard/profile',icon:UserRound},
      {label:ar?'الشركات المرتبطة':'Linked companies',value:data?.companies?.length ?? '—',href:'/dashboard/company',icon:Building2},
      {label:ar?'طلبات تعارف واردة':'Incoming introductions',value:data?.intro_requests?.inbound_count ?? '—',href:'/dashboard/matches',icon:Handshake},
      {label:ar?'تعارف مقترح':'Suggested connections',value:data?.recommended_matches?.length ?? '—',href:'/dashboard/matches',icon:Users},
    ].map(({label,value,href,icon:Icon})=><Link key={href+label} href={href} className={`${panel} group transition-colors hover:border-indigo-400`}><Icon className="h-5 w-5 text-indigo-600"/><strong className="mt-4 block text-3xl font-bold text-slate-950">{value}</strong><span className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold leading-5 text-slate-500">{label}<ArrowUpRight className="h-4 w-4 shrink-0"/></span></Link>)}</section>
    <NextSteps ar={ar} profileCompletion={completion} companyCompletion={data?.company_completion} pendingIntros={data?.intro_requests?.pending_count}/>
    <MyFounderCard profile={profile} publicProfile={publicProfile} state={cardState} locale={ar ? 'ar' : 'en'} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section className={panel}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-950">{ar?'علاقات تستحق البداية':'People worth connecting with'}</h2><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-600" href="/dashboard/matches">{ar?'كل المقترحات':'All suggestions'}<ArrowUpRight size={16}/></Link></div><p className="text-sm leading-7 text-slate-500">{ar?'راجع الملفات قبل طلب التعارف، ووضح ما ترغب في تحقيقه.':'Explore their profiles and make your introduction purposeful.'}</p><div className="mt-5 space-y-3">{matches.map(person=><Link key={person.id} href={`/founders/${person.slug}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-indigo-300"><Avatar className="h-12 w-12 shrink-0"><AvatarImage src={person.avatarUrl} alt={person.name}/><AvatarFallback>{getInitials(person.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{person.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{person.position || person.tagline}</p></div><ArrowUpRight size={17} className="shrink-0 text-indigo-600"/></Link>)}{data && !matches.length && <div className="rounded-2xl bg-indigo-50 p-5"><p className="text-sm leading-7 text-indigo-950">{ar?'لا توجد مقترحات حالياً. ابحث في المجتمع عن خبرة تكمل خبرتك.':'No suggestions yet. Explore the community to find experience that complements yours.'}</p><Link href="/dashboard/directory" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-indigo-700 underline">{ar?'تصفح المجتمع':'Browse the community'}</Link></div>}</div></section>
      <ScorecardWidget key={`${locale}-${updated?.getTime()}`} initialScorecard={score} locale={locale}/>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className={panel} aria-labelledby="dashboard-schedule">
        <div className="flex items-center gap-3"><CalendarDays className="text-indigo-600" size={21}/><h2 id="dashboard-schedule" className="text-xl font-bold">{ar?'في جدولك القادم':'Coming up'}</h2></div>
        <p className="mt-2 text-xs text-slate-500">{ar?'الأوقات بتوقيت الرياض':'Times shown in Riyadh time'}</p>
        <div className="mt-5 divide-y divide-slate-100">
          {appointments.map(item=><article key={`appointment-${item.id}`} className="py-4"><p className="text-sm font-semibold">{item.type || (ar?'موعد':'Appointment')}</p><time dateTime={item.scheduled_at} className="mt-1 block text-sm text-slate-500">{date(item.scheduled_at)}</time></article>)}
          {schedule.mine.map(event=>{const status=rsvpStatus(event.rsvp_status,locale);return <Link key={`rsvp-${event.id}`} href={`/events/${event.slug}`} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 py-4 hover:text-indigo-600"><span className="min-w-0"><span className="block text-sm font-bold">{event.title}</span><time dateTime={event.starts_at} className="mt-1 block text-sm text-slate-500">{date(event.starts_at)}</time></span><StatusBadge {...status}/></Link>})}
          {data && !appointments.length && !schedule.mine.length && <p className="py-4 text-sm leading-7 text-slate-500">{ar?'لست مسجلاً في أي فعالية قادمة، ولا توجد لديك مواعيد.':'You are not registered for any upcoming event and have no appointments.'}</p>}
        </div>
        {schedule.suggested.length > 0 && <div className="mt-4 border-t border-slate-100 pt-4"><h3 className="text-sm font-bold text-slate-700">{ar?'فعاليات قادمة في المجتمع':'Upcoming community events'}</h3><ul className="mt-2 divide-y divide-slate-100">{schedule.suggested.map(event=><li key={`event-${event.id}`}><Link href={`/events/${event.slug}`} className="block py-3 hover:text-indigo-600"><span className="block text-sm font-semibold">{event.title}</span><time dateTime={event.starts_at} className="mt-1 block text-sm text-slate-500">{date(event.starts_at)}</time></Link></li>)}</ul></div>}
        <Link href="/dashboard/events" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-indigo-600">{ar?'كل الفعاليات':'All events'}<ArrowUpRight size={17}/></Link>
      </section>
      <section className={panel} aria-labelledby="dashboard-programs">
        <h2 id="dashboard-programs" className="text-xl font-bold">{ar?'البرامج':'Programs'}</h2>
        {programs.mine.length > 0 && <div className="mt-5"><h3 className="text-sm font-bold text-slate-700">{ar?'طلباتك':'Your applications'}</h3><ul className="mt-3 space-y-3">{programs.mine.map(application=>{const status=applicationStatus(application.status,locale);return <li key={`application-${application.id}`}><Link href={applicationHref(application.program.slug)} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 rounded-2xl border border-slate-200 p-4 hover:border-indigo-400"><span className="min-w-0 font-bold text-slate-900">{application.program.name}</span><StatusBadge {...status}/></Link></li>})}</ul></div>}
        <div className="mt-5">{programs.mine.length > 0 && programs.suggested.length > 0 && <h3 className="text-sm font-bold text-slate-700">{ar?'مقترحة لشركتك':'Suggested for your company'}</h3>}<div className="mt-3 space-y-3">{programs.suggested.map(program=><Link key={program.id} href={`/programs/${program.slug}`} className="block rounded-2xl border border-slate-200 p-4 font-bold text-slate-900 hover:border-indigo-400">{program.name}</Link>)}</div>{data && !programs.suggested.length && !programs.mine.length && <p className="text-sm leading-7 text-slate-500">{ar?'لا توجد برامج مفتوحة تناسب مرحلة شركتك الآن. يمكنك تصفح كل البرامج.':'No open programs match your company stage right now. You can browse all programs.'}</p>}</div>
        <Link href="/dashboard/programs" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-indigo-600">{ar?'كل البرامج':'All programs'}<ArrowUpRight size={17}/></Link>
      </section>
    </div>
    {updated && <p className="text-xs text-slate-500">{ar?'آخر تحديث: ':'Last refreshed: '}{date(updated.toISOString())}</p>}
  </div>
}
