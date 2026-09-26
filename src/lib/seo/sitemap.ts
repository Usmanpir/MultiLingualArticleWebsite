import "server-only"
import { prisma } from "../prisma"
import { getActiveLanguages, liveArticleWhere } from "../data/public"
import { defaultLocale, isLocale } from "../i18n/config"
import { getSettings } from "../settings"
import { absoluteUrl, paths, staticPageKeys } from "../urls"

export const ARTICLES_PER_SITEMAP = 5000

type Entry = {
  loc: string
  lastmod?: Date
  alternates?: Record<string, string>
  images?: { loc: string; title?: string }[]
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

export function renderUrlset(entries: Entry[]) {
  const body = entries
    .map((e) => {
      const alts = e.alternates
        ? Object.entries(e.alternates)
            .map(([l, href]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(absoluteUrl(href))}"/>`)
            .join("")
        : ""
      const xDefault = e.alternates ? (e.alternates[defaultLocale] ?? Object.values(e.alternates)[0]) : undefined
      const imgs = (e.images ?? []).map((i) => `<image:image><image:loc>${esc(absoluteUrl(i.loc))}</image:loc></image:image>`).join("")
      return `<url><loc>${esc(absoluteUrl(e.loc))}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString()}</lastmod>` : ""}${alts}${
        xDefault && e.alternates && Object.keys(e.alternates).length > 1 ? `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(xDefault))}"/>` : ""
      }${imgs}</url>`
    })
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`
}

export function renderIndex(files: { name: string; lastmod?: Date }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((f) => `<sitemap><loc>${esc(absoluteUrl(`/sitemaps/${f.name}`))}</loc>${f.lastmod ? `<lastmod>${f.lastmod.toISOString()}</lastmod>` : ""}</sitemap>`).join("\n")}
</sitemapindex>`
}

/** Only indexable, self-canonical, published translations belong in the sitemap. */
function indexableTranslationWhere() {
  return { status: "PUBLISHED" as const, robots: "INDEX_FOLLOW" as const, canonicalUrl: null, language: { isActive: true }, article: liveArticleWhere() }
}

export async function sitemapFiles() {
  const settings = await getSettings()
  const count = await prisma.articleTranslation.count({ where: indexableTranslationWhere() })
  const latest = await prisma.articleTranslation.findFirst({ where: indexableTranslationWhere(), orderBy: { updatedAt: "desc" }, select: { updatedAt: true } })
  const files: { name: string; lastmod?: Date }[] = [{ name: "pages.xml" }, { name: "categories.xml", lastmod: latest?.updatedAt }]
  if (settings.sitemapIncludeTags) files.push({ name: "tags.xml", lastmod: latest?.updatedAt })
  if (settings.sitemapIncludeAuthors) files.push({ name: "authors.xml", lastmod: latest?.updatedAt })
  const chunks = Math.max(1, Math.ceil(count / ARTICLES_PER_SITEMAP))
  for (let i = 0; i < chunks; i++) files.push({ name: `articles-${i}.xml`, lastmod: latest?.updatedAt })
  return files
}

export async function pagesEntries(): Promise<Entry[]> {
  const langs = (await getActiveLanguages()).filter((l) => isLocale(l.code))
  const homeAlts = Object.fromEntries(langs.map((l) => [l.code, paths.home(l.code)]))
  const entries: Entry[] = langs.map((l) => ({ loc: paths.home(l.code), alternates: homeAlts }))
  const pages = await prisma.staticPage.findMany({ include: { translations: { select: { updatedAt: true, language: { select: { code: true, isActive: true } } } } } })
  for (const p of pages) {
    const trs = p.translations.filter((t) => t.language.isActive && isLocale(t.language.code))
    const alts = Object.fromEntries(trs.map((t) => [t.language.code, paths.page(t.language.code, p.key)]))
    for (const t of trs) {
      if (!(staticPageKeys as readonly string[]).includes(p.key)) continue
      entries.push({ loc: paths.page(t.language.code, p.key), lastmod: t.updatedAt, alternates: alts })
    }
  }
  return entries
}

async function taxonomyEntries(kind: "category" | "tag" | "author", threshold: number): Promise<Entry[]> {
  const langs = await getActiveLanguages()
  const codeOf = new Map(langs.map((l) => [l.id, l.code]))
  // Count live published stories per (entity, language) in one grouped query each.
  const rows = await prisma.articleTranslation.findMany({
    where: { status: "PUBLISHED", article: liveArticleWhere(), language: { isActive: true } },
    select: {
      languageId: true,
      updatedAt: true,
      article: { select: { category: { select: { slug: true } }, author: { select: { slug: true, isActive: true } }, tags: { select: { tag: { select: { slug: true } } } } } },
    },
  })
  const map = new Map<string, Map<string, { n: number; last: Date }>>()
  const bump = (slug: string, code: string, at: Date) => {
    const byLang = map.get(slug) ?? new Map()
    const cur = byLang.get(code) ?? { n: 0, last: at }
    byLang.set(code, { n: cur.n + 1, last: at > cur.last ? at : cur.last })
    map.set(slug, byLang)
  }
  for (const r of rows) {
    const code = codeOf.get(r.languageId)
    if (!code || !isLocale(code)) continue
    if (kind === "category") bump(r.article.category.slug, code, r.updatedAt)
    else if (kind === "author") {
      if (r.article.author.isActive) bump(r.article.author.slug, code, r.updatedAt)
    } else for (const t of r.article.tags) bump(t.tag.slug, code, r.updatedAt)
  }
  const entries: Entry[] = []
  for (const [slug, byLang] of map) {
    const ok = [...byLang.entries()].filter(([, v]) => v.n >= threshold)
    const alts = Object.fromEntries(ok.map(([code]) => [code, paths[kind](code, slug)]))
    for (const [code, v] of ok) entries.push({ loc: paths[kind](code, slug), lastmod: v.last, alternates: alts })
  }
  return entries
}

export const categoryEntries = () => taxonomyEntries("category", 1)
export const authorEntries = () => taxonomyEntries("author", 1)
export async function tagEntries() {
  const settings = await getSettings()
  return taxonomyEntries("tag", settings.tagIndexThreshold)
}

export async function articleEntries(chunk: number): Promise<Entry[]> {
  const rows = await prisma.articleTranslation.findMany({
    where: indexableTranslationWhere(),
    orderBy: { id: "asc" },
    skip: chunk * ARTICLES_PER_SITEMAP,
    take: ARTICLES_PER_SITEMAP,
    select: {
      slug: true,
      title: true,
      updatedAt: true,
      language: { select: { code: true } },
      article: {
        select: {
          category: { select: { slug: true } },
          featuredImage: { select: { url: true } },
          translations: { where: indexableTranslationWhere(), select: { slug: true, language: { select: { code: true } } } },
        },
      },
    },
  })
  return rows
    .filter((r) => isLocale(r.language.code))
    .map((r) => ({
      loc: paths.article(r.language.code, r.article.category.slug, r.slug),
      lastmod: r.updatedAt,
      alternates: Object.fromEntries(r.article.translations.filter((t) => isLocale(t.language.code)).map((t) => [t.language.code, paths.article(t.language.code, r.article.category.slug, t.slug)])),
      images: r.article.featuredImage ? [{ loc: r.article.featuredImage.url, title: r.title }] : [],
    }))
}
