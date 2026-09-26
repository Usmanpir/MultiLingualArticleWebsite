"use client"

import { useEffect } from "react"
import { track } from "@/components/analytics/track"

/**
 * Counts a view once per article per browser session, and only after the
 * reader has spent a few visible seconds on the page (filters bounces/prefetch).
 * The server further de-duplicates per anonymous visitor per day.
 */
export function ViewTracker({ articleId, lang, category }: { articleId: string; lang: string; category: string }) {
  useEffect(() => {
    track("article_view", { article_id: articleId, language: lang, category })

    const key = `fs:viewed:${articleId}`
    try {
      if (sessionStorage.getItem(key)) return
    } catch {}

    let timer: ReturnType<typeof setTimeout> | undefined
    const send = () => {
      try {
        sessionStorage.setItem(key, "1")
      } catch {}
      const body = JSON.stringify({ articleId, lang })
      if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
        fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {})
      }
    }
    const arm = () => {
      if (document.visibilityState === "visible" && !timer) timer = setTimeout(send, 5000)
      else if (document.visibilityState !== "visible" && timer) {
        clearTimeout(timer)
        timer = undefined
      }
    }
    arm()
    document.addEventListener("visibilitychange", arm)
    return () => {
      document.removeEventListener("visibilitychange", arm)
      if (timer) clearTimeout(timer)
    }
  }, [articleId, lang, category])

  return null
}
