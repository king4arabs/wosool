import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

// Set native pool limits before Next/SWC loads, including in child build workers.
// These apply only to the build process; next start keeps its normal environment.
const result = spawnSync(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'build', '--webpack', ...process.argv.slice(2)],
  {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
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
