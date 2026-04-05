export interface Founder {
  id: string
  name: string
  slug: string
  tagline: string
  bio: string
  location: string
  sector: string
  stage: string
  avatarUrl: string
  linkedinUrl?: string
  twitterUrl?: string
  companyName: string
  joinedAt: string
  score: number
  needs: string[]
  offers: string[]
  isVerified: boolean
  isFeatured: boolean
  status?: "active" | "pending" | "rejected" | "suspended"
  skills?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Company {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  sector: string
  stage: string
  location: string
  foundedYear: number
  teamSize: string
  website?: string
  isHiring: boolean
  isFundraising: boolean
  isCollaborating: boolean
  founderIds: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  date: string
  endDate?: string
  location: string
  type: string
  isVirtual: boolean
  registrationUrl?: string
  maxAttendees?: number
  currentAttendees?: number
  imageUrl?: string
  isPublic: boolean
  tags: string[]
  createdAt?: string
}

export interface Program {
  id: string
  name: string
  slug: string
  description: string
  category: string
  duration: string
  targetStage: string[]
  applicationDeadline?: string
  cohortSize?: number
  benefits: string[]
  isOpen: boolean
  createdAt?: string
}

export interface Partner {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  website?: string
  type: string
  status: "Confirmed" | "Prospective" | "Ecosystem-Aligned" | "Past Collaborator"
  sector: string
}

export interface Sponsor {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  website?: string
  tier: "Platinum" | "Gold" | "Silver" | "Bronze" | "Community"
  isActive: boolean
}

export interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  imageUrl?: string
  publishedAt: string
  author: string
  tags: string[]
}

export interface User {
  id: string
  email: string
  name: string
  role: "member" | "admin" | "moderator"
  avatarUrl?: string
  founderId?: string
  companyId?: string
  emailVerifiedAt?: string
  createdAt?: string
}

/** Application form submission */
export interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  companyName: string
  sector: string
  stage: string
  motivation: string
  status: "submitted" | "reviewing" | "approved" | "rejected" | "waitlisted"
  referenceId: string
  submittedAt: string
}

/** Contact form submission */
export interface ContactMessage {
  name: string
  email: string
  company?: string
  category: "general" | "partnerships" | "sponsorship" | "founder-support" | "media" | "office-hours"
  subject: string
  message: string
}

/** Founder match */
export interface Match {
  id: string
  founderId: string
  matchedFounderId: string
  score: number
  reason: string
  status: "suggested" | "accepted" | "declined" | "connected"
  createdAt: string
}

/** Introduction between founders */
export interface Intro {
  id: string
  requesterId: string
  targetId: string
  facilitatorId?: string
  message: string
  status: "requested" | "pending" | "completed" | "declined"
  createdAt: string
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

/** API success response */
export interface ApiResponse<T> {
  data: T
  message?: string
}
