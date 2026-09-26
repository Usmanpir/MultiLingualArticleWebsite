import type { Metadata } from "next"
import { defaultLocale, isLocale, localeMeta } from "../i18n/config"
import { absoluteUrl } from "../urls"
import type { SiteSettings } from "../settings"

export type RobotsMode = "index" | "noindex-follow" | "noindex-nofollow"

type BuildArgs = {
  settings: SiteSettings
  lang: string
  title: string
  /** Use the title verbatim (no "| Site" template). */
  absoluteTitle?: boolean
  description: string
  path: string
  /** Override canonical (absolute or path). */
  canonical?: string | null
  /**
   * Map of language code → path for versions that actually exist.
   * Pass null for pages that have no language equivalents.
   */
  alternates?: Record<string, string> | null
  image?: { url: string; width?: number; height?: number; alt?: string } | null
  type?: "website" | "article" | "profile"
  robots?: RobotsMode
  article?: {
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    section?: string
    tags?: string[]
  }
}

export function robotsFor(mode: RobotsMode, settings: SiteSettings): Metadata["robots"] {
  const index = settings.indexSite && mode === "index"
  const follow = mode !== "noindex-nofollow"
  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      // Enables large image previews in Search & Discover.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  }
}

export function buildMetadata(a: BuildArgs): Metadata {
  const url = absoluteUrl(a.path)
  const canonical = a.canonical ? absoluteUrl(a.canonical) : url
  const ogLocale = isLocale(a.lang) ? localeMeta[a.lang].ogLocale : "en_US"

  let languages: Record<string, string> | undefined
  if (a.alternates && Object.keys(a.alternates).length > 0) {
    languages = {}
    for (const [code, p] of Object.entries(a.alternates)) languages[code] = absoluteUrl(p)
    const xDefault = a.alternates[defaultLocale] ?? a.alternates[a.lang]
    if (xDefault) languages["x-default"] = absoluteUrl(xDefault)
  }

  const image = a.image ?? (a.settings.defaultOgImage ? { url: a.settings.defaultOgImage, width: 1200, height: 630, alt: a.settings.siteName } : null)
  const images = image ? [{ url: absoluteUrl(image.url), width: image.width, height: image.height, alt: image.alt ?? a.title }] : undefined
  const fullTitle = a.absoluteTitle ? a.title : `${a.title} | ${a.settings.siteName}`

  return {
    title: a.absoluteTitle ? { absolute: a.title } : a.title,
    description: a.description,
    alternates: { canonical, languages },
    robots: robotsFor(a.robots ?? "index", a.settings),
    openGraph: {
      type: a.type ?? "website",
      url: canonical,
      siteName: a.settings.siteName,
      title: fullTitle,
      description: a.description,
      locale: ogLocale,
      alternateLocale: a.alternates
        ? Object.keys(a.alternates).filter((c) => c !== a.lang && isLocale(c)).map((c) => localeMeta[c as keyof typeof localeMeta].ogLocale)
        : undefined,
      images,
      ...(a.type === "article" && a.article
        ? {
            publishedTime: a.article.publishedTime,
            modifiedTime: a.article.modifiedTime,
            authors: a.article.authors,
            section: a.article.section,
            tags: a.article.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: a.description,
      site: a.settings.xHandle || undefined,
      images: images?.map((i) => i.url),
    },
  }
}
