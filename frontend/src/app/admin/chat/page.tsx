"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"

const ROOM_STATUSES = [
  ["open", "مفتوحة", "Open"],
  ["pending", "معلّقة", "Pending"],
  ["resolved", "محلولة", "Resolved"],
  ["archived", "مؤرشفة", "Archived"],
  ["closed", "مغلقة", "Closed"],
] as const

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
  const { locale } = useLocale()
  const ar = locale === "ar"
  const t = useCallback((arabic: string, english: string) => (ar ? arabic : english), [ar])
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
      toast(e instanceof Error ? e.message : t("تعذر تحميل بيانات الإشراف", "Could not load moderation data"), "error")
    }
  }, [toast, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; state updates happen after await
    void load()
  }, [load])

  async function updateStatus(roomId: number, status: string) {
    try {
      await api.patch(`/admin/chat/rooms/${roomId}/status`, { status })
      toast(t("تم تحديث حالة الغرفة", "Room status updated"), "success")
      await load()
    } catch (e) {
      toast(e instanceof Error ? e.message : t("تعذر تحديث الحالة", "Could not update the status"), "error")
    }
  }

  function statusLabel(status: string) {
    const match = ROOM_STATUSES.find(([value]) => value === status)
    return match ? (ar ? match[1] : match[2]) : status
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("إشراف المحادثات", "Chat moderation")}</h2>

      <Card>
        <CardHeader><h2 className="font-semibold">{t("طلبات المساعدة غير المحلولة", "Unresolved help requests")}</h2></CardHeader>
        <CardContent className="space-y-2">
          {helpRequests.length === 0 ? <p className="text-sm text-slate-500">{t("لا توجد طلبات معلّقة.", "No open help requests.")}</p> : null}
          {helpRequests.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p className="text-slate-500">{item.category} • {item.urgency} • {item.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">{t("غرف المحادثة", "Chat rooms")}</h2></CardHeader>
        <CardContent className="space-y-2">
          {rooms.length === 0 ? <p className="text-sm text-slate-500">{t("لا توجد غرف.", "No rooms yet.")}</p> : null}
          {rooms.map((room) => (
            <div key={room.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="font-semibold">{room.title}</p>
                <p className="text-xs text-slate-500">{room.type} • {statusLabel(room.status)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={room.status}
                  aria-label={t(`حالة الغرفة: ${room.title}`, `Status for ${room.title}`)}
                  onChange={(e) => updateStatus(room.id, e.target.value)}
                >
                  {ROOM_STATUSES.map(([value, arabic, english]) => (
                    <option key={value} value={value}>{ar ? arabic : english}</option>
                  ))}
                </Select>
                <Button variant="outline" onClick={() => updateStatus(room.id, "closed")}>{t("إغلاق", "Close")}</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
