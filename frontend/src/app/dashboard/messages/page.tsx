"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Search } from "lucide-react"
import { api } from "@/lib/api"

type ThreadSummary = {
  thread_id: string
  last_message: string
  last_message_at?: string | null
  unread_count: number
  counterparty?: { id: number; name?: string | null; email?: string | null }
}

type ThreadDetails = {
  data: {
    thread_id: string
    messages: Array<{
      id: number
      body: string
      created_at: string
      sender?: { id: number; name?: string | null }
    }>
  }
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<ThreadDetails["data"]["messages"]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadThreads = useCallback(() =>
    api.get<{ data: ThreadSummary[] }>("/member/threads")
      .then((response) => {
        setThreads(response.data)
        if (!activeThread && response.data[0]) {
          setActiveThread(response.data[0].thread_id)
        }
      })
      .catch((err: Error) => setError(err.message)), [activeThread])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (!activeThread) return
    api.get<ThreadDetails>(`/member/threads/${activeThread}`)
      .then((response) => setMessages(response.data.messages))
      .catch((err: Error) => setError(err.message))
  }, [activeThread])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeThread || !draft.trim()) return
    await api.post(`/member/threads/${activeThread}/messages`, { body: draft.trim() })
    setDraft("")
    const response = await api.get<ThreadDetails>(`/member/threads/${activeThread}`)
    setMessages(response.data.messages)
    await loadThreads()
  }

  const selected = threads.find((thread) => thread.thread_id === activeThread) ?? null

  if (error) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Messaging is rolling out for your account.</div>
  }

  return (
    <div className="h-[calc(100vh-10rem)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search messages..." className="pl-9" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {threads.map((thread) => {
                  const name = thread.counterparty?.name || "Founder"
                  return (
                    <button
                      key={thread.thread_id}
                      onClick={() => setActiveThread(thread.thread_id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeThread === thread.thread_id ? "bg-[#F8F5EF]" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="text-xs">{initials(name)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-[#0A1628] truncate">{name}</span>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                              {thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString("en-US") : ""}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">{thread.last_message}</p>
                        </div>
                        {thread.unread_count > 0 && <Badge variant="gold" className="shrink-0 text-xs px-1.5 py-0.5">{thread.unread_count}</Badge>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(selected?.counterparty?.name || "F")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{selected?.counterparty?.name || "Select a thread"}</p>
                  <p className="text-xs text-gray-400">{selected?.counterparty?.email || ""}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender?.name === selected?.counterparty?.name ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-[#F8F5EF] text-gray-700">
                      <p>{message.body}</p>
                      <p className="mt-2 text-[11px] text-gray-400">{new Date(message.created_at).toLocaleString("en-US")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="border-t border-gray-200 p-4 flex gap-3">
                <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." className="flex-1" />
                <Button type="submit" disabled={!activeThread || !draft.trim()}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
