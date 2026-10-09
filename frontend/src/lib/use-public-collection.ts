"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "./api"
import { useLocale } from "./locale"

type Collection<T> = { data: T[]; meta?: { current_page?: number; last_page?: number }; links?: { next?: string | null } }
export function usePublicCollection<T extends { id: string | number }>(path: string) {
  const { locale } = useLocale()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const pending = useRef<AbortController | null>(null)
  const failedPage = useRef(1)
  const load = useCallback(async (page = 1) => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    failedPage.current = page
    setLoading(true); setError(null)
    if (page === 1) { setItems([]); setNextPage(null) }
    try {
      const response = await api.get<Collection<T>>(path, { params: { page, per_page: 24 }, headers: { "X-Locale": locale }, signal: controller.signal })
      if (controller.signal.aborted) return
      setItems(current => page === 1 ? response.data : [...new Map([...current, ...response.data].map(item => [item.id, item])).values()])
      setNextPage(response.links?.next || (response.meta?.last_page ?? 1) > page ? page + 1 : null)
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load content") }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }, [path, locale])
  useEffect(() => { void load(); return () => pending.current?.abort() }, [load])
  return { items, loading, error, hasMore: nextPage !== null, retry: () => void load(failedPage.current), loadMore: () => { if (nextPage && !loading) void load(nextPage) } }
}
