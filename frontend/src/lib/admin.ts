"use client"

import type { User } from "@/types"

export interface AdminStats {
  total_members: number
  active_founders: number
  companies: number
  events_this_month: number
  pending_applications: number
  published_news: number
  open_programs: number
}

export interface AdminDashboardResponse {
  stats: AdminStats
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
  status: "submitted" | "reviewing" | "approved" | "rejected" | "waitlisted"
  admin_notes?: string | null
  reviewed_at?: string | null
  reviewer?: { id: number; name: string } | null
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
  starts_at: string
  ends_at?: string | null
  location: string
  type: string
  format: "virtual" | "in-person"
  virtual_link?: string | null
  image_url?: string | null
  max_attendees?: number | null
  is_public: boolean
  requires_rsvp: boolean
  status: "draft" | "upcoming" | "live" | "completed" | "cancelled"
  tags?: string[] | null
  rsvp_count?: number
  created_at?: string
}

export interface AdminProgram {
  id: number
  name: string
  slug: string
  description?: string | null
  category: string
  duration?: string | null
  target_stages?: string[] | null
  cohort_size?: number | null
  benefits?: string[] | null
  is_open: boolean
  application_deadline?: string | null
  applications_count?: number
  cohorts_count?: number
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
}

export interface AdminCollectionResponse<T> {
  data: T[]
  meta: Record<string, number>
}

export function isAdminUser(user: User | null): boolean {
  return Boolean(user?.roles?.includes("admin"))
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
