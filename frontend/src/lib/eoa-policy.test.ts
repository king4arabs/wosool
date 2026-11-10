import test from 'node:test'
import assert from 'node:assert/strict'
import { eoaIntakeAction, eoaPolicy, eoaDeliveryStage } from './eoa-policy'
import { eoaGlobalSessions, registrationOpen } from './eoa-calendar'
import { eoaFaqs } from './eoa-editorial'
import { eligibility } from './eoa'
import { eoaAdminTab } from './eoa-admin-navigation'

test('fees remain annual 4000, split 2000/2000 and inclusive of global dues', () => {
  assert.equal(eoaPolicy.globalFee + eoaPolicy.localFee, eoaPolicy.annualFee)
  assert.equal(eoaPolicy.sponsorShare + eoaPolicy.participantShare, 4000)
  assert.equal(eoaPolicy.sponsorShare, 2000)
  assert.equal(eoaPolicy.durationMonths, 24)
})
test('closed and unknown intakes do not invite an unready application', () => {
  assert.equal(eoaIntakeAction(undefined, false).href, '/eoa/contact')
  assert.equal(eoaIntakeAction(false, true).href, '/eoa/contact')
  assert.equal(eoaIntakeAction(true, false).href, '/eoa/apply')
  for (const [n, expected] of [
    [9, 'global_virtual'],
    [10, 'virtual_trainer'],
    [14, 'virtual_trainer'],
    [15, 'in_person'],
  ] as const)
    assert.equal(eoaDeliveryStage(n), expected)
})
test('registration closes exactly 48 hours before the real session, all slots render 09:00 Riyadh', () => {
  for (const s of eoaGlobalSessions) {
    const deadline = Date.parse(s.startsAt) - 48 * 3600000
    assert.equal(registrationOpen(s, deadline - 1), true)
    assert.equal(registrationOpen(s, deadline), false)
    assert.equal(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(s.startsAt)),
      '09:00',
    )
    assert.match(s.registration, /^https:\/\/forms\.monday\.com\/forms\//)
  }
})
test('published legacy fees and six-month completion cannot override current policy', () => {
  const old = {
    question_en: 'What are the participation fees?',
    question_ar: 'ما رسوم المشاركة؟',
    answer_en: 'A different price',
    answer_ar: 'قيمة قديمة',
    visible: true,
  }
  const faqs = eoaFaqs({ version: 1, operator: null, faqs: [old] })
  assert.match(
    faqs.find((f) => f.question_en === old.question_en)!.answer_en,
    /US\$4,000/,
  )
  assert.equal(eligibility(300000, 'USD', true, 'funding'), 'potential')
  assert.equal(eligibility(1000000, 'USD', true, 'funding'), 'review')
  assert.equal(eoaAdminTab('finance', { lead: false }, true), 'overview')
  assert.equal(eoaAdminTab('finance', { lead: true }, true), 'finance')
})
