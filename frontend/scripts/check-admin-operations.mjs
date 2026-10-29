/** Browser contract for admin CRM/PR persistence, analytics controls and priority navigation. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const origin = 'http://127.0.0.1:18091'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18091'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
let browser
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar', 'en']) for (const width of [390, 1440]) {
    const ar = locale === 'ar'; const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    await context.addCookies([{ name: 'laravel_session', value: 'isolated-admin-test', url: origin }])
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message))
    const records = []; const analyticsRequests = []
    let nextId = 1; let failSave = false
    const operations = { open_messages: 4, crm_due: 2, pr_due: 1, crm_open: 5, pr_open: 2, public_members: 12, upcoming_events: 3, follow_ups: [] }
    await context.route('**/*', route => {
      const url = new URL(route.request().url()); const method = route.request().method()
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      const json = body => route.fulfill({ json: body })
      if (url.pathname.endsWith('/auth/me')) return json({ user: { id: 1, name: 'Admin', email: 'admin@example.com', roles: ['admin'] } })
      if (url.pathname.endsWith('/admin/dashboard')) return json({ stats: { total_members: 12, active_founders: 12, companies: 10, events_this_month: 3, pending_applications: 2, published_news: 5, open_programs: 1 }, application_pipeline: { submitted: 2, stale_submitted: 1 }, recent_applications: [], activity: [], operations })
      if (url.pathname.endsWith('/admin/analytics')) {
        const days = Number(url.searchParams.get('days')); analyticsRequests.push(days)
        return json({ data: { period: { days, start: '2026-10-01', end: '2026-10-29', timezone: 'UTC' }, comparison: { current: { signups: 7, applications: 4, approved_applications: 2, approval_rate: 50, rsvps: 0, messages: 3, relationships: 2 }, previous: { signups: 0, applications: 0, approved_applications: 0, approval_rate: null, rsvps: 0, messages: 1, relationships: 0 } }, trend: [{ date: '2026-10-29', signups: 7, applications: 4 }], sector_distribution: [{ sector: 'Software', count: 12 }], operations } })
      }
      if (url.pathname.endsWith('/admin/relationships')) {
        if (method === 'POST') { const data = route.request().postDataJSON(); const record = { ...data, id: nextId++, version: 1, owner: data.owner_id ? { id: 1, name: 'Admin' } : null, activities: [] }; records.push(record); return route.fulfill({ status: 201, json: { data: record } }) }
        const kind = url.searchParams.get('kind'); const all = records.filter(item => item.kind === kind)
        const search = url.searchParams.get('search'); const stage = url.searchParams.get('stage'); const due = url.searchParams.get('due') === '1'
        const filtered = all.filter(item => (!search || `${item.name} ${item.organization}`.includes(search)) && (!stage || item.stage === stage) && (!due || item.follow_up_on))
        return json({ data: filtered, meta: { current_page: 1, last_page: 1, total: filtered.length }, summary: { total: all.length, open: all.length, due: all.filter(item => item.follow_up_on).length, unassigned: 0, stages: Object.fromEntries(all.map(item => [item.stage, 1])) }, owners: [{ id: 1, name: 'Admin' }] })
      }
      const match = url.pathname.match(/\/admin\/relationships\/(\d+)(\/activities)?$/)
      if (match) {
        const record = records.find(item => item.id === Number(match[1])); assert.ok(record)
        if (match[2]) { const activity = { id: record.activities.length + 1, body: route.request().postDataJSON().body, author: { id: 1, name: 'Admin' }, created_at: '2026-10-29T12:00:00Z' }; record.activities.unshift(activity); return route.fulfill({ status: 201, json: { data: activity } }) }
        if (method === 'PUT') {
          if (failSave) return route.fulfill({ status: 409, json: { message: 'This record changed. Reload it before saving.' } })
          const data = route.request().postDataJSON(); assert.equal(data.version, record.version); assert.equal(data.kind, undefined)
          Object.assign(record, data, { version: record.version + 1 })
        }
        return json({ data: record })
      }
      return json({ data: [] })
    })
    async function audit(label) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${label}: no horizontal overflow`)
      await page.addScriptTag({ content: axe })
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })))
      assert.deepEqual(violations, [], `${label}: accessibility`)
      await page.screenshot({ path: `/tmp/admin-operations-${label}-${locale}-${width}.png`, fullPage: true })
    }
    await page.goto(origin + '/admin', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: ar ? 'ما يحتاج انتباهك' : 'Needs your attention' }).waitFor()
    await audit('dashboard')
    await page.locator('a[href="/admin/crm?due=1"]').click()
    await page.getByRole('checkbox', { name: ar ? 'المتابعات المستحقة فقط' : 'Due follow-ups only' }).waitFor()
    assert.ok(await page.getByRole('checkbox').isChecked(), 'Dashboard opens due follow-ups')
    for (const kind of ['crm', 'pr']) {
      await page.goto(origin + '/admin/' + kind, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: ar ? 'سجل جديد' : 'New record', exact: true }).click()
      const form = page.locator('form').filter({ has: page.locator('[name="name"]') })
      await form.locator('[name="name"]').fill(kind === 'crm' ? 'New Founder Contact' : 'Founder launch story')
      await form.locator('[name="organization"]').fill('شبكة الاختبار')
      await form.locator('[name="owner_id"]').selectOption('1')
      await form.locator('[name="follow_up_on"]').fill('2026-10-29')
      await form.locator('[name="campaign"]').fill('Launch')
      if (kind === 'pr') await form.locator('[name="coverage_url"]').fill('https://example.com/story')
      await form.getByRole('button', { name: ar ? 'حفظ السجل' : 'Save record', exact: true }).click()
      await page.getByRole('status').filter({ hasText: ar ? 'تم حفظ السجل' : 'Record saved' }).waitFor()
      await page.getByLabel(ar ? 'إضافة ملاحظة متابعة' : 'Add an activity note', { exact: true }).fill('Meeting complete. Follow up next week.')
      await page.getByRole('button', { name: ar ? 'حفظ الملاحظة' : 'Save note' }).click()
      await page.getByRole('status').filter({ hasText: ar ? 'تم حفظ الملاحظة' : 'Note saved' }).waitFor()
      await form.locator('[name="stage"]').selectOption(kind === 'crm' ? 'in_progress' : 'published')
      await form.getByRole('button', { name: ar ? 'حفظ السجل' : 'Save record', exact: true }).click()
      await page.waitForFunction(() => !document.querySelector('button[type=submit]')?.disabled)
      assert.equal(records.at(-1).stage, kind === 'crm' ? 'in_progress' : 'published')
      await audit(kind)
      const id = records.at(-1).id
      await page.goto(`${origin}/admin/${kind}?record=${id}`, { waitUntil: 'networkidle' })
      await page.getByText('Meeting complete. Follow up next week.', { exact: true }).waitFor()
      assert.equal(await page.locator('[name="stage"]').inputValue(), kind === 'crm' ? 'in_progress' : 'published')
      failSave = true
      await page.locator('[name="notes"]').fill('Unsaved edit must remain')
      await page.getByRole('button', { name: ar ? 'حفظ السجل' : 'Save record', exact: true }).click()
      await page.getByRole('alert').filter({ hasText: 'This record changed' }).waitFor()
      assert.equal(await page.locator('[name="notes"]').inputValue(), 'Unsaved edit must remain')
      failSave = false
    }
    await page.goto(origin + '/admin/analytics', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: ar ? 'تصدير CSV' : 'Export CSV' }).waitFor()
    const periodResponse = page.waitForResponse(response => response.url().includes('/admin/analytics?days=7'))
    await page.getByLabel(ar ? 'الفترة' : 'Period', { exact: true }).selectOption('7')
    await periodResponse
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: ar ? 'تصدير CSV' : 'Export CSV' }).click()
    const download = await downloadPromise
    assert.ok(download.suggestedFilename().endsWith('.csv'))
    const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk)
    const csv = Buffer.concat(chunks).toString('utf8'); assert.ok(csv.includes('2026-10-29')); assert.ok(csv.includes('50'))
    await page.locator('summary').click()
    assert.equal(await page.locator('tbody tr').count(), 1)
    assert.ok(analyticsRequests.includes(30) && analyticsRequests.includes(7))
    await audit('analytics')
    assert.deepEqual(errors, [])
    console.log(`PASS admin operations ${locale}/${width}: priority links, CRM and PR create/update/reload, owner, follow-up, notes, conflict handling, date comparison, CSV export, accessibility`)
    await context.close()
  }
} finally { await browser?.close(); app.kill('SIGTERM'); if (app.exitCode === null) await once(app, 'exit') }
