import {test} from 'node:test'
import assert from 'node:assert/strict'
import {profileCompletion} from './profile-completion'
test('empty text and empty matching lists do not count as completed profile fields', () => {
  assert.equal(profileCompletion({bio:' ', needs:[], offers:[' ']}),0)
  assert.equal(profileCompletion({bio:'Founder biography', needs:['Product feedback']}),22)
})
test('a fully completed profile has the same 100 percent score for saved and draft fields', () => {
  assert.equal(profileCompletion({tagline:'Founder',bio:'Biography',location:'Riyadh',sector:'SaaS',stage:'seed',linkedin_url:'https://linkedin.com/in/example',website_url:'https://example.com',needs:['Feedback'],offers:['Mentoring']}),100)
})
