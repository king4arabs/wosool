export type IntroRoutingStatus = "INTRO_PENDING" | "INTRO_APPROVED" | "ROUTE_EXPIRED" | "DECLINED"

export interface FounderProfile {
  id: number
  user_id?: number
  legal_name: string
  title: string
  biography_summary?: string | null
  skills_tags: string[]
  vetted_status: boolean
  momentum_score: number
  profile_markdown?: string | null
  created_at?: string
  updated_at?: string
}

export interface CompanyProfile {
  id: number
  legal_name: string
  domain_url?: string | null
  operational_stage: "pre-seed" | "seed" | "series-a" | "series-b"
  sector: string
  hq_location: string
  tech_stack_tokens: string[]
  metrics_summary: Record<string, unknown>
  vector_embedding_payload?: string | number[] | null
  created_at?: string
  updated_at?: string
}

export interface Scorecard {
  id: number
  founder_profile_id: number
  aggregate_score: number
  tracking: {
    momentum: number
    growth: number
    readiness: number
    support_delta: number
  }
  trends?: {
    score_direction?: "up" | "down" | "flat"
    momentum_direction?: "up" | "down" | "flat"
    growth_direction?: "up" | "down" | "flat"
    readiness_direction?: "up" | "down" | "flat"
    support_delta_direction?: "up" | "down" | "flat"
  }
  insights?: {
    dynamic_alerts?: Array<{
      level: "critical" | "warning" | "info"
      code: string
      message: string
    }>
    automated_action_suggestions?: Array<{
      key: string
      label: string
      priority: "high" | "medium" | "normal"
    }>
  }
  historical_logs?: Array<Record<string, unknown>>
  created_at?: string
  updated_at?: string
}

export interface IntroductionRequest {
  id: number
  source_founder_id: number
  target_founder_id: number
  routing_status: IntroRoutingStatus
  payload_context_brief: string
  tracking_notes?: string | null
  expires_at?: string | null
  source_founder?: Pick<FounderProfile, "id" | "legal_name" | "title"> | null
  target_founder?: Pick<FounderProfile, "id" | "legal_name" | "title"> | null
  created_at?: string
  updated_at?: string
}

export interface DashboardAggregate {
  founderProfile: FounderProfile | null
  companies: CompanyProfile[]
  scorecard: Scorecard | null
  introInbound: IntroductionRequest[]
  introOutbound: IntroductionRequest[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

export function parseFounderProfile(input: unknown): FounderProfile | null {
  if (!isRecord(input)) return null

  return {
    id: toNumber(input.id),
    user_id: typeof input.user_id === "number" ? input.user_id : undefined,
    legal_name: toString(input.legal_name),
    title: toString(input.title),
    biography_summary: typeof input.biography_summary === "string" ? input.biography_summary : null,
    skills_tags: Array.isArray(input.skills_tags) ? input.skills_tags.map((x) => toString(x)).filter(Boolean) : [],
    vetted_status: Boolean(input.vetted_status),
    momentum_score: toNumber(input.momentum_score),
    profile_markdown: typeof input.profile_markdown === "string" ? input.profile_markdown : null,
    created_at: typeof input.created_at === "string" ? input.created_at : undefined,
    updated_at: typeof input.updated_at === "string" ? input.updated_at : undefined,
  }
}

export function parseCompanyProfile(input: unknown): CompanyProfile | null {
  if (!isRecord(input)) return null

  const stage = toString(input.operational_stage || input.stage)
  if (!["pre-seed", "seed", "series-a", "series-b"].includes(stage)) return null

  return {
    id: toNumber(input.id),
    legal_name: toString(input.legal_name || input.name),
    domain_url: typeof input.domain_url === "string" ? input.domain_url : (typeof input.website === "string" ? input.website : null),
    operational_stage: stage as CompanyProfile["operational_stage"],
    sector: toString(input.sector),
    hq_location: toString(input.hq_location || input.location),
    tech_stack_tokens: Array.isArray(input.tech_stack_tokens) ? input.tech_stack_tokens.map((x) => toString(x)).filter(Boolean) : [],
    metrics_summary: isRecord(input.metrics_summary) ? input.metrics_summary : {},
    vector_embedding_payload: (typeof input.vector_embedding_payload === "string" || Array.isArray(input.vector_embedding_payload)) ? (input.vector_embedding_payload as string | number[]) : null,
    created_at: typeof input.created_at === "string" ? input.created_at : undefined,
    updated_at: typeof input.updated_at === "string" ? input.updated_at : undefined,
  }
}

export function parseScorecard(input: unknown): Scorecard | null {
  if (!isRecord(input)) return null
  const tracking = isRecord(input.tracking) ? input.tracking : {}

  return {
    id: toNumber(input.id),
    founder_profile_id: toNumber(input.founder_profile_id),
    aggregate_score: toNumber(input.aggregate_score),
    tracking: {
      momentum: toNumber((tracking as Record<string, unknown>).momentum),
      growth: toNumber((tracking as Record<string, unknown>).growth),
      readiness: toNumber((tracking as Record<string, unknown>).readiness),
      support_delta: toNumber((tracking as Record<string, unknown>).support_delta),
    },
    trends: isRecord(input.trends) ? (input.trends as Scorecard["trends"]) : undefined,
    insights: isRecord(input.insights) ? (input.insights as Scorecard["insights"]) : undefined,
    historical_logs: Array.isArray(input.historical_logs) ? (input.historical_logs as Array<Record<string, unknown>>) : [],
    created_at: typeof input.created_at === "string" ? input.created_at : undefined,
    updated_at: typeof input.updated_at === "string" ? input.updated_at : undefined,
  }
}

export function parseIntroductionRequest(input: unknown): IntroductionRequest | null {
  if (!isRecord(input)) return null
  const status = toString(input.routing_status)
  if (!["INTRO_PENDING", "INTRO_APPROVED", "ROUTE_EXPIRED", "DECLINED"].includes(status)) return null

  const source = isRecord(input.source_founder) ? input.source_founder : null
  const target = isRecord(input.target_founder) ? input.target_founder : null

  return {
    id: toNumber(input.id),
    source_founder_id: toNumber(input.source_founder_id),
    target_founder_id: toNumber(input.target_founder_id),
    routing_status: status as IntroRoutingStatus,
    payload_context_brief: toString(input.payload_context_brief),
    tracking_notes: typeof input.tracking_notes === "string" ? input.tracking_notes : null,
    expires_at: typeof input.expires_at === "string" ? input.expires_at : null,
    source_founder: source
      ? {
          id: toNumber(source.id),
          legal_name: toString(source.legal_name),
          title: toString(source.title),
        }
      : null,
    target_founder: target
      ? {
          id: toNumber(target.id),
          legal_name: toString(target.legal_name),
          title: toString(target.title),
        }
      : null,
    created_at: typeof input.created_at === "string" ? input.created_at : undefined,
    updated_at: typeof input.updated_at === "string" ? input.updated_at : undefined,
  }
}
