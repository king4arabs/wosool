import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18091'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18091'], {stdio: ['ignore', 'pipe', 'pipe']})
let log = ''
app.stdout.on('data', value => { log += value })
app.stderr.on('data', value => { log += value })
let browser
try {
  for (let i = 0; i < 150 && !log.includes('Ready'); i++) await new Promise(resolve => setTimeout(resolve, 100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined})
  for (const locale of ['ar', 'en']) for (const width of [390, 1440]) {
    const context = await browser.newContext({viewport: {width, height: 1000}})
    await context.addCookies([{name: 'laravel_session', value: 'isolated-test-session', url: origin}])
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    const page = await context.newPage()
    const errors = []; const requests = []; let verified = false
    page.on('pageerror', error => errors.push(error.message))
    const account = {key: 'registered:11', origin: 'registered', user_id: 11, founder_profile_id: null, name: 'Test Founder', email: 'founder@example.com', company: 'Example Company', email_verified: true, admin_verified: false}
    const candidate = {id: 42, founder_uid: 'canonical-founder-uid', slug: 'canonical-founder', name: 'Test Founder', company: 'Example Company', website: 'https://example.com/', signals: ['name', 'company_website']}
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      if (url.pathname.endsWith('/auth/me')) return route.fulfill({json: {user: {id: 1, name: 'Admin', email: 'admin@example.com', roles: ['admin'], email_verified_at: '2026-11-15T09:00:00Z'}}})
      if (url.pathname.endsWith('/admin/users')) return route.fulfill({json: {data: verified ? [{...account, founder_profile_id: 42, admin_verified: true}] : [account, {...account, key: 'invited:42', origin: 'invited', user_id: null, founder_profile_id: 42, founder_uid: candidate.founder_uid, name: 'Imported Founder'}], meta: {total: verified ? 1 : 2, current_page: 1, last_page: 1, registered: 1, invited: verified ? 0 : 1}}})
      if (url.pathname.endsWith('/admin/users/11/identity')) return route.fulfill({json: {data: {user: {id: 11, name: account.name, email: account.email, email_verified: true}, profile: null, application: {full_name: account.name, company_name: account.company, company_website: candidate.website, phone: '+966500000000', onboarding_data: {bio: 'Reviewed registration information.'}}, candidates: [candidate]}}})
      if (url.pathname.endsWith('/admin/users/11/verify')) { requests.push(route.request().postDataJSON()); verified = true; return route.fulfill({json: {data: {status: 'approved'}}}) }
      if (url.pathname.endsWith('/admin/founders/outreach')) { requests.push(route.request().postDataJSON()); return route.fulfill({json: {data: {queued: 1, skipped: 0}}}) }
      return route.fulfill({json: {data: []}})
    })
    const ar = locale === 'ar'
    await page.goto(origin + '/admin/users', {waitUntil: 'networkidle'})
    await page.getByRole('heading', {name: 'Test Founder', exact: true}).waitFor()
    await page.getByRole('button', {name: ar ? 'دعوة جميع المدعوين' : 'Invite all invited records', exact: true}).click()
    let dialog = page.getByRole('dialog')
    await dialog.getByRole('button', {name: ar ? 'جدولة دعوات التسجيل' : 'Queue registration invitations'}).click()
    await dialog.waitFor({state: 'hidden'})
    assert.deepEqual(requests[0], {action: 'invite', all_inactive: true, ids: []})
    await page.getByRole('button', {name: ar ? 'مراجعة المطابقة والتحقق' : 'Review identity & verification'}).click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('radio', {name: /Test Founder/}).check()
    const approve = dialog.getByRole('button', {name: ar ? 'اعتماد الملف وتم التحقق' : 'Approve profile & verify'})
    assert.equal(await approve.isEnabled(), false, 'Administrator must explicitly review identity evidence')
    await dialog.getByRole('checkbox').check()
    assert.equal(await approve.isEnabled(), true)
    await approve.click()
    await dialog.waitFor({state: 'hidden'})
    assert.deepEqual(requests[1], {identity_verified: true, matched_founder_id: 42, create_new_profile: false})
    await page.getByText(ar ? 'تم التحقق' : 'Verified', {exact: true}).waitFor()
    assert.equal(await page.getByRole('heading', {name: 'Imported Founder', exact: true}).count(), 0, 'Claimed source is not duplicated as an invited record')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    assert.deepEqual(errors, [])
    console.log(`PASS ${locale}/${width}: private origins, reviewed bulk invitations, explicit identity selection and canonical verification`)
    await page.screenshot({path: `/tmp/member-identity-${locale}-${width}.png`, fullPage: true})
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
}
