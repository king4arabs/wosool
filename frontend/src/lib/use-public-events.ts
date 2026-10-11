"use client"

import { useEffect, useState } from "react"
import type { Event, PaginatedResponse } from "@/types"
import { api } from "./api"
import { getCollectionItems, mapEvent, type ApiEvent, type WrappedResponse } from "./content-api"
import { useLocale } from "./locale"

export function usePublicEvents(period: "upcoming" | "past" = "upcoming") {
  const { locale } = useLocale()
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${locale}:${period}:${attempt}`
  const [state, setState] = useState<{ requestKey: string; events: Event[]; loading: boolean; error: boolean }>({ requestKey: "", events: [], loading: true, error: false })

  // Reset before children render, including a quick upcoming → past → upcoming switch.
  if (state.requestKey !== requestKey) {
    setState({ requestKey, events: [], loading: true, error: false })
  }

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    api.get<PaginatedResponse<ApiEvent> | WrappedResponse<ApiEvent[]>>("/events", { params: { per_page: 100, period }, headers: { "X-Locale": locale }, cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (active) setState({ requestKey, events: getCollectionItems(response).map(mapEvent), loading: false, error: false })
      })
      .catch(() => { if (active) setState({ requestKey, events: [], loading: false, error: true }) })
    return () => { active = false; controller.abort() }
  }, [locale, period, requestKey])

  function retry() {
    setAttempt((value) => value + 1)
  }

  return { ...(state.requestKey === requestKey ? state : { events: [], loading: true, error: false }), retry }
}
