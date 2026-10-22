import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const css = readFileSync(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')

function baseLayer(): string {
  const start = css.indexOf('@layer base {')
  assert.notEqual(start, -1, 'globals.css declares a base layer')
  let depth = 0
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}' && --depth === 0) return css.slice(start, index + 1)
  }
  throw new Error('unterminated @layer base block')
}

test('bare Tailwind borders use the soft design-system colour, not currentColor', () => {
  const layer = baseLayer()
  assert.match(layer, /\*,\s*::before,\s*::after[^{]*\{\s*border-color:\s*var\(--border-soft/, 'every element defaults to --border-soft')
  assert.match(layer, /button,\s*input,\s*select,\s*textarea\s*\{\s*border-color:\s*var\(--border[,)]/, 'controls default to --border, like Input and the outline Button')
})

test('the border default stays in the base layer so border-* utilities still override it', () => {
  const outside = css.replace(baseLayer(), '')
  assert.doesNotMatch(outside, /^\s*\*[^{]*\{[^}]*border-color/m, 'an unlayered * border-color would beat every utility')
})
