import assert from "node:assert/strict"
import test from "node:test"
import { mergeMessages, type ChatMessage } from "./chat"
const message = (id: number, room_id = 2): ChatMessage => ({ id, room_id, sender_user_id: 8, message_type: "text", body: `Message ${id}`, created_at: "2026-10-09T09:00:00Z" })
test("messages are chronological, deduplicated across transport responses, and isolated by room", () => {
  const current = [message(3), { ...message(2), body: "broadcast" }]
  const result = mergeMessages(current, [message(1), { ...message(2), body: "persisted" }, message(9, 5)], 2)
  assert.deepEqual(result.map(item => item.id), [1, 2, 3])
  assert.equal(result[1].body, "persisted")
  assert.equal(current[1].body, "broadcast")
  assert.deepEqual(mergeMessages(current, [message(9, 5)], 5).map(item => item.id), [9])
})
