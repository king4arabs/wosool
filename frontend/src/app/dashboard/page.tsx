import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import IntroRouterLedger from "@/components/dashboard/IntroRouterLedger"
import ScorecardWidget from "@/components/dashboard/ScorecardWidget"
import { env } from "@/lib/env"
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

async function apiFetch<T>(path: string): Promise<ApiEnvelope<T> | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const response = await fetch(`${env.apiUrl}/api/v1${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  if (response.status === 401) {
    redirect("/login")
  }

  if (!response.ok) {
    return null
  }

  return response.json() as Promise<ApiEnvelope<T>>
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
  const [profileRes, companiesRes, scorecardRes, introsRes] = await Promise.all([
    apiFetch<unknown>("/member/founder-profile"),
    apiFetch<unknown>("/member/companies"),
    apiFetch<unknown>("/member/scorecard"),
    apiFetch<unknown>("/member/introductions"),
  ])

  const founderProfile: FounderProfile | null = parseFounderProfile(profileRes?.data && typeof profileRes.data === "object" ? (profileRes.data as { data?: unknown }).data ?? profileRes.data : null)

  const companiesRaw = companiesRes?.data
  const companyListData = Array.isArray(companiesRaw)
    ? companiesRaw
    : Array.isArray((companiesRaw as { data?: unknown[] } | undefined)?.data)
      ? (companiesRaw as { data: unknown[] }).data
      : []

  const companies: CompanyProfile[] = companyListData
    .map(parseCompanyProfile)
    .filter((x): x is CompanyProfile => x !== null)

  const scorecardRaw = scorecardRes?.data && typeof scorecardRes.data === "object"
    ? (scorecardRes.data as { data?: unknown }).data ?? scorecardRes.data
    : null
  const scorecard: Scorecard | null = parseScorecard(scorecardRaw)

  const introsData = introsRes?.data as { inbound?: unknown; outbound?: unknown } | undefined
  const inbound = parseIntroCollection(introsData?.inbound)
  const outbound = parseIntroCollection(introsData?.outbound)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1E293B] bg-[#121826] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Wosool</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Founder Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          {founderProfile
            ? `Welcome back, ${founderProfile.legal_name}. Your workspace is synced with live backend signals.`
            : "Your member workspace is connected. Complete your founder profile to unlock full routing."}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#121826] p-4">
          <p className="text-xs text-slate-400">Vetted Status</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{founderProfile?.vetted_status ? "Vetted" : "Pending Vetting"}</p>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#121826] p-4">
          <p className="text-xs text-slate-400">Linked Companies</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{companies.length}</p>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#121826] p-4">
          <p className="text-xs text-slate-400">Active Intros</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{[...inbound, ...outbound].filter((x) => x.routing_status === "INTRO_PENDING").length}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ScorecardWidget initialScorecard={scorecard} />
        <IntroRouterLedger initialInbound={inbound} initialOutbound={outbound} />
      </section>
    </div>
  )
}
