import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { publicApiSpec } from '../../src/lib/public-api-spec'

const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
type Schema = Record<string, unknown>
type Response = { content?: { 'application/json'?: { schema?: Schema } } }
const paths = publicApiSpec.paths as unknown as Record<string, { get: { responses: Record<string, Response> } }>

/** Relocate OAS component references into JSON Schema $defs; never fetch external refs. */
function relocate(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(relocate)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      if (key === '$ref') {
        if (typeof child !== 'string' || !child.startsWith('#/components/schemas/')) throw new Error('Only local component references are supported')
        return [key, child.replace('#/components/schemas/', '#/$defs/')]
      }
      return [key, relocate(child)]
    }))
  }
  return value
}

const validators = new Map<string, ReturnType<typeof ajv.compile>>()
export function validatePublicResponse(path: string, status: number, body: unknown) {
  const schema = paths[path]?.get.responses[String(status)]?.content?.['application/json']?.schema
  if (!schema) throw new Error(`No JSON response schema for GET ${path} ${status}`)
  const key = `${path}:${status}`
  let validate = validators.get(key)
  if (!validate) {
    validate = ajv.compile({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      ...relocate(schema) as Schema,
      $defs: relocate(publicApiSpec.components.schemas),
    })
    validators.set(key, validate)
  }
  const valid = validate(body)
  return { valid, errors: validate.errors ?? [] }
}
