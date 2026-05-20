import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import IntroRouterLedger from "@/components/dashboard/IntroRouterLedger"
import ScorecardWidget from "@/components/dashboard/ScorecardWidget"
import { dashboardDictionary, resolveDashboardLocale } from "@/lib/dashboard-i18n"
import {
  parseCompanyProfile,
  parseFounderProfile,
  parseIntroductionRequest,
  parseScorecard,
  type CompanyProfile,
  type FounderProfile,
  type IntroductionRequest,
  type Scorecard,
} from "@/types/platform"

interface ApiEnvelope<T> {
  data?: T
  message?: string
}

interface ApiFetchResult<T> {
  ok: boolean
  status: number
  data: ApiEnvelope<T> | null
  message: string | null
}

interface AuthUser {
  id: number
  role_token?: string | null
  is_admin?: boolean
  roles?: string[]
}

interface MemberDashboardData {
  profile_completion?: number
  company_completion?: number
  founder_score_summary?: {
    aggregate_score?: number | null
    momentum_score?: number | null
    growth_score?: number | null
    readiness_score?: number | null
    support_delta?: number | null
  }
  recommended_matches?: Array<{ id: number; match_score?: number; status?: string }>
  intro_requests?: { pending_count?: number; inbound_count?: number; outbound_count?: number }
  upcoming_appointments?: Array<{ id: number; scheduled_at?: string; type?: string; status?: string; meeting_link?: string | null }>
  upcoming_events?: Array<{ id: number; title?: string; starts_at?: string; slug?: string }>
  recommended_programs?: Array<{ id: number; name?: string; slug?: string; category?: string }>
  latest_community_updates?: Array<{ id: number; title?: string; slug?: string; published_at?: string }>
  ai_assistant_panel?: { title?: string; description?: string; quick_prompts?: string[] }
}

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

async function apiFetch<T>(path: string): Promise<ApiFetchResult<T>> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const locale = cookieStore.get("wosool-locale")?.value || headerStore.get("x-locale") || "ar"
  const cookieHeader = cookieStore.toString()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") ?? "http"

  if (!host) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: "Missing host header.",
    }
  }

  let response: Response

  try {
    // Use same-origin API route so Next rewrites/proxy rules stay in one place.
    // Add a hard timeout to avoid hanging dashboard rendering.
    response = await fetch(`${protocol}://${host}/api/v1${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Locale": locale,
        Cookie: cookieHeader,
      },
      cache: "no-store",
      signal: timeoutSignal(8000),
    })
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      message: "Request timed out or failed to reach backend.",
    }
  }

  if (response.status === 401) {
    redirect("/login")
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: payload,
      message: payload?.message ?? `Request failed (${response.status})`,
    }
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
    message: null,
  }
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const locale = cookieStore.get("wosool-locale")?.value || headerStore.get("x-locale") || "ar"
  const cookieHeader = cookieStore.toString()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") ?? "http"

  if (!host) return null

  try {
    const response = await fetch(`${protocol}://${host}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Locale": locale,
        Cookie: cookieHeader,
      },
      cache: "no-store",
      signal: timeoutSignal(5000),
    })

    if (!response.ok) return null
    const payload = (await response.json().catch(() => null)) as { user?: AuthUser } | null
    return payload?.user ?? null
  } catch {
    return null
  }
}

function parseIntroCollection(input: unknown): IntroductionRequest[] {
  if (Array.isArray(input)) {
    return input.map(parseIntroductionRequest).filter((x): x is IntroductionRequest => x !== null)
  }

  if (typeof input === "object" && input !== null && Array.isArray((input as { data?: unknown }).data)) {
    return ((input as { data: unknown[] }).data)
      .map(parseIntroductionRequest)
      .filter((x): x is IntroductionRequest => x !== null)
  }

  return []
}

export default async function DashboardPage() {
  const currentUser = await fetchCurrentUser()
  const isAdmin = Boolean(
    currentUser?.is_admin ||
    currentUser?.role_token === "admin" ||
    currentUser?.roles?.includes("admin")
  )

  if (isAdmin) {
    redirect("/admin")
  }

  const cookieStore = await cookies()
  const locale = cookieStore.get("wosool-locale")?.value ?? "ar"
  const localeKey = resolveDashboardLocale(locale)
  const copy = dashboardDictionary[localeKey]

  const [profileSettled, companiesSettled, scorecardSettled, introsSettled, memberDashboardSettled] = await Promise.allSettled([
    apiFetch<unknown>("/member/founder-profile"),
    apiFetch<unknown>("/member/companies"),
    apiFetch<unknown>("/member/scorecard"),
    apiFetch<unknown>("/member/introductions"),
    apiFetch<MemberDashboardData>("/member/dashboard"),
  ])

  const profileRes = profileSettled.status === "fulfilled" ? profileSettled.value : null
  const companiesRes = companiesSettled.status === "fulfilled" ? companiesSettled.value : null
  const scorecardRes = scorecardSettled.status === "fulfilled" ? scorecardSettled.value : null
  const introsRes = introsSettled.status === "fulfilled" ? introsSettled.value : null
  const memberDashboardRes = memberDashboardSettled.status === "fulfilled" ? memberDashboardSettled.value : null

  const founderProfile: FounderProfile | null = parseFounderProfile(
    profileRes?.data?.data && typeof profileRes.data.data === "object"
      ? (profileRes.data.data as { data?: unknown }).data ?? profileRes.data.data
      : null
  )

  const companiesRaw = companiesRes?.data?.data
  const companyListData = Array.isArray(companiesRaw)
    ? companiesRaw
    : Array.isArray((companiesRaw as { data?: unknown[] } | undefined)?.data)
      ? (companiesRaw as { data: unknown[] }).data
      : []

  const companies: CompanyProfile[] = companyListData
    .map(parseCompanyProfile)
    .filter((x): x is CompanyProfile => x !== null)

  const scorecardRaw = scorecardRes?.data?.data && typeof scorecardRes.data.data === "object"
    ? (scorecardRes.data.data as { data?: unknown }).data ?? scorecardRes.data.data
    : null
  const scorecard: Scorecard | null = parseScorecard(scorecardRaw)

  const introsData = introsRes?.data?.data as { inbound?: unknown; outbound?: unknown } | undefined
  const inbound = parseIntroCollection(introsData?.inbound)
  const outbound = parseIntroCollection(introsData?.outbound)

  const activeIntros = [...inbound, ...outbound].filter((x) => x.routing_status === "INTRO_PENDING").length
  const founderProfileMissing = profileRes?.status === 404
  const dashboardData = (memberDashboardRes?.data?.data ?? {}) as MemberDashboardData
  const loadWarnings = [profileRes, companiesRes, scorecardRes, introsRes, memberDashboardRes]
    .filter((res) => res && !res.ok && res.message)
    .map((res) => res!.message as string)

  return (
    <div className="space-y-6">
      {loadWarnings.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">{copy.home.loadWarnTitle}</p>
          <p className="mt-1">{loadWarnings[0]}</p>
        </section>
      ) : null}

      {/* Welcome banner */}
      <section
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6"
        style={{ boxShadow: "0 2px 12px -2px rgba(59,82,212,0.06)" }}
      >
        <div className="pointer-events-none absolute top-0 right-0 w-[300px] h-[150px] rounded-full bg-[#3B52D4]/5 blur-[80px]" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#3B52D4] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
              Wosool
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {founderProfile ? copy.home.welcome.replace("{name}", founderProfile.legal_name) : copy.home.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-lg">
              {founderProfile || !founderProfileMissing
                ? copy.home.workspaceSynced
                : copy.home.workspaceNeedsProfile}
            </p>
          </div>
        </div>
      </section>

      {founderProfileMissing ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
          <h2 className="text-base font-bold">{copy.home.profileRequired}</h2>
          <p className="mt-1 text-sm">
            {copy.home.profileRequiredBody}
          </p>
          <a
            href="/dashboard/profile"
            className="mt-3 inline-flex rounded-lg bg-[#3B52D4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E44C8]"
          >
            {copy.home.profileCta}
          </a>
        </section>
      ) : null}

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: copy.home.vettedStatus,
            value: founderProfile?.vetted_status ? copy.home.vetted : copy.home.pendingVetting,
            dot: founderProfile?.vetted_status ? "#22c55e" : "#f59e0b",
          },
          { label: copy.home.linkedCompanies, value: String(companies.length), dot: "#3B52D4" },
          { label: copy.home.activeIntros,  value: String(activeIntros),       dot: "#8b5cf6" },
        ].map(({ label, value, dot }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center gap-4"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.05)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="mt-0.5 text-lg font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ScorecardWidget initialScorecard={scorecard} locale={localeKey} />
        <IntroRouterLedger initialInbound={inbound} initialOutbound={outbound} locale={localeKey} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{copy.home.profileCompletion}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{dashboardData.profile_completion ?? 0}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{copy.home.companyCompletion}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{dashboardData.company_completion ?? 0}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{copy.home.founderScoreSummary}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{dashboardData.founder_score_summary?.aggregate_score ?? "-"}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.recommendedMatches}</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {(dashboardData.recommended_matches ?? []).slice(0, 3).map((match) => (
              <p key={match.id}>#{match.id} • {match.match_score ?? 0} • {match.status ?? copy.home.pending}</p>
            ))}
            {(dashboardData.recommended_matches ?? []).length === 0 ? <p>{copy.home.noData}</p> : null}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.introRequests}</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-slate-500">{copy.home.pending}</p><p className="font-bold text-slate-900">{dashboardData.intro_requests?.pending_count ?? 0}</p></div>
            <div><p className="text-slate-500">{copy.home.inbound}</p><p className="font-bold text-slate-900">{dashboardData.intro_requests?.inbound_count ?? 0}</p></div>
            <div><p className="text-slate-500">{copy.home.outbound}</p><p className="font-bold text-slate-900">{dashboardData.intro_requests?.outbound_count ?? 0}</p></div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.upcomingAppointments}</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {(dashboardData.upcoming_appointments ?? []).slice(0, 3).map((appointment) => (
              <p key={appointment.id}>
                {appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : "-"} • {appointment.type ?? "-"}
              </p>
            ))}
            {(dashboardData.upcoming_appointments ?? []).length === 0 ? <p>{copy.home.noData}</p> : null}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.upcomingEvents}</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {(dashboardData.upcoming_events ?? []).slice(0, 3).map((event) => (
              <a key={event.id} className="block hover:text-[#3B52D4]" href={`/events/${event.slug ?? ""}`}>
                {event.title ?? `#${event.id}`}
              </a>
            ))}
            {(dashboardData.upcoming_events ?? []).length === 0 ? <p>{copy.home.noData}</p> : null}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.recommendedPrograms}</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {(dashboardData.recommended_programs ?? []).slice(0, 3).map((program) => (
              <a key={program.id} className="block hover:text-[#3B52D4]" href={`/programs/${program.slug ?? ""}`}>
                {program.name ?? `#${program.id}`}
              </a>
            ))}
            {(dashboardData.recommended_programs ?? []).length === 0 ? <p>{copy.home.noData}</p> : null}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">{copy.home.latestCommunityUpdates}</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {(dashboardData.latest_community_updates ?? []).slice(0, 3).map((item) => (
              <a key={item.id} className="block hover:text-[#3B52D4]" href={`/news/${item.slug ?? ""}`}>
                {item.title ?? `#${item.id}`}
              </a>
            ))}
            {(dashboardData.latest_community_updates ?? []).length === 0 ? <p>{copy.home.noData}</p> : null}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">{copy.home.aiAssistant}</h2>
        <p className="mt-2 text-sm text-slate-600">{dashboardData.ai_assistant_panel?.description ?? copy.home.noData}</p>
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{copy.home.quickPrompts}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(dashboardData.ai_assistant_panel?.quick_prompts ?? []).map((prompt) => (
              <span key={prompt} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{prompt}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
