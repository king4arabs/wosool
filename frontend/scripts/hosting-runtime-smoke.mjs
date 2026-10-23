import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const port = Number.parseInt(process.env.HOSTING_SMOKE_PORT || '18082', 10)
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('HOSTING_SMOKE_PORT must be an integer between 1024 and 65535')
}

const origin = `http://127.0.0.1:${port}`
const packageManager = process.env.npm_execpath
if (!packageManager) throw new Error('Run this check through a package-manager script')
const argumentSeparator = (process.env.npm_config_user_agent || '').startsWith('npm/') ? ['--'] : []

const app = spawn(
  process.execPath,
  [packageManager, 'run', 'start', ...argumentSeparator, '--hostname', '127.0.0.1', '--port', String(port)],
  {
    cwd: process.cwd(),
    detached: process.platform !== 'win32',
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

let output = ''
for (const stream of [app.stdout, app.stderr]) {
  stream.on('data', (chunk) => {
    output = (output + chunk.toString()).slice(-8000)
  })
}

async function request(path, accept) {
  const response = await fetch(origin + path, {
    headers: { Accept: accept },
    signal: AbortSignal.timeout(5000),
  })
  if (response.status !== 200) throw new Error(`${path} returned HTTP ${response.status}`)
  return response
}

async function waitUntilReady() {
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    if (app.exitCode !== null) throw new Error(`Next.js exited with code ${app.exitCode}`)
    try {
      const response = await request('/health', 'application/json')
      const data = await response.json()
      if (data?.status === 'healthy' && data?.service === 'wosool-frontend') return
    } catch {}
    await delay(250)
  }
  throw new Error('Next.js did not become healthy within 60 seconds')
}

function signalApp(signal) {
  try {
    if (process.platform !== 'win32' && app.pid) return process.kill(-app.pid, signal)
    return app.kill(signal)
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error
    return false
  }
}

async function stop() {
  const exited = app.exitCode !== null
    ? Promise.resolve()
    : new Promise((resolve) => app.once('exit', resolve))
  signalApp('SIGTERM')
  await Promise.race([
    exited,
    delay(5000).then(() => signalApp('SIGKILL')),
  ])
}

try {
  await waitUntilReady()
  const homepage = await request('/', 'text/html')
  if (!/Wosool|وصول/i.test(await homepage.text())) throw new Error('/ did not contain Wosool content')
  const accelerator = await request('/eoa', 'text/html')
  if (!(accelerator.headers.get('content-type') || '').includes('text/html')) {
    throw new Error('/eoa did not return HTML')
  }
  console.log('Hosting runtime smoke: /health, / and /eoa passed through the package start command')
} catch (error) {
  const message = error instanceof Error ? error.message : 'Runtime smoke failed'
  console.error(message)
  if (output.trim()) console.error(`Next.js output (last 8 KB):\n${output.trim()}`)
  process.exitCode = 1
} finally {
  await stop()
}
