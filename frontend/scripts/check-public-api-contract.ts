import { readFileSync } from 'node:fs'
import { validatePublicResponse } from './lib/public-contract'

// Test-only bridge: Laravel passes actual JSON responses on stdin. No network or DB access.
try {
  const samples: { path: string; status: number; body: unknown }[] = JSON.parse(readFileSync(0, 'utf8'))
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('Expected a non-empty array of response samples')
  for (const sample of samples) {
    const result = validatePublicResponse(sample.path, sample.status, sample.body)
    if (!result.valid) throw new Error(`GET ${sample.path} ${sample.status}: ${JSON.stringify(result.errors)}`)
  }
  console.log(`${samples.length} public API response contracts passed`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
