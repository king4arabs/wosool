"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "./api"
import { useLocale } from "./locale"
import { beginCollection, failCollection, initialCollection, receiveCollection, type Collection } from "./public-collection-state"

export function usePublicCollection<T extends { id: string | number }>(path: string) {
  const { locale } = useLocale()
  const key = `${path}\u0000${locale}`
  const [stored, setState] = useState(() => initialCollection<T>(key))
  // Never render the previous resource/language while its replacement is loading.
  const state = stored.key === key ? stored : initialCollection<T>(key)
  const pending = useRef<AbortController | null>(null)
  const load = useCallback(async (page = 1) => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    setState(previous => beginCollection(previous.key === key ? previous : initialCollection<T>(key), page))
    try {
      const response = await api.get<Collection<T>>(path, { params: { page, per_page: 24 }, headers: { "X-Locale": locale }, signal: controller.signal })
      if (controller.signal.aborted) return
      if (!response || !Array.isArray(response.data)) throw new Error("Invalid public collection response")
      setState(previous => previous.key === key ? receiveCollection(previous, response, page) : previous)
    } catch (error) {
      if (!controller.signal.aborted) setState(previous => previous.key === key ? failCollection(previous, error) : previous)
    }
  }, [path, locale, key])
  useEffect(() => { void load(); return () => pending.current?.abort() }, [load])
  return { items: state.items, meta: state.meta, loading: state.loading, error: state.error, snapshotAllowed: state.snapshotAllowed, hasMore: state.nextPage !== null, retry: () => void load(state.failedPage), loadMore: () => { if (state.nextPage && !state.loading) void load(state.nextPage) } }
}
