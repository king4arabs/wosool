import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from '../proxy'

test('lowercase EOA gateway remains canonical in middleware', () => {
  for (const path of ['/eoa', '/eoa/apply?track=3', '/eoa/account']) {
    const response = proxy(new NextRequest(`https://wosool.org${path}`))
    assert.equal(response.headers.get('location'), null)
  }
})

test('dashboard sign-in preserves destination without trusting a missing session', () => {
  const response = proxy(
    new NextRequest('https://wosool.org/dashboard/eoa?track=3'),
  )
  const location = new URL(response.headers.get('location')!)

  assert.equal(location.pathname, '/login')
  assert.equal(location.searchParams.get('redirect'), '/dashboard/eoa?track=3')
})

test('private EOA workspaces use the EOA account journey and preserve destination', () => {
  for (const path of ['/eoa/admin', '/eoa/coach?session=4']) {
    const response = proxy(new NextRequest(`https://wosool.org${path}`))
    const location = new URL(response.headers.get('location')!)

    assert.equal(location.pathname, '/eoa/account')
    assert.equal(location.searchParams.get('redirect'), path)
  }
})

test('canonical gateway and sign-in pages do not loop on cookie heuristics', () => {
  for (const path of ['/eoa', '/eoa/account', '/login']) {
    const response = proxy(
      new NextRequest(`https://wosool.org${path}`, {
        headers: { cookie: 'wosool_session=expired' },
      }),
    )
    assert.equal(response.headers.get('location'), null)
  }
})
