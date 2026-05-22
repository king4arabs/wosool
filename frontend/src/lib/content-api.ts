import type {
  Company,
  Event,
  Founder,
  NewsItem,
  PaginatedResponse,
  Partner,
  Program,
  Sponsor,
} from "@/types"

export interface ApiUser {
  id: number
  name: string
  email?: string | null
}

export interface ApiScorecardMetric {
  id: number
  metric_key: string
  metric_label: string
  value: number
  max_value: number
  explanation?: string | null
}

export interface ApiScorecard {
  id: number
  overall_score: number
  profile_completeness?: number
  community_engagement?: number
  execution_track_record?: number
  network_strength?: number
  knowledge_contribution?: number
  ai_summary?: string | null
  improvement_suggestions?: string[] | null
  metrics?: ApiScorecardMetric[] | null
  calculated_at?: string | null
}

export interface ApiCompany {
  id: number
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  founded_year?: number | null
  team_size?: number | null
  is_hiring: boolean
  is_fundraising: boolean
  is_collaborating: boolean
  is_featured?: boolean
  is_public?: boolean
  status?: string
  founders_count?: number
}

export interface ApiFounder {
  id: number
  slug: string
  name?: string | null
  tagline?: string | null
  bio?: string | null
  location?: string | null
  sector?: string | null
  stage?: string | null
  avatar_url?: string | null
  needs?: string[] | null
  offers?: string[] | null
  is_verified: boolean
  is_featured: boolean
  user?: ApiUser | null
  companies?: ApiCompany[] | null
  scorecard?: ApiScorecard | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ApiEvent {
  id: number
  title: string
  slug: string
  description?: string | null
  starts_at: string
  ends_at?: string | null
  location?: string | null
  type?: string | null
  format?: string | null
  max_attendees?: number | null
  is_public: boolean
  status?: string | null
  tags?: string[] | null
}

export interface ApiProgram {
  id: number
  name: string
  title?: string | null
  slug: string
  description?: string | null
  short_description?: string | null
  full_description?: string | null
  program_type?: string | null
  category: string
  duration?: string | null
  format?: string | null
  language?: string | null
  city_region?: string | null
  target_stages?: string[] | null
  cohort_size?: number | null
  capacity?: number | null
  benefits?: string[] | null
  tags?: string[] | null
  is_open: boolean
  visibility?: string | null
  status_flow?: string | null
  objective?: string | null
  who_it_is_for?: string | null
  expected_outcomes?: string | null
  application_deadline?: string | null
  starts_at?: string | null
  ends_at?: string | null
}

export interface ApiPartner {
  id: number
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  type: string
  status: string
  sector?: string | null
}

export interface ApiSponsor {
  id: number
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  tier: string
  is_active: boolean
  contract_start?: string | null
  contract_end?: string | null
}

export interface ApiNewsItem {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  category: string
  image_url?: string | null
  author_name?: string | null
  tags?: string[] | null
  published_at?: string | null
}

export interface WrappedResponse<T> {
  data: T
}

export function mapFounder(founder: ApiFounder): Founder {
  return {
    id: String(founder.id),
    name: founder.name ?? founder.user?.name ?? founder.slug,
    slug: founder.slug,
    tagline: founder.tagline ?? "",
    bio: founder.bio ?? "",
    location: founder.location ?? "",
    sector: founder.sector ?? "",
    stage: founder.stage ?? "",
    avatarUrl: founder.avatar_url ?? "",
    companyName: founder.companies?.[0]?.name ?? "",
    joinedAt: founder.created_at ?? "",
    score: founder.scorecard?.overall_score ?? 0,
    needs: founder.needs ?? [],
    offers: founder.offers ?? [],
    isVerified: founder.is_verified,
    isFeatured: founder.is_featured,
    createdAt: founder.created_at ?? undefined,
    updatedAt: founder.updated_at ?? undefined,
  }
}

export function mapCompany(company: ApiCompany): Company {
  return {
    id: String(company.id),
    name: company.name,
    slug: company.slug,
    description: company.description ?? "",
    logoUrl: company.logo_url ?? "",
    sector: company.sector ?? "",
    stage: company.stage ?? "",
    location: company.location ?? "",
    foundedYear: company.founded_year ?? 0,
    teamSize: company.team_size ? String(company.team_size) : "—",
    website: company.website ?? undefined,
    isHiring: company.is_hiring,
    isFundraising: company.is_fundraising,
    isCollaborating: company.is_collaborating,
    founderIds: [],
    createdAt: undefined,
    updatedAt: undefined,
  }
}

export function mapEvent(event: ApiEvent): Event {
  return {
    id: String(event.id),
    title: event.title,
    slug: event.slug,
    description: event.description ?? "",
    date: event.starts_at,
    endDate: event.ends_at ?? undefined,
    location: event.location ?? "",
    type: event.type ?? "",
    isVirtual: event.format === "virtual",
    maxAttendees: event.max_attendees ?? undefined,
    isPublic: event.is_public,
    tags: event.tags ?? [],
    createdAt: undefined,
  }
}

export function mapProgram(program: ApiProgram): Program {
  return {
    id: String(program.id),
    name: program.title || program.name,
    slug: program.slug,
    description: program.short_description ?? program.description ?? "",
    category: program.category,
    duration: program.duration ?? "",
    targetStage: program.target_stages ?? [],
    applicationDeadline: program.application_deadline ?? undefined,
    cohortSize: program.cohort_size ?? undefined,
    benefits: program.benefits ?? [],
    isOpen: program.is_open,
    createdAt: undefined,
  }
}

const partnerStatusMap: Record<string, Partner["status"]> = {
  confirmed: "Confirmed",
  prospective: "Prospective",
  "ecosystem-aligned": "Ecosystem-Aligned",
  "past-collaborator": "Past Collaborator",
}

export function mapPartner(partner: ApiPartner): Partner {
  return {
    id: String(partner.id),
    name: partner.name,
    slug: partner.slug,
    description: partner.description ?? "",
    logoUrl: partner.logo_url ?? "",
    website: partner.website ?? undefined,
    type: partner.type,
    status: partnerStatusMap[partner.status] ?? "Prospective",
    sector: partner.sector ?? "",
  }
}

const sponsorTierMap: Record<string, Sponsor["tier"]> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  community: "Community",
}

export function mapSponsor(sponsor: ApiSponsor): Sponsor {
  return {
    id: String(sponsor.id),
    name: sponsor.name,
    slug: sponsor.slug,
    description: sponsor.description ?? "",
    logoUrl: sponsor.logo_url ?? "",
    website: sponsor.website ?? undefined,
    tier: sponsorTierMap[sponsor.tier] ?? "Community",
    isActive: sponsor.is_active,
  }
}

export function mapNewsItem(item: ApiNewsItem): NewsItem {
  return {
    id: String(item.id),
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? "",
    content: item.content ?? "",
    category: item.category,
    imageUrl: item.image_url ?? undefined,
    publishedAt: item.published_at ?? new Date().toISOString(),
    author: item.author_name ?? "Wosool Team",
    tags: item.tags ?? [],
  }
}

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: init?.cache ?? "no-store",
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as {
      message?: string
      errors?: Record<string, string[]>
    } | null

    const firstFieldError = errorPayload?.errors
      ? Object.values(errorPayload.errors).flat()[0]
      : null

    throw new Error(
      firstFieldError || errorPayload?.message || `Request failed: ${response.status}`
    )
  }

  return response.json()
}

export function getCollectionItems<T>(response: PaginatedResponse<T> | WrappedResponse<T[]>): T[] {
  return Array.isArray((response as WrappedResponse<T[]>).data)
    ? (response as WrappedResponse<T[]>).data
    : (response as PaginatedResponse<T>).data
}
