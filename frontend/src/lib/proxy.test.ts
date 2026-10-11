import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from '../proxy'

test('lowercase EOA gateway preserves section and query in canonical redirect', () => {
  for (const path of ['/eoa', '/eoa/apply?track=3', '/eoa/account']) {
    const response = proxy(new NextRequest(`https://wosool.org${path}`))
    assert.equal(response.status, 308)
    assert.equal(response.headers.get('location'), `https://wosool.org${path.replace('/eoa', '/EOA')}`)
  }
})

test('dashboard sign-in preserves destination without trusting a missing session', () => {
  const response = proxy(new NextRequest('https://wosool.org/dashboard/eoa?track=3'))
  const location = new URL(response.headers.get('location')!)
  assert.equal(location.pathname, '/login')
  assert.equal(location.searchParams.get('redirect'), '/dashboard/eoa?track=3')
})

test('canonical gateway and login do not loop on cookie heuristics', () => {
  for (const path of ['/EOA', '/EOA/account', '/login']) {
    const response = proxy(new NextRequest(`https://wosool.org${path}`, {
      headers: { cookie: 'wosool_session=expired' },
    }))
    assert.equal(response.headers.get('location'), null)
  }
})
