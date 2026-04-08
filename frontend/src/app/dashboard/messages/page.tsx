"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { founders } from "@/data/seed"
import { Send, Search } from "lucide-react"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

const threads = [
  {
    id: "t1",
    founder: founders[1],
    lastMessage: "Thanks for the investor intro! I'll follow up with them this week.",
    time: "2h ago",
    unread: 0,
    messages: [
      { id: "m1", fromMe: false, text: "Hi Layla! I heard you know some great fintech investors in Riyadh.", time: "Yesterday 10:30 AM" },
      { id: "m2", fromMe: true, text: "Hey Omar! Yes — I can connect you with Wa'ed Ventures. They've been active in healthtech too.", time: "Yesterday 11:15 AM" },
      { id: "m3", fromMe: false, text: "That would be amazing! We're looking to close our seed round this quarter.", time: "Yesterday 11:45 AM" },
      { id: "m4", fromMe: true, text: "I'll make the intro today. Let me know how it goes!", time: "Yesterday 2:00 PM" },
      { id: "m5", fromMe: false, text: "Thanks for the investor intro! I'll follow up with them this week.", time: "2h ago" },
    ],
  },
  {
    id: "t2",
    founder: founders[2],
    lastMessage: "Would love to chat about your experience with Series A fundraising.",
    time: "1d ago",
    unread: 2,
    messages: [
      { id: "m6", fromMe: false, text: "Hi Layla, Sara here from Amal Ops. I've been following Meezan's growth — impressive!", time: "2d ago" },
      { id: "m7", fromMe: true, text: "Thanks Sara! Love what you're building with AI-powered back-office tools.", time: "2d ago" },
      { id: "m8", fromMe: false, text: "Would love to chat about your experience with Series A fundraising.", time: "1d ago" },
    ],
  },
  {
    id: "t3",
    founder: founders[5],
    lastMessage: "The Mawahib talent pool could be great for your hiring needs. Let's discuss.",
    time: "3d ago",
    unread: 0,
    messages: [
      { id: "m9", fromMe: true, text: "Faisal, congrats on the scale-up milestone! Impressive growth at Mawahib.", time: "4d ago" },
      { id: "m10", fromMe: false, text: "Thanks Layla! Heard Meezan is hiring aggressively for the new product line.", time: "3d ago" },
      { id: "m11", fromMe: false, text: "The Mawahib talent pool could be great for your hiring needs. Let's discuss.", time: "3d ago" },
    ],
  },
]

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState(threads[0].id)

  const selected = threads.find((t) => t.id === activeThread) ?? threads[0]

  return (
    <div className="h-[calc(100vh-10rem)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Thread list */}
            <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search messages..." className="pl-9" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      activeThread === thread.id ? "bg-[#F8F5EF]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-xs">
                          {initials(thread.founder.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-[#0A1628] truncate">
                            {thread.founder.name}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0 ml-2">
                            {thread.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {thread.founder.companyName}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {thread.lastMessage}
                        </p>
                      </div>
                      {thread.unread > 0 && (
                        <Badge variant="gold" className="shrink-0 text-xs px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {thread.unread}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message view */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {initials(selected.founder.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">
                    {selected.founder.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selected.founder.companyName} · {selected.founder.sector}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.fromMe
                          ? "bg-[#0A1628] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.fromMe ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compose */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button size="sm" className="gap-1">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
