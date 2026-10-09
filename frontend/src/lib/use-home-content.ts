"use client"

import { useEffect, useState } from "react"
import type { Company, Founder, NewsItem, Partner } from "@/types"
import { api } from "./api"
import { mapCompany, mapFounder, mapNewsItem, mapPartner, type ApiCompany, type ApiFounder, type ApiNewsItem, type ApiPartner, type WrappedResponse } from "./content-api"
import { useLocale } from "./locale"

interface HomeContent { founders: Founder[]; companies: Company[]; partners: Partner[]; newsItems: NewsItem[]; loading: boolean; failed: string[] }
const empty: HomeContent = { founders: [], companies: [], partners: [], newsItems: [], loading: true, failed: [] }

function items<T>(result: PromiseSettledResult<WrappedResponse<T[]>>): T[] {
  return result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : []
}

export function useHomeContent(): HomeContent & { retry: () => void } {
  const { locale } = useLocale()
  const [content, setContent] = useState<HomeContent>(empty)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const options = { params: { per_page: 12 }, headers: { "X-Locale": locale } }
    // Each section remains independent; never substitute fictional membership data.
    void Promise.allSettled([
      api.get<WrappedResponse<ApiFounder[]>>("/founders", options),
      api.get<WrappedResponse<ApiCompany[]>>("/companies", options),
      api.get<WrappedResponse<ApiPartner[]>>("/partners", options),
      api.get<WrappedResponse<ApiNewsItem[]>>("/news", options),
    ]).then(([founders, companies, partners, news]) => {
      if (!active) return
      setContent({
        loading: false,
        failed: [founders, companies, partners, news].flatMap((result, index) => result.status === "rejected" ? [ ["founders", "companies", "partners", "news"][index] ] : []),
        founders: items(founders).map(mapFounder),
        companies: items(companies).map(mapCompany),
        partners: items(partners).map(mapPartner).filter((partner) => partner.status === "Confirmed"),
        newsItems: items(news).map(mapNewsItem),
      })
    })
    return () => { active = false }
  }, [locale, attempt])
  return { ...content, retry: () => { setContent(previous => ({ ...previous, loading: true })); setAttempt(value => value + 1) } }
}
