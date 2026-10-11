import assert from 'node:assert/strict'
import test from 'node:test'
import { learningSummary } from './eoa-management'
test('learning summary separates attendance records from registration and goals',()=>{
 assert.deepEqual(learningSummary([{title:'Cash',completed:true},{title:'People',completed:false}],[{status:'attended'},{status:'absent'},{status:'excused'},{status:'registered'}]),{total:2,completed:1,attended:1,recorded:3})
 assert.deepEqual(learningSummary([],[]),{total:0,completed:0,attended:0,recorded:0})
})
