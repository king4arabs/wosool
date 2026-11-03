"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useLocale } from "@/lib/locale"
import { resolveDashboardLocale } from "@/lib/dashboard-i18n"
import {
  founderMeta,
  joinList,
  listItems,
  matchCounterpart,
  matchReasons,
  matchStatusLabel,
  memberMatches,
  profileHref,
  splitMatches,
  type MemberMatch,
} from "@/lib/member-matches"
import IntroRouterLedger from "@/components/dashboard/IntroRouterLedger"

type MatchesResponse = {
  data?: MemberMatch[]
  meta?: { profile_required?: boolean; credits?: { remaining?: number } }
}

function scoreTone(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200/60"
  if (score >= 80) return "bg-blue-50 text-blue-700 border-blue-200/60"
  return "bg-amber-50 text-amber-700 border-amber-200/60"
}

function initial(name?: string | null) {
  return (name || "").trim().charAt(0) || "·"
}

export default function MatchesPage() {
  const { user } = useAuth()
  const { locale: activeLocale } = useLocale()
  const locale = resolveDashboardLocale(activeLocale)
  const copy = memberMatches(locale)
  const userId = user?.id ? Number(user.id) : null
  const [matches, setMatches] = useState<MemberMatch[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<{ id: number; action: "accept" | "decline" } | null>(null)
  const [creditRemaining, setCreditRemaining] = useState<number | null>(null)
  const [profileRequired, setProfileRequired] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const current = ++requestId.current
    setLoading(true)
    try {
      const response = await api.get<MatchesResponse>("/member/matches")
      if (current !== requestId.current) return
      setMatches(Array.isArray(response.data) ? response.data : [])
      setProfileRequired(Boolean(response.meta?.profile_required))
      const remaining = response.meta?.credits?.remaining
      setCreditRemaining(typeof remaining === "number" ? remaining : null)
      setLoadFailed(false)
    } catch {
      if (current === requestId.current) setLoadFailed(true)
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const respond = async (id: number, action: "accept" | "decline") => {
    setBusy({ id, action })
    setActionError(null)
    try {
      await api.post(`/member/matches/${id}/${action}`)
      await load()
    } catch {
      setActionError(copy.actionFailed)
    } finally {
      setBusy(null)
    }
  }

  const { active, suggested } = useMemo(() => splitMatches(matches), [matches])
  const panel = "bg-white border border-slate-200 rounded-xl shadow-sm"
  const muted = `${panel} p-4 text-sm text-slate-600`

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen antialiased">
      <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 space-y-6">
        <div className={`${panel} p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
            <p className="text-sm text-slate-600 mt-1">{copy.subtitle}</p>
          </div>
          {creditRemaining !== null ? (
            <p className="bg-slate-950 text-white text-xs px-3 py-2 rounded-lg text-center shrink-0">
              {copy.creditsLabel}: <span className="text-amber-300 font-bold">{creditRemaining}</span>
            </p>
          ) : null}
        </div>

        {loadFailed ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex flex-wrap items-center justify-between gap-3">
            <span>{copy.loadFailed}</span>
            <button type="button" onClick={() => void load()} className="min-h-11 rounded-lg border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100">
              {copy.retry}
            </button>
          </div>
        ) : null}
        {actionError ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>
        ) : null}

        {profileRequired ? (
          <div className={`${muted} flex flex-wrap items-center justify-between gap-3`}>
            <span>{copy.profileRequired}</span>
            <Link href="/dashboard/profile" className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
              {copy.profileCta}
            </Link>
          </div>
        ) : null}

        <IntroRouterLedger locale={locale} onChange={load} />

        <section className="space-y-3" aria-labelledby="active-introductions">
          <h2 id="active-introductions" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <span>{copy.activeTitle}</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 rounded text-xs">{active.length}</span>
          </h2>

          {loading && matches.length === 0 ? (
            <div className={muted}>{copy.loading}</div>
          ) : active.length === 0 ? (
            <div className={muted}>{copy.activeEmpty}</div>
          ) : (
            <ul className="space-y-2">
              {active.map((match) => {
                const founder = matchCounterpart(match, userId)
                const company = founder?.companies?.[0]?.name
                return (
                  <li key={match.id} className={`${panel} p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span aria-hidden="true" className="w-8 h-8 shrink-0 rounded-full bg-slate-100 border flex items-center justify-center text-xs font-bold text-slate-600">
                        {initial(founder?.name)}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 min-w-0 break-words">
                        <bdi>{founder?.name || copy.founderFallback}</bdi>
                        {company ? <span className="font-normal text-slate-600"> · <bdi>{company}</bdi></span> : null}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border whitespace-nowrap ${match.status === "connected" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-800 border-amber-200/60"}`}>
                      {matchStatusLabel(locale, match.status)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4" aria-labelledby="suggested-founders">
          <h2 id="suggested-founders" className="text-sm font-bold text-slate-700">{copy.suggestedTitle}</h2>

          {loading && matches.length === 0 ? (
            <div className={muted}>{copy.loading}</div>
          ) : suggested.length === 0 ? (
            <div className={muted}>{copy.suggestedEmpty}</div>
          ) : (
            <ul className="space-y-4">
              {suggested.map((match) => {
                const founder = matchCounterpart(match, userId)
                const score = Math.round(match.match_score || 0)
                const company = founder?.companies?.[0]?.name
                const meta = founderMeta(locale, founder)
                const reasons = matchReasons(locale, match.match_reasons)
                const offers = listItems(founder?.offers)
                const needs = listItems(founder?.needs)
                const href = profileHref(founder)
                const isBusy = busy?.id === match.id
                return (
                  <li key={match.id} className={`${panel} p-5 space-y-4 hover:border-slate-300 transition-colors`}>
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span aria-hidden="true" className="w-11 h-11 rounded-full border-2 border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {initial(founder?.name)}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 break-words">
                            <bdi>{founder?.name || copy.founderFallback}</bdi>
                            {company ? <span className="ms-2 inline-block bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium px-1.5 rounded align-middle">{company}</span> : null}
                          </h3>
                          {meta.length ? (
                            <p className="text-xs text-slate-600 mt-0.5">
                              {meta.map((part, index) => (
                                <span key={index}>{index > 0 ? " · " : null}<bdi>{part}</bdi></span>
                              ))}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {score > 0 ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border shrink-0 ${scoreTone(score)}`}>
                          {score}%
                        </span>
                      ) : null}
                    </div>

                    {reasons || founder?.tagline ? (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm space-y-1">
                        <p className="font-semibold text-slate-800">{copy.reasonsTitle}</p>
                        <p className="text-slate-600 leading-relaxed"><bdi>{reasons || founder?.tagline}</bdi></p>
                      </div>
                    ) : null}

                    {offers.length || needs.length ? (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {offers.length ? (
                          <div>
                            <dt className="text-xs font-bold text-slate-600 mb-0.5">{copy.canHelp}</dt>
                            <dd className="text-slate-800"><bdi>{joinList(locale, offers)}</bdi></dd>
                          </div>
                        ) : null}
                        {needs.length ? (
                          <div>
                            <dt className="text-xs font-bold text-slate-600 mb-0.5">{copy.looksFor}</dt>
                            <dd className="text-slate-800"><bdi>{joinList(locale, needs)}</bdi></dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                      {href ? (
                        <Link href={href} className="min-h-11 inline-flex items-center bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 border border-slate-200 rounded-lg text-sm transition-colors">
                          {copy.viewProfile}
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void respond(match.id, "decline")}
                        disabled={busy !== null}
                        className="min-h-11 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-semibold px-4 border border-slate-200 rounded-lg text-sm transition-colors"
                      >
                        {isBusy && busy?.action === "decline" ? copy.declining : copy.decline}
                      </button>
                      <button
                        type="button"
                        onClick={() => void respond(match.id, "accept")}
                        disabled={busy !== null}
                        className="min-h-11 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        {isBusy && busy?.action === "accept" ? copy.requesting : copy.requestIntro}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
