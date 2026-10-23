import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { frontendDirectory, loadBuildEnvironment } from './load-build-env.mjs'
import { checkDeploymentEnvironment, checkLocalBuildEnvironment } from './hosting-preflight.mjs'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const local = args[0] === '--local'
if (local) args.shift()

try {
  loadBuildEnvironment()
  if (local) {
    checkLocalBuildEnvironment()
    console.log('Local preview build; do not publish this artifact')
  } else {
    checkDeploymentEnvironment()
    console.log('Frontend production/staging environment preflight passed')
  }
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

// Set native pool limits before Next/SWC loads, including in child build workers.
// These apply only to the build process; next start keeps its normal environment.
const result = spawnSync(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'build', '--webpack', ...args],
  {
    cwd: frontendDirectory,
    stdio: 'inherit',
    env: {
      ...process.env,
      TOKIO_WORKER_THREADS: '1',
      RAYON_NUM_THREADS: '1',
    },
  },
)

if (result.error) console.error(result.error.message)
if (result.signal) console.error(`Next.js build terminated by ${result.signal}`)
process.exit(result.status ?? 1)
