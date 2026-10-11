import assert from 'node:assert/strict'
import test from 'node:test'
import { leadershipBoard, referenceBoard } from './eoa-leadership'

test('leadership uses the poster snapshot only until a live roster is available', () => {
  assert.equal(leadershipBoard().length, 11)
  assert.equal(leadershipBoard(null).length, 11)
  assert.deepEqual(leadershipBoard([]), [])
  const live = { ...referenceBoard[0], id: 75, name_en: 'Edited by the chapter' }
  assert.deepEqual(leadershipBoard([live]).map(member => member.name_en), ['Edited by the chapter'])
  assert.deepEqual(leadershipBoard([{ ...live, publication_status: 'draft' }]), [])
  assert.deepEqual(leadershipBoard([{ ...live, is_active: false }]), [])
})

test('the chair role upgrades the legacy label without mutating live editorial data', () => {
  const chair = referenceBoard.find(member => member.slug === 'mohammed-alsolami')!
  const legacy = { ...chair, position_en: 'Membership', position_ar: 'العضوية' }
  assert.equal(leadershipBoard([legacy])[0].position_en, 'Membership & Accelerator Chair')
  assert.equal(legacy.position_en, 'Membership')
  const changedRole = { ...chair, position_en: 'Chapter advisor' }
  assert.equal(leadershipBoard([changedRole])[0].position_en, 'Chapter advisor')
})
