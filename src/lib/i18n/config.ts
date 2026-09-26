/**
 * Locales the router knows about. To add a language:
 *  1. add it here,
 *  2. add a dictionary in ./dictionaries,
 *  3. create the Language row (Admin → Languages or the seed).
 * Content for a locale only appears once translations exist in the database.
 */
export const locales = ["en", "ur", "ar"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

type LocaleMeta = {
  name: string
  nativeName: string
  dir: "ltr" | "rtl"
  /** BCP-47 tag used for Intl formatting and <html lang>. */
  htmlLang: string
  intl: string
  ogLocale: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { name: "English", nativeName: "English", dir: "ltr", htmlLang: "en", intl: "en-US", ogLocale: "en_US" },
  ur: { name: "Urdu", nativeName: "اردو", dir: "rtl", htmlLang: "ur", intl: "ur-PK", ogLocale: "ur_PK" },
  ar: { name: "Arabic", nativeName: "العربية", dir: "rtl", htmlLang: "ar", intl: "ar", ogLocale: "ar_AR" },
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

export function dirOf(locale: string): "ltr" | "rtl" {
  return isLocale(locale) ? localeMeta[locale].dir : "ltr"
}

export function formatDate(date: Date | string, locale: string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date
  const intl = isLocale(locale) ? localeMeta[locale].intl : "en-US"
  // Fixed time zone keeps server output deterministic (no hydration mismatch).
  return new Intl.DateTimeFormat(intl, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC", ...opts }).format(d)
}

export function formatNumber(n: number, locale: string) {
  const intl = isLocale(locale) ? localeMeta[locale].intl : "en-US"
  return new Intl.NumberFormat(intl, { notation: n >= 10000 ? "compact" : "standard" }).format(n)
}
