"use client"

import { useEffect, useState } from "react"
import type { Company, Founder, NewsItem, Partner } from "@/types"
import { api } from "./api"
import { mapCompany, mapFounder, mapNewsItem, mapPartner, type ApiCompany, type ApiFounder, type ApiNewsItem, type ApiPartner, type WrappedResponse } from "./content-api"
import { useLocale } from "./locale"

interface HomeContent { founders: Founder[]; companies: Company[]; partners: Partner[]; newsItems: NewsItem[] }
const empty: HomeContent = { founders: [], companies: [], partners: [], newsItems: [] }

function items<T>(result: PromiseSettledResult<WrappedResponse<T[]>>): T[] {
  return result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : []
}

export function useHomeContent(): HomeContent {
  const { locale } = useLocale()
  const [content, setContent] = useState<HomeContent>(empty)

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
        founders: items(founders).map(mapFounder),
        companies: items(companies).map(mapCompany),
        partners: items(partners).map(mapPartner).filter((partner) => partner.status === "Confirmed"),
        newsItems: items(news).map(mapNewsItem),
      })
    })
    return () => { active = false }
  }, [locale])
  return content
}
