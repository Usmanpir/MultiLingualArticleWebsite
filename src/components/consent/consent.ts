"use client"

/**
 * Consent is stored in a first-party "necessary" cookie:
 *   fs_consent = {"v":1,"analytics":bool,"ads":bool,"ts":number}
 * Region: `fs_country` (set by proxy from Vercel's geo header) is compared to
 * NEXT_PUBLIC_CONSENT_REGIONS ("*" = everywhere, "none" = nowhere, or "DE,FR,GB,…").
 */
export type Consent = { v: 1; analytics: boolean; ads: boolean; ts: number }

const COOKIE = "fs_consent"
const EVENT = "fs:consent"
export const OPEN_EVENT = "fs:open-consent"

function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : null
}

export function consentRequired() {
  const regions = (process.env.NEXT_PUBLIC_CONSENT_REGIONS || "*").trim().toUpperCase()
  if (regions === "*") return true
  if (regions === "NONE") return false
  const country = readCookie("fs_country")
  if (!country) return true // unknown location → be conservative
  return regions.split(",").map((r) => r.trim()).includes(country.toUpperCase())
}

export function getStoredConsent(): Consent | null {
  try {
    const raw = readCookie(COOKIE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent
    return parsed?.v === 1 ? parsed : null
  } catch {
    return null
  }
}

/** Effective consent: stored choice, or implicit grant where opt-in isn't required. */
export function getEffectiveConsent(): { analytics: boolean; ads: boolean; decided: boolean } {
  const stored = getStoredConsent()
  if (stored) return { analytics: stored.analytics, ads: stored.ads, decided: true }
  if (!consentRequired()) return { analytics: true, ads: true, decided: false }
  return { analytics: false, ads: false, decided: false }
}

export function saveConsent(choice: { analytics: boolean; ads: boolean }) {
  const value: Consent = { v: 1, ...choice, ts: Date.now() }
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`
  document.documentElement.dataset.consentAds = choice.ads ? "1" : "0"
  document.documentElement.dataset.consentAnalytics = choice.analytics ? "1" : "0"
  window.dispatchEvent(new Event(EVENT))
}

export function onConsentChange(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
