/** Browser check for /admin/scorecards: both languages, labelled fields, override validation, invitations and errors. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18098'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18098'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const initial = () => [
  { id: 1, founder_profile_id: 11, founder_name: 'Sara Example', founder_uid: 'WF-0001', founder_slug: 'sara-example', founder_status: 'active', founder_is_public: true, user_email: null, email_verified: false, invitation_email: 'sara@example.com', aggregate_score: 60, momentum: 55, growth: 70, readiness: 40, support_delta: 10, updated_at: '2026-11-01T09:00:00Z' },
  { id: 2, founder_profile_id: 12, founder_name: null, founder_uid: null, founder_slug: 'pending-founder', founder_status: 'pending', founder_is_public: false, user_email: 'pending@example.com', email_verified: false, invitation_email: null, aggregate_score: 30, momentum: 20, growth: 25, readiness: 35, support_delta: 0, updated_at: null },
]
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
    const writes = []; let stored = initial(); let rejectOverride = false; let mailStatus = 200
    await context.route('**/*', route => {
      const url = new URL(route.request().url()); const method = route.request().method()
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { user: { id: 1, name: 'Admin', email: 'admin@example.com', email_verified_at: '2026-10-01T00:00:00Z', roles: ['admin'] } } })
      if (url.pathname.endsWith('/admin/scorecards') && method === 'GET') {
        return route.fulfill({ json: { data: stored, meta: { current_page: 1, total: stored.length, per_page: 20 } } })
      }
      const override = url.pathname.match(/\/admin\/scorecards\/(\d+)\/override$/)
      if (override) {
        const body = route.request().postDataJSON(); writes.push({ kind: 'override', body })
        if (rejectOverride) return route.fulfill({ status: 422, json: { message: 'The growth field must be between 1 and 100.', errors: { growth: ['The growth field must be between 1 and 100.'] } } })
        stored = stored.map(item => item.id === Number(override[1]) ? { ...item, ...Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'override_note')) } : item)
        return route.fulfill({ json: { message: 'Scorecard override applied.' } })
      }
      if (/\/admin\/founders\/\d+\/invite$/.test(url.pathname)) {
        writes.push({ kind: 'invite', body: route.request().postDataJSON() })
        if (mailStatus === 503) return route.fulfill({ status: 503, json: { message: 'Configure a delivering mail transport before sending invitations.' } })
        return route.fulfill({ json: { message: 'Invitation accepted by the mail transport.' } })
      }
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      return route.fulfill({ json: { data: [] } })
    })
    await page.goto(origin + '/admin/scorecards', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 2, name: ar ? 'بطاقات التقييم' : 'Scorecards' }).waitFor()
    await page.getByText('Sara Example').first().waitFor()
    await page.getByText(ar ? 'مؤسس رقم 12' : 'Founder #12').waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dir), ar ? 'rtl' : 'ltr')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: horizontal overflow`)

    await page.getByRole('button', { name: /^Sara Example/ }).click()
    const growth = page.getByLabel(ar ? 'النمو' : 'Growth', { exact: true })
    await growth.waitFor()
    assert.equal(await page.getByLabel(ar ? /^بريد المؤسس/ : /^Founder email/).inputValue(), 'sara@example.com')
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => `${item.id}: ${item.nodes.map(node => node.target.join(' ') + ' ' + (node.any[0]?.message ?? '')).join(' | ')}`))
    assert.deepEqual(violations, [], `${locale} ${width}: accessibility`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: overflow with the panel open`)

    // A score that is not a whole number is caught locally (it used to be sent as null), with focus on it.
    const apply = page.getByRole('button', { name: ar ? 'تطبيق التعديل' : 'Apply override' })
    await growth.fill('7a')
    await page.getByLabel(ar ? /^سبب التعديل/ : /^Reason for the override/).fill('Board review')
    await apply.click()
    await page.getByText(ar ? 'أدخل عددًا صحيحًا من 1 إلى 100.' : 'Enter a whole number from 1 to 100.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'scorecard-growth', { timeout: 5000 })
    assert.equal(writes.length, 0)

    // A valid override sends only the entered scores, as integers, and the current value updates.
    await growth.fill('80')
    await page.getByLabel(ar ? 'فجوة الدعم' : 'Support gap', { exact: true }).fill('0')
    await apply.click()
    await page.getByText(ar ? 'طُبّق التعديل وسُجّل في سجل التدقيق.' : 'Override applied and recorded in the audit log.').waitFor()
    assert.deepEqual(writes[0].body, { growth: 80, support_delta: 0, override_note: 'Board review' })
    await page.locator('dd', { hasText: /^80$/ }).waitFor()

    // An API rejection lands under its field in the page language.
    rejectOverride = true
    await growth.fill('90')
    await page.getByLabel(ar ? /^سبب التعديل/ : /^Reason for the override/).fill('Second review')
    await apply.click()
    await page.getByText(ar ? 'لم يقبل الخادم هذه القيمة.' : 'The server did not accept this value.').waitFor()
    await page.waitForFunction(id => document.activeElement?.id === id, 'scorecard-growth', { timeout: 5000 })
    assert.equal(await page.getByText('The growth field must be').count(), 0, 'raw API message is not shown')

    // Invitations: confirmation required locally; a mail failure is explained in the page language.
    const send = page.getByRole('button', { name: ar ? 'إرسال دعوة التفعيل' : 'Send activation invitation' })
    await page.getByLabel(ar ? /^كيف تحققت/ : /^How did you verify/).fill('Confirmed on a call with the founder')
    await send.click()
    await page.getByText(ar ? 'أكّد أنك تحققت من البريد قبل الإرسال.' : 'Confirm that you verified the address before sending.').waitFor()
    assert.equal(writes.length, 2)
    await page.getByLabel(ar ? /^تحققت أن هذا البريد/ : /^I verified this address/).check()
    mailStatus = 503
    await send.click()
    await page.getByText(ar ? /خادم البريد غير مهيأ/ : /Mail is not configured/).waitFor()
    assert.equal(await page.getByText('Configure a delivering mail transport').count(), 0, 'raw API message is not shown')
    mailStatus = 200
    await send.click()
    await page.getByText(ar ? /قبل خادم البريد دعوة التفعيل/ : /accepted the activation invitation/).waitFor()
    assert.deepEqual(writes.at(-1).body, { email: 'sara@example.com', recipient_evidence: 'Confirmed on a call with the founder', recipient_verified: true })
    await page.screenshot({ path: `/tmp/admin-operations-scorecards-${locale}-${width}.png`, fullPage: true })

    // A pending profile offers no email action.
    await page.getByRole('button', { name: ar ? /^مؤسس رقم 12/ : /^Founder #12/ }).click()
    await page.getByText(ar ? 'لا يمكن إرسال بريد إلا لملف نشط.' : 'Email can only be sent for an active profile.').waitFor()
    assert.equal(await page.getByRole('button', { name: ar ? 'إرسال رسالة التوثيق' : 'Send verification email' }).count(), 0)
    assert.deepEqual(errors, [])
    await context.close()
    console.log(`admin scorecards ${locale} ${width}: ok`)
  }
} finally {
  await browser?.close()
  app.kill()
}
