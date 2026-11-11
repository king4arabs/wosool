/** Browser check for /admin/settings: both languages, labelled fields, validation and saving. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18093'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18093'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', v => log += v); app.stderr.on('data', v => log += v)
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const settings = () => ({
  general: { site_name: 'Wosool', site_url: 'https://wosool.org', site_description: 'Founder community', timezone: 'Asia/Riyadh', default_language: 'en', maintenance_mode: false, registration_open: true },
  email: { from_name: 'Wosool', from_email: 'hello@wosool.org', reply_to: 'support@wosool.org', smtp_host: 'smtp.resend.com', notifications: { weekly_digest: true } },
  security: { require_2fa: true, session_timeout_minutes: 30, password_policy: 'Minimum 12 characters.', api_rate_limit: 100 },
})
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
    const puts = []; let stored = settings(); let reject = false
    await context.route('**/*', route => {
      const url = new URL(route.request().url()); const method = route.request().method()
      if (url.origin !== origin) return route.abort()
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/sanctum/')) return route.continue()
      if (url.pathname.endsWith('/auth/me')) return route.fulfill({ json: { user: { id: 1, name: 'Admin', email: 'admin@example.com', email_verified_at: '2026-10-01T00:00:00Z', roles: ['admin'] } } })
      if (url.pathname.endsWith('/admin/settings')) {
        if (method === 'PUT') {
          const body = route.request().postDataJSON(); puts.push(body)
          if (reject) return route.fulfill({ status: 422, json: { message: 'The general.site url field must be a valid URL.', errors: { 'general.site_url': ['The general.site url field must be a valid URL.'] } } })
          stored = body
        }
        return route.fulfill({ json: { data: stored } })
      }
      if (url.pathname.endsWith('/eoa/program')) return route.fulfill({ json: { data: null } })
      return route.fulfill({ json: { data: [] } })
    })
    await page.goto(origin + '/admin/settings', { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 2, name: ar ? 'الإعدادات' : 'Settings' }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dir), ar ? 'rtl' : 'ltr')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${locale} ${width}: horizontal overflow`)
    const timeout = page.getByLabel(ar ? /مدة الجلسة/ : /Session timeout/)
    assert.equal(await timeout.inputValue(), '30')
    await page.addScriptTag({ content: axe })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => item.id))
    assert.deepEqual(violations, [], `${locale} ${width}: accessibility`)

    // Out-of-range value: caught locally, focus moves to the field, nothing is sent.
    await timeout.fill('2')
    await page.getByRole('button', { name: ar ? 'حفظ التغييرات' : 'Save changes' }).click()
    await page.getByText(ar ? 'أدخل عددًا صحيحًا من 5 إلى 1440.' : 'Enter a whole number from 5 to 1440.').waitFor()
    assert.equal(await timeout.getAttribute('aria-invalid'), 'true')
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'setting-security-session-timeout-minutes')
    assert.equal(puts.length, 0)

    // Valid save: number is sent as an integer and untouched values round-trip.
    await timeout.fill('45')
    await page.getByRole('button', { name: ar ? 'حفظ التغييرات' : 'Save changes' }).click()
    await page.getByText(ar ? 'حُفظت الإعدادات.' : 'Settings saved.').waitFor()
    assert.equal(puts.length, 1)
    assert.equal(puts[0].security.session_timeout_minutes, 45)
    assert.equal(puts[0].general.timezone, 'Asia/Riyadh')
    assert.deepEqual(puts[0].email.notifications, { weekly_digest: true })

    // API rejection: shown under the field in the page language.
    reject = true
    await page.getByRole('button', { name: ar ? 'حفظ التغييرات' : 'Save changes' }).click()
    await page.getByText(ar ? 'لم يقبل الخادم هذه القيمة.' : 'The server did not accept this value.').waitFor()
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'setting-general-site-url')
    assert.equal(await page.getByText('The general.site url field').count(), 0, 'raw API message is not shown')
    await page.screenshot({ path: `/tmp/admin-operations-settings-${locale}-${width}.png`, fullPage: true })
    assert.deepEqual(errors, [])
    await context.close()
    console.log(`admin settings ${locale} ${width}: ok`)
  }
} finally {
  await browser?.close()
  app.kill()
}
