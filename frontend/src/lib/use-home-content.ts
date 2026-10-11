"use client"

import { useEffect, useState } from "react"
import type { Company, Founder, NewsItem, Partner } from "@/types"
import { api } from "./api"
import { mapCompany, mapFounder, mapNewsItem, mapPartner, type ApiCompany, type ApiFounder, type ApiNewsItem, type ApiPartner, type WrappedResponse } from "./content-api"
import { useLocale } from "./locale"

interface HomeContent { founders: Founder[]; companies: Company[]; partners: Partner[]; newsItems: NewsItem[]; loading: boolean; failed: string[] }
const empty: HomeContent = { founders: [], companies: [], partners: [], newsItems: [], loading: true, failed: [] }

export function useHomeContent(): HomeContent & { retry: () => void } {
  const { locale } = useLocale()
  const [content, setContent] = useState<HomeContent>(empty)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const options = { params: { per_page: 12 }, headers: { "X-Locale": locale }, signal: controller.signal }
    let pending = 4
    // Publish sections independently, so a slow endpoint cannot hold up the page.
    // Retain previously loaded public content during a temporary retry failure.
    async function section<T>(key: string, request: Promise<WrappedResponse<T[]>>, map: (items: T[]) => Partial<HomeContent>) {
      try {
        const result = await request
        if (active) setContent(previous => ({ ...previous, ...map(Array.isArray(result.data) ? result.data : []), failed: previous.failed.filter(value => value !== key) }))
      } catch {
        if (active) setContent(previous => ({ ...previous, failed: [...new Set([...previous.failed, key])] }))
      } finally {
        pending -= 1
        if (active && pending === 0) setContent(previous => ({ ...previous, loading: false }))
      }
    }
    void section('founders', api.get<WrappedResponse<ApiFounder[]>>("/founders", options), items => ({ founders: items.map(mapFounder) }))
    void section('companies', api.get<WrappedResponse<ApiCompany[]>>("/companies", options), items => ({ companies: items.map(mapCompany) }))
    void section('partners', api.get<WrappedResponse<ApiPartner[]>>("/partners", options), items => ({ partners: items.map(mapPartner).filter(partner => partner.status === 'Confirmed') }))
    void section('news', api.get<WrappedResponse<ApiNewsItem[]>>("/news", options), items => ({ newsItems: items.map(mapNewsItem) }))
    return () => { active = false; controller.abort() }
  }, [locale, attempt])
  return { ...content, retry: () => { setContent(previous => ({ ...previous, loading: true })); setAttempt(value => value + 1) } }
}
