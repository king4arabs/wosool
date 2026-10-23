import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

export const frontendDirectory = fileURLToPath(new URL('..', import.meta.url))

export function loadBuildEnvironment(directory = frontendDirectory) {
  // Resolve the loader shipped with our pinned Next version, including pnpm's
  // isolated dependency layout. Use Next's own .env precedence and expansion.
  const require = createRequire(import.meta.url)
  const nextRequire = createRequire(require.resolve('next/package.json'))
  const { loadEnvConfig } = nextRequire('@next/env')
  process.env.NODE_ENV = 'production'
  loadEnvConfig(directory, false, {
    info() {},
    error() { throw new Error('Unable to load the frontend environment files') },
  })
}
