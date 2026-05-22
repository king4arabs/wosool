"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Search, WifiOff } from "lucide-react"
import { api } from "@/lib/api"
import { getEcho } from "@/lib/realtime"

type RoomParticipant = {
  user_id: number
  role: string
  status: string
  user?: { id: number; name?: string | null; email?: string | null } | null
}

type ChatRoom = {
  id: number
  uuid: string
  type: string
  title: string
  status: string
  last_message_at?: string | null
  participants?: RoomParticipant[]
}

type ChatMessage = {
  id: number
  room_id: number
  sender_user_id: number
  message_type: string
  body: string
  created_at: string
  sender?: { id: number; name?: string | null }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  const loadRooms = useCallback(async () => {
    try {
      const response = await api.get<{ data: ChatRoom[] }>("/member/chat/rooms")
      const list = response.data || []
      setRooms(list)
      if (!activeRoomId && list[0]) {
        setActiveRoomId(list[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الغرف.")
    }
  }, [activeRoomId])

  const loadRoomDetails = useCallback(async (roomId: number) => {
    try {
      const response = await api.get<{ data: { room: ChatRoom; messages: { data: ChatMessage[] } | ChatMessage[] } }>(`/member/chat/rooms/${roomId}`)
      const items = Array.isArray(response.data.messages)
        ? response.data.messages
        : response.data.messages.data
      setMessages(items || [])
      await api.post(`/member/chat/rooms/${roomId}/read`, {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الرسائل.")
    }
  }, [])

  useEffect(() => {
    void loadRooms()
  }, [loadRooms])

  useEffect(() => {
    if (!activeRoomId) return
    void loadRoomDetails(activeRoomId)
  }, [activeRoomId, loadRoomDetails])

  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      setIsRealtimeConnected(false)
      return
    }

    const connector = (echo as unknown as { connector?: { pusher?: { connection?: { bind: (event: string, cb: () => void) => void; unbind: (event: string, cb: () => void) => void } } } }).connector
    const connection = connector?.pusher?.connection

    const onConnected = () => setIsRealtimeConnected(true)
    const onDisconnected = () => setIsRealtimeConnected(false)

    connection?.bind("connected", onConnected)
    connection?.bind("disconnected", onDisconnected)
    connection?.bind("unavailable", onDisconnected)
    connection?.bind("failed", onDisconnected)

    return () => {
      connection?.unbind("connected", onConnected)
      connection?.unbind("disconnected", onDisconnected)
      connection?.unbind("unavailable", onDisconnected)
      connection?.unbind("failed", onDisconnected)
    }
  }, [])

  useEffect(() => {
    if (!activeRoomId) return

    const echo = getEcho()
    if (!echo) return

    const channel = echo.private(`chat.room.${activeRoomId}`)

    channel.listen(".chat.message.created", (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload])
      setRooms((prev) => prev.map((room) => (room.id === activeRoomId ? { ...room, last_message_at: payload.created_at } : room)))
    })

    channel.listen(".chat.typing.updated", (payload: { user_id: number; is_typing: boolean }) => {
      setTypingUsers((prev) => {
        if (payload.is_typing) return prev.includes(payload.user_id) ? prev : [...prev, payload.user_id]
        return prev.filter((id) => id !== payload.user_id)
      })
    })

    channel.listen(".chat.message.read", () => {
      // read receipts are reflected server-side; UI marker can be extended here
    })

    return () => {
      channel.stopListening(".chat.message.created")
      channel.stopListening(".chat.typing.updated")
      channel.stopListening(".chat.message.read")
      echo.leave(`chat.room.${activeRoomId}`)
    }
  }, [activeRoomId])

  const sendTyping = useCallback(async (isTyping: boolean) => {
    if (!activeRoomId) return
    try {
      await api.post(`/member/chat/rooms/${activeRoomId}/typing`, { is_typing: isTyping })
    } catch {
      // ignore typing transport failures
    }
  }, [activeRoomId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeRoomId || !draft.trim()) return

    const optimistic: ChatMessage = {
      id: Date.now() * -1,
      room_id: activeRoomId,
      sender_user_id: -1,
      message_type: "text",
      body: draft.trim(),
      created_at: new Date().toISOString(),
      sender: { id: -1, name: "أنا" },
    }

    setMessages((prev) => [...prev, optimistic])
    const body = draft.trim()
    setDraft("")

    try {
      const response = await api.post<{ data: ChatMessage }>(`/member/chat/rooms/${activeRoomId}/messages`, { body, message_type: "text" })
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? response.data : m)))
      await api.post(`/member/chat/rooms/${activeRoomId}/read`, {})
      await loadRooms()
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة.")
    } finally {
      void sendTyping(false)
    }
  }

  const selected = useMemo(() => rooms.find((room) => room.id === activeRoomId) ?? null, [rooms, activeRoomId])

  if (error) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
  }

  return (
    <div className="h-[calc(100vh-10rem)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="ابحث في الغرف..." className="pl-9" />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  {!isRealtimeConnected ? <WifiOff className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  {isRealtimeConnected ? "اتصال لحظي نشط" : "وضع غير متصل لحظيًا"}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {rooms.map((room) => {
                  const firstParticipant = room.participants?.find((p) => p.user)
                  const displayName = firstParticipant?.user?.name || room.title

                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeRoomId === room.id ? "bg-[#F8F5EF]" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="text-xs">{initials(displayName)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-[#0A1628] truncate">{displayName}</span>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">{room.last_message_at ? new Date(room.last_message_at).toLocaleDateString("ar-SA") : ""}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">{room.type}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0.5">{room.status}</Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(selected?.title || "R")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{selected?.title || "اختر غرفة"}</p>
                  <p className="text-xs text-gray-400">{selected?.type || ""}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender?.name === "أنا" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-[#F8F5EF] text-gray-700">
                      <p>{message.body}</p>
                      <p className="mt-2 text-[11px] text-gray-400">{new Date(message.created_at).toLocaleString("ar-SA")}</p>
                    </div>
                  </div>
                ))}
                {typingUsers.length > 0 ? (
                  <div className="text-xs text-slate-400">أحد المشاركين يكتب الآن...</div>
                ) : null}
              </div>

              <form
                onSubmit={submit}
                className="border-t border-gray-200 p-4 flex gap-3"
              >
                <Input
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value)
                    void sendTyping(event.target.value.trim().length > 0)
                  }}
                  onBlur={() => void sendTyping(false)}
                  placeholder="اكتب رسالة..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!activeRoomId || !draft.trim()}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
