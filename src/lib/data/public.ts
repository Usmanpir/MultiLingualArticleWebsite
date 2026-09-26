import "server-only"
import { cache } from "react"
import { prisma } from "../prisma"
import type { Prisma } from "@/generated/prisma/client"
import { defaultLocale } from "../i18n/config"
import { paths } from "../urls"

export const PAGE_SIZE = 12

// ─────────────────────────────────────────────────────────────
// Languages
// ─────────────────────────────────────────────────────────────

export const getActiveLanguages = cache(async () =>
  prisma.language.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { code: "asc" }] }),
)

export const getLanguageId = cache(async (code: string) => {
  const langs = await getActiveLanguages()
  return langs.find((l) => l.code === code)?.id ?? null
})

async function langIds(code: string) {
  const langs = await getActiveLanguages()
  const current = langs.find((l) => l.code === code)?.id
  const fallback = langs.find((l) => l.code === defaultLocale)?.id
  return { current: current ?? null, fallback: fallback ?? null, both: [current, fallback].filter(Boolean) as string[] }
}

function pick<T extends { languageId: string }>(rows: T[], current: string | null, fallback: string | null) {
  return rows.find((r) => r.languageId === current) ?? rows.find((r) => r.languageId === fallback) ?? rows[0]
}

// ─────────────────────────────────────────────────────────────
// Visibility rules
// ─────────────────────────────────────────────────────────────

/** An article is live when PUBLISHED, or SCHEDULED and its go-live time has passed. */
export function liveArticleWhere(now = new Date()): Prisma.ArticleWhereInput {
  return {
    publishedAt: { lte: now },
    OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED" }],
  }
}

function liveTranslationWhere(languageId: string, extra: Prisma.ArticleWhereInput = {}): Prisma.ArticleTranslationWhereInput {
  return { languageId, status: "PUBLISHED", article: { ...liveArticleWhere(), ...extra } }
}

// ─────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────

const cardSelect = (languageIds: string[]) =>
  ({
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    readingTimeMinutes: true,
    updatedAt: true,
    article: {
      select: {
        id: true,
        publishedAt: true,
        featured: true,
        trending: true,
        views: true,
        category: { select: { id: true, slug: true, color: true, translations: { where: { languageId: { in: languageIds } }, select: { name: true, languageId: true } } } },
        author: { select: { name: true, slug: true, avatarUrl: true } },
        featuredImage: { select: { url: true, width: true, height: true, alt: true } },
      },
    },
  }) satisfies Prisma.ArticleTranslationSelect

type CardRow = Prisma.ArticleTranslationGetPayload<{ select: ReturnType<typeof cardSelect> }>

export type ArticleCardData = {
  id: string
  translationId: string
  lang: string
  title: string
  slug: string
  href: string
  excerpt: string
  readingTime: number
  publishedAt: Date
  updatedAt: Date
  featured: boolean
  trending: boolean
  views: number
  category: { slug: string; name: string; color: string }
  author: { name: string; slug: string; avatarUrl: string | null }
  image: { url: string; width: number; height: number; alt: string } | null
}

function toCard(row: CardRow, lang: string, ids: { current: string | null; fallback: string | null }): ArticleCardData {
  const a = row.article
  const catName = pick(a.category.translations, ids.current, ids.fallback)?.name ?? a.category.slug
  return {
    id: a.id,
    translationId: row.id,
    lang,
    title: row.title,
    slug: row.slug,
    href: paths.article(lang, a.category.slug, row.slug),
    excerpt: row.excerpt,
    readingTime: row.readingTimeMinutes,
    publishedAt: a.publishedAt ?? row.updatedAt,
    updatedAt: row.updatedAt,
    featured: a.featured,
    trending: a.trending,
    views: a.views,
    category: { slug: a.category.slug, name: catName, color: a.category.color },
    author: a.author,
    image: a.featuredImage,
  }
}

async function listCards(
  lang: string,
  opts: { where?: Prisma.ArticleWhereInput; orderBy?: Prisma.ArticleTranslationOrderByWithRelationInput[]; take: number; skip?: number },
) {
  const ids = await langIds(lang)
  if (!ids.current) return []
  const rows = await prisma.articleTranslation.findMany({
    where: liveTranslationWhere(ids.current, opts.where),
    orderBy: opts.orderBy ?? [{ article: { publishedAt: "desc" } }],
    take: opts.take,
    skip: opts.skip,
    select: cardSelect(ids.both),
  })
  return rows.map((r) => toCard(r, lang, ids))
}

async function pagedCards(lang: string, where: Prisma.ArticleWhereInput, page: number) {
  const ids = await langIds(lang)
  if (!ids.current) return { items: [], total: 0, totalPages: 0, page }
  const [total, items] = await Promise.all([
    prisma.articleTranslation.count({ where: liveTranslationWhere(ids.current, where) }),
    listCards(lang, { where, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
  ])
  return { items, total, totalPages: Math.ceil(total / PAGE_SIZE), page }
}

// ─────────────────────────────────────────────────────────────
// Navigation & home
// ─────────────────────────────────────────────────────────────

export const getNavCategories = cache(async (lang: string) => {
  const ids = await langIds(lang)
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    select: { id: true, slug: true, color: true, translations: { where: { languageId: { in: ids.both } }, select: { name: true, description: true, languageId: true } } },
  })
  return cats.map((c) => {
    const tr = pick(c.translations, ids.current, ids.fallback)
    return { id: c.id, slug: c.slug, color: c.color, name: tr?.name ?? c.slug, description: tr?.description ?? "" }
  })
})

export const getHomeData = cache(async (lang: string) => {
  const [featuredList, trendingFlag, latest, picks, popular, categories] = await Promise.all([
    listCards(lang, { where: { featured: true }, take: 1 }),
    listCards(lang, { where: { trending: true }, take: 5 }),
    listCards(lang, { take: 10 }),
    listCards(lang, { where: { editorsPick: true }, take: 4 }),
    listCards(lang, { orderBy: [{ article: { views: "desc" } }], take: 5 }),
    getNavCategories(lang),
  ])
  const featured = featuredList[0] ?? latest[0] ?? null
  const seen = new Set(featured ? [featured.id] : [])
  const latestRest = latest.filter((a) => !seen.has(a.id)).slice(0, 9)

  const sectionSlugs = ["technology", "ai", "science", "future", "business"]
  const sectionCats = sectionSlugs.map((s) => categories.find((c) => c.slug === s)).filter((c): c is NonNullable<typeof c> => !!c)
  const sections = (
    await Promise.all(
      sectionCats.map(async (cat) => ({ category: cat, items: await listCards(lang, { where: { categoryId: cat.id }, take: 4 }) })),
    )
  ).filter((s) => s.items.length > 0)

  const langId = await getLanguageId(lang)
  const totalArticles = langId ? await prisma.articleTranslation.count({ where: liveTranslationWhere(langId) }) : 0

  return { featured, trending: trendingFlag.length ? trendingFlag : popular, latest: latestRest, picks, popular, sections, categories, totalArticles }
})

// ─────────────────────────────────────────────────────────────
// Article
// ─────────────────────────────────────────────────────────────

export const getArticleBySlug = cache(async (lang: string, slug: string) => {
  const ids = await langIds(lang)
  if (!ids.current) return null
  const tr = await prisma.articleTranslation.findFirst({
    where: { slug, ...liveTranslationWhere(ids.current) },
    include: {
      article: {
        include: {
          category: { include: { translations: { where: { languageId: { in: ids.both } } } } },
          author: { include: { translations: { where: { languageId: { in: ids.both } } } } },
          featuredImage: true,
          tags: { include: { tag: { include: { translations: { where: { languageId: { in: ids.both } } } } } } },
          // Sibling translations for hreflang / language switcher — only published ones.
          translations: {
            where: { status: "PUBLISHED", language: { isActive: true } },
            select: { slug: true, title: true, language: { select: { code: true, nativeName: true } } },
          },
        },
      },
    },
  })
  if (!tr) return null
  const a = tr.article
  const catTr = pick(a.category.translations, ids.current, ids.fallback)
  const authorTr = pick(a.author.translations, ids.current, ids.fallback)
  return {
    translation: tr,
    article: a,
    category: { id: a.category.id, slug: a.category.slug, color: a.category.color, name: catTr?.name ?? a.category.slug },
    author: { ...a.author, bio: authorTr?.bio ?? null, jobTitle: authorTr?.jobTitle ?? null },
    tags: a.tags.map(({ tag }) => ({ id: tag.id, slug: tag.slug, name: pick(tag.translations, ids.current, ids.fallback)?.name ?? tag.slug })),
    alternates: a.translations.map((t) => ({ lang: t.language.code, nativeName: t.language.nativeName, title: t.title, href: paths.article(t.language.code, a.category.slug, t.slug) })),
  }
})

/** Finds a live translation by slug regardless of category (for /article/[slug] and moved categories). */
export const findArticlePathBySlug = cache(async (lang: string, slug: string) => {
  const langId = await getLanguageId(lang)
  if (!langId) return null
  const tr = await prisma.articleTranslation.findFirst({
    where: { slug, ...liveTranslationWhere(langId) },
    select: { slug: true, article: { select: { category: { select: { slug: true } } } } },
  })
  return tr ? paths.article(lang, tr.article.category.slug, tr.slug) : null
})

export async function getRelatedArticles(lang: string, articleId: string, categoryId: string, tagIds: string[], take = 3) {
  const byTags = tagIds.length
    ? await listCards(lang, { where: { id: { not: articleId }, tags: { some: { tagId: { in: tagIds } } } }, take })
    : []
  if (byTags.length >= take) return byTags
  const exclude = [articleId, ...byTags.map((a) => a.id)]
  const byCat = await listCards(lang, { where: { id: { notIn: exclude }, categoryId }, take: take - byTags.length })
  const combined = [...byTags, ...byCat]
  if (combined.length >= take) return combined
  const latest = await listCards(lang, { where: { id: { notIn: [...exclude, ...byCat.map((a) => a.id)] } }, take: take - combined.length })
  return [...combined, ...latest]
}

export async function getPrevNext(lang: string, articleId: string, publishedAt: Date) {
  const [prev, next] = await Promise.all([
    listCards(lang, { where: { id: { not: articleId }, publishedAt: { lt: publishedAt } }, take: 1 }),
    listCards(lang, { where: { id: { not: articleId }, publishedAt: { gt: publishedAt, lte: new Date() } }, orderBy: [{ article: { publishedAt: "asc" } }], take: 1 }),
  ])
  return { prev: prev[0] ?? null, next: next[0] ?? null }
}

export async function getPopularArticles(lang: string, excludeId: string, take = 4) {
  return listCards(lang, { where: { id: { not: excludeId } }, orderBy: [{ article: { views: "desc" } }], take })
}

export async function getApprovedComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorName: true, content: true, createdAt: true },
    take: 200,
  })
}

// ─────────────────────────────────────────────────────────────
// Archives
// ─────────────────────────────────────────────────────────────

export const getCategoryBySlug = cache(async (lang: string, slug: string) => {
  const cats = await getNavCategories(lang)
  const cat = cats.find((c) => c.slug === slug)
  if (!cat) return null
  const ids = await langIds(lang)
  const tr = await prisma.categoryTranslation.findFirst({ where: { categoryId: cat.id, languageId: ids.current ?? "" }, select: { seoTitle: true, seoDescription: true } })
  return { ...cat, seoTitle: tr?.seoTitle ?? null, seoDescription: tr?.seoDescription ?? null }
})

export async function getCategoryArticles(lang: string, categoryId: string, page: number) {
  return pagedCards(lang, { categoryId }, page)
}

export const getTagBySlug = cache(async (lang: string, slug: string) => {
  const ids = await langIds(lang)
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true, slug: true, translations: { where: { languageId: { in: ids.both } }, select: { name: true, description: true, languageId: true } } },
  })
  if (!tag) return null
  const tr = pick(tag.translations, ids.current, ids.fallback)
  return { id: tag.id, slug: tag.slug, name: tr?.name ?? tag.slug, description: tr?.description ?? null }
})

export async function getTagArticles(lang: string, tagId: string, page: number) {
  return pagedCards(lang, { tags: { some: { tagId } } }, page)
}

export const getAuthorBySlug = cache(async (lang: string, slug: string) => {
  const ids = await langIds(lang)
  const author = await prisma.author.findFirst({
    where: { slug, isActive: true },
    include: { translations: { where: { languageId: { in: ids.both } } } },
  })
  if (!author) return null
  const tr = pick(author.translations, ids.current, ids.fallback)
  return { ...author, bio: tr?.bio ?? null, jobTitle: tr?.jobTitle ?? null }
})

/**
 * Number of live stories per language for an archive — used so hreflang and
 * indexability only point at archive pages that actually have content.
 */
export async function archiveLanguageCounts(where: Prisma.ArticleWhereInput) {
  const [groups, langs] = await Promise.all([
    prisma.articleTranslation.groupBy({ by: ["languageId"], where: { status: "PUBLISHED", article: { ...liveArticleWhere(), ...where } }, _count: { _all: true } }),
    getActiveLanguages(),
  ])
  const out: Record<string, number> = {}
  for (const g of groups) {
    const code = langs.find((l) => l.id === g.languageId)?.code
    if (code) out[code] = g._count._all
  }
  return out
}

export async function getAuthorArticles(lang: string, authorId: string, page: number) {
  return pagedCards(lang, { authorId }, page)
}

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────

export async function searchArticles(lang: string, q: string, page: number) {
  const ids = await langIds(lang)
  if (!ids.current) return { items: [], total: 0, totalPages: 0, page }
  const term = q.trim().slice(0, 100)
  const contains = { contains: term, mode: "insensitive" as const }
  const where: Prisma.ArticleTranslationWhereInput = {
    ...liveTranslationWhere(ids.current),
    OR: [
      { title: contains },
      { excerpt: contains },
      { article: { category: { translations: { some: { name: contains } } } } },
      { article: { tags: { some: { tag: { translations: { some: { name: contains } } } } } } },
    ],
  }
  const [total, rows] = await Promise.all([
    prisma.articleTranslation.count({ where }),
    prisma.articleTranslation.findMany({
      where,
      orderBy: [{ article: { publishedAt: "desc" } }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: cardSelect(ids.both),
    }),
  ])
  return { items: rows.map((r) => toCard(r, lang, ids)), total, totalPages: Math.ceil(total / PAGE_SIZE), page }
}

// ─────────────────────────────────────────────────────────────
// Static pages, ads, redirects
// ─────────────────────────────────────────────────────────────

export const getStaticPage = cache(async (lang: string, key: string) => {
  const ids = await langIds(lang)
  const page = await prisma.staticPage.findUnique({
    where: { key },
    include: { translations: { where: { languageId: { in: ids.both } } } },
  })
  if (!page) return null
  const tr = page.translations.find((t) => t.languageId === ids.current)
  // Only the requested language is served — a fallback would duplicate content under another URL.
  if (!tr) return null
  const langs = await prisma.staticPageTranslation.findMany({ where: { pageId: page.id }, select: { language: { select: { code: true, isActive: true } } } })
  return { ...tr, key: page.key, availableIn: langs.filter((l) => l.language.isActive).map((l) => l.language.code) }
})

export const getActiveAds = cache(async () => {
  const ads = await prisma.advertisement.findMany({ where: { isActive: true }, orderBy: { updatedAt: "desc" } })
  const byPlacement = new Map<string, (typeof ads)[number]>()
  for (const ad of ads) if (!byPlacement.has(ad.placement)) byPlacement.set(ad.placement, ad)
  return byPlacement
})

export async function findRedirect(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/"
  const redirect = await prisma.redirect.findUnique({ where: { source: normalized } })
  if (redirect) {
    // Fire-and-forget hit counter; never block the redirect on it.
    prisma.redirect.update({ where: { id: redirect.id }, data: { hits: { increment: 1 } } }).catch(() => {})
  }
  return redirect
}
