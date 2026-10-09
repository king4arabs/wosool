"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

type HelpRequest = {
  id: number
  title: string
  category: string
  urgency: string
  status: string
  created_at: string
  chat_room_id?: number | null
}

export default function HelpRequestsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<HelpRequest[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    category: "operations",
    urgency: "normal",
    description: "",
    visibility: "matched_founders",
    allow_ai_matching: true,
  })

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ data: HelpRequest[] }>("/member/help-requests")
      setItems(res.data || [])
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر تحميل الطلبات", "error")
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  async function submit() {
    setLoading(true)
    try {
      const res = await api.post<{ message: string }>("/member/help-requests", form)
      toast(res.message || "تم إنشاء طلب المساعدة", "success")
      setOpen(false)
      setForm({ title: "", category: "operations", urgency: "normal", description: "", visibility: "matched_founders", allow_ai_matching: true })
      await load()
    } catch (e) {
      toast(e instanceof Error ? e.message : "تعذر إنشاء الطلب", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">طلبات المساعدة</h1>
          <p className="text-sm text-slate-500">أنشئ طلب مساعدة وسيتم فتح غرفة محادثة مرتبطة به مباشرة.</p>
        </div>
        <Button onClick={() => setOpen(true)}>طلب مساعدة</Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">لا توجد طلبات مساعدة حتى الآن.</p> : null}
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.title}</h3>
                <Badge variant="outline">{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 flex items-center justify-between">
              <div>{item.category} • {item.urgency} • {new Date(item.created_at).toLocaleDateString("ar-SA")}</div>
              {item.chat_room_id ? <a className="text-[#3B52D4] font-semibold" href={`/dashboard/messages?room=${item.chat_room_id}`}>فتح الغرفة</a> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>إنشاء طلب مساعدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="عنوان الطلب" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                <option value="fundraising">التمويل</option><option value="growth">النمو</option><option value="product">المنتج</option><option value="hiring">التوظيف</option><option value="legal">القانوني</option><option value="finance">المالي</option><option value="technology">التقني</option><option value="partnerships">الشراكات</option><option value="marketing">التسويق</option><option value="operations">العمليات</option><option value="founder_wellness">رفاه المؤسس</option><option value="other">أخرى</option>
              </Select>
              <Select value={form.urgency} onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value }))}>
                <option value="low">منخفضة</option><option value="normal">متوسطة</option><option value="high">عالية</option>
              </Select>
            </div>
            <Textarea placeholder="اشرح التحدي بالتفصيل" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <Select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}>
              <option value="private_admin">خاص بالإدارة</option>
              <option value="matched_founders">مشارك مع المؤسسين المطابقين</option>
              <option value="founder_circle">مشارك مع دائرة المؤسسين</option>
              <option value="community_public">عام داخل المجتمع</option>
            </Select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allow_ai_matching} onChange={(e) => setForm((p) => ({ ...p, allow_ai_matching: e.target.checked }))} /> السماح باقتراح أعضاء للمساعدة</label>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={submit} disabled={loading}>{loading ? "جارٍ الإنشاء..." : "إنشاء"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
