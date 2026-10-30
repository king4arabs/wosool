"use client"

import { useSyncExternalStore } from "react"

function subscribe(listener: () => void): () => void {
  window.addEventListener("popstate", listener)
  window.addEventListener("pageshow", listener)
  return () => {
    window.removeEventListener("popstate", listener)
    window.removeEventListener("pageshow", listener)
  }
}

function currentFounderSlug(): string {
  const value = new URLSearchParams(window.location.search).get("founder")?.trim() ?? ""
  return value.length <= 255 ? value : ""
}

/** Hydration-safe account-to-public-card deep link, no effect-driven state updates. */
export function useLinkedFounderSlug(): string {
  return useSyncExternalStore(subscribe, currentFounderSlug, () => "")
}
