import en, { type Dictionary } from "./dictionaries/en"
import ur from "./dictionaries/ur"
import ar from "./dictionaries/ar"
import { defaultLocale, isLocale, type Locale } from "./config"

export * from "./config"
export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { en, ur, ar }

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale]
}

/** Replace `{name}` placeholders. */
export function t(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}
