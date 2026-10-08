"use client"

import { useEffect, useState } from "react"
import type { Event, PaginatedResponse } from "@/types"
import { api } from "./api"
import { getCollectionItems, mapEvent, type ApiEvent, type WrappedResponse } from "./content-api"
import { useLocale } from "./locale"

export function usePublicEvents(period: "upcoming" | "past" = "upcoming") {
  const { locale } = useLocale()
  const [state, setState] = useState<{ events: Event[]; loading: boolean; error: boolean }>({ events: [], loading: true, error: false })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    api.get<PaginatedResponse<ApiEvent> | WrappedResponse<ApiEvent[]>>("/events", { params: { per_page: 100, period }, headers: { "X-Locale": locale } })
      .then((response) => {
        if (active) setState({ events: getCollectionItems(response).map(mapEvent), loading: false, error: false })
      })
      .catch(() => { if (active) setState({ events: [], loading: false, error: true }) })
    return () => { active = false }
  }, [locale, attempt, period])

  function retry() {
    setState({ events: [], loading: true, error: false })
    setAttempt((value) => value + 1)
  }

  return { ...state, retry }
}
