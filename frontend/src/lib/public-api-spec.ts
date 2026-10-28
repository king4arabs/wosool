import { publicNewsSchemas } from './public-news-schemas'
import { publicFounderSchemas } from './public-founder-schemas'
import { publicCompanySchemas } from './public-company-schemas'
import { publicStartupSchemas } from './public-startup-schemas'

/** Read-only contract, derived from backend/routes/api.php and its public controllers. */
const json = (schema: object) => ({ "application/json": { schema } })
const query = (name: string, schema: object, description: string) => ({ name, in: "query", required: false, description, schema })
const string = { type: "string" }
const record = { type: "object", additionalProperties: true }
const pagination = { type: "object", required: ["current_page", "last_page", "total"], properties: { current_page: { type: "integer" }, last_page: { type: "integer" }, total: { type: "integer" } }, additionalProperties: true }
const collection = { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: record }, meta: pagination, links: record } }
const errors = { "422": { description: "Invalid query parameters", content: json({ type: "object", properties: { message: string, errors: record } }) }, "429": { description: "Rate limit exceeded; respect Retry-After when returned." } }
const slug = { name: "slug", in: "path", required: true, schema: string, description: "Public record slug returned by the corresponding list endpoint." }
const list = (operationId: string, summary: string, description: string, parameters: object[]) => ({ get: { operationId, summary, description, parameters, responses: { "200": { description: "Paginated public records. Nullable fields may be absent; clients must tolerate additional fields.", content: json(collection) }, ...errors } } })
const page = query("page", { type: "integer", minimum: 1, default: 1 }, "Page number")
const schemaRef = (name: keyof typeof publicNewsSchemas | keyof typeof publicFounderSchemas | keyof typeof publicCompanySchemas | keyof typeof publicStartupSchemas) => ({ $ref: `#/components/schemas/${name}` })
const newsErrors = {
  '422': { description: 'Invalid company aliases or region', content: json(schemaRef('PublicValidationError')) },
  '429': { description: 'Rate limit exceeded; respect Retry-After when returned. Intermediary response bodies are not covered by the Laravel JSON schema.' },
}
const newsList = (...args: Parameters<typeof list>) => ({ get: {
  ...list(...args).get,
  responses: {
    '200': { description: 'Paginated published public stories, including nullable editorial fields and translations', content: json(schemaRef('NewsCollection')) },
    ...newsErrors,
  },
} })
const founderList = (...args: Parameters<typeof list>) => ({ get: {
  ...list(...args).get,
  responses: {
    '200': { description: 'Anonymous public profiles with private account and scorecard fields redacted', content: json(schemaRef('FounderCollection')) },
    '422': { description: 'Invalid country, region or search parameters', content: json(schemaRef('PublicValidationError')) },
    '429': newsErrors['429'],
  },
} })
const companyList = (...args: Parameters<typeof list>) => ({ get: {
  ...list(...args).get,
  responses: {
    '200': { description: 'Anonymous active public companies with active public founder relationships', content: json(schemaRef('CompanyCollection')) },
    '429': newsErrors['429'],
  },
} })
const startupList = (...args: Parameters<typeof list>) => ({ get: {
  ...list(...args).get,
  responses: {
    '200': { description: 'Published records that pass the active-website and earned-revenue evidence gates, with bilingual sector facets', content: json(schemaRef('StartupCollection')) },
    '422': { description: 'Invalid query parameters', content: json(schemaRef('PublicValidationError')) },
    '429': newsErrors['429'],
  },
} })

export const publicApiSpec = {
  openapi: "3.1.0",
  info: { title: "Wosool public read API", version: "1.6.0", description: "Read-only discovery contract for anonymous requests without credentials. News, founder, standalone company and revenue-qualified startup-directory fields are tested against Laravel responses. Public founder details redact member account identifiers, legal identities, social contacts, private matching fields and all scorecards. Founder relationships expose only active public profiles. No API key is required. Authenticated member/admin variants use Sanctum sessions, CSRF and server-side authorization and are outside this specification." },
  servers: [{ url: "/", description: "Same-origin Laravel proxy" }],
  security: [],
  components: { schemas: { ...publicNewsSchemas, ...publicFounderSchemas, ...publicCompanySchemas, ...publicStartupSchemas } },
  paths: {
    "/api/health": { get: { operationId: "getHealth", summary: "Service liveness", responses: { "200": { description: "Process responds; does not prove database readiness", content: json({ type: "object", required: ["status", "version", "timestamp"], properties: { status: { const: "healthy" }, version: string, timestamp: { type: "string", format: "date-time" } } }) } } } },
    "/api/ready": { get: { operationId: "getReadiness", summary: "Database and migration readiness", responses: { "200": { description: "Required checks passed", content: json({ type: "object", properties: { status: { const: "ready" } } }) }, "503": { description: "Database, schema or program setup unavailable", content: json({ type: "object", properties: { status: { const: "unavailable" } } }) } } } },
    "/api/v1/founders": founderList("listFounders", "Discover public founders", "Anonymous active, public profiles. Editorial profiles do not establish community membership. Country and region filters run before pagination; country falls back to the primary company. The optional engagement indicator measures activation and recent approved participation, independently of private operating scorecards. per_page is clamped to 1–24.", [page, query("per_page", { type: "integer", minimum: 1, maximum: 24, default: 12 }, "Page size"), ...["sector", "stage", "search"].map(name => query(name, string, "Optional filter")), query("country", { type: "string", minLength: 2, maxLength: 2 }, "ISO country code"), query("region", { type: "string", enum: ["saudi", "gcc", "mena", "other"] }, "Region"), query("facets", { type: "boolean" }, "Include full-directory sector and stage options"), query("community", { type: "boolean" }, "Limit to claimed/member profiles"), query("featured", { type: "boolean" }, "Only featured profiles")]),
    "/api/v1/founders/{slug}": { get: { operationId: 'getFounder', summary: 'Read a public founder profile', parameters: [slug], responses: {
      '200': { description: 'Anonymous active public founder with currently public company relationships', content: json(schemaRef('FounderDetail')) },
      '404': { description: 'Missing, private, inactive or deleted profile', content: json(schemaRef('PublicApiError')) },
      '429': newsErrors['429'],
    } } },
    "/api/v1/companies": companyList("listCompanies", "Discover public companies", "Anonymous active, public companies. founders_count and founders include only active public profiles. per_page is clamped to 1–24. Malformed query handling is not yet a validated 422 contract.", [page, query("per_page", { type: "integer", minimum: 1, maximum: 24, default: 12 }, "Page size"), ...["sector", "stage", "search"].map(name => query(name, string, "Optional filter")), ...["hiring", "fundraising", "collaborating", "featured"].map(name => query(name, { type: "boolean" }, "Only matching public companies"))]),
    "/api/v1/companies/{slug}": { get: { operationId: 'getCompany', summary: 'Read a public company profile', parameters: [slug], responses: {
      '200': { description: 'Anonymous active public company with active public founder relationships', content: json(schemaRef('CompanyDetail')) },
      '404': { description: 'Missing, private, inactive or deleted company', content: json(schemaRef('PublicApiError')) },
      '429': newsErrors['429'],
    } } },
    "/api/v1/news": newsList("listNews", "Read published news", "Only published, public stories with a null publication date or a date not in the future. Company matching uses exact company names or tags. per_page is clamped to 1–50.", [page, query("per_page", { type: "integer", minimum: 1, maximum: 50, default: 10 }, "Page size"), query("search", string, "Title, excerpt or publisher search"), query("category", string, "Exact category value"), query("region", { type: "string", enum: ["saudi", "gcc", "mena", "global"] }, "Region"), query("company", { type: "string", maxLength: 255 }, "One company alias"), query("companies", { type: "string", maxLength: 2559 }, "Comma-separated aliases; at most 10 combined with company; each at most 255 characters"), query("featured", { type: "boolean" }, "Only featured stories")]),
    "/api/v1/news/{slug}": { get: { operationId: 'getNews', summary: 'Read a published news story', parameters: [slug], responses: {
      '200': { description: 'Published public story; optional content and source fields can be null', content: json(schemaRef('NewsDetail')) },
      '404': { description: 'Missing, private, draft, archived, deleted or future-dated story', content: json(schemaRef('PublicApiError')) },
      '429': newsErrors['429'],
    } } },
    "/api/v1/startup-directory": startupList("listStartups", "Discover revenue-evidenced startups", "Published records with active websites and reported/financial-statement revenue evidence. Unlike the founder directory, this collection requires revenue evidence. reported identifies an attributed company/program/investor figure; financial_statement identifies a statement source without promising an audit opinion. Program participation does not imply approval, partnership or membership. Pagination meta includes sector options. Invalid filters return 422.", [page, query("per_page", { type: "integer", minimum: 1, maximum: 100, default: 24 }, "Page size"), query("region", { type: "string", enum: ["Saudi Arabia", "GCC", "MENA", "Global"] }, "Region; values differ from the news API"), query("business_type", { type: "string", enum: ["technology", "traditional"] }, "Primary offering"), query("search", { type: "string", maxLength: 120 }, "Literal text search"), query("sector", { type: "string", maxLength: 100 }, "English sector name"), query("source", { type: "string", maxLength: 40 }, "Source registry key")]),
  },
}
