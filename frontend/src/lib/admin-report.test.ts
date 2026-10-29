import test from 'node:test'
import assert from 'node:assert/strict'
import { periodChange, reportCsv } from './admin-report'

test('analytics CSV preserves Arabic, quotes and line breaks and neutralizes formulas', () => {
  const csv = reportCsv([['المؤشر', 'A "quoted", value', 'first\nsecond', '=HYPERLINK("x")', '  +cmd'], [0, null, 50]])
  assert.ok(csv.startsWith('\uFEFF"المؤشر"'))
  assert.ok(csv.includes('"A ""quoted"", value"'))
  assert.ok(csv.includes('"first\nsecond"'))
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'))
  assert.ok(csv.includes('"\'  +cmd"'))
  assert.ok(csv.endsWith('"0","","50"'))
})
test('period change does not invent a comparison when a denominator is absent', () => {
  assert.equal(periodChange(5, 0), 5)
  assert.equal(periodChange(10, 12), -2)
  assert.equal(periodChange(null, 10), null)
  assert.equal(periodChange(0, null), null)
})
