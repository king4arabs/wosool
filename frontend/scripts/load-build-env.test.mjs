import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

test('the default hosting build stops before compilation when release settings are missing', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], {
    encoding: 'utf8',
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: '', NEXT_PUBLIC_API_URL: '', NEXT_PUBLIC_ENABLE_DEMO_CONTENT: '' },
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Frontend release preflight failed/)
  assert.doesNotMatch(result.stdout, /Creating an optimized production build/)
})

test('release environment uses Next production file precedence, expansion and host overrides', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wosool-build-env-'))
  try {
    writeFileSync(join(directory, '.env'), 'NEXT_PUBLIC_API_URL=http://localhost:8000\n')
    writeFileSync(join(directory, '.env.production'), 'WOSOOL_TEST_HOST=api.wosool.org\nNEXT_PUBLIC_API_URL=https://$WOSOOL_TEST_HOST\nNEXT_PUBLIC_SITE_URL=https://wrong.example\nNEXT_PUBLIC_ENABLE_DEMO_CONTENT=false\n')
    writeFileSync(join(directory, '.env.development'), 'NEXT_PUBLIC_ENABLE_DEMO_CONTENT=true\n')
    const env = { ...process.env, NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'https://wosool.org' }
    for (const key of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_ENABLE_DEMO_CONTENT', '__NEXT_PROCESSED_ENV', 'WOSOOL_TEST_HOST']) delete env[key]
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { loadBuildEnvironment } from ${JSON.stringify(new URL('./load-build-env.mjs', import.meta.url).href)};
      import { checkDeploymentEnvironment } from ${JSON.stringify(new URL('./hosting-preflight.mjs', import.meta.url).href)};
      loadBuildEnvironment(process.argv[1]);
      console.log(JSON.stringify(checkDeploymentEnvironment()));
    `, directory], { env, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(JSON.parse(result.stdout), { siteOrigin: 'https://wosool.org', apiOrigin: 'https://api.wosool.org' })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
