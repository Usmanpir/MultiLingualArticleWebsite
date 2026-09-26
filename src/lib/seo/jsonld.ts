import { brandConfig } from "../brand"
import { localeMeta, type Locale } from "../i18n/config"
import type { SiteSettings } from "../settings"
import { absoluteUrl, paths } from "../urls"

/**
 * schema.org builders. Every value must reflect content that is visible on the
 * page — no invented ratings, reviews or credentials.
 */

const orgId = () => `${absoluteUrl("/")}#organization`
const siteId = (lang: string) => `${absoluteUrl(paths.home(lang))}#website`

export function organizationJsonLd(settings: SiteSettings) {
  const sameAs = [brandConfig.social.x, brandConfig.social.facebook, brandConfig.social.linkedin, brandConfig.social.youtube, brandConfig.social.instagram].filter(Boolean)
  return {
    "@type": "NewsMediaOrganization",
    "@id": orgId(),
    name: settings.organizationName,
    url: absoluteUrl("/"),
    logo: settings.organizationLogo ? { "@type": "ImageObject", url: absoluteUrl(settings.organizationLogo), width: 512, height: 512 } : undefined,
    email: brandConfig.contact.email,
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function websiteJsonLd(settings: SiteSettings, lang: Locale, description: string) {
  return {
    "@type": "WebSite",
    "@id": siteId(lang),
    url: absoluteUrl(paths.home(lang)),
    name: settings.siteName,
    description,
    inLanguage: localeMeta[lang].htmlLang,
    publisher: { "@id": orgId() },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(`/${lang}/search`)}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function articleJsonLd(args: {
  settings: SiteSettings
  lang: Locale
  url: string
  headline: string
  description: string
  images: string[]
  datePublished: Date
  dateModified: Date
  author: { name: string; path: string; jobTitle?: string | null }
  section: string
  keywords: string[]
  wordCount: number
}) {
  return {
    "@type": args.settings.newsArticleSchema ? "NewsArticle" : "Article",
    "@id": `${args.url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    headline: args.headline.slice(0, 110),
    description: args.description,
    image: args.images.map((i) => absoluteUrl(i)),
    datePublished: args.datePublished.toISOString(),
    dateModified: args.dateModified.toISOString(),
    inLanguage: localeMeta[args.lang].htmlLang,
    articleSection: args.section,
    keywords: args.keywords.length ? args.keywords.join(", ") : undefined,
    wordCount: args.wordCount,
    author: [{ "@type": "Person", name: args.author.name, url: absoluteUrl(args.author.path), jobTitle: args.author.jobTitle || undefined }],
    publisher: { "@id": orgId() },
    isPartOf: { "@id": siteId(args.lang) },
  }
}

export function personJsonLd(args: { name: string; path: string; image?: string | null; jobTitle?: string | null; description?: string | null; sameAs: string[] }) {
  return {
    "@type": "Person",
    name: args.name,
    url: absoluteUrl(args.path),
    image: args.image ? absoluteUrl(args.image) : undefined,
    jobTitle: args.jobTitle || undefined,
    description: args.description || undefined,
    ...(args.sameAs.length ? { sameAs: args.sameAs } : {}),
    worksFor: { "@id": orgId() },
  }
}

export function collectionPageJsonLd(args: { name: string; description: string; path: string; lang: Locale }) {
  return {
    "@type": "CollectionPage",
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    inLanguage: localeMeta[args.lang].htmlLang,
    isPartOf: { "@id": siteId(args.lang) },
  }
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes }
}
