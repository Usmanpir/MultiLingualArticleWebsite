"use client"

import { useEffect, useRef, useState } from "react"
import { getEffectiveConsent, onConsentChange } from "@/components/consent/consent"

let scriptRequested = false

function loadAdsense(clientId: string) {
  if (scriptRequested) return
  scriptRequested = true
  const s = document.createElement("script")
  s.async = true
  s.crossOrigin = "anonymous"
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
  document.head.appendChild(s)
}

/**
 * A single AdSense unit. Loads nothing until advertising consent exists and
 * the slot is near the viewport. Never renders in development unless
 * NEXT_PUBLIC_ADSENSE_TEST=true (which sets data-adtest="on").
 */
export function GoogleAd({ clientId, slotId, format = "auto", responsive = true }: { clientId: string; slotId: string; format?: string; responsive?: boolean }) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const [consented, setConsented] = useState(false)
  const devBlocked = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ADSENSE_TEST !== "true"

  useEffect(() => {
    const update = () => setConsented(getEffectiveConsent().ads)
    update()
    return onConsentChange(update)
  }, [])

  useEffect(() => {
    if (!consented || devBlocked || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || pushed.current) return
        pushed.current = true
        io.disconnect()
        loadAdsense(clientId)
        try {
          const w = window as unknown as { adsbygoogle: unknown[] }
          ;(w.adsbygoogle = w.adsbygoogle || []).push({})
        } catch {
          /* ad blockers or duplicate pushes */
        }
      },
      { rootMargin: "300px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [consented, devBlocked, clientId])

  if (devBlocked) {
    return (
      <div className="flex h-full min-h-[inherit] items-center justify-center rounded-xl border border-dashed border-border-strong text-xs text-fg-subtle">
        AdSense slot {slotId} (hidden in development)
      </div>
    )
  }

  return (
    <ins
      ref={ref}
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      {...(process.env.NEXT_PUBLIC_ADSENSE_TEST === "true" ? { "data-adtest": "on" } : {})}
    />
  )
}
