import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const origin = 'http://127.0.0.1:18085'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18085'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''; app.stdout.on('data', d => log += d); app.stderr.on('data', d => log += d)
let browser
try {
  for (let i=0; i<150 && !log.includes('Ready'); i++) await new Promise(r=>setTimeout(r,100))
  assert.ok(log.includes('Ready'), log)
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined })
  for (const locale of ['ar','en']) for (const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:950}})
    await context.addInitScript(l=>localStorage.setItem('wosool-locale',l),locale)
    let verified=false, submitted=false, registered=false
    const user=()=>({id:900,name:'Test Founder',email:'founder@example.com',roles:[],email_verified_at:verified?'2026-10-28T12:00:00Z':null,registration_step:verified?(submitted?'review':'profile'):'verify'})
    const errors=[]; const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message))
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url()); const p=url.pathname
      if(url.origin!==origin)return route.abort()
      if(!p.startsWith('/api/') && !p.startsWith('/sanctum/'))return route.continue()
      if(p.endsWith('/auth/me'))return route.fulfill({status:registered?200:401,json:registered?{user:user()}:{message:'Unauthenticated'}})
      if(p.endsWith('/auth/register')){registered=true;return route.fulfill({status:201,json:{user:user()}})}
      if(p.endsWith('/auth/registration/verify')){
        if(route.request().postDataJSON().code!=='123456')return route.fulfill({status:422,json:{errors:{code:['Invalid code']}}})
        verified=true;return route.fulfill({json:{user:user()}})
      }
      if(p.endsWith('/registration/application')){
        if(route.request().method()==='POST')submitted=true
        return route.fulfill({json:{step:submitted?'review':'profile',application:submitted?{status:'submitted',onboarding_data:{bio:'Founder'}}:null}})
      }
      return route.fulfill({json:{data:[]}})
    })
    await page.goto(origin+'/apply'); await page.waitForURL('**/register')
    await page.locator('#register-name').fill('Test Founder');await page.locator('#register-email').fill('founder@example.com')
    await page.locator('#register-password').fill('Password123');await page.locator('#register-password-confirmation').fill('Password123')
    await page.locator('input[type=checkbox]').check();await page.locator('button[type=submit]').click()
    await page.waitForURL('**/onboarding');await page.locator('#registration-code').fill('000000')
    await page.locator('form button').first().click();await page.getByRole('alert').filter({ hasText: 'Invalid code' }).waitFor()
    await page.locator('#registration-code').fill(locale==='ar'?'١٢٣٤٥٦':'123456');await page.locator('form button').first().click()
    await page.locator('input[name=full_name]').waitFor()
    for(const [key,value] of Object.entries({full_name:'Test Founder',phone:'+966500000000',position:'Founder',company_name:'Test Company',company_website:'https://example.com',sector:'Software',location:'Riyadh',founded_year:'2024',team_size:'5'}))await page.locator(`[name=${key}]`).fill(value)
    await page.locator('[name=country_code]').selectOption('SA');await page.locator('[name=stage]').selectOption('Seed')
    for(const key of ['bio','company_description','motivation','what_you_offer','what_you_need'])await page.locator(`[name=${key}]`).fill('Building useful software with a community of founders.')
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
    await page.locator('[name=public_profile_consent]').check();await page.locator('form button').last().click()
    await page.getByRole('heading',{name:locale==='ar'?'طلبك لدى فريق وصول':'Your application is with Wosool'}).waitFor()
    assert.equal(submitted,true);assert.deepEqual(errors,[])
    await page.screenshot({path:`/tmp/onboarding-${locale}-${width}.png`,fullPage:true})
    console.log(`PASS ${locale}/${width}: registration, OTP error/recovery, profile and review`)
    await context.close()
  }
} finally {await browser?.close();app.kill('SIGTERM')}
