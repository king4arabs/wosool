"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"

type ProgramItem = {
  id?: number
  status?: string
  submitted_at?: string
  progress?: number
  at_risk?: boolean
  next_session?: { title?: string; starts_at?: string | null } | null
  cohort?: { id: number; name: string } | null
  program: {
    id: number
    name: string
    slug: string
    category?: string
    starts_at?: string | null
    ends_at?: string | null
  }
}

type MyProgramsResponse = {
  data: {
    applied_programs: ProgramItem[]
    enrolled_programs: ProgramItem[]
    completed_programs: ProgramItem[]
    recommended_programs: Array<{ id: number; name: string; slug: string; category?: string }>
  }
}

const statusMap: Record<string, string> = {
  submitted: "تم الإرسال",
  pending_review: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
  waitlisted: "قائمة الانتظار",
  enrolled: "ملتحق",
  completed: "مكتمل",
  in_progress: "قيد التنفيذ",
}

export default function DashboardProgramsPage() {
  const [data, setData] = useState<MyProgramsResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // loading starts as true; no synchronous setState needed here
    api.get<MyProgramsResponse>("/member/programs/my-programs")
      .then((res) => setData(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-16 text-center text-slate-500">جارٍ تحميل برامجي...</div>
  if (error) return <div className="py-16 text-center text-rose-600">{error}</div>

  const applied = data?.applied_programs || []
  const enrolled = data?.enrolled_programs || []
  const completed = data?.completed_programs || []
  const recommended = data?.recommended_programs || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">برامجي</h1>
        <p className="text-sm text-slate-500 mt-1">تابع طلباتك، تقدمك، والجلسات القادمة في مكان واحد.</p>
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">الملتحق بها ({enrolled.length})</TabsTrigger>
          <TabsTrigger value="applied">طلبات الانضمام ({applied.length})</TabsTrigger>
          <TabsTrigger value="completed">المكتملة ({completed.length})</TabsTrigger>
          <TabsTrigger value="recommended">الموصى بها ({recommended.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-5 space-y-4">
          {enrolled.length === 0 ? <p className="text-sm text-slate-500">لا توجد برامج ملتحق بها حالياً.</p> : null}
          {enrolled.map((item) => (
            <Card key={`${item.program.id}-${item.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.program.name}</h3>
                    <p className="text-xs text-slate-500">{item.program.category || "برنامج"}</p>
                  </div>
                  <Badge variant={item.at_risk ? "destructive" : "success"}>{item.at_risk ? "بحاجة متابعة" : (statusMap[item.status || ""] || item.status || "—")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>نسبة الإنجاز</span><span>{item.progress || 0}%</span></div>
                  <Progress value={item.progress || 0} />
                </div>
                <p className="text-xs text-slate-500">الجلسة القادمة: {item.next_session?.title ? `${item.next_session.title} — ${item.next_session.starts_at ? new Date(item.next_session.starts_at).toLocaleString("ar-SA") : ""}` : "لا توجد جلسة مجدولة"}</p>
                <Link href={`/programs/${item.program.slug}`} className="text-sm font-semibold text-[#3B52D4]">عرض البرنامج</Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applied" className="mt-5 space-y-4">
          {applied.length === 0 ? <p className="text-sm text-slate-500">لا توجد طلبات انضمام.</p> : null}
          {applied.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.program.name}</p>
                  <p className="text-xs text-slate-500">تاريخ التقديم: {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString("ar-SA") : "—"}</p>
                </div>
                <Badge variant="warning">{statusMap[item.status || ""] || item.status || "—"}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-5 space-y-4">
          {completed.length === 0 ? <p className="text-sm text-slate-500">لا توجد برامج مكتملة بعد.</p> : null}
          {completed.map((item) => (
            <Card key={`${item.program.id}-${item.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.program.name}</p>
                  <p className="text-xs text-slate-500">برنامج مكتمل</p>
                </div>
                <Badge variant="success">مكتمل</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommended" className="mt-5 space-y-3">
          {recommended.length === 0 ? <p className="text-sm text-slate-500">لا توجد توصيات حالياً.</p> : null}
          {recommended.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category || "برنامج"}</p>
                </div>
                <Link href={`/programs/${item.slug}`} className="text-sm font-semibold text-[#3B52D4]">عرض</Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
