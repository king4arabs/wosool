import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const origin = 'http://127.0.0.1:18087'
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '18087'], {stdio:['ignore','pipe','pipe']})
let log=''; app.stdout.on('data',d=>log+=d);app.stderr.on('data',d=>log+=d)
let browser
try {
  for(let i=0;i<150&&!log.includes('Ready');i++)await new Promise(r=>setTimeout(r,100))
  assert.ok(log.includes('Ready'),log)
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined})
  for(const locale of ['ar','en'])for(const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000}})
    await context.addCookies([{name:'laravel_session',value:'isolated-test-session',url:origin}])
    await context.addInitScript(l=>localStorage.setItem('wosool-locale',l),locale)
    const requests=[]; const errors=[]; const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message))
    const record={id:42,slug:'founder',name:'Test Founder',status:'active',activation_status:'unclaimed',is_public:true,companies:[],outreach:{status:'review',email:'founder@example.com',evidence:'Founder: founder@example.com',source_url:'https://example.com/team',attempts:1}}
    await context.route('**/*',route=>{
      const url=new URL(route.request().url()); if(url.origin!==origin)return route.abort()
      if(!url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/sanctum/'))return route.continue()
      if(url.pathname.endsWith('/auth/me'))return route.fulfill({json:{user:{id:1,name:'Admin',email:'admin@example.com',roles:['admin']}}})
      if(url.pathname.endsWith('/admin/founders'))return route.fulfill({json:{data:[record],meta:{total:1,last_page:1,current_page:1,unclaimed:22,claimed:0,featured:0}}})
      if(url.pathname.endsWith('/outreach')){requests.push(route.request().postDataJSON());return route.fulfill({json:{data:{queued:1,skipped:0}}})}
      if(url.pathname.endsWith('/recipient')){requests.push(route.request().postDataJSON());return route.fulfill({json:{message:'Saved'}})}
      return route.fulfill({json:{data:[]}})
    })
    await page.goto(origin+'/admin/founders',{waitUntil:'networkidle'})
    const bulk=page.getByRole('region',{name:locale==='ar'?'التفعيل الجماعي':'Bulk activation'})
    await bulk.waitFor()
    await bulk.getByRole('checkbox').check()
    await bulk.getByRole('button',{name:locale==='ar'?'إرسال دعوات التفعيل للمحددين':'Send activation invitations to selection'}).click()
    await page.getByRole('status').filter({hasText:locale==='ar'?'تم تحديث':'profiles updated'}).waitFor()
    assert.deepEqual(requests[0],{action:'invite',all_inactive:true,ids:[]})
    await page.getByRole('checkbox',{name:locale==='ar'?'تحديد Test Founder':'Select Test Founder',exact:true}).check()
    await bulk.getByRole('button',{name:locale==='ar'?'بدء البحث عن البريد المفقود':'Start missing email research'}).click()
    await page.getByRole('status').filter({hasText:locale==='ar'?'تم تحديث':'profiles updated'}).waitFor()
    assert.deepEqual(requests[1],{action:'research',all_inactive:false,ids:[42]})
    await page.getByRole('button',{name:locale==='ar'?'مراجعة البريد واعتماده':'Review and verify email'}).click()
    const form=page.locator('form').filter({has:page.locator('input[name=email]')})
    assert.equal(await form.locator('[name=email]').inputValue(),'founder@example.com')
    await form.locator('[name=verified]').check()
    await form.getByRole('button',{name:locale==='ar'?'اعتماد البريد للتفعيل':'Verify activation recipient'}).click()
    await page.getByRole('status').filter({hasText:locale==='ar'?'تم اعتماد البريد':'Recipient verified'}).waitFor()
    assert.equal(requests[2].recipient_verified,true)
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
    assert.deepEqual(errors,[])
    await page.screenshot({path:`/tmp/founder-outreach-${locale}-${width}.png`,fullPage:true})
    console.log(`PASS ${locale}/${width}: select all, individual selection, research and email review`)
    await context.close()
  }
}finally{await browser?.close();app.kill('SIGTERM')}
