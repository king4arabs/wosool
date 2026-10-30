"use client"

import { useSyncExternalStore } from "react"
import { linkedFounderSlug } from "./founder-card-links"

function subscribe(listener: () => void): () => void {
  window.addEventListener("popstate", listener)
  window.addEventListener("pageshow", listener)
  return () => {
    window.removeEventListener("popstate", listener)
    window.removeEventListener("pageshow", listener)
  }
}

function currentFounderSlug(): string {
  return linkedFounderSlug(window.location.search)
}

/** Hydration-safe account-to-public-card deep link, no effect-driven state updates. */
export function useLinkedFounderSlug(): string {
  return useSyncExternalStore(subscribe, currentFounderSlug, () => "")
}
