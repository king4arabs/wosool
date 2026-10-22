"use client"

import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Search, ArrowLeft, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { getEcho } from "@/lib/realtime"
import { mergeMessages, type ChatMessage } from "@/lib/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ChatRoom = { id: number; title: string; status: string; last_message_at?: string | null; participants?: Array<{ user_id: number; user?: { name?: string | null } }> }
type RoomResponse = { data: { room: ChatRoom; messages: { data: ChatMessage[] } | ChatMessage[] }; meta?: { last_page: number } }

export default function MessagesPage() {
  const { user } = useAuth()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const params = useSearchParams()
  const roomParam = Number(params.get("room"))
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomPage, setRoomPage] = useState(1)
  const [roomLastPage, setRoomLastPage] = useState(1)
  const [activeRoomId, setActiveRoomId] = useState<number | null>(roomParam > 0 ? roomParam : null)
  const activeRef = useRef(activeRoomId)
  const [selected, setSelected] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const sendLock = useRef(false)
  const [attempt, setAttempt] = useState(0)
  const bottom = useRef<HTMLDivElement>(null)
  const draft = activeRoomId ? drafts[activeRoomId] ?? "" : ""
  const copy = (arabic: string, english: string) => ar ? arabic : english
  const showError = useCallback((error: unknown) => setError(error instanceof Error ? error.message : (locale === "ar" ? "تعذر تحميل المحادثة." : "Unable to load conversation.")), [locale])

  useEffect(() => {
    const timer = setTimeout(() => { setRoomPage(1); setQuery(search.trim()) }, 300)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => {
    const controller = new AbortController()
    setRoomsLoading(true); setError(null)
    api.get<{ data: ChatRoom[]; meta?: { last_page: number } }>("/member/chat/rooms", { params: { q: query, page: roomPage }, signal: controller.signal })
      .then(response => { setRooms(response.data); setRoomLastPage(response.meta?.last_page ?? 1) })
      .catch(error => { if (!controller.signal.aborted) showError(error) })
      .finally(() => { if (!controller.signal.aborted) setRoomsLoading(false) })
    return () => controller.abort()
  }, [query, roomPage, attempt, showError])

  const loadMessages = useCallback(async (roomId: number, nextPage: number, signal?: AbortSignal) => {
    const response = await api.get<RoomResponse>(`/member/chat/rooms/${roomId}`, { params: { page: nextPage }, signal })
    if (activeRef.current !== roomId || signal?.aborted) return
    const incoming = Array.isArray(response.data.messages) ? response.data.messages : response.data.messages.data
    setMessages(current => mergeMessages(current, incoming, roomId))
    setSelected(response.data.room)
    setLastPage(response.meta?.last_page ?? 1)
    if (nextPage === 1 && incoming.length) {
      const newestId = Math.max(...incoming.map(message => message.id))
      // Read receipts must never turn a successful load or send into a failure.
      void api.post(`/member/chat/rooms/${roomId}/read`, { last_read_message_id: newestId }).catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    activeRef.current = activeRoomId
    setMessages([]); setSelected(null); setPage(1); setError(null)
    if (!activeRoomId) return
    const controller = new AbortController()
    setMessagesLoading(true)
    void loadMessages(activeRoomId, 1, controller.signal).catch(error => { if (!controller.signal.aborted) showError(error) }).finally(() => { if (!controller.signal.aborted) setMessagesLoading(false) })
    // HTTP refresh also works when realtime has not been configured or disconnects.
    let polling = false
    const timer = setInterval(async () => {
      if (document.hidden || polling) return
      polling = true
      try { await loadMessages(activeRoomId, 1, controller.signal) } catch { /* Keep the visible history and manual retry available. */ }
      finally { polling = false }
    }, 15000)
    return () => { controller.abort(); clearInterval(timer) }
  }, [activeRoomId, loadMessages, showError, attempt])

  useEffect(() => {
    if (!activeRoomId) return
    const echo = getEcho()
    if (!echo) return
    const channel = echo.private(`chat.room.${activeRoomId}`)
    channel.listen(".chat.message.created", (message: ChatMessage) => {
      if (activeRef.current === activeRoomId) setMessages(current => mergeMessages(current, [message], activeRoomId))
    })
    return () => { channel.stopListening(".chat.message.created"); echo.leave(`chat.room.${activeRoomId}`) }
  }, [activeRoomId])

  const newestId = messages.at(-1)?.id
  useEffect(() => { if (page === 1) bottom.current?.scrollIntoView({ block: "nearest" }) }, [newestId, page])

  async function send(event: FormEvent) {
    event.preventDefault()
    const roomId = activeRoomId
    const body = draft.trim()
    if (!roomId || !body || sendLock.current) return
    sendLock.current = true; setSending(true); setError(null)
    try {
      const response = await api.post<{ data: ChatMessage }>(`/member/chat/rooms/${roomId}/messages`, { body, message_type: "text" })
      if (activeRef.current === roomId) setMessages(current => mergeMessages(current, [response.data], roomId))
      setDrafts(current => current[roomId]?.trim() === body ? { ...current, [roomId]: "" } : current)
      setRooms(current => current.map(room => room.id === roomId ? { ...room, last_message_at: response.data.created_at } : room))
    } catch (error) { showError(error) }
    finally { sendLock.current = false; setSending(false) }
  }

  async function older() {
    if (!activeRoomId || messagesLoading || page >= lastPage) return
    setMessagesLoading(true)
    const roomId = activeRoomId
    try { await loadMessages(roomId, page + 1); if (activeRef.current === roomId) setPage(value => value + 1) }
    catch (error) { showError(error) }
    finally { if (activeRef.current === roomId) setMessagesLoading(false) }
  }

  return <div className="space-y-3">
    <h1 className="text-2xl font-bold">{copy("الرسائل", "Messages")}</h1>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3"><p>{error}</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)}>{copy("إعادة المحاولة", "Try again")}</Button></div>}
    <div className="flex h-[70dvh] min-h-[28rem] overflow-hidden rounded-2xl border bg-white">
      <aside className={`${activeRoomId ? "hidden md:flex" : "flex"} w-full flex-col border-e md:w-72 lg:w-80 shrink-0`} aria-label={copy("المحادثات", "Conversations")}>
        <div className="border-b p-3"><div className="relative"><Search className="pointer-events-none absolute start-3 top-4 h-4 w-4 text-slate-400" /><Input type="search" value={search} onChange={event => setSearch(event.target.value)} className="ps-10" aria-label={copy("ابحث في المحادثات", "Search conversations")} placeholder={copy("ابحث في المحادثات", "Search conversations")} /></div></div>
        <div className="flex-1 overflow-y-auto">
          {roomsLoading && <p role="status" className="p-4">{copy("جارٍ التحميل…", "Loading…")}</p>}
          {!roomsLoading && !rooms.length && <p className="p-4 text-sm text-slate-500">{copy("لا توجد محادثات مطابقة. تبدأ المحادثة بعد قبول التعارف أو طلب المساعدة.", "No matching conversations. Conversations open after an introduction or help request.")}</p>}
          {rooms.map(room => <button type="button" key={room.id} onClick={() => { activeRef.current = room.id; setActiveRoomId(room.id) }} aria-current={activeRoomId === room.id ? "true" : undefined} className={`w-full border-b p-4 text-start hover:bg-slate-50 ${activeRoomId === room.id ? "bg-[#EEF1FF]" : ""}`}><span className="block font-semibold">{room.title}</span><time className="mt-1 block text-xs text-slate-500">{room.last_message_at ? new Date(room.last_message_at).toLocaleDateString(ar ? "ar-SA" : "en-GB") : ""}</time></button>)}
        </div>
        {roomLastPage > 1 && <nav className="flex justify-between gap-2 border-t p-2"><Button variant="ghost" disabled={roomPage <= 1 || roomsLoading} onClick={() => setRoomPage(value => value - 1)}>{copy("السابق", "Previous")}</Button><Button variant="ghost" disabled={roomPage >= roomLastPage || roomsLoading} onClick={() => setRoomPage(value => value + 1)}>{copy("التالي", "Next")}</Button></nav>}
      </aside>
      <section className={`${activeRoomId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`} aria-label={copy("الرسائل", "Messages")}>
        <div className="flex min-h-16 items-center gap-2 border-b p-3"><button type="button" className="min-h-11 min-w-11 md:hidden" aria-label={copy("العودة للمحادثات", "Back to conversations")} onClick={() => { activeRef.current = null; setActiveRoomId(null) }}><ArrowLeft className="mx-auto h-5 w-5 rtl:rotate-180" /></button><h2 className="min-w-0 flex-1 font-semibold">{selected?.title || copy("اختر محادثة", "Select a conversation")}</h2>{activeRoomId && <Button variant="ghost" aria-label={copy("تحديث الرسائل", "Refresh messages")} onClick={() => setAttempt(value => value + 1)}><RefreshCw className="h-4 w-4" /></Button>}</div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" role="log" aria-live="polite" aria-relevant="additions text">
          {messagesLoading && <p role="status">{copy("جارٍ تحميل الرسائل…", "Loading messages…")}</p>}
          {page < lastPage && <Button variant="outline" onClick={() => void older()} disabled={messagesLoading}>{copy("رسائل أقدم", "Older messages")}</Button>}
          {!messagesLoading && activeRoomId && !messages.length && <p className="text-sm text-slate-500">{copy("ابدأ المحادثة برسالتك الأولى.", "Start with your first message.")}</p>}
          {messages.map(message => { const mine = Number(message.sender_user_id) === Number(user?.id); return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${mine ? "bg-[#EEF1FF] text-slate-900" : "bg-slate-100 text-slate-800"}`}><p className="mb-1 text-xs font-semibold">{mine ? copy("أنت", "You") : message.sender?.name || selected?.participants?.find(participant => participant.user_id === message.sender_user_id)?.user?.name}</p><p dir="auto" className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.body}</p><time className="mt-2 block text-xs text-slate-500">{new Date(message.created_at).toLocaleString(ar ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short" })}</time></div></div> })}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className="flex items-end gap-2 border-t p-3"><Textarea disabled={!activeRoomId || sending} value={draft} maxLength={12000} onChange={event => { if (activeRoomId) setDrafts(current => ({ ...current, [activeRoomId]: event.target.value })) }} aria-label={copy("رسالتك", "Your message")} placeholder={copy("اكتب رسالة…", "Write a message…")} className="min-h-12 max-h-32 flex-1" rows={2} /><Button type="submit" loading={sending} disabled={!activeRoomId || !draft.trim() || selected?.status === "closed" || selected?.status === "archived"} aria-label={copy("إرسال الرسالة", "Send message")}><Send className="h-5 w-5" /></Button></form>
      </section>
    </div>
  </div>
}
