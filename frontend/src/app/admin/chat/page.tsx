"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

type Room = {
  id: number
  title: string
  type: string
  status: string
  last_message_at?: string | null
}

type HelpRequest = {
  id: number
  title: string
  category: string
  urgency: string
  status: string
}

export default function AdminChatPage() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])

  const load = useCallback(async () => {
    try {
      const [roomsRes, helpRes] = await Promise.all([
        api.get<{ data: Room[] }>("/admin/chat/rooms"),
        api.get<{ data: HelpRequest[] }>("/admin/chat/help-requests/unresolved"),
      ])
      setRooms(roomsRes.data || [])
      setHelpRequests(helpRes.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر تحميل بيانات الإشراف", "error")
    }
  }, [toast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; state updates happen after await
    void load()
  }, [load])

  async function updateStatus(roomId: number, status: string) {
    try {
      await api.patch(`/admin/chat/rooms/${roomId}/status`, { status })
      toast("تم تحديث حالة الغرفة", "success")
      await load()
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر تحديث الحالة", "error")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إشراف المحادثات</h1>

      <Card>
        <CardHeader><h2 className="font-semibold">طلبات المساعدة غير المحلولة</h2></CardHeader>
        <CardContent className="space-y-2">
          {helpRequests.length === 0 ? <p className="text-sm text-slate-500">لا توجد طلبات معلّقة.</p> : null}
          {helpRequests.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p className="text-slate-500">{item.category} • {item.urgency} • {item.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">غرف المحادثة</h2></CardHeader>
        <CardContent className="space-y-2">
          {rooms.length === 0 ? <p className="text-sm text-slate-500">لا توجد غرف.</p> : null}
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{room.title}</p>
                <p className="text-xs text-slate-500">{room.type} • {room.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={room.status} onChange={(e) => updateStatus(room.id, e.target.value)}>
                  <option value="open">مفتوحة</option>
                  <option value="pending">معلقة</option>
                  <option value="resolved">محلولة</option>
                  <option value="archived">مؤرشفة</option>
                  <option value="closed">مغلقة</option>
                </Select>
                <Button variant="outline" onClick={() => updateStatus(room.id, "closed")}>إغلاق</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
