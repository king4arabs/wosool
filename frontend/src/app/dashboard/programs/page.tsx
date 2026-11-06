"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { resolveDashboardLocale } from "@/lib/dashboard-i18n"
import {
  applicationTone,
  fill,
  memberPrograms,
  nextSessionLine,
  programCategory,
  programDate,
  programStatusLabel,
  programTitle,
  progressValue,
  type MyPrograms,
} from "@/lib/member-programs"

const linkClass = "inline-flex min-h-11 items-center text-sm font-semibold text-[#3B52D4] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B52D4]"

export default function DashboardProgramsPage() {
  const { locale: activeLocale } = useLocale()
  const locale = resolveDashboardLocale(activeLocale)
  const copy = memberPrograms(locale)
  const [data, setData] = useState<MyPrograms | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const latestRequest = useRef(0)

  const load = useCallback(async () => {
    const request = ++latestRequest.current
    setLoading(true)
    setFailed(false)
    try {
      const res = await api.get<{ data: MyPrograms }>("/member/programs/my-programs")
      if (request === latestRequest.current) setData(res.data)
    } catch {
      if (request === latestRequest.current) setFailed(true)
    } finally {
      if (request === latestRequest.current) setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const header = (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{copy.title}</h1>
      <p className="text-sm text-slate-500 mt-1">{copy.intro}</p>
    </div>
  )

  if (loading && !data) {
    return <div className="max-w-5xl mx-auto space-y-6">{header}<p className="py-16 text-center text-slate-500" role="status">{copy.loading}</p></div>
  }
  if (failed || !data) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {header}
        <div className="py-12 text-center space-y-3" role="alert">
          <p className="text-rose-700">{copy.loadFailed}</p>
          <button type="button" onClick={() => void load()} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">{copy.retry}</button>
        </div>
      </div>
    )
  }

  const applied = data.applied_programs ?? []
  const enrolled = data.enrolled_programs ?? []
  const completed = data.completed_programs ?? []
  const recommended = data.recommended_programs ?? []
  const firstTab = enrolled.length ? "enrolled" : applied.length ? "applied" : completed.length ? "completed" : "recommended"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {header}

      <Tabs defaultValue={firstTab} dir={locale === "ar" ? "rtl" : "ltr"}>
        <TabsList aria-label={copy.tabsLabel}>
          <TabsTrigger value="enrolled">{fill(copy.tabEnrolled, { count: enrolled.length })}</TabsTrigger>
          <TabsTrigger value="applied">{fill(copy.tabApplied, { count: applied.length })}</TabsTrigger>
          <TabsTrigger value="completed">{fill(copy.tabCompleted, { count: completed.length })}</TabsTrigger>
          <TabsTrigger value="recommended">{fill(copy.tabRecommended, { count: recommended.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-5 space-y-4">
          {enrolled.length === 0 ? <p className="text-sm text-slate-500">{copy.emptyEnrolled}</p> : null}
          {enrolled.map((item) => {
            const progress = progressValue(item.progress)
            const title = programTitle(locale, item.program)
            return (
              <Card key={item.participant_id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900"><bdi>{title}</bdi></h2>
                      <p className="text-xs text-slate-500">
                        {programCategory(locale, item.program)}
                        {item.cohort?.name ? <> · <bdi>{fill(copy.cohort, { name: item.cohort.name })}</bdi></> : null}
                      </p>
                    </div>
                    <Badge variant={item.at_risk ? "destructive" : "success"}>{item.at_risk ? copy.needsFollowUp : programStatusLabel(locale, item.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>{copy.progress}</span><span>{progress}%</span></div>
                    <Progress value={progress} aria-label={`${copy.progress}: ${progress}%`} />
                  </div>
                  <p className="text-xs text-slate-500">{nextSessionLine(locale, item.next_session)}</p>
                  <Link href={`/programs/${item.program.slug}`} className={linkClass}>{copy.viewProgram}<span className="sr-only">: {title}</span></Link>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="applied" className="mt-5 space-y-4">
          {applied.length === 0 ? <p className="text-sm text-slate-500">{copy.emptyApplied}</p> : null}
          {applied.map((item) => {
            const date = programDate(locale, item.submitted_at)
            return (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900"><bdi>{programTitle(locale, item.program)}</bdi></h2>
                    {date ? <p className="text-xs text-slate-500">{fill(copy.submittedOn, { date })}</p> : null}
                  </div>
                  <Badge variant={applicationTone(item.status)}>{programStatusLabel(locale, item.status)}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="completed" className="mt-5 space-y-4">
          {completed.length === 0 ? <p className="text-sm text-slate-500">{copy.emptyCompleted}</p> : null}
          {completed.map((item) => {
            const date = programDate(locale, item.completed_at)
            return (
              <Card key={item.participant_id}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900"><bdi>{programTitle(locale, item.program)}</bdi></h2>
                    <p className="text-xs text-slate-500">{date ? fill(copy.completedOn, { date }) : copy.completedNoDate}</p>
                  </div>
                  <Badge variant="success">{programStatusLabel(locale, "completed")}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="recommended" className="mt-5 space-y-3">
          {recommended.length === 0 ? (
            <p className="text-sm text-slate-500">{copy.emptyRecommended} <Link href="/programs" className={linkClass}>{copy.browsePrograms}</Link></p>
          ) : null}
          {recommended.map((item) => {
            const title = programTitle(locale, item)
            return (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900"><bdi>{title}</bdi></h2>
                    <p className="text-xs text-slate-500">{programCategory(locale, item)}</p>
                  </div>
                  <Link href={`/programs/${item.slug}`} className={linkClass}>{copy.viewProgram}<span className="sr-only">: {title}</span></Link>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
