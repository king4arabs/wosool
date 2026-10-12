import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'

const adminDir = join(process.cwd(), 'src', 'app', 'admin')

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return pages(full)
    return entry === 'page.tsx' ? [full] : []
  })
}

test('the admin layout owns the only h1; admin pages start at h2', () => {
  const layout = readFileSync(join(adminDir, 'layout.tsx'), 'utf8')
  assert.equal(layout.match(/<h1[\s>]/g)?.length, 1, 'admin layout renders the page h1')

  const offenders = pages(adminDir)
    .filter((file) => /<h1[\s>]/.test(readFileSync(file, 'utf8')))
    .map((file) => relative(adminDir, file))
  assert.deepEqual(offenders, [], 'admin pages must not render a second h1')
})
