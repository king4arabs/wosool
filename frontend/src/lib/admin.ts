"use client"

import type { User } from "@/types"

export interface AdminStats {
  total_members: number
  unclaimed_founders?: number
  pending_founder_invitations?: number
  active_founders: number
  companies: number
  events_this_month: number
  pending_applications: number
  published_news: number
  open_programs: number
}

export interface AdminDashboardResponse {
  operations?: AdminOperations
  stats: AdminStats
  application_pipeline?: Record<string, number>
  recent_applications: AdminApplication[]
  activity: AdminActivity[]
}

export interface AdminActivity {
  id: number
  action: string
  entity_type: string
  entity_id: number
  notes?: string | null
  admin_name?: string | null
  created_at?: string | null
}

export interface AdminApplication {
  onboarding_data?: { position: string; bio: string; company_description: string; country_code: string; founded_year: number; team_size: number; avatar_url?: string; logo_url?: string } | null
  id: number
  full_name: string
  email: string
  phone?: string | null
  company_name?: string | null
  company_website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  motivation?: string | null
  what_you_offer?: string | null
  what_you_need?: string | null
  linkedin_url?: string | null
  referral_source?: string | null
  referrer_name?: string | null
  status: "submitted" | "reviewing" | "approved" | "rejected" | "waitlisted" | "request_more_info"
  admin_notes?: string | null
  reviewed_at?: string | null
  reviewer?: { id: number; name: string } | null
  invite_token?: string | null
  invite_url?: string | null
  invite_sent_at?: string | null
  created_at: string
}

export interface AdminCompany {
  id: number
  name: string
  slug: string
  description?: string | null
  website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  country_code?: string | null
  founded_year?: number | null
  team_size?: number | null
  is_hiring: boolean
  is_fundraising: boolean
  is_collaborating: boolean
  is_featured: boolean
  is_public: boolean
  status: string
  founders_count?: number
  founders?: Array<{ id: number; user?: { name?: string | null } | null }>
  created_at?: string
  updated_at?: string
}

export interface AdminEvent {
  id: number
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  full_description?: string | null
  starts_at: string
  ends_at?: string | null
  registration_deadline?: string | null
  timezone?: string | null
  location: string
  venue_name?: string | null
  city?: string | null
  country?: string | null
  google_maps_url?: string | null
  type: string
  category?: string | null
  format: "virtual" | "in-person"
  mode?: "in-person" | "online" | "hybrid"
  virtual_link?: string | null
  online_meeting_url?: string | null
  image_url?: string | null
  cover_image_url?: string | null
  gallery_images?: string[] | null
  max_attendees?: number | null
  capacity_limit?: number | null
  is_public: boolean
  visibility?: "public" | "members_only" | "founder_only" | "invite_only" | "circle_only"
  requires_rsvp: boolean
  rsvp_required?: boolean
  waitlist_enabled?: boolean
  allow_public_registration?: boolean
  allow_guest_registration?: boolean
  requires_approval?: boolean
  auto_approve_trusted_members?: boolean
  organizer_type?: "wosool" | "founder" | "partner" | "sponsor" | "external_ecosystem"
  organizer_name?: string | null
  organizer_reference_id?: number | null
  status: "draft" | "upcoming" | "live" | "completed" | "cancelled" | "pending_approval" | "hidden"
  status_flow?: "draft" | "pending_review" | "published" | "registration_closed" | "live_now" | "completed" | "cancelled" | "archived"
  targeting_rules?: Record<string, unknown> | null
  invites?: Record<string, unknown> | null
  featured_attendees?: Array<Record<string, unknown>> | null
  sponsor_partner_blocks?: Array<Record<string, unknown>> | null
  ai_settings?: Record<string, unknown> | null
  rsvp_settings?: Record<string, unknown> | null
  agenda?: Array<Record<string, unknown>> | null
  speakers?: Array<Record<string, unknown>> | null
  resources?: Array<Record<string, unknown>> | null
  tags?: string[] | null
  rsvp_count?: number
  created_at?: string
}

export interface AdminProgram {
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
  applications_count?: number
  cohorts_count?: number
  participants_count?: number
  sessions_count?: number
  created_at?: string
}

export interface AdminNewsItem {
  id: number
  title: string
  slug: string
  excerpt: string
  content?: string | null
  category: string
  image_url?: string | null
  author_name: string
  is_featured: boolean
  is_public: boolean
  status: "draft" | "published" | "archived"
  tags?: string[] | null
  published_at?: string | null
  created_at?: string
  source_url?: string | null
  source_name?: string | null
  image_credit?: string | null
  companies?: string[] | null
  region?: "saudi" | "gcc" | "mena" | "global" | null
  key_facts?: string[] | null
}

export interface AdminCollectionResponse<T> {
  data: T[]
  meta: Record<string, number>
  links?: {
    next?: string | null
    prev?: string | null
  }
}

export interface AdminFounder {
  id: number
  slug: string
  name?: string | null
  tagline?: string | null
  location?: string | null
  sector?: string | null
  stage?: string | null
  status: string
  is_verified: boolean
  is_featured: boolean
  created_at?: string | null
  companies?: Array<{ id: number; name: string }>
  scorecard?: { overall_score: number | null } | null
}

export interface AdminPartner {
  id: number
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  type: string
  status: string
  sector?: string | null
  contact_name?: string | null
  contact_email?: string | null
  is_public: boolean
  display_order: number
}

export interface AdminSponsor {
  id: number
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website?: string | null
  tier: string
  is_active: boolean
  contact_name?: string | null
  contact_email?: string | null
  contract_start?: string | null
  contract_end?: string | null
  display_order: number
}

export interface AdminSettingsResponse {
  general: {
    site_name: string
    site_url: string
    site_description: string
    timezone: string
    default_language: string
    maintenance_mode: boolean
    registration_open: boolean
  }
  email: {
    from_name: string
    from_email: string
    reply_to?: string | null
    smtp_host?: string | null
    notifications: Record<string, boolean>
  }
  security: {
    require_2fa: boolean
    session_timeout_minutes: number
    password_policy: string
    api_rate_limit: number
  }
}

export interface NewsletterStatus {
  transport_configured: boolean; active: number; pending: number; unsubscribed: number
  sent_30_days: number; failed: number; unresolved: number; scheduler_recent: boolean; next_issue_at: string
  last_run: { started_at: string; finished_at: string | null; status: string; sent?: number; failed?: number } | null
}
export interface AdminOperations {
  newsletter?: NewsletterStatus
  open_messages: number; crm_due: number; pr_due: number; crm_open: number; pr_open: number; public_members: number; upcoming_events: number
  follow_ups: Array<{ id: number; kind: 'crm' | 'pr'; name: string; organization?: string | null; priority: string; follow_up_on: string; owner?: { name: string } | null }>
}
export interface AdminAnalyticsResponse {
  data: {
    kpis: Record<string, number>
    monthly_signups: Array<{ month: string; value: number }>
    sector_distribution: Array<{ sector: string; count: number }>
    recent_activity: Array<{ metric: string; value: number }>
    period: { days: number; start: string; end: string; timezone: string }
    comparison: { current: Record<string, number | null>; previous: Record<string, number | null> }
    trend: Array<{ date: string; signups: number; applications: number }>
    operations: AdminOperations
  }
}

export function isAdminUser(user: User | null): boolean {
  if (!user) return false
  return Boolean(user.roles?.includes("admin") || user.roleToken === "admin" || user.isAdmin)
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-US", options ?? {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function toCsvLines(value?: string[] | null): string {
  return value?.join(", ") ?? ""
}

export function fromCsvLines(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
