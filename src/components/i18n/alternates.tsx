"use client"

import { useEffect, useSyncExternalStore } from "react"

/**
 * Pages whose URLs differ per language (articles have localised slugs)
 * register their real alternates here so the header language switcher never
 * links to a translation that doesn't exist.
 */
type Alternates = Record<string, string> | null

let current: Alternates = null
const listeners = new Set<() => void>()

function set(next: Alternates) {
  current = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAlternates() {
  return useSyncExternalStore(subscribe, () => current, () => null)
}

export function RegisterAlternates({ map }: { map: Record<string, string> }) {
  const key = JSON.stringify(map)
  useEffect(() => {
    set(JSON.parse(key))
    return () => set(null)
  }, [key])
  return null
}
