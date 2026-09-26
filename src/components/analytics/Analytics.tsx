"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { getEffectiveConsent, onConsentChange } from "@/components/consent/consent"

/**
 * Google Analytics 4. The tag is only requested after analytics consent
 * (or where consent isn't required). Page views for client-side navigations
 * are captured by GA4 enhanced measurement ("page changes based on browser
 * history events"), which is on by default; outbound clicks likewise.
 */
export function Analytics({ measurementId, lang }: { measurementId: string; lang: string }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const update = () => setAllowed(getEffectiveConsent().analytics)
    update()
    return onConsentChange(update)
  }, [])

  if (!measurementId || !allowed) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)},{anonymize_ip:true,content_language:${JSON.stringify(lang)}});`}
      </Script>
    </>
  )
}
