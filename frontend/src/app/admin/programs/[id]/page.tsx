"use client"

import { FormEvent, ReactElement, cloneElement, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ProgramOperationsPanel } from "@/components/admin/ProgramOperationsPanel"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"
import {
  type ApplicationAction,
  type CohortErrors,
  type CohortField,
  type CohortForm,
  type SessionErrors,
  type SessionField,
  type SessionForm,
  applicationActions,
  applicationStatusVariant,
  applicationUpdateError,
  codeLabel,
  cohortFieldOrder,
  cohortLimits,
  cohortPayload,
  cohortStatuses,
  emptyCohortForm,
  emptySessionForm,
  fill,
  programManage,
  programTabs,
  riyadhDate,
  riyadhDateTimeLabel,
  saveErrors,
  sessionFieldOrder,
  sessionLimits,
  sessionPayload,
  sessionTypes,
  validateCohort,
  validateSession,
} from "@/lib/admin-program-manage"

type TabKey = (typeof programTabs)[number]["key"]
type LoadState = "loading" | "ready" | "error"

type ApplicationRow = {
  id: number
  applicant_name?: string | null
  email?: string | null
  sector?: string | null
  company_stage?: string | null
  status: string
  submitted_at?: string | null
}

type CohortRow = { id: number; name: string; code?: string | null; status: string; capacity?: number | null; starts_at?: string | null; applications_count?: number }
type SessionRow = { id: number; title: string; session_type: string; starts_at?: string | null; duration_minutes?: number | null }

type FieldProps = {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  requiredText: string
  optionalText: string
  className?: string
  children: ReactElement<Record<string, unknown>>
}

/** A labelled control with its required/optional marker, hint and error tied to it. */
function Field({ id, label, required, hint, error, requiredText, optionalText, className, children }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={id}>
        {label}
        {required
          ? <span className="text-red-600"> *<span className="sr-only"> ({requiredText})</span></span>
          : <span className="text-xs font-normal text-gray-500"> ({optionalText})</span>}
      </Label>
      {cloneElement(children, { id, "aria-required": required || undefined, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  )
}

function focusFirst<F extends string>(order: F[], errors: Partial<Record<F, string>>, prefix: string) {
  const first = order.find(field => errors[field])
  if (first) window.requestAnimationFrame(() => document.getElementById(`${prefix}-${first}`)?.focus())
}

function LoadStatus({ state, failed, empty, isEmpty, loading, retry, onRetry }: { state: LoadState; failed: string; empty: string; isEmpty: boolean; loading: string; retry: string; onRetry: () => void }) {
  if (state === "loading") return <p className="text-sm text-gray-500" role="status">{loading}</p>
  if (state === "error") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
        <span>{failed}</span>
        <Button size="sm" variant="outline" onClick={onRetry}>{retry}</Button>
      </div>
    )
  }
  return isEmpty ? <p className="text-sm text-gray-500">{empty}</p> : null
}

export default function AdminProgramManagePage() {
  const params = useParams<{ id: string }>()
  const programId = params?.id
  const { toast } = useToast()
  const { locale } = useLocale()
  const ar = locale === "ar"
  const copy = programManage(locale)

  const [tab, setTab] = useState<TabKey>("الطلبات")
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [applicationsState, setApplicationsState] = useState<LoadState>("loading")
  const [cohortsState, setCohortsState] = useState<LoadState>("loading")
  const [sessionsState, setSessionsState] = useState<LoadState>("loading")
  const [updating, setUpdating] = useState<number | null>(null)

  const [cohortForm, setCohortForm] = useState<CohortForm>(emptyCohortForm)
  const [cohortErrors, setCohortErrors] = useState<CohortErrors>({})
  const [savingCohort, setSavingCohort] = useState(false)
  const [sessionForm, setSessionForm] = useState<SessionForm>(emptySessionForm)
  const [sessionErrors, setSessionErrors] = useState<SessionErrors>({})
  const [savingSession, setSavingSession] = useState(false)
  // Ignore responses from a superseded request (for example after switching tabs quickly).
  const requests = useRef({ applications: 0, cohorts: 0, sessions: 0 })

  const loadApplications = useCallback(async () => {
    if (!programId) return
    const request = ++requests.current.applications
    setApplicationsState("loading")
    try {
      const res = await api.get<{ data: ApplicationRow[] }>(`/admin/programs/${programId}/applications`)
      if (request !== requests.current.applications) return
      setApplications(res.data || [])
      setApplicationsState("ready")
    } catch {
      if (request === requests.current.applications) setApplicationsState("error")
    }
  }, [programId])

  const loadCohorts = useCallback(async () => {
    if (!programId) return
    const request = ++requests.current.cohorts
    setCohortsState("loading")
    try {
      const res = await api.get<{ data: CohortRow[] }>(`/admin/programs/${programId}/cohorts`)
      if (request !== requests.current.cohorts) return
      setCohorts(res.data || [])
      setCohortsState("ready")
    } catch {
      if (request === requests.current.cohorts) setCohortsState("error")
    }
  }, [programId])

  const loadSessions = useCallback(async () => {
    if (!programId) return
    const request = ++requests.current.sessions
    setSessionsState("loading")
    try {
      const res = await api.get<{ data: SessionRow[] }>(`/admin/programs/${programId}/sessions`)
      if (request !== requests.current.sessions) return
      setSessions(res.data || [])
      setSessionsState("ready")
    } catch {
      if (request === requests.current.sessions) setSessionsState("error")
    }
  }, [programId])

  useEffect(() => {
    if (tab === "الطلبات") void loadApplications()
    if (tab === "الدفعات") void loadCohorts()
    if (tab === "الجلسات") void loadSessions()
  }, [tab, loadApplications, loadCohorts, loadSessions])

  async function updateApplication(application: ApplicationRow, action: ApplicationAction) {
    if (!programId) return
    const name = application.applicant_name || copy.unnamed
    setUpdating(application.id)
    try {
      await api.patch(`/admin/programs/${programId}/applications/${application.id}`, { action })
      toast(fill(copy.applicationUpdated, { name }), "success")
      await loadApplications()
    } catch (error) {
      toast(applicationUpdateError(locale, error instanceof ApiError ? error.status : 0), "error")
    } finally {
      setUpdating(null)
    }
  }

  function setCohortField(field: CohortField, value: string) {
    setCohortForm(previous => ({ ...previous, [field]: value }))
    setCohortErrors(previous => ({ ...previous, [field]: undefined }))
  }

  function setSessionField(field: SessionField, value: string) {
    setSessionForm(previous => ({ ...previous, [field]: value }))
    setSessionErrors(previous => ({ ...previous, [field]: undefined }))
  }

  async function createCohort(event: FormEvent) {
    event.preventDefault()
    if (!programId || savingCohort) return
    const errors = validateCohort(locale, cohortForm)
    setCohortErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirst(cohortFieldOrder, errors, "cohort")
      return
    }
    setSavingCohort(true)
    try {
      const payload = cohortPayload(cohortForm)
      await api.post(`/admin/programs/${programId}/cohorts`, payload)
      toast(fill(copy.cohortCreated, { name: payload.name }), "success")
      setCohortForm(emptyCohortForm)
      await loadCohorts()
    } catch (error) {
      const result = saveErrors(locale, error instanceof ApiError ? error.status : 0, error instanceof ApiError ? error.data : undefined, cohortFieldOrder, copy.cohortFailed)
      setCohortErrors(result.fields)
      focusFirst(cohortFieldOrder, result.fields, "cohort")
      toast(result.message, "error")
    } finally {
      setSavingCohort(false)
    }
  }

  async function createSession(event: FormEvent) {
    event.preventDefault()
    if (!programId || savingSession) return
    const errors = validateSession(locale, sessionForm)
    setSessionErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirst(sessionFieldOrder, errors, "session")
      return
    }
    setSavingSession(true)
    try {
      const payload = sessionPayload(sessionForm)
      await api.post(`/admin/programs/${programId}/sessions`, payload)
      toast(fill(copy.sessionCreated, { title: payload.title }), "success")
      setSessionForm(emptySessionForm)
      await loadSessions()
    } catch (error) {
      const result = saveErrors(locale, error instanceof ApiError ? error.status : 0, error instanceof ApiError ? error.data : undefined, sessionFieldOrder, copy.sessionFailed)
      setSessionErrors(result.fields)
      focusFirst(sessionFieldOrder, result.fields, "session")
      toast(result.message, "error")
    } finally {
      setSavingSession(false)
    }
  }

  const marker = { requiredText: copy.required, optionalText: copy.optional }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">{copy.title}</h2>
      <Link href="/admin/programs" className="inline-flex min-h-11 items-center text-[#3B52D4] underline">{copy.settingsLink}</Link>
      <div className="flex flex-wrap gap-2" role="group" aria-label={copy.tabsLabel}>
        {programTabs.map(entry => <Button key={entry.key} size="sm" variant={tab === entry.key ? "default" : "outline"} aria-pressed={tab === entry.key} onClick={() => setTab(entry.key)}>{ar ? entry.key : entry.en}</Button>)}
      </div>

      {tab === "الطلبات" && (
        <Card><CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">{copy.applicationsTitle}</h3>
            <a className="inline-flex min-h-11 items-center text-sm text-[#3B52D4] underline" href={`/api/v1/admin/programs/${programId}/applications/export`}>{copy.exportCsv}</a>
          </div>
          <LoadStatus state={applicationsState} failed={copy.applicationsFailed} empty={copy.applicationsEmpty} isEmpty={applications.length === 0} loading={copy.loading} retry={copy.retry} onRetry={loadApplications} />
          {applicationsState !== "error" && applications.map(application => {
            const name = application.applicant_name || copy.unnamed
            const submitted = riyadhDate(locale, application.submitted_at)
            return (
              <div key={application.id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold" dir="auto">{name}</p>
                    <p className="text-xs text-gray-500 break-words">
                      {[application.email, application.sector, application.company_stage].filter(Boolean).map((part, index) => <span key={index} dir="auto">{index > 0 ? " • " : ""}{part}</span>)}
                    </p>
                    {submitted ? <p className="text-xs text-gray-500">{fill(copy.submittedOn, { date: submitted })}</p> : null}
                  </div>
                  <Badge variant={applicationStatusVariant(application.status)}>{codeLabel(locale, "application", application.status)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label={fill(copy.actionsFor, { name })}>
                  {applicationActions.map(action => (
                    <Button key={action} size="sm" variant="outline" disabled={updating === application.id} onClick={() => updateApplication(application, action)}>
                      {codeLabel(locale, "action", action)}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent></Card>
      )}

      {tab === "الدفعات" && (
        <Card><CardContent className="space-y-4 p-4">
          <h3 className="font-bold">{copy.cohortsTitle}</h3>
          <form noValidate onSubmit={createCohort} className="space-y-3 rounded-lg border p-3" aria-labelledby="cohort-form-title">
            <h4 id="cohort-form-title" className="font-semibold">{copy.newCohort}</h4>
            <fieldset disabled={savingCohort} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field id="cohort-name" label={copy.cohortName} required hint={fill(copy.cohortNameHint, { max: cohortLimits.name })} error={cohortErrors.name} {...marker}>
                <Input dir="auto" value={cohortForm.name} onChange={event => setCohortField("name", event.target.value)} />
              </Field>
              <Field id="cohort-code" label={copy.cohortCode} hint={fill(copy.cohortCodeHint, { max: cohortLimits.code })} error={cohortErrors.code} {...marker}>
                <Input dir="ltr" value={cohortForm.code} onChange={event => setCohortField("code", event.target.value)} />
              </Field>
              <Field id="cohort-status" label={copy.cohortStatus} required error={cohortErrors.status} {...marker}>
                <Select value={cohortForm.status} onChange={event => setCohortField("status", event.target.value)}>
                  {cohortStatuses.map(value => <option key={value} value={value}>{codeLabel(locale, "cohort", value)}</option>)}
                </Select>
              </Field>
              <Field id="cohort-capacity" label={copy.capacity} hint={copy.capacityHint} error={cohortErrors.capacity} {...marker}>
                <Input inputMode="numeric" dir="ltr" value={cohortForm.capacity} onChange={event => setCohortField("capacity", event.target.value)} />
              </Field>
              <Field id="cohort-starts_at" label={copy.cohortStart} error={cohortErrors.starts_at} {...marker}>
                <Input type="date" value={cohortForm.starts_at} onChange={event => setCohortField("starts_at", event.target.value)} />
              </Field>
            </fieldset>
            <Button type="submit" disabled={savingCohort}>{savingCohort ? copy.addingCohort : copy.addCohort}</Button>
          </form>
          <LoadStatus state={cohortsState} failed={copy.cohortsFailed} empty={copy.cohortsEmpty} isEmpty={cohorts.length === 0} loading={copy.loading} retry={copy.retry} onRetry={loadCohorts} />
          {cohortsState !== "error" ? (
            <ul className="space-y-2">
              {cohorts.map(cohort => {
                const starts = riyadhDate(locale, cohort.starts_at)
                return (
                  <li key={cohort.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold" dir="auto">{cohort.name}{cohort.code ? <span className="font-normal text-gray-500" dir="ltr"> ({cohort.code})</span> : null}</p>
                      <p className="text-xs text-gray-500">
                        {[cohort.capacity ? fill(copy.capacityValue, { value: cohort.capacity }) : copy.noCapacity, starts ? fill(copy.startsOn, { date: starts }) : null, typeof cohort.applications_count === "number" ? fill(copy.applicationsCount, { count: cohort.applications_count }) : null].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <Badge variant="secondary">{codeLabel(locale, "cohort", cohort.status)}</Badge>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </CardContent></Card>
      )}

      {tab === "الجلسات" && (
        <Card><CardContent className="space-y-4 p-4">
          <h3 className="font-bold">{copy.sessionsTitle}</h3>
          <form noValidate onSubmit={createSession} className="space-y-3 rounded-lg border p-3" aria-labelledby="session-form-title">
            <h4 id="session-form-title" className="font-semibold">{copy.newSession}</h4>
            <fieldset disabled={savingSession} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field id="session-title" label={copy.sessionTitle} required hint={fill(copy.sessionTitleHint, { max: sessionLimits.title })} error={sessionErrors.title} {...marker}>
                <Input dir="auto" value={sessionForm.title} onChange={event => setSessionField("title", event.target.value)} />
              </Field>
              <Field id="session-session_type" label={copy.sessionType} required error={sessionErrors.session_type} {...marker}>
                <Select value={sessionForm.session_type} onChange={event => setSessionField("session_type", event.target.value)}>
                  {sessionTypes.map(value => <option key={value} value={value}>{codeLabel(locale, "session", value)}</option>)}
                </Select>
              </Field>
              <Field id="session-starts_at" label={copy.sessionStart} required hint={copy.sessionStartHint} error={sessionErrors.starts_at} {...marker}>
                <Input type="datetime-local" value={sessionForm.starts_at} onChange={event => setSessionField("starts_at", event.target.value)} />
              </Field>
              <Field id="session-duration_minutes" label={copy.duration} hint={fill(copy.durationHint, { min: sessionLimits.minDuration })} error={sessionErrors.duration_minutes} {...marker}>
                <Input inputMode="numeric" dir="ltr" value={sessionForm.duration_minutes} onChange={event => setSessionField("duration_minutes", event.target.value)} />
              </Field>
              <Field id="session-description" label={copy.sessionDescription} error={sessionErrors.description} className="sm:col-span-2" {...marker}>
                <Textarea dir="auto" value={sessionForm.description} onChange={event => setSessionField("description", event.target.value)} />
              </Field>
            </fieldset>
            <Button type="submit" disabled={savingSession}>{savingSession ? copy.addingSession : copy.addSession}</Button>
          </form>
          <LoadStatus state={sessionsState} failed={copy.sessionsFailed} empty={copy.sessionsEmpty} isEmpty={sessions.length === 0} loading={copy.loading} retry={copy.retry} onRetry={loadSessions} />
          {sessionsState !== "error" ? (
            <ul className="space-y-2">
              {sessions.map(session => {
                const when = riyadhDateTimeLabel(locale, session.starts_at)
                return (
                  <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold" dir="auto">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {[when ? `${when} (${copy.riyadhTime})` : copy.noTime, session.duration_minutes ? fill(copy.minutes, { count: session.duration_minutes }) : null].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <Badge variant="secondary">{codeLabel(locale, "session", session.session_type)}</Badge>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </CardContent></Card>
      )}

      {!["الطلبات", "الدفعات", "الجلسات"].includes(tab) ? (
        <ProgramOperationsPanel programId={programId} panel={tab} />
      ) : null}
    </div>
  )
}
