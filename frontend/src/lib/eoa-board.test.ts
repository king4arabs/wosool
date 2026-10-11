import assert from 'node:assert/strict'
import test from 'node:test'
import { boardExternalUrl, boardPortraitUrl, boardScrollOffset, boardText, publishedBoardMembers, type EoaBoardMember } from './eoa-board'

test('board links exclude missing, unsafe and credential-bearing addresses', () => {
  for (const url of [null, '', '   ', 'javascript:alert(1)', 'data:text/html,hello', '//example.org', '/profile', 'https://person:password@example.org']) {
    assert.equal(boardExternalUrl(url), null)
  }
  assert.equal(boardExternalUrl(' https://www.linkedin.com/in/example/ '), 'https://www.linkedin.com/in/example/')
  assert.equal(boardExternalUrl('http://company.example'), 'http://company.example/')
})

test('board portraits preserve local assets and same-origin restricted storage paths', () => {
  assert.equal(boardPortraitUrl('/eoa/board/person.webp'), '/eoa/board/person.webp')
  assert.equal(boardPortraitUrl('/storage/eoa/board/person.webp'), '/storage/eoa/board/person.webp')
  assert.equal(boardPortraitUrl('//untrusted.example/image.png'), null)
  assert.equal(boardPortraitUrl('/\\untrusted.example/image.png'), null)
  assert.equal(boardPortraitUrl('data:image/svg+xml,anything'), null)
})

test('public board excludes hidden and draft records, removes duplicates and preserves defined order', () => {
  const member = (id: number, order: number, active = true, status: 'draft' | 'published' = 'published') => ({ id, display_order: order, is_active: active, publication_status: status }) as EoaBoardMember
  const input = [member(3, 2), member(2, 1), member(1, 1), member(4, 0, false), member(5, 0, true, 'draft'), member(2, 1)]
  assert.deepEqual(publishedBoardMembers(input).map(item => item.id), [1, 2, 3])
  assert.equal(input.length, 6)
})

test('carousel rightward movement decreases its LTR offset without overscrolling', () => {
  assert.equal(boardScrollOffset(300, 1000, 25), 275)
  assert.equal(boardScrollOffset(10, 1000, 25), 0)
  assert.equal(boardScrollOffset(990, 1000, -25), 1000)
  assert.equal(boardScrollOffset(10, 0, 25), 0)
})

test('board labels use the available language without inventing missing information', () => {
  assert.equal(boardText(true, 'اسم العضو', 'Member name'), 'اسم العضو')
  assert.equal(boardText(true, null, 'Member name'), 'Member name')
  assert.equal(boardText(false, 'اسم العضو', null), 'اسم العضو')
  assert.equal(boardText(false, null, null), '')
})
