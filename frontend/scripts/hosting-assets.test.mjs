import test from 'node:test'
import assert from 'node:assert/strict'
import { checkPageAssets } from './hosting-assets.mjs'

const html = '<link rel="stylesheet" href="/_next/static/app.css"/><script src="/_next/static/app.js"></script><script src="/_next/static/app.js"></script>'
const origin = 'http://127.0.0.1:18082'
const asset = (url) => new Response('/* built asset */', { headers: { 'content-type': url.endsWith('.css') ? 'text/css' : 'application/javascript' } })

test('checks both CSS and JS, deduplicates preloads and never follows redirects', async () => {
  const urls = []
  assert.equal(await checkPageAssets(html, origin, async (url, options) => {
    urls.push(url)
    assert.equal(options.redirect, 'manual')
    return asset(url)
  }), 2)
  assert.deepEqual(urls, [origin + '/_next/static/app.css', origin + '/_next/static/app.js'])
})

test('rejects missing assets, redirects, HTML error pages and empty output', async () => {
  for (const response of [
    new Response('', { status: 404 }),
    new Response('', { status: 307 }),
    new Response('<html>Error</html>', { headers: { 'content-type': 'text/html' } }),
    new Response(' ', { headers: { 'content-type': 'text/css' } }),
  ]) {
    await assert.rejects(checkPageAssets(html, origin, async () => response), /Build asset/)
  }
  await assert.rejects(checkPageAssets('<html>Placeholder</html>', origin), /missing Next.js/)
})

test('does not request external or traversing asset references', async () => {
  const unsafe = '<script src="https://elsewhere.test/_next/static/x.js"></script><link href="/_next/static/../../private.css"/>'
  let requests = 0
  assert.equal(await checkPageAssets(html + unsafe, origin, async (url) => { requests++; return asset(url) }), 2)
  assert.equal(requests, 2)
})
