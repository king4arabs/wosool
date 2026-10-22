/**
 * Entrepreneur seed data validation.
 *
 * Run with: npm run validate:entrepreneurs (from frontend/)
 * or:       npm run validate:entrepreneurs (from repo root)
 *
 * Fails the process with a non-zero exit code if any rule is violated.
 */
import { entrepreneurs } from "../src/data/entrepreneurs"
import {
  ALLOWED_COUNTRIES,
  ENTREPRENEUR_REGIONS,
  ENTREPRENEUR_SECTORS,
  STARTUP_STAGES,
  type Entrepreneur,
} from "../src/types/entrepreneur"

const BANNED_TERMS = [
  "iran",
  "israel",
  "turkey",
  "tehran",
  "tel aviv",
  "jerusalem",
  "haifa",
  "istanbul",
  "ankara",
  "izmir",
  "tabriz",
  "shiraz",
  "isfahan",
]

const REQUIRED_STRING_FIELDS: Array<keyof Entrepreneur> = [
  "id",
  "firstName",
  "familyName",
  "fullName",
  "gender",
  "country",
  "city",
  "region",
  "sector",
  "startupName",
  "startupStage",
  "businessModel",
  "description",
  "shortBio",
  "problemSolved",
  "solution",
  "traction",
  "fundingNeed",
]

const errors: string[] = []

function fail(message: string) {
  errors.push(message)
}

function containsBannedTerm(value: string): string | null {
  const lowered = value.toLowerCase()
  for (const term of BANNED_TERMS) {
    // Word-boundary match so e.g. "Manama" doesn't accidentally match anything.
    const pattern = new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, "i")
    if (pattern.test(lowered)) return term
  }
  return null
}

const seenIds = new Set<string>()
const seenFullNames = new Set<string>()
const seenStartupNames = new Set<string>()
const allowedCountries = new Set<string>(ALLOWED_COUNTRIES)
const allowedStages = new Set<string>(STARTUP_STAGES)
const allowedSectors = new Set<string>(ENTREPRENEUR_SECTORS)
const allowedRegions = new Set<string>(ENTREPRENEUR_REGIONS)

for (const entrepreneur of entrepreneurs) {
  const label = `${entrepreneur.id} (${entrepreneur.fullName || "unnamed"})`

  // Required fields present and non-empty
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = entrepreneur[field]
    if (typeof value !== "string" || value.trim() === "") {
      fail(`${label}: missing or empty required field "${field}"`)
    }
  }

  // Duplicates
  if (seenIds.has(entrepreneur.id)) fail(`${label}: duplicate id`)
  seenIds.add(entrepreneur.id)

  const nameKey = entrepreneur.fullName.trim().toLowerCase()
  if (seenFullNames.has(nameKey)) fail(`${label}: duplicate full name`)
  seenFullNames.add(nameKey)

  const startupKey = entrepreneur.startupName.trim().toLowerCase()
  if (seenStartupNames.has(startupKey)) fail(`${label}: duplicate startup name "${entrepreneur.startupName}"`)
  seenStartupNames.add(startupKey)

  // Country and region constraints
  if (!allowedCountries.has(entrepreneur.country)) {
    fail(`${label}: country "${entrepreneur.country}" is not in the allowed list`)
  }
  if (!allowedRegions.has(entrepreneur.region)) {
    fail(`${label}: region "${entrepreneur.region}" is not valid`)
  }

  // Banned-country screening across every text surface of the profile
  const textSurfaces: string[] = [
    entrepreneur.country,
    entrepreneur.city,
    entrepreneur.fullName,
    entrepreneur.startupName,
    entrepreneur.description,
    entrepreneur.shortBio,
    entrepreneur.problemSolved,
    entrepreneur.solution,
    entrepreneur.traction,
    entrepreneur.fundingNeed,
    entrepreneur.businessModel,
    ...entrepreneur.tags,
    ...entrepreneur.targetCustomers,
  ]
  for (const surface of textSurfaces) {
    const hit = containsBannedTerm(surface)
    if (hit) fail(`${label}: banned term "${hit}" found in "${surface}"`)
  }

  // Gender constraints
  if (entrepreneur.gender !== "male" && entrepreneur.gender !== "female") {
    fail(`${label}: gender must be "male" or "female"`)
  }

  // Avatar config
  const avatar = entrepreneur.avatar
  if (!avatar) {
    fail(`${label}: avatar config missing`)
  } else {
    if (avatar.type !== "cartoon") fail(`${label}: avatar.type must be "cartoon"`)
    if (avatar.style !== "professional-founder") {
      fail(`${label}: avatar.style must be "professional-founder"`)
    }
    if (avatar.gender !== entrepreneur.gender) {
      fail(`${label}: avatar.gender must match entrepreneur.gender`)
    }
  }

  // Arrays
  if (!Array.isArray(entrepreneur.tags) || entrepreneur.tags.length < 3) {
    fail(`${label}: tags array must have at least 3 tags`)
  }
  if (!Array.isArray(entrepreneur.targetCustomers) || entrepreneur.targetCustomers.length === 0) {
    fail(`${label}: targetCustomers array must not be empty`)
  }

  // Enumerated values
  if (!allowedStages.has(entrepreneur.startupStage)) {
    fail(`${label}: startupStage "${entrepreneur.startupStage}" is not valid`)
  }
  if (!allowedSectors.has(entrepreneur.sector)) {
    fail(`${label}: sector "${entrepreneur.sector}" is not valid`)
  }
}

// Dataset-level distribution checks
if (entrepreneurs.length < 60) {
  fail(`dataset: expected at least 60 profiles, found ${entrepreneurs.length}`)
}

const saudiCount = entrepreneurs.filter((e) => e.country === "Saudi Arabia").length
if (saudiCount < 25) fail(`dataset: expected at least 25 Saudi profiles, found ${saudiCount}`)

const gccNonSaudi = entrepreneurs.filter(
  (e) => e.region === "GCC" && e.country !== "Saudi Arabia"
).length
if (gccNonSaudi < 15) fail(`dataset: expected at least 15 non-Saudi GCC profiles, found ${gccNonSaudi}`)

const arabNonGcc = entrepreneurs.filter((e) => e.region === "Arab World").length
if (arabNonGcc < 10) fail(`dataset: expected at least 10 Arab non-GCC profiles, found ${arabNonGcc}`)

const globalCount = entrepreneurs.filter(
  (e) => e.region !== "GCC" && e.region !== "Arab World"
).length
if (globalCount < 10) fail(`dataset: expected at least 10 global profiles, found ${globalCount}`)

// Report
if (errors.length > 0) {
  console.error(`✖ Entrepreneur data validation failed with ${errors.length} error(s):\n`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

const femaleCount = entrepreneurs.filter((e) => e.gender === "female").length
const countryCount = new Set(entrepreneurs.map((e) => e.country)).size
const sectorCount = new Set(entrepreneurs.map((e) => e.sector)).size

console.log("✔ Entrepreneur data validation passed")
console.log(`  Profiles:            ${entrepreneurs.length}`)
console.log(`  Saudi Arabia:        ${saudiCount}`)
console.log(`  GCC (non-Saudi):     ${gccNonSaudi}`)
console.log(`  Arab (non-GCC):      ${arabNonGcc}`)
console.log(`  Global:              ${globalCount}`)
console.log(`  Female / Male:       ${femaleCount} / ${entrepreneurs.length - femaleCount}`)
console.log(`  Countries covered:   ${countryCount}`)
console.log(`  Sectors covered:     ${sectorCount}`)
console.log("  Iran / Israel / Turkey references: none ✔")
