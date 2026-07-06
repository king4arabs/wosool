export type EntrepreneurGender = "male" | "female"

export type StartupStage =
  | "Idea"
  | "Prototype"
  | "MVP"
  | "Pre-Seed"
  | "Seed"
  | "Series A"
  | "Growth"

export type EntrepreneurSector =
  | "AI"
  | "FinTech"
  | "HealthTech"
  | "EdTech"
  | "ClimateTech"
  | "Logistics"
  | "Robotics"
  | "Cybersecurity"
  | "PropTech"
  | "AgriTech"
  | "TourismTech"
  | "GovTech"
  | "RetailTech"
  | "MediaTech"
  | "SpaceTech"
  | "Smart Cities"
  | "Geospatial Intelligence"
  | "Blockchain Infrastructure"
  | "Digital Identity"
  | "Creator Economy"

export type EntrepreneurRegion =
  | "GCC"
  | "Arab World"
  | "Europe"
  | "Asia-Pacific"
  | "South Asia"
  | "Americas"
  | "Africa"

export interface EntrepreneurAvatarConfig {
  type: "cartoon"
  style: "professional-founder"
  gender: EntrepreneurGender
}

export interface Entrepreneur {
  id: string
  firstName: string
  familyName: string
  fullName: string
  gender: EntrepreneurGender
  country: string
  city: string
  region: EntrepreneurRegion
  sector: EntrepreneurSector
  startupName: string
  startupStage: StartupStage
  businessModel: string
  description: string
  shortBio: string
  problemSolved: string
  solution: string
  targetCustomers: string[]
  traction: string
  fundingNeed: string
  tags: string[]
  avatar: EntrepreneurAvatarConfig
}

export interface EntrepreneurFilters {
  search?: string
  country?: string
  region?: string
  sector?: string
  gender?: EntrepreneurGender
  startupStage?: string
}

export const STARTUP_STAGES: StartupStage[] = [
  "Idea",
  "Prototype",
  "MVP",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Growth",
]

export const ENTREPRENEUR_SECTORS: EntrepreneurSector[] = [
  "AI",
  "FinTech",
  "HealthTech",
  "EdTech",
  "ClimateTech",
  "Logistics",
  "Robotics",
  "Cybersecurity",
  "PropTech",
  "AgriTech",
  "TourismTech",
  "GovTech",
  "RetailTech",
  "MediaTech",
  "SpaceTech",
  "Smart Cities",
  "Geospatial Intelligence",
  "Blockchain Infrastructure",
  "Digital Identity",
  "Creator Economy",
]

export const ENTREPRENEUR_REGIONS: EntrepreneurRegion[] = [
  "GCC",
  "Arab World",
  "Europe",
  "Asia-Pacific",
  "South Asia",
  "Americas",
  "Africa",
]

/** Countries permitted to appear in the entrepreneur directory. */
export const ALLOWED_COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Egypt",
  "Morocco",
  "Jordan",
  "Pakistan",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Brazil",
  "Mexico",
  "South Africa",
] as const
