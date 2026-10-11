import assert from 'node:assert/strict'
import test from 'node:test'
import { filterMentors, mentorExpertise, mentorExternalUrl, mentorPortraitUrl, mentorText, publicMentors, type EoaMentor } from './eoa-mentors'

const profile = (id: number, overrides: Partial<EoaMentor> = {}) => ({
  id, name_en: 'Riyadh Founder', name_ar: 'مؤسس الرياض', company_name_en: 'Growth Company', company_name_ar: 'شركة النمو', position_en: 'Mentor', position_ar: 'مرشد', bio_en: 'Supports growth strategy.', bio_ar: 'يدعم استراتيجية النمو.', expertise_en: ['Strategy', 'Cash'], expertise_ar: ['الاستراتيجية', 'النقد'], display_order: id, is_active: true, publication_status: 'published', ...overrides,
}) as EoaMentor

test('mentor directory shows active published appointments only and keeps defined order', () => {
  const input = [profile(4, { display_order: 1 }), profile(2), profile(2), profile(1, { publication_status: 'draft' }), profile(5, { is_active: false }), profile(6, { appointment_status: 'draft' }), profile(7, { public_consent: false })]
  assert.deepEqual(publicMentors(input).map(mentor => mentor.id), [4, 2])
  assert.equal(input.length, 7)
})

test('mentor search covers both languages, company and expertise without changing source records', () => {
  const input = [profile(1), profile(2, { name_en: 'Operations Advisor', name_ar: 'مستشار التشغيل', company_name_en: 'Second Company', company_name_ar: 'الشركة الثانية', expertise_en: ['Operations'], expertise_ar: ['التشغيل'] })]
  assert.deepEqual(filterMentors(input, ' growth company ', '').map(mentor => mentor.id), [1])
  assert.deepEqual(filterMentors(input, 'مستشار', '').map(mentor => mentor.id), [2])
  assert.deepEqual(filterMentors(input, '', 'Cash').map(mentor => mentor.id), [1])
  assert.deepEqual(filterMentors(input, 'operations', 'النقد'), [])
  assert.equal(input.length, 2)
})

test('mentor links accept official HTTP(S) addresses and reject unsafe or credential-bearing URLs', () => {
  for (const value of ['', null, '//example.org', '/profile', 'javascript:alert(1)', 'data:text/html,test', 'https://user:secret@example.org']) assert.equal(mentorExternalUrl(value), null)
  assert.equal(mentorExternalUrl(' https://www.linkedin.com/in/mentor/ '), 'https://www.linkedin.com/in/mentor/')
  assert.equal(mentorExternalUrl('http://company.example'), 'http://company.example/')
  assert.equal(mentorPortraitUrl('/storage/eoa/mentors/person.webp'), '/storage/eoa/mentors/person.webp')
  assert.equal(mentorPortraitUrl('/eoa/mentors/person.jpg'), '/eoa/mentors/person.jpg')
  assert.equal(mentorPortraitUrl('/storage/eoa/mentors/../private.png'), null)
  assert.equal(mentorPortraitUrl('//example.org/person.jpg'), null)
})

test('missing Arabic content falls back to supplied English without inventing biographies or expertise', () => {
  assert.equal(mentorText(true, null, 'Mentor name'), 'Mentor name')
  assert.equal(mentorText(false, 'اسم المرشد', null), 'اسم المرشد')
  assert.equal(mentorText(true, null, null), '')
  assert.deepEqual(mentorExpertise(profile(1, { expertise_ar: [] }), true), ['Strategy', 'Cash'])
  assert.deepEqual(mentorExpertise(profile(1, { expertise_ar: [], expertise_en: [] }), true), [])
})
