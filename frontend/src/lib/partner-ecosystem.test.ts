import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import roster from '../data/partner-ecosystem.json'

test('partnership prospects meet category minimums and the requested regional balance', () => {
  assert.equal(roster.length, 80)
  assert.equal(new Set(roster.map(item => item.id)).size, 80)
  assert.deepEqual(Object.fromEntries(['saudi','gcc','mena','world'].map(region => [region, roster.filter(item => item.region === region).length])), {saudi:64,gcc:8,mena:4,world:4})
  for (const category of ['government','bank','pif','university','vc','listed']) assert.ok(roster.filter(item => item.category === category).length >= 10, category)
  assert.ok(roster.every(item => item.status === 'prospect' && !['IL','IR'].includes(item.country)))
})

test('each organization has local artwork and a safe official website', () => {
  for (const item of roster) {
    assert.match(item.website, /^https:\/\//)
    assert.ok(item.logo_path.startsWith('/') && !item.logo_path.startsWith('//'))
    const file = join(process.cwd(), 'public', item.logo_path)
    assert.ok(existsSync(file), item.id)
    if (file.endsWith('.svg')) assert.doesNotMatch(readFileSync(file, 'utf8'), /<script|<foreignObject|onload=|href=["']https?:/i, item.id)
  }
})
