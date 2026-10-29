import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const origin='http://127.0.0.1:18088'
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','18088'],{stdio:['ignore','pipe','pipe']})
let log='';app.stdout.on('data',v=>log+=v);app.stderr.on('data',v=>log+=v)
let browser
try {
  for(let i=0;i<150&&!log.includes('Ready');i++)await new Promise(r=>setTimeout(r,100))
  assert.ok(log.includes('Ready'),log)
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined})
  for(const locale of ['ar','en'])for(const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'})
    await context.addInitScript(l=>localStorage.setItem('wosool-locale',l),locale)
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());if(url.origin!==origin)return route.abort()
      if(url.pathname.startsWith('/api/'))return route.fulfill({json:{data:[],meta:{total:0,last_page:1}}})
      return route.continue()
    })
    await page.goto(origin+'/partners',{waitUntil:'networkidle'})
    const section=page.locator('section[aria-labelledby="partnership-opportunities"]')
    await section.getByRole('heading',{name:locale==='ar'?'فرص الشراكة':'Partnership opportunities'}).waitFor()
    const strip=section.locator('[data-partner-marquee]')
    assert.equal(await strip.locator('img').count(),160)
    const failed=await strip.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||!img.naturalWidth).map(img=>img.getAttribute('src')))
    assert.deepEqual(failed,[], 'Every logo must load')
    const track=strip.locator(':scope > div')
    const transform=()=>track.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
    const before=await transform();await strip.hover();await page.waitForTimeout(600);const after=await transform()
    assert.ok(after>before,'Artwork keeps moving physically right on hover in both languages')
    assert.equal(await track.evaluate(el=>getComputedStyle(el).animationPlayState),'running')
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
    assert.ok(await strip.locator('img').evaluateAll(images=>images.every(img=>getComputedStyle(img).objectFit==='contain')))
    await section.getByRole('button',{name:locale==='ar'?'البنوك':'Banks',exact:true}).click()
    assert.equal(await strip.locator('img').count(),24)
    await section.locator('summary').click()
    assert.equal(await section.locator('ul a').count(),12)
    await section.screenshot({path:`/tmp/partner-ecosystem-${locale}-${width}.png`})
    await page.emulateMedia({reducedMotion:'reduce'})
    assert.equal(await track.evaluate(el=>getComputedStyle(el).animationName),'none')
    assert.deepEqual(errors,[])
    console.log(`PASS ${locale}/${width}: 80 logos, rightward motion, no hover pause, category filters, responsive layout, reduced motion`)
    await context.close()
  }
}finally{await browser?.close();app.kill('SIGTERM')}
