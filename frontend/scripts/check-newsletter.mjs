import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const origin='http://127.0.0.1:18086'
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','18086'],{stdio:['ignore','pipe','pipe']})
let log='';app.stdout.on('data',d=>log+=d);app.stderr.on('data',d=>log+=d)
let browser
try {
  for(let i=0;i<150&&!log.includes('Ready');i++)await new Promise(r=>setTimeout(r,100))
  assert.ok(log.includes('Ready'),log)
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined})
  for(const locale of ['ar','en'])for(const width of [390,1440]) {
    const ctx=await browser.newContext({viewport:{width,height:1000}})
    await ctx.addInitScript(l=>localStorage.setItem('wosool-locale',l),locale)
    const page=await ctx.newPage();const errors=[];const requests=[];let failSignup=404
    page.on('pageerror',e=>errors.push(e.message))
    await ctx.route('**/*',route=>{
      const url=new URL(route.request().url())
      if(url.origin!==origin)return route.abort()
      if(!url.pathname.startsWith('/api/'))return route.continue()
      if(url.pathname.includes('/newsletter/'))requests.push({path:url.pathname,body:route.request().postDataJSON()})
      if(url.pathname.endsWith('/newsletter/subscribe') && failSignup) return route.fulfill({status:failSignup,json:{message:'The route v1/newsletter/subscribe could not be found.'}})
      if(url.pathname.endsWith('/auth/me'))return route.fulfill({status:401,json:{message:'Unauthenticated'}})
      return route.fulfill({json:{data:[],message:'OK'}})
    })
    for (const path of ['/contact', '/founders', '/events', '/news', '/']) {
      failSignup=404;requests.length=0
      await page.goto(origin+path,{waitUntil:'networkidle'})
      await page.waitForFunction(l=>document.documentElement.lang===l && document.querySelectorAll('#newsletter-email').length===1,locale)
      await page.locator('#newsletter-email:visible').fill('reader@example.com')
      const form=page.locator('form').filter({has:page.locator('#newsletter-email:visible')})
      await form.locator('[name=newsletter_consent]').check();await form.locator('button').click()
      await form.getByRole('alert').waitFor()
      assert.doesNotMatch(await form.getByRole('alert').innerText(), /v1\/newsletter|route/)
      assert.match(await form.getByRole('alert').innerText(), /info@wosool.org/)
      assert.equal(await form.getByRole('status').count(),0)
      assert.equal(await form.locator('input[type=email]').inputValue(),'reader@example.com')
      failSignup=503
      await form.locator('button').click()
      await page.waitForFunction(()=>!document.querySelector('#newsletter-email').disabled)
      assert.equal(await form.getByRole('status').count(),0)
      failSignup=false;requests.length=0
      await form.locator('button').click()
      await form.getByRole('status').waitFor()
      assert.equal(requests.length,1)
      assert.equal(requests[0].path,'/api/v1/newsletter/subscribe')
      assert.equal(requests[0].body.email,'reader@example.com');assert.equal(requests[0].body.consent,true)
      assert.equal(requests[0].body.locale,locale)
      assert.equal(await form.locator('input[type=email]').inputValue(),'')
    }
    const token='a'.repeat(64)
    await page.goto(origin+`/newsletter?confirm=1#token=${token}`,{waitUntil:'networkidle'})
    assert.equal(requests.length,1,'No automatic mutation by email-link scanners')
    await page.locator('main button').click();await page.locator('main').getByRole('status').waitFor()
    assert.equal(requests[1].path,'/api/v1/newsletter/confirm');assert.equal(requests[1].body.token,token)
    assert.equal(new URL(page.url()).hash,'')
    await page.goto(origin+`/newsletter?unsubscribe=1#token=${token}`,{waitUntil:'networkidle'})
    await page.locator('main button').click();await page.locator('main').getByRole('status').waitFor()
    assert.equal(requests[2].path,'/api/v1/newsletter/unsubscribe')
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
    assert.deepEqual(errors,[])
    await page.locator('footer section').screenshot({path:`/tmp/newsletter-${locale}-${width}.png`})
    console.log(`PASS newsletter ${locale}/${width}`);await ctx.close()
  }
} finally {await browser?.close();app.kill('SIGTERM')}
