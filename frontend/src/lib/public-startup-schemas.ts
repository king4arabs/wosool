/** Revenue-qualified StartupDirectoryController wire format. */
const text = { type: 'string' }
const nonEmptyText = { type: 'string', minLength: 1 }
const day = { type: 'string', format: 'date' }
const httpsUrl = { type: 'string', format: 'uri', pattern: '^https://' }
const publicAssetUrl = { type: ['string', 'null'], pattern: '^(https://|/startup-directory/)' }
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const object = (properties: Record<string, object>, required = Object.keys(properties), additionalProperties = false) => ({ type: 'object', properties, required, additionalProperties })

const startupProperties = {
  id: text,
  slug: text,
  company_name_en: text,
  company_name_ar: text,
  country_en: text,
  country_ar: text,
  country_code: { type: 'string', pattern: '^[A-Z]{2}$' },
  region: { type: 'string', enum: ['Saudi Arabia', 'GCC', 'MENA', 'Global'] },
  sector_en: text,
  sector_ar: text,
  founder_name_en: text,
  founder_name_ar: text,
  role_en: text,
  role_ar: text,
  company_brief_en: text,
  company_brief_ar: text,
  founder_brief_en: text,
  founder_brief_ar: text,
  website: httpsUrl,
  source_url: httpsUrl,
  logo_url: publicAssetUrl,
  portrait_url: publicAssetUrl,
  company_socials: { type: 'array', items: ref('StartupSocialLink') },
  founder_socials: { type: 'array', items: ref('StartupSocialLink') },
  reviewed_at: day,
  review_due_at: day,
  sources: { type: 'array', minItems: 1, items: httpsUrl },
  asset_sources: { type: 'array', items: ref('StartupAssetSource') },
  business_type: { type: 'string', enum: ['technology', 'traditional'] },
  focus_area_en: text,
  focus_area_ar: text,
  website_status: { type: 'string', const: 'active' },
  website_verified_at: day,
  website_verification_method: text,
  ecosystem_sources: { type: 'array', items: ref('StartupEcosystemSource') },
  revenue_status: { type: 'string', enum: ['reported', 'financial_statement'] },
  revenue_evidence: ref('StartupRevenueEvidence'),
  review_due: { type: 'boolean' },
  logo_tone: { type: 'string', enum: ['dark'] },
  review_note: text,
}

const requiredStartupFields = Object.keys(startupProperties).filter((field) => !['logo_tone', 'review_note'].includes(field))

export const publicStartupSchemas = {
  StartupSocialLink: object({ label: text, url: httpsUrl }),
  StartupAssetSource: object({ kind: text, url: httpsUrl, page: httpsUrl }),
  StartupEcosystemSource: object({
    key: { type: 'string', enum: ['misk', 'code', 'monshaat', 'multiverse', 'impact46', 'falak', 'lamarka', 'the-garage', 'leap', 'gitex'] },
    label: text,
    label_ar: text,
    url: httpsUrl,
    relationship_en: text,
    relationship_ar: text,
  }),
  StartupRevenueEvidence: {
    ...object({ source_url: httpsUrl, period: nonEmptyText, period_ar: nonEmptyText, summary_en: nonEmptyText, summary_ar: nonEmptyText, reviewed_at: day }),
    description: 'Published earned-revenue or ARR evidence with its exact reporting period. reported is company/program/investor-reported; financial_statement identifies a statement source but does not itself promise an audit opinion.',
  },
  PublicStartup: {
    ...object(startupProperties, requiredStartupFields),
    description: 'Published startup-directory record that passed the active-website and revenue-evidence gates. Program participation does not imply approval, investment, partnership or Wosool membership.',
  },
  StartupSector: object({ en: text, ar: text }),
  StartupPaginationMeta: object({
    current_page: { type: 'integer', minimum: 1 },
    last_page: { type: 'integer', minimum: 1 },
    total: { type: 'integer', minimum: 0 },
    sectors: { type: 'array', items: ref('StartupSector') },
  }),
  StartupCollection: object({ data: { type: 'array', items: ref('PublicStartup') }, meta: ref('StartupPaginationMeta') }),
}
