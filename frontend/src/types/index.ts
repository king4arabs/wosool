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
  imageUrl?: string
  isPublic: boolean
  tags: string[]
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
  tier: "Platinum" | "Gold" | "Silver"
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

export interface BoardMember {
  id: string
  name: string
  image: string
  brief: string
  companyName: string
  linkedinUrl: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "member" | "admin" | "moderator"
  avatarUrl?: string
  founderId?: string
  companyId?: string
}
