export interface ChatMessage {
  id: number
  room_id: number
  sender_user_id: number
  message_type: string
  body: string
  created_at: string
  sender?: { id: number; name?: string | null }
}

/** A broadcast may arrive before the POST response; render each message once. */
export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[], roomId: number): ChatMessage[] {
  const byId = new Map<number, ChatMessage>()
  for (const message of [...current, ...incoming]) {
    if (message.room_id === roomId) byId.set(message.id, { ...byId.get(message.id), ...message })
  }
  return [...byId.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id)
}
