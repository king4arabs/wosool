"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import Link from "next/link"
import {
  programApplicationStatusLabel,
  programApplyAction,
  programDate,
  programDetailCopy,
  programFormatLabel,
  programLanguageLabel,
  programSessionTypeLabel,
  programStatusFlowLabel,
  programTypeLabel,
} from "@/lib/program-detail"
import { programDurationLabel } from "@/lib/program-labels"

type ProgramDetails = {
  id: number
  name: string
  title?: string
  slug: string
  short_description?: string | null
  full_description?: string | null
  program_type?: string | null
  category?: string | null
  tags?: string[]
  cover_image_url?: string | null
  visibility?: string
  status_flow?: string
  is_open?: boolean
  objective?: string | null
  who_it_is_for?: string | null
  expected_outcomes?: string | null
  duration?: string | null
  format?: string | null
  language?: string | null
  city_region?: string | null
  capacity?: number | null
  application_deadline?: string | null
  starts_at?: string | null
  ends_at?: string | null
  eligibility_criteria?: string[]
  application_process?: string[]
  faqs?: Array<{ q: string; a: string }>
  cohorts?: Array<{ id: number; name: string; status: string; starts_at?: string | null; ends_at?: string | null }>
  sessions?: Array<{ id: number; title: string; description?: string | null; session_type?: string; starts_at?: string | null; duration_minutes?: number | null; location?: string | null; online_link?: string | null }>
  resources?: Array<{ id: number; title: string; resource_type?: string; url?: string | null }>
}

type ProgramApplicationStatus = {
  status: string
}

export default function ProgramDetailPage() {
  // Detail pages need the site header, footer and <main> landmark like every other public page.
  return (
    <PublicLayout>
      <ProgramDetailPageContent />
    </PublicLayout>
  )
}

function ProgramDetailPageContent() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const { toast } = useToast()

  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)

  const [form, setForm] = useState({
    motivation: "",
    relevant_experience: "",
    why_join: "",
    current_challenge: "",
    expected_outcome: "",
    company_stage: "",
    sector: "",
    team_size: "",
    current_traction: "",
    fundraising_status: "",
    availability_confirmed: true,
    consent_share_profile: true,
    attachment_path: "",
  })

  const { user, isLoading: authLoading } = useAuth()
  const signedIn = Boolean(user)
  const { locale } = useLocale()
  const copy = programDetailCopy[locale]

  useEffect(() => {
    if (!slug || authLoading) return
    setLoading(true)
    Promise.all([
      api.get<{ data: ProgramDetails }>(`/programs/${slug}`),
      // Only members have application history; visitors skip the private lookup.
      signedIn
        ? api.get<{ data: Array<ProgramApplicationStatus & { program: { slug: string } }> }>("/member/program-applications").catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] as Array<ProgramApplicationStatus & { program: { slug: string } }> }),
    ])
      .then(([programRes, applicationsRes]) => {
        setProgram(programRes.data)
        const mine = (applicationsRes.data || []).find((item) => item.program?.slug === slug)
        setApplicationStatus(mine?.status ?? null)
      })
      .catch((err: Error) => toast(err.message, "error"))
      .finally(() => setLoading(false))
  }, [slug, toast, authLoading, signedIn])

  async function submitApplication() {
    if (!program) return
    setSubmitting(true)
    try {
      const res = await api.post<{ message: string; data: { status: string } }>(`/member/programs/${program.slug}/apply`, form)
      toast(locale === "ar" && res.message ? res.message : copy.sent, "success")
      setApplicationStatus(res.data?.status || "pending_review")
      setIsApplyOpen(false)
    } catch (err) {
      toast(err instanceof ApiError && err.message ? err.message : copy.sendFailed, "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-500" role="status">{copy.loading}</div>
  if (!program) {
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-xl font-bold text-slate-900">{copy.notFound}</h1>
        <Link href="/programs" className="text-sm font-semibold text-blue-700 underline">{copy.backToPrograms}</Link>
      </div>
    )
  }

  const action = programApplyAction(program, applicationStatus, signedIn, locale)
  const statusFlow = programStatusFlowLabel(program.status_flow, locale)
  const format = programFormatLabel(program.format, locale)
  const meta = [
    program.city_region?.trim() || null,
    program.duration ? programDurationLabel(program.duration, locale) : null,
    programLanguageLabel(program.language, locale),
  ].filter(Boolean)
  const deadline = programDate(program.application_deadline, locale)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/programs" className="inline-block text-sm font-semibold text-blue-700 hover:underline">{copy.backToPrograms}</Link>
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{programTypeLabel(program.program_type || program.category, locale)}</Badge>
            {statusFlow ? <Badge variant="secondary">{statusFlow}</Badge> : null}
            {format ? <Badge variant="outline">{format}</Badge> : null}
          </div>
          <h1 dir="auto" className="text-3xl font-black text-slate-900 break-words">{program.title || program.name}</h1>
          {program.short_description ? <p dir="auto" className="text-slate-600">{program.short_description}</p> : null}
          {meta.length > 0 ? <p className="text-xs text-slate-500">{meta.join(" • ")}</p> : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {program.full_description && program.full_description !== program.short_description ? (
            <Card><CardContent className="p-5"><h2 className="font-bold mb-2">{copy.overview}</h2><p dir="auto" className="text-sm text-slate-600 whitespace-pre-wrap">{program.full_description}</p></CardContent></Card>
          ) : null}
          <Card><CardContent className="p-5"><h2 className="font-bold mb-2">{copy.whoFor}</h2><p dir="auto" className="text-sm text-slate-600 whitespace-pre-wrap">{program.who_it_is_for || copy.notAdded}</p></CardContent></Card>
          <Card><CardContent className="p-5"><h2 className="font-bold mb-2">{copy.outcomes}</h2><p dir="auto" className="text-sm text-slate-600 whitespace-pre-wrap">{program.expected_outcomes || copy.notAdded}</p></CardContent></Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold mb-3">{copy.sessions}</h2>
              <div className="space-y-3">
                {(program.sessions || []).length === 0 ? <p className="text-sm text-slate-500">{copy.noSessions}</p> : null}
                {(program.sessions || []).map((session) => {
                  const when = programDate(session.starts_at, locale, true)
                  return (
                    <div key={session.id} className="rounded-lg border border-slate-200 p-3">
                      <p dir="auto" className="font-semibold text-sm">{session.title}</p>
                      <p className="text-xs text-slate-500">{programSessionTypeLabel(session.session_type, locale)}{when ? ` • ${when}` : ""}</p>
                      {session.description ? <p dir="auto" className="text-sm text-slate-600 mt-1">{session.description}</p> : null}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold mb-3">{copy.resources}</h2>
              <div className="space-y-2">
                {(program.resources || []).filter((resource) => resource.url).length === 0 ? <p className="text-sm text-slate-500">{copy.noResources}</p> : null}
                {(program.resources || []).filter((resource) => resource.url).map((resource) => (
                  <a key={resource.id} href={resource.url || undefined} target="_blank" rel="noreferrer" dir="auto" className="block rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
                    {resource.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-bold">{copy.join}</h2>
              <p className="text-xs text-slate-500">{copy.deadline}: {deadline || copy.notSet}</p>
              {action.kind === "link" ? (
                <Button asChild className="w-full"><Link href={action.href}>{action.label}</Link></Button>
              ) : (
                <Button className="w-full" disabled={action.kind === "disabled" || submitting} onClick={() => setIsApplyOpen(true)}>{action.label}</Button>
              )}
              {applicationStatus ? <p className="text-xs text-slate-500">{copy.yourStatus}: {programApplicationStatusLabel(applicationStatus, locale)}</p> : null}
              {action.kind !== "apply" && "hint" in action && action.hint ? <p className="text-xs text-slate-500">{action.hint}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{copy.dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea aria-label={copy.whyJoin} placeholder={copy.whyJoin} required minLength={20} value={form.why_join || form.motivation} onChange={(e) => setForm((p) => ({ ...p, why_join: e.target.value, motivation: e.target.value }))} />
            <Textarea aria-label={copy.challenge} placeholder={copy.challenge} value={form.current_challenge} onChange={(e) => setForm((p) => ({ ...p, current_challenge: e.target.value }))} />
            <Textarea aria-label={copy.outcome} placeholder={copy.outcome} value={form.expected_outcome} onChange={(e) => setForm((p) => ({ ...p, expected_outcome: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input aria-label={copy.stage} placeholder={copy.stage} value={form.company_stage} onChange={(e) => setForm((p) => ({ ...p, company_stage: e.target.value }))} />
              <Input aria-label={copy.sector} placeholder={copy.sector} value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} />
              <Input aria-label={copy.teamSize} placeholder={copy.teamSize} value={form.team_size} onChange={(e) => setForm((p) => ({ ...p, team_size: e.target.value }))} />
              <Input aria-label={copy.fundraising} placeholder={copy.fundraising} value={form.fundraising_status} onChange={(e) => setForm((p) => ({ ...p, fundraising_status: e.target.value }))} />
            </div>
            <Textarea aria-label={copy.traction} placeholder={copy.traction} value={form.current_traction} onChange={(e) => setForm((p) => ({ ...p, current_traction: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.availability_confirmed} onChange={(e) => setForm((p) => ({ ...p, availability_confirmed: e.target.checked }))} /> {copy.availability}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.consent_share_profile} onChange={(e) => setForm((p) => ({ ...p, consent_share_profile: e.target.checked }))} /> {copy.consent}</label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsApplyOpen(false)}>{copy.cancel}</Button>
              <Button onClick={submitApplication} disabled={submitting || (form.why_join || form.motivation).trim().length < 20}>{submitting ? copy.submitting : copy.submit}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
