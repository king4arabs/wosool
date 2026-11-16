/** Browser check for /admin/companies: both languages, English and Arabic text kept apart, labelled fields, validation and errors. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18095'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18095'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const initial = () => [
  { id: 1, name: 'Example Logistics', slug: 'example-logistics', description: 'Freight software.', website: 'https://example.com', sector: 'Logistics', stage: 'seed', location: 'Saudi Arabia', country_code: 'SA', founded_year: 2021, team_size: 14, is_hiring: true, is_fundraising: false, is_collaborating: false, is_featured: false, is_public: true, status: 'active', founders: [{ id: 9, user: { name: 'Sara Example' } }], ar: { name: 'مثال اللوجستية', description: 'برمجيات شحن.', sector: 'الخدمات اللوجستية', location: 'السعودية' } },
  { id: 2, name: 'Sample Health', slug: 'sample-health', description: null, website: null, sector: null, stage: null, location: null, country_code: null, founded_year: null, team_size: null, is_hiring: false, is_fundraising: true, is_collaborating: false, is_featured: false, is_public: false, status: 'pending', founders: [], ar: { name: null, description: null, sector: null, location: null } },
]
const meta = list => ({ total: list.length, hiring: list.filter(item => item.is_hiring).length, fundraising: list.filter(item => item.is_fundraising).length })
let browser
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const [locale, width] of [['ar', 390], ['en', 1366], ['en', 390], ['ar', 1366]]) {
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
      const match = url.pathname.match(/\/admin\/companies(?:\/(\d+))?$/)
      if (match) {
        const id = Number(match[1])
        if (method === 'GET') {
          const search = url.searchParams.get('search') || ''
          searches.push(search)
          const list = stored.filter(item => [item.name, item.ar?.name].some(value => value?.toLowerCase().includes(search.toLowerCase())))
          return route.fulfill({ json: { data: list, meta: meta(list) } })
        }
        if (method === 'DELETE') { stored = stored.filter(item => item.id !== id); return route.fulfill({ json: { message: 'Company deleted.' } }) }
        const body = route.request().postDataJSON(); writes.push({ method, id, body })
        if (reject) return route.fulfill({ status: 422, json: { message: 'The slug has already been taken.', errors: { slug: ['The slug has already been taken.'] } } })
        const saved = { ...body, ar: { name: body.name_ar, description: body.description_ar, sector: body.sector_ar, location: body.location_ar } }
        if (method === 'PUT') stored = stored.map(item => item.id === id ? { ...item, ...saved } : item)
        else stored = [...stored, { ...saved, id: 3, slug: 'new', founders: [] }]
        return route.fulfill({ status: method === 'POST' ? 201 : 200, json: { data: saved } })
      }
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      return route.fulfill({ json: { data: [] } })
    })
    await page.goto(origin + '/admin/companies', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 2, name: ar ? 'الشركات' : 'Companies' }).waitFor()
    const primaryName = ar ? 'مثال اللوجستية' : 'Example Logistics'
    await page.getByText(primaryName, { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dir), ar ? 'rtl' : 'ltr')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: horizontal overflow`)
    await page.getByText(ar ? 'لا تظهر في الدليل' : 'Not listed', { exact: true }).waitFor()
    await page.getByText(ar ? 'قيد المراجعة' : 'Pending review', { exact: true }).waitFor()
    if (ar) await page.getByText('بلا اسم عربي', { exact: true }).waitFor()

    // Search runs on submit only.
    const searchBox = page.getByRole('searchbox', { name: ar ? 'البحث في الشركات' : 'Search companies' })
    await searchBox.fill('nothing-matches')
    assert.equal(searches.length, 1, 'typing does not send a request')
    await searchBox.press('Enter')
    await page.getByText(ar ? 'لا توجد شركات تطابق هذا البحث.' : 'No companies match this search.').waitFor()
    await searchBox.fill('')
    await searchBox.press('Enter')
    await page.getByText(primaryName, { exact: true }).waitFor()

    // Edit: English and Arabic fields side by side, whatever the admin language; axe on the open dialog.
    await page.getByRole('button', { name: ar ? `تعديل ${primaryName}` : `Edit ${primaryName}` }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    assert.equal(await dialog.getByLabel(ar ? /^الاسم بالإنجليزية/ : /^Name \(English\)/).inputValue(), 'Example Logistics')
    assert.equal(await dialog.getByLabel(ar ? /^الاسم بالعربية/ : /^Name \(Arabic\)/).inputValue(), 'مثال اللوجستية')
    assert.equal(await dialog.getByLabel(ar ? /^القطاع بالإنجليزية/ : /^Sector \(English\)/).inputValue(), 'Logistics')
    assert.equal(await dialog.getByLabel(ar ? /^الحالة/ : /^Status/).inputValue(), 'active')
    assert.equal(await dialog.getByLabel(ar ? /^الاسم بالعربية/ : /^Name \(Arabic\)/).getAttribute('dir'), 'rtl')
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => item.id))
    assert.deepEqual(violations, [], `${locale} ${width}: accessibility`)

    // An out-of-range year is caught locally, focus moves to it, nothing is sent.
    await dialog.getByLabel(ar ? /^سنة التأسيس/ : /^Founded year/).fill('1800')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'أدخل عددًا صحيحًا من 1900 إلى 2100.' : 'Enter a whole number from 1900 to 2100.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'company-founded-year', { timeout: 5000 })
    assert.equal(writes.length, 0)

    await dialog.getByLabel(ar ? /^سنة التأسيس/ : /^Founded year/).fill('2020')
    await dialog.getByLabel(ar ? /^الموقع بالعربية/ : /^Location \(Arabic\)/).fill('الرياض')
    await dialog.getByLabel(ar ? /^تظهر في الدليل العام/ : /^Listed in the public directory/).uncheck()
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await page.getByText(ar ? 'حُفظت الشركة.' : 'Company saved.').waitFor()
    assert.equal(writes.length, 1)
    assert.equal(writes[0].method, 'PUT')
    assert.equal(writes[0].body.name, 'Example Logistics', 'the English name is not replaced by the Arabic one')
    assert.equal(writes[0].body.name_ar, 'مثال اللوجستية')
    assert.equal(writes[0].body.sector, 'Logistics')
    assert.equal(writes[0].body.location_ar, 'الرياض')
    assert.equal(writes[0].body.founded_year, 2020)
    assert.equal(writes[0].body.is_public, false)
    assert.equal(writes[0].body.description, 'Freight software.')

    // An API rejection lands under its field in the page language; a taken slug is shown on the name.
    reject = true
    await page.getByRole('button', { name: ar ? 'إضافة شركة' : 'Add company' }).click()
    await dialog.getByLabel(ar ? /^الاسم بالإنجليزية/ : /^Name \(English\)/).fill('Example Logistics')
    await dialog.getByRole('button', { name: ar ? 'حفظ' : 'Save', exact: true }).click()
    await dialog.getByText(ar ? 'لم يقبل الخادم هذه القيمة.' : 'The server did not accept this value.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'company-name', { timeout: 5000 })
    assert.equal(await page.getByText('The slug has already been taken.').count(), 0, 'raw API message is not shown')
    assert.equal(writes[1].method, 'POST')
    assert.equal(writes[1].body.is_public, true)
    assert.equal(writes[1].body.name_ar, null)
    await page.screenshot({ path: `/tmp/admin-companies-${locale}-${width}.png`, fullPage: true })
    await dialog.getByRole('button', { name: ar ? 'إلغاء' : 'Cancel' }).click()

    // Delete is confirmed by name and the list reloads.
    reject = false
    await page.getByRole('button', { name: ar ? 'حذف Sample Health' : 'Delete Sample Health' }).click()
    await page.getByText(ar ? 'حُذفت الشركة.' : 'Company deleted.').waitFor()
    await page.getByText('Sample Health', { exact: true }).waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
    await context.close()
    console.log(`admin companies ${locale} ${width}: ok`)
  }
} finally {
  await browser?.close()
  app.kill()
}
