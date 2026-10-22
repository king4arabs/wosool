/** Public NewsItemResource wire format; shared by OpenAPI and backend contract tests. */
const text = { type: 'string' }
const nullableText = { type: ['string', 'null'] }
const timestamp = { type: ['string', 'null'], format: 'date-time' }
const strings = { type: 'array', items: text }
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const object = (properties: Record<string, object>, required = Object.keys(properties), additionalProperties = false) => ({ type: 'object', properties, required, additionalProperties })

export const publicNewsSchemas = {
  NewsStringCollection: {
    description: 'Normally a list. Legacy/admin associative PHP arrays may serialize as string-valued objects; consumers should tolerate both.',
    anyOf: [strings, { type: 'object', additionalProperties: text }],
  },
  NewsTranslation: {
    type: 'object',
    description: 'Optional localized editorial content; the API returns this map without replacing the top-level fields. Additional editorial translation fields may exist.',
    properties: { title: text, excerpt: text, category: text, body: strings, keyFacts: strings },
    additionalProperties: true,
  },
  NewsItem: object({
    id: { type: 'integer' },
    title: text,
    slug: text,
    excerpt: nullableText,
    content: { ...nullableText, description: 'Original editorial content; feed discoveries can have no body. This is not a license to copy the publisher article.' },
    category: text,
    image_url: { ...nullableText, description: 'Image location when available; no reuse rights are implied.' },
    source_url: { ...nullableText, description: 'Publisher/source URL; manual editorial stories may have no external source.' },
    source_name: nullableText,
    image_credit: nullableText,
    companies: strings,
    region: { type: ['string', 'null'], enum: ['saudi', 'gcc', 'mena', 'global', null] },
    key_facts: ref('NewsStringCollection'),
    translations: {
      description: 'Locale-keyed translations. An empty legacy PHP array serializes as []; absent translations serialize as {}.',
      anyOf: [{ type: 'object', additionalProperties: ref('NewsTranslation') }, { type: 'array', maxItems: 0 }],
    },
    author_name: nullableText,
    is_featured: { type: 'boolean' },
    is_public: { type: 'boolean', const: true },
    status: { type: 'string', const: 'published' },
    tags: ref('NewsStringCollection'),
    published_at: { ...timestamp, description: 'May be null for undated published stories. Future-dated stories are excluded from public reads.' },
    created_at: timestamp,
    updated_at: timestamp,
  }),
  PaginationLink: object({ url: nullableText, label: text, active: { type: 'boolean' }, page: { type: ['integer', 'null'] } }, ['url', 'label', 'active'], true),
  PaginationLinks: object({ first: text, last: text, prev: nullableText, next: nullableText }, undefined, true),
  NewsPaginationMeta: object({
    current_page: { type: 'integer', minimum: 1 },
    from: { type: ['integer', 'null'], minimum: 1 },
    last_page: { type: 'integer', minimum: 1 },
    links: { type: 'array', items: ref('PaginationLink') },
    path: text,
    per_page: { type: 'integer', minimum: 1, maximum: 50 },
    to: { type: ['integer', 'null'], minimum: 1 },
    total: { type: 'integer', minimum: 0 },
  }, undefined, true),
  NewsCollection: object({ data: { type: 'array', items: ref('NewsItem') }, links: ref('PaginationLinks'), meta: ref('NewsPaginationMeta') }, undefined, true),
  NewsDetail: object({ data: ref('NewsItem') }, undefined, true),
  PublicApiError: object({ message: text }, undefined, true),
  PublicValidationError: object({ message: text, errors: { type: 'object', additionalProperties: strings } }, undefined, true),
}
