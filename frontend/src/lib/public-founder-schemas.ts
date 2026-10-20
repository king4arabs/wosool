import { publicNewsSchemas } from './public-news-schemas'

/** Anonymous FounderController responses, not member/admin resource variants. */
const text = { type: 'string' }
const nullableText = { type: ['string', 'null'] }
const integer = { type: 'integer' }
const boolean = { type: 'boolean' }
const timestamp = { type: ['string', 'null'], format: 'date-time' }
const day = { type: ['string', 'null'], format: 'date' }
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const nullableRef = (name: string) => ({ anyOf: [ref(name), { type: 'null' }] })
const object = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false })
const strings = { type: 'array', items: text }
const direction = { type: 'string', enum: ['up', 'down', 'flat'] }

export const publicFounderSchemas = {
  FounderStringCollection: {
    description: 'String lists can be associative PHP arrays in existing profiles; clients must tolerate string-valued objects too.',
    anyOf: [strings, { type: 'object', additionalProperties: text }],
  },
  FounderPublicUser: object({
    id: integer,
    name: nullableText,
    email: { type: 'null', description: 'Anonymous responses never expose the account email. Admin/session variants are outside this contract.' },
  }),
  FounderCompanyTraction: object({
    text,
    source_url: text,
    reviewed_at: nullableText,
  }),
  FounderCompany: {
    ...object({
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
      founded_year: {
        description: 'Uncast database YEAR value: production can serialize four-digit strings while SQLite returns integers. Clients must accept both without assuming coercion.',
        anyOf: [{ type: ['integer', 'null'] }, { type: 'string', pattern: '^[0-9]{4}$' }],
      },
      traction: nullableRef('FounderCompanyTraction'),
      team_size: { type: ['integer', 'null'] },
      is_hiring: boolean,
      is_fundraising: boolean,
      is_collaborating: boolean,
      is_featured: boolean,
      is_public: { type: 'boolean', const: true },
      status: { type: 'string', const: 'active' },
      pivot: object({ role: nullableText, is_primary: boolean }),
      created_at: timestamp,
      updated_at: timestamp,
    }),
    description: 'Company relationship as returned inside a founder. Separate company endpoints may load different relationships. Traction does not establish earned revenue or Wosool membership.',
  },
  FounderScorecard: {
    ...object({
      id: integer,
      founder_profile_id: integer,
      aggregate_score: integer,
      momentum_score: integer,
      fundraising_score: integer,
      growth_score: integer,
      support_need_score: integer,
      latest_update_text: nullableText,
      tracking: object({ momentum: integer, growth: integer, readiness: integer, support_delta: integer }),
      trends: object({ score_direction: direction, momentum_direction: direction, growth_direction: direction, readiness_direction: direction, support_delta_direction: direction }),
      insights: object({
        dynamic_alerts: { type: 'array', items: object({ level: { type: 'string', enum: ['critical', 'warning', 'info'] }, code: text, message: text }) },
        automated_action_suggestions: { type: 'array', items: object({ key: text, label: text, priority: { type: 'string', enum: ['normal', 'medium', 'high'] } }) },
      }),
      historical_logs: {
        description: 'Existing resource passes legacy JSON log entries through unchanged. Their internal fields are not a stable typed contract; this schema does not certify their contents or confidentiality.',
        anyOf: [{ type: 'array', items: {} }, { type: 'object', additionalProperties: true }],
      },
      created_at: timestamp,
      updated_at: timestamp,
    }),
    description: 'Existing serialized scorecard, when present. Scores are not financial verification, audit results, program admission or membership certification.',
  },
  PublicFounder: object({
    id: integer,
    position: nullableText,
    slug: text,
    display_name: nullableText,
    legal_name: text,
    skills_tags: ref('FounderStringCollection'),
    skills: ref('FounderStringCollection'),
    tagline: nullableText,
    bio: nullableText,
    location: nullableText,
    country_code: nullableText,
    sector: nullableText,
    stage: nullableText,
    linkedin_url: nullableText,
    twitter_url: nullableText,
    website_url: nullableText,
    needs: ref('FounderStringCollection'),
    offers: ref('FounderStringCollection'),
    is_verified: boolean,
    is_featured: boolean,
    is_public: { type: 'boolean', const: true },
    status: { type: 'string', const: 'active' },
    avatar_url: nullableText,
    name: nullableText,
    activation_status: { type: 'string', enum: ['active', 'unclaimed'], description: 'Account activation state; an editorial profile alone is not a claimed account or member.' },
    can_communicate: boolean,
    source_urls: ref('FounderStringCollection'),
    source_reviewed_at: day,
    claimed_at: timestamp,
    user: nullableRef('FounderPublicUser'),
    primary_company_name: { ...nullableText, description: 'Existing serializer uses the primary company base name; it may differ from the localized company name.' },
    companies: { type: 'array', items: ref('FounderCompany') },
    scorecard: nullableRef('FounderScorecard'),
    created_at: timestamp,
    updated_at: timestamp,
  }),
  FounderPaginationMeta: {
    ...publicNewsSchemas.NewsPaginationMeta,
    properties: { ...publicNewsSchemas.NewsPaginationMeta.properties, per_page: { type: 'integer', minimum: 1, maximum: 100 } },
  },
  FounderCollection: { ...object({ data: { type: 'array', items: ref('PublicFounder') }, links: ref('PaginationLinks'), meta: ref('FounderPaginationMeta') }), additionalProperties: true },
  FounderDetail: { ...object({ data: ref('PublicFounder') }), additionalProperties: true },
}
