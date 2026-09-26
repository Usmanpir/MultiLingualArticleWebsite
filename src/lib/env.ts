/**
 * Typed access to environment variables. Only NEXT_PUBLIC_* values are ever
 * inlined into client bundles; everything else stays on the server.
 */
function bool(v: string | undefined, fallback = false) {
  if (v === undefined || v === "") return fallback
  return v === "true" || v === "1"
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")

export const publicEnv = {
  siteUrl,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
  /** Master switch for AdSense. Ads only render when this AND a client id AND a configured slot exist. */
  adsenseEnabled: bool(process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? process.env.ADSENSE_ENABLED),
  /**
   * Comma-separated ISO country codes where opt-in consent is required before
   * analytics/ads load, or "*" (default) to require it everywhere.
   */
  consentRegions: process.env.NEXT_PUBLIC_CONSENT_REGIONS || "*",
}

export function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET (or NEXTAUTH_SECRET) must be set to a random string of at least 32 characters.")
    }
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-0000")
  }
  return new TextEncoder().encode(secret)
}
