import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

// Uses the production build. No browser JavaScript: these are the bytes crawlers receive.
const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:18083'
const canonicalOrigin = process.env.SEO_CANONICAL_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || 'https://wosool.org'
const server = process.env.SEO_BASE_URL ? null : spawn(process.execPath, ['--import', './scripts/seo-fixtures.mjs', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '18083'], { stdio: 'ignore', cwd: new URL('../', import.meta.url) })
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]))
const meta = (html, key) => [...html.matchAll(/<meta\s[^>]*>/g)].map(match => attributes(match[0])).find(tag => tag.name === key || tag.property === key)?.content
const canonical = html => [...html.matchAll(/<link\s[^>]*>/g)].map(match => attributes(match[0])).find(tag => tag.rel === 'canonical')?.href
async function read(path) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Googlebot', Accept: 'text/html' } })
  return { response, html: await response.text() }
}
try {
  if (server) {
    let ready = false
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error('Preview server exited')
      try { if ((await read('/health')).response.ok) { ready = true; break } } catch {}
      await delay(250)
    }
    assert.ok(ready, 'Preview server must start')
  }
  const titles = new Set()
  for (const path of ['/', '/about', '/terms', '/startups', '/news', '/eoa/mentors', '/eoa/leadership', '/opportunities/aws-activate']) {
    const { response, html } = await read(path)
    assert.equal(response.status, 200, path)
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
    assert.ok(title && !titles.has(title), `Unique title: ${path}`)
    titles.add(title)
    assert.ok(meta(html, 'description'), `Description: ${path}`)
    assert.equal(new URL(canonical(html)).href, new URL(path, canonicalOrigin).href, `Canonical: ${path}`)
    assert.equal(new URL(meta(html, 'og:url')).href, new URL(path, canonicalOrigin).href, `Social URL: ${path}`)
    assert.doesNotMatch(meta(html, 'og:image') || '', /\.svg(?:\?|$)/, `Raster social image: ${path}`)
    assert.doesNotMatch(meta(html, 'robots') || '', /noindex/, `Public indexing: ${path}`)
    for (const script of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) JSON.parse(script[1])
  }
  for (const path of ['/login', '/register', '/forgot-password', '/verify-email', '/eoa/account']) {
    const { html } = await read(path)
    assert.match(meta(html, 'robots') || '', /noindex/, `Private indexing: ${path}`)
  }
  const robots = (await read('/robots.txt')).html
  assert.ok(robots.includes(`Sitemap: ${new URL('/sitemap.xml', canonicalOrigin).href}`))
  assert.ok(!robots.includes('Disallow: /login'), 'Allow crawlers to read login noindex')
  const sitemap = (await read('/sitemap.xml')).html
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.ok(urls.length > 30)
  assert.equal(urls.length, new Set(urls).size, 'Unique sitemap URLs')
  for (const url of urls) {
    assert.equal(new URL(url).origin, new URL(canonicalOrigin).origin)
    assert.doesNotMatch(new URL(url).pathname, /^\/(admin|dashboard|login|register)(\/|$)|^\/eoa\/(admin|coach|account|apply)(\/|$)/)
  }
  if (server) {
    for (const [kind, title] of [['events', 'جلسة نمو الاختبار'], ['programs', 'برنامج نمو الاختبار']]) {
      const path = `/${kind}/seo-fixture-public`
      const { response, html } = await read(path)
      assert.equal(response.status, 200)
      assert.ok(html.includes(title), `Server-rendered ${kind} content`)
      assert.ok([...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].some(match => match[1].includes(title)), `Visible ${kind} heading before JavaScript`)
      assert.equal(new URL(canonical(html)).href, new URL(path, canonicalOrigin).href)
      assert.doesNotMatch(html, /NEVER_SERIALIZE_THIS/)
      const missing = await read(`/${kind}/seo-fixture-missing`)
      assert.ok([200, 404].includes(missing.response.status), `Missing ${kind} status`)
      // Next's root loading boundary can stream HTTP 200 before notFound().
      // The noindex directive must be present in either response path.
      assert.match(missing.html, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/, `Missing ${kind} must not be indexed`)
      assert.ok(missing.html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `Missing ${kind} uses not-found boundary`)
      const outage = await read(`/${kind}/seo-fixture-outage`)
      assert.match(meta(outage.html, 'robots') || '', /noindex/, `Outage ${kind} indexing`)
    }
    const privateProgram = await read('/programs/seo-fixture-private')
    assert.match(meta(privateProgram.html, 'robots') || '', /noindex/)
    assert.ok(!privateProgram.html.includes('برنامج نمو الاختبار'))
  }
  const asset = await fetch(new URL('/opengraph-image', base))
  assert.equal(asset.status, 200)
  assert.match(asset.headers.get('content-type') || '', /image\/png/)
  const bytes = new Uint8Array(await asset.arrayBuffer())
  assert.deepEqual([...bytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  console.log(`SEO smoke passed: ${titles.size} distinct pages, 5 noindex routes, ${urls.length} sitemap URLs, structured data, PNG preview and dynamic-detail fixtures.`)
} finally {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM')
    await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(3000)])
    if (server.exitCode === null) server.kill('SIGKILL')
  }
}
