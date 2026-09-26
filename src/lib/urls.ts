import { siteUrl } from "./env"

/**
 * Canonical URL scheme — the single source of truth for public links.
 *   /{lang}                          home
 *   /{lang}/{category}/{slug}        article (canonical)
 *   /{lang}/article/{slug}           short link → 308 to canonical
 *   /{lang}/category/{slug}[/page/n] section
 *   /{lang}/tag/{slug}[/page/n]      topic
 *   /{lang}/author/{slug}[/page/n]   author
 */
export const paths = {
  home: (lang: string) => `/${lang}`,
  article: (lang: string, categorySlug: string, slug: string) => `/${lang}/${categorySlug}/${slug}`,
  category: (lang: string, slug: string, page = 1) => `/${lang}/category/${slug}${page > 1 ? `/page/${page}` : ""}`,
  tag: (lang: string, slug: string, page = 1) => `/${lang}/tag/${slug}${page > 1 ? `/page/${page}` : ""}`,
  author: (lang: string, slug: string, page = 1) => `/${lang}/author/${slug}${page > 1 ? `/page/${page}` : ""}`,
  search: (lang: string, q?: string) => `/${lang}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
  page: (lang: string, key: string) => `/${lang}/${key}`,
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

/** Static page keys (rendered at /{lang}/{key}). */
export const staticPageKeys = [
  "about",
  "contact",
  "privacy",
  "terms",
  "cookie-policy",
  "editorial-policy",
  "advertising-policy",
] as const
export type StaticPageKey = (typeof staticPageKeys)[number]

/** Route segments that can never be used as a category slug. */
export const reservedSlugs = new Set<string>([
  "article",
  "category",
  "tag",
  "author",
  "search",
  "newsletter",
  "api",
  "admin",
  "login",
  "page",
  ...staticPageKeys,
])
