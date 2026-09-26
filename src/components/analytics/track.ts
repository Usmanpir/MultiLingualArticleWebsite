"use client"

type Gtag = (...args: unknown[]) => void

/** Sends a GA4 event if analytics has loaded (i.e. is configured and consented). No-op otherwise. */
export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag === "function") gtag("event", event, params)
}
