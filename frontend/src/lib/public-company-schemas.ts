import { publicFounderSchemas } from './public-founder-schemas'

/** Anonymous CompanyController responses, not member/admin resource variants. */
const text = { type: 'string' }
const nullableText = { type: ['string', 'null'] }
const integer = { type: 'integer' }
const boolean = { type: 'boolean' }
const timestamp = { type: ['string', 'null'], format: 'date-time' }
const day = { type: ['string', 'null'], format: 'date' }
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const nullableRef = (name: string) => ({ anyOf: [ref(name), { type: 'null' }] })
const object = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties).filter(key => key !== 'community_engagement_score'), additionalProperties: false })

const companyFounderProperties = {
  id: integer,
  position: nullableText,
  slug: text,
  display_name: nullableText,
  legal_name: text,
  skills_tags: { type: 'array', items: text, maxItems: 0 },
  skills: { type: 'array', items: text, maxItems: 0 },
  tagline: nullableText,
  bio: nullableText,
  location: nullableText,
  country_code: nullableText,
  sector: nullableText,
  stage: nullableText,
  linkedin_url: { type: 'null' },
  twitter_url: { type: 'null' },
  website_url: nullableText,
  needs: { type: 'array', items: text, maxItems: 0 },
  offers: { type: 'array', items: text, maxItems: 0 },
  is_verified: boolean,
  is_featured: boolean,
  is_public: { type: 'boolean', const: true },
  status: { type: 'string', const: 'active' },
  avatar_url: nullableText,
  name: nullableText,
  activation_status: { type: 'string', enum: ['active', 'unclaimed'] },
  can_communicate: boolean,
  community_engagement_score: publicFounderSchemas.PublicFounder.properties.community_engagement_score,
  source_urls: ref('FounderStringCollection'),
  source_reviewed_at: day,
  claimed_at: { type: 'null' },
  user: { type: 'null' },
  primary_company_name: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
}

const companyProperties = {
  id: integer,
  source_urls: ref('FounderStringCollection'),
  source_reviewed_at: day,
  name: text,
  slug: text,
  description: nullableText,
  logo_url: nullableText,
  website: nullableText,
  sector: nullableText,
  stage: nullableText,
  location: nullableText,
  country_code: nullableText,
  founded_year: publicFounderSchemas.FounderCompany.properties.founded_year,
  traction: nullableRef('FounderCompanyTraction'),
  team_size: { type: ['integer', 'null'] },
  is_hiring: boolean,
  is_fundraising: boolean,
  is_collaborating: boolean,
  is_featured: boolean,
  is_public: { type: 'boolean', const: true },
  status: { type: 'string', const: 'active' },
  founders: { type: 'array', items: ref('PublicCompanyFounder') },
  created_at: timestamp,
  updated_at: timestamp,
}

export const publicCompanySchemas = {
  PublicCompanyFounder: {
    ...object(companyFounderProperties),
    description: 'Active public founder relationship. Company and scorecard relationships are not loaded in this representation; anonymous account email remains null.',
  },
  PublicCompany: {
    ...object(companyProperties),
    description: 'Standalone public company detail. Publication does not establish Wosool membership, partnership, audit or revenue qualification.',
  },
  PublicCompanyListItem: {
    ...object({ ...companyProperties, founders_count: integer }),
    description: 'Standalone public company list item. founders_count counts only active public founders and matches the visibility boundary of founders.',
  },
  CompanyPaginationMeta: publicFounderSchemas.FounderPaginationMeta,
  CompanyCollection: {
    ...object({ data: { type: 'array', items: ref('PublicCompanyListItem') }, links: ref('PaginationLinks'), meta: ref('CompanyPaginationMeta') }),
    additionalProperties: true,
  },
  CompanyDetail: { ...object({ data: ref('PublicCompany') }), additionalProperties: true },
}
