import assert from 'node:assert/strict'
import test from 'node:test'
import { eoaFaqs, defaultEoaFaqs } from './eoa-editorial'
import { eoaJourneyStage } from './eoa-journey'
test('published legacy FAQ cannot replace the current local cohort and membership guidance',()=>{
 const legacy={...defaultEoaFaqs[3],answer_en:'The program runs for two years.'}
 const custom={question_en:'Where do we meet?',question_ar:'أين نلتقي؟',answer_en:'Venue confirmed with the cohort.',answer_ar:'حسب جدول الدفعة.',visible:true}
 const rows=eoaFaqs({version:1,operator:null,faqs:[legacy,custom]})
 assert.match(rows.find(f=>f.question_en===legacy.question_en)!.answer_en,/six months/)
 assert.equal(rows.filter(f=>f.question_en===legacy.question_en).length,1)
 assert.ok(rows.includes(custom))
 assert.match(rows.find(f=>f.question_en.includes('EO membership'))!.answer_en,/all joining requirements/)
})
test('alumni continue in the growth workspace rather than returning to onboarding',()=>{
 assert.equal(eoaJourneyStage('enrolled',true,'alumni'),4)
 assert.equal(eoaJourneyStage(undefined,false,'alumni'),0)
})
