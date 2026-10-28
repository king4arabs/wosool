import { ApiError } from "./api"

export type CollectionMeta = { current_page?: number; last_page?: number; total?: number; sectors?: { en: string; ar: string }[]; stages?: string[] }
export type Collection<T> = { data: T[]; meta?: CollectionMeta; links?: { next?: string | null } }
export type CollectionState<T> = {
  key: string; items: T[]; meta: CollectionMeta; loading: boolean; error: string | null
  nextPage: number | null; failedPage: number; snapshotAllowed: boolean; snapshotBlocked: boolean
}

export function initialCollection<T>(key: string): CollectionState<T> {
  return { key, items: [], meta: {}, loading: true, error: null, nextPage: null, failedPage: 1, snapshotAllowed: false, snapshotBlocked: false }
}

export function beginCollection<T>(state: CollectionState<T>, page: number): CollectionState<T> {
  return { ...state, ...(page === 1 ? { items: [], meta: {}, nextPage: null } : {}), loading: true, error: null, failedPage: page, snapshotAllowed: false }
}

export function receiveCollection<T extends { id: string | number }>(state: CollectionState<T>, response: Collection<T>, page: number): CollectionState<T> {
  return {
    ...state, loading: false, error: null, snapshotAllowed: false, snapshotBlocked: true,
    items: page === 1 ? response.data : [...new Map([...state.items, ...response.data].map(item => [item.id, item])).values()],
    meta: response.meta ?? {},
    nextPage: response.links?.next || (response.meta?.last_page ?? 1) > page ? page + 1 : null,
  }
}

export function failCollection<T>(state: CollectionState<T>, error: unknown): CollectionState<T> {
  const transient = error instanceof Error && (!(error instanceof ApiError) || error.status >= 500 && error.status <= 599)
  return {
    ...state, loading: false, error: error instanceof Error ? error.message : "Unable to load content",
    snapshotAllowed: transient && !state.snapshotBlocked && state.items.length === 0,
    snapshotBlocked: state.snapshotBlocked || !transient,
    // A denied/withdrawn collection invalidates previously loaded pages too.
    // Retry from page one so cleared records cannot be skipped.
    ...(!transient ? { items: [], meta: {}, nextPage: null, failedPage: 1 } : {}),
  }
}
