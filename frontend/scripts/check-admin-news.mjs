/** Browser check for /admin/news: both languages, labelled fields, Riyadh publish times, validation and errors. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18099'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18099'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const initial = () => [
  { id: 1, title: 'Example raises a seed round', slug: 'example-seed', excerpt: 'Example announced a seed round.', content: 'Full text.', category: 'Funding', image_url: null, author_name: 'Wosool Team', is_featured: true, is_public: true, status: 'published', tags: ['seed'], published_at: '2026-11-14T06:00:00+00:00', source_url: 'https://example.com/news/seed', source_name: 'Example News', image_credit: null, companies: ['Example'], region: 'saudi', key_facts: ['Seed round'], translations: { ar: { title: 'عنوان', excerpt: 'ملخص' } } },
  { id: 2, title: 'Sample opens an office', slug: 'sample-office', excerpt: 'Sample opened an office.', content: null, category: 'Expansion', image_url: null, author_name: 'Wosool Team', is_featured: false, is_public: false, status: 'draft', tags: [], published_at: null, source_url: null, source_name: null, image_credit: null, companies: [], region: null, key_facts: [] },
]
const meta = list => ({ total: list.length, published: list.filter(item => item.status === 'published').length, drafts: list.filter(item => item.status === 'draft').length, archived: 0, featured: list.filter(item => item.is_featured).length })
let browser
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const [locale, width] of [['en', 390], ['ar', 1366], ['ar', 390], ['en', 1366]]) {
    const ar = locale === 'ar'
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', timezoneId: 'America/New_York' })
    await context.addCookies([{ name: 'laravel_session', value: 'isolated-admin-test', url: origin }])
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message))
    page.on('dialog', dialog => dialog.accept())
    const writes = []; const searches = []; let stored = initial(); let reject = null
    await context.route('**/*', route => {
      const url = new URL(route.request().url()); const method = route.request().method()
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { user: { id: 1, name: 'Admin', email: 'admin@example.com', email_verified_at: '2026-10-01T00:00:00Z', roles: ['admin'] } } })
      const match = url.pathname.match(/\/admin\/news(?:\/(\d+))?$/)
      if (match) {
        const id = Number(match[1])
        if (method === 'GET') {
          const search = url.searchParams.get('search') || ''
          searches.push(search)
          const list = stored.filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
          return route.fulfill({ json: { data: list, meta: meta(list) } })
        }
        if (method === 'DELETE') { stored = stored.filter(item => item.id !== id); return route.fulfill({ json: { message: 'Article deleted.' } }) }
        const body = route.request().postDataJSON(); writes.push({ method, id, body })
        if (reject) return route.fulfill({ status: 422, json: { message: 'Rejected.', errors: reject } })
        if (method === 'PUT') stored = stored.map(item => item.id === id ? { ...item, ...body } : item)
        else stored = [...stored, { ...body, id: 3, slug: 'new' }]
        return route.fulfill({ status: method === 'POST' ? 201 : 200, json: { data: body } })
      }
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      return route.fulfill({ json: { data: [] } })
    })
    await page.goto(origin + '/admin/news', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 2, name: ar ? 'الأخبار' : 'News' }).waitFor()
    await page.getByText('Example raises a seed round').waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dir), ar ? 'rtl' : 'ltr')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: horizontal overflow`)
    await page.getByText(ar ? 'غير عام' : 'Not public', { exact: true }).waitFor()
    await page.getByText(ar ? 'مسودة' : 'Draft', { exact: true }).first().waitFor()
    // 06:00 UTC is shown as 09:00 Riyadh time whatever the browser's own time zone.
    await page.getByText(/09:00/).first().waitFor()

    // Search runs on submit only.
    const searchBox = page.getByRole('searchbox', { name: ar ? 'البحث في الأخبار' : 'Search news' })
    await searchBox.fill('nothing-matches')
    assert.equal(searches.length, 1, 'typing does not send a request')
    await searchBox.press('Enter')
    await page.getByText(ar ? 'لا توجد أخبار تطابق هذا البحث.' : 'No stories match this search.').waitFor()
    await searchBox.fill('')
    await searchBox.press('Enter')
    await page.getByText('Example raises a seed round').waitFor()

    // Edit: every field labelled, publish time in Riyadh time; axe on the open dialog.
    await page.getByRole('button', { name: ar ? 'تعديل Example raises a seed round' : 'Edit Example raises a seed round' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    assert.equal(await dialog.getByLabel(ar ? /^العنوان/ : /^Title/).inputValue(), 'Example raises a seed round')
    assert.equal(await dialog.getByLabel(ar ? /^وقت النشر/ : /^Publish time/).inputValue(), '2026-11-14T09:00')
    assert.equal(await dialog.getByLabel(ar ? /^الحالة/ : /^Status/).inputValue(), 'published')
    assert.equal(await dialog.getByLabel(ar ? /^المنطقة/ : /^Region/).inputValue(), 'saudi')
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => item.id))
    assert.deepEqual(violations, [], `${locale} ${width}: accessibility`)

    // An http source is caught locally, focus moves to it, nothing is sent.
    await dialog.getByLabel(ar ? /^رابط المصدر/ : /^Source URL/).fill('http://example.com/news/seed')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'يجب أن يبدأ رابط المصدر بـ https://' : 'The source URL must start with https://').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'news-source-url', { timeout: 5000 })
    assert.equal(writes.length, 0)

    // A valid save keeps the time, lists and untouched values; translations are not sent.
    await dialog.getByLabel(ar ? /^رابط المصدر/ : /^Source URL/).fill('https://example.com/news/seed')
    await dialog.getByLabel(ar ? /^الوسوم/ : /^Tags/).fill('seed، fintech')
    await dialog.getByLabel(ar ? /^عام/ : /^Public/).uncheck()
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await page.getByText(ar ? 'حُفظ الخبر.' : 'Story saved.').waitFor()
    assert.equal(writes.length, 1)
    assert.equal(writes[0].method, 'PUT')
    assert.equal(writes[0].body.published_at, '2026-11-14T06:00:00.000Z')
    assert.deepEqual(writes[0].body.tags, ['seed', 'fintech'])
    assert.deepEqual(writes[0].body.companies, ['Example'])
    assert.deepEqual(writes[0].body.key_facts, ['Seed round'])
    assert.equal(writes[0].body.is_public, false)
    assert.equal(writes[0].body.content, 'Full text.')
    assert.equal('translations' in writes[0].body, false)

    // A taken source link from the API lands under its field in the page language.
    reject = { source_url: ['The source url has already been taken.'] }
    await page.getByRole('button', { name: ar ? 'خبر جديد' : 'New story' }).click()
    await dialog.getByLabel(ar ? /^العنوان/ : /^Title/).fill('New story title')
    await dialog.getByLabel(ar ? /^التصنيف/ : /^Category/).fill('Funding')
    await dialog.getByLabel(ar ? /^الملخص/ : /^Summary/).fill('A short summary.')
    await dialog.getByLabel(ar ? /^رابط المصدر/ : /^Source URL/).fill('https://example.com/news/seed')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'يوجد خبر آخر بهذا الرابط.' : 'Another story already uses this link.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'news-source-url', { timeout: 5000 })
    assert.equal(await page.getByText('has already been taken').count(), 0, 'raw API message is not shown')
    assert.equal(writes[1].method, 'POST')
    assert.equal(writes[1].body.status, 'draft')
    assert.equal(writes[1].body.published_at, null)
    await page.screenshot({ path: `/tmp/admin-news-${locale}-${width}.png`, fullPage: true })
    await dialog.getByRole('button', { name: ar ? 'إلغاء' : 'Cancel' }).click()

    // Delete is confirmed by title and the list reloads.
    reject = null
    await page.getByRole('button', { name: ar ? 'حذف Sample opens an office' : 'Delete Sample opens an office' }).click()
    await page.getByText(ar ? 'حُذف الخبر.' : 'Story deleted.').waitFor()
    await page.getByText('Sample opens an office').waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
    await context.close()
    console.log(`admin news ${locale} ${width}: ok`)
  }
} finally {
  await browser?.close()
  app.kill()
}
