/** Isolated Arabic/English founder-calendar checks. No production/API writes. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:18091'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18091'], { stdio: ['ignore', 'pipe', 'pipe'] })
let serverLog = ''
app.stdout.on('data', value => { serverLog = (serverLog + value).slice(-6000) })
app.stderr.on('data', value => { serverLog = (serverLog + value).slice(-6000) })
async function eventually(check) {
  for (let attempt = 0; attempt < 160; attempt++) {
    if (await check()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Calendar browser assertion did not settle: ' + serverLog)
}
let browser
try {
  await eventually(() => serverLog.includes('Ready'))
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) })
  for (const locale of ['ar', 'en']) for (const width of [320, 390, 768, 1366]) {
    const ar = locale === 'ar'
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(value => localStorage.setItem('wosool-locale', value), locale)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { data: [], meta: { last_page: 1, total: 0 } } })
      return route.continue()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.clock.setFixedTime(new Date("2026-01-15T09:00:00Z"))
    await page.goto(origin + '/events')
    const calendar = page.locator('#founder-calendar')
    await calendar.getByRole('heading', { name: ar ? 'اختر ما يلهم خطوتك القادمة' : 'Make room for what’s next' }).waitFor()
    assert.equal(await calendar.getByRole('button', { name: ar ? 'الأجندة' : 'Agenda', exact: true }).getAttribute('aria-pressed'), 'true')
    await eventually(async () => await calendar.locator('#programme-overview > summary').count() === 1)
    await calendar.locator('#programme-overview > summary').click()
    for (const name of (ar ? ['مختبر نمو المؤسسين', 'من داخل الأعمال', 'EOA: من مؤسس إلى مؤسس', 'التعلّم الرقمي للدفعة'] : ['Founder growth lab', 'Inside the business', 'EOA peer-to-peer', 'Cohort online learning'])) {
      assert.ok(await calendar.getByText(name, { exact: true }).count() >= 1, 'Original category missing: ' + name)
    }
    const years = calendar.getByRole('combobox', { name: ar ? 'السنة' : 'Year', exact: true })
    await years.selectOption('2027')
    assert.equal(await calendar.locator('[data-calendar-entry]').count(), 8, 'Agenda starts with a manageable page')
    await calendar.getByRole('button', { name: ar ? 'عرض المزيد من المواعيد' : 'Show more dates' }).click()
    assert.ok(await calendar.locator('[data-calendar-entry]').count() > 8, 'More dates remain accessible')
    const activity = calendar.getByRole('combobox', { name: ar ? 'نوع النشاط' : 'Activity type', exact: true })
    await activity.selectOption('ecosystem')
    await calendar.getByRole('button', { name: ar ? 'الأجندة' : 'Agenda', exact: true }).click()
    await eventually(async () => await calendar.locator('[data-calendar-entry="ecosystem-ces-2027"]').count() === 1)
    const ces = calendar.locator('[data-calendar-entry="ecosystem-ces-2027"]')
    assert.equal(await ces.getByRole('link', { name: ar ? 'الموقع الرسمي والتسجيل' : 'Official site & registration' }).count(), 1)
    assert.equal(await ces.locator('details').getAttribute('open'), null, 'Details should start collapsed')
    await ces.locator('summary').click()
    assert.notEqual(await ces.locator('details').getAttribute('open'), null, 'Details open on request')
    await calendar.getByRole('button', { name: ar ? 'التقويم' : 'Calendar', exact: true }).click()
    const dayDetails = calendar.getByRole('complementary', { name: ar ? 'تفاصيل اليوم المحدد' : 'Selected day details' })
    const firstDay = await dayDetails.locator('h3').textContent()
    await dayDetails.getByRole('button', { name: ar ? 'اليوم التالي' : 'Next day' }).click()
    assert.notEqual(await dayDetails.locator('h3').textContent(), firstDay, 'Day-by-day navigation should advance')
    await calendar.getByRole('button', { name: ar ? 'الأجندة' : 'Agenda', exact: true }).click()
    await calendar.getByText(ar ? 'تصفية المؤتمرات' : 'Conference filters', { exact: true }).click()
    await calendar.getByRole('combobox', { name: ar ? 'اختر منطقة المؤتمرات' : 'Conference region' }).selectOption('riyadh')
    await calendar.getByRole('combobox', { name: ar ? 'اختر مجال المؤتمرات' : 'Conference focus' }).selectOption('investment')
    const special = calendar.getByRole('button', { name: ar ? 'الدعوات الخاصة واللقاءات المنتقاة' : 'Invitations & curated meetings' })
    await special.click()
    assert.equal(await special.getAttribute('aria-pressed'), 'true')
    await eventually(async () => await calendar.locator('[data-calendar-entry="ecosystem-superreturn-lp-boardroom-2027"]').count() === 1)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Expanded filters horizontal overflow')
    await activity.selectOption('learning')
    assert.equal(await calendar.getByRole('combobox', { name: ar ? 'اختر منطقة المؤتمرات' : 'Conference region' }).inputValue(), 'all', 'Changing activity clears incompatible conference location')
    assert.equal(await calendar.getByRole('combobox', { name: ar ? 'اختر مجال المؤتمرات' : 'Conference focus' }).inputValue(), 'all')
    assert.equal(await special.getAttribute('aria-pressed'), 'false')
    assert.ok(await calendar.locator('[data-calendar-entry^="plan-learning"]').count() > 0)
    await calendar.getByRole('button', { name: ar ? 'مسح التصفية' : 'Clear filters', exact: true }).first().click()
    await years.selectOption('2029')
    await calendar.getByRole('button', { name: ar ? 'الأجندة' : 'Agenda', exact: true }).click()
    await eventually(async () => await calendar.locator('[data-calendar-entry="ecosystem-ces-2029"]').count() === 1)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Calendar horizontal overflow')
    assert.deepEqual(errors, [], 'Calendar script errors')
    console.log(`PASS worldwide calendar ${locale}/${width}: source, year navigation, original tracks, region/sector and invitation filters`)
    await context.close()
  }
} finally {
  await browser?.close()
  app.kill('SIGTERM')
  if (app.exitCode === null) await once(app, 'exit')
}
