/** Browser check for /admin/sponsors: both languages, labelled fields, hiding a sponsor, validation and errors. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18094'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18094'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const initial = () => [
  { id: 1, name: 'Example Capital', slug: 'example-capital', description: 'Annual community partner.', logo_url: null, website: 'https://example.com', tier: 'gold', is_active: true, contact_name: 'Sara', contact_email: 'sara@example.com', contract_start: '2026-01-01', contract_end: null, display_order: 1 },
  { id: 2, name: 'Sample Ventures', slug: 'sample-ventures', description: null, logo_url: null, website: null, tier: 'community', is_active: false, contact_name: null, contact_email: null, contract_start: null, contract_end: null, display_order: 2 },
]
const meta = list => ({ total: list.length, active: list.filter(item => item.is_active).length, platinum: list.filter(item => item.tier === 'platinum').length, gold: list.filter(item => item.tier === 'gold').length })
let browser
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const [locale, width] of [['en', 390], ['ar', 1366], ['ar', 390], ['en', 1366]]) {
    const ar = locale === 'ar'
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    await context.addCookies([{ name: 'laravel_session', value: 'isolated-admin-test', url: origin }])
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message))
    page.on('dialog', dialog => dialog.accept())
    const writes = []; const searches = []; let stored = initial(); let reject = false
    await context.route('**/*', route => {
      const url = new URL(route.request().url()); const method = route.request().method()
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { user: { id: 1, name: 'Admin', email: 'admin@example.com', email_verified_at: '2026-10-01T00:00:00Z', roles: ['admin'] } } })
      const match = url.pathname.match(/\/admin\/sponsors(?:\/(\d+))?$/)
      if (match) {
        const id = Number(match[1])
        if (method === 'GET') {
          const search = url.searchParams.get('search') || ''
          searches.push(search)
          const list = stored.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
          return route.fulfill({ json: { data: list, meta: meta(list) } })
        }
        if (method === 'DELETE') { stored = stored.filter(item => item.id !== id); return route.fulfill({ json: { message: 'Sponsor deleted.' } }) }
        const body = route.request().postDataJSON(); writes.push({ method, id, body })
        if (reject) return route.fulfill({ status: 422, json: { message: 'The website field must be a valid URL.', errors: { website: ['The website field must be a valid URL.'] } } })
        if (method === 'PUT') stored = stored.map(item => item.id === id ? { ...item, ...body } : item)
        else stored = [...stored, { ...body, id: 3, slug: 'new' }]
        return route.fulfill({ status: method === 'POST' ? 201 : 200, json: { data: body } })
      }
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      return route.fulfill({ json: { data: [] } })
    })
    await page.goto(origin + '/admin/sponsors', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 2, name: ar ? 'الرعاة' : 'Sponsors' }).waitFor()
    await page.getByText('Example Capital').waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dir), ar ? 'rtl' : 'ltr')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: horizontal overflow`)
    await page.getByText(ar ? 'ذهبي' : 'Gold', { exact: true }).first().waitFor()
    await page.getByText(ar ? 'مخفي' : 'Hidden', { exact: true }).waitFor()

    // Search runs on submit only.
    const searchBox = page.getByRole('searchbox', { name: ar ? 'البحث في الرعاة' : 'Search sponsors' })
    await searchBox.fill('nothing-matches')
    assert.equal(searches.length, 1, 'typing does not send a request')
    await searchBox.press('Enter')
    await page.getByText(ar ? 'لا يوجد رعاة يطابقون هذا البحث.' : 'No sponsors match this search.').waitFor()
    await searchBox.fill('')
    await searchBox.press('Enter')
    await page.getByText('Example Capital').waitFor()

    // Edit: every field labelled; hide the sponsor; axe on the open dialog.
    await page.getByRole('button', { name: ar ? 'تعديل Example Capital' : 'Edit Example Capital' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    assert.equal(await dialog.getByLabel(ar ? /^الاسم/ : /^Name/).inputValue(), 'Example Capital')
    assert.equal(await dialog.getByLabel(ar ? /^بداية العقد/ : /^Contract start/).inputValue(), '2026-01-01')
    assert.equal(await dialog.getByLabel(ar ? /^المستوى/ : /^Tier/).inputValue(), 'gold')
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => item.id))
    assert.deepEqual(violations, [], `${locale} ${width}: accessibility`)

    // End before start: caught locally, focus on the field, nothing sent.
    await dialog.getByLabel(ar ? /^نهاية العقد/ : /^Contract end/).fill('2025-12-31')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'يجب ألا تسبق نهاية العقد بدايته.' : 'The contract end cannot be before its start.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'sponsor-contract-end', { timeout: 5000 })
    assert.equal(writes.length, 0)

    await dialog.getByLabel(ar ? /^نهاية العقد/ : /^Contract end/).fill('2026-12-31')
    await dialog.getByLabel(ar ? /^نشط/ : /^Active/).uncheck()
    await dialog.getByLabel(ar ? /^ترتيب العرض/ : /^Display order/).fill('5')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await page.getByText(ar ? 'حُفظ الراعي.' : 'Sponsor saved.').waitFor()
    assert.equal(writes.length, 1)
    assert.equal(writes[0].method, 'PUT')
    assert.equal(writes[0].body.is_active, false)
    assert.equal(writes[0].body.display_order, 5)
    assert.equal(writes[0].body.contract_end, '2026-12-31')
    assert.equal(writes[0].body.description, 'Annual community partner.')

    // API rejection lands under its field in the page language.
    reject = true
    await page.getByRole('button', { name: ar ? 'إضافة راعٍ' : 'Add sponsor' }).click()
    await dialog.getByLabel(ar ? /^الاسم/ : /^Name/).fill('New sponsor')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'لم يقبل الخادم هذه القيمة.' : 'The server did not accept this value.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'sponsor-website', { timeout: 5000 })
    assert.equal(await page.getByText('The website field must be').count(), 0, 'raw API message is not shown')
    assert.equal(writes[1].method, 'POST')
    assert.equal(writes[1].body.is_active, true)
    await page.screenshot({ path: `/tmp/admin-operations-sponsors-${locale}-${width}.png`, fullPage: true })
    await dialog.getByRole('button', { name: ar ? 'إلغاء' : 'Cancel' }).click()

    // Delete is confirmed by name and the list reloads.
    reject = false
    await page.getByRole('button', { name: ar ? 'حذف Sample Ventures' : 'Delete Sample Ventures' }).click()
    await page.getByText(ar ? 'حُذف الراعي.' : 'Sponsor deleted.').waitFor()
    await page.getByText('Sample Ventures').waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
    await context.close()
    console.log(`admin sponsors ${locale} ${width}: ok`)
  }
} finally {
  await browser?.close()
  app.kill()
}
