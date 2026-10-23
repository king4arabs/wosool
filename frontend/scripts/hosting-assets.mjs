export async function checkPageAssets(html, origin, fetchImpl = fetch) {
  const paths = new Set()
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), origin)
    if (url.origin === origin && url.pathname.startsWith('/_next/static/') && /\.(js|css)$/.test(url.pathname)) {
      paths.add(url.pathname + url.search)
    }
  }
  if (![...paths].some(path => /\.js(?:\?|$)/.test(path)) ||
      ![...paths].some(path => /\.css(?:\?|$)/.test(path))) {
    throw new Error('Page is missing Next.js script or stylesheet references')
  }
  for (const path of paths) {
    const response = await fetchImpl(origin + path, {
      redirect: 'manual', signal: AbortSignal.timeout(5000),
    })
    const css = new URL(path, origin).pathname.endsWith('.css')
    const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (response.status !== 200) throw new Error(`Build asset returned HTTP ${response.status}: ${path}`)
    if (!(css ? mime === 'text/css' : ['text/javascript', 'application/javascript'].includes(mime))) {
      throw new Error(`Build asset has the wrong content type: ${path}`)
    }
    if (!(await response.text()).trim()) throw new Error(`Build asset is empty: ${path}`)
  }
  return paths.size
}
