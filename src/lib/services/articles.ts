import "server-only"
import { z } from "zod"
import { prisma } from "../prisma"
import type { CurrentUser } from "../auth/session"
import { AuthError } from "../auth/session"
import { can } from "../auth/permissions"
import { contentStats, sanitizeArticleHtml } from "../content"
import { HttpError } from "../http"
import { paths } from "../urls"
import { slugPattern } from "../utils"
import { logActivity } from "./activity"

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))

export const translationInput = z.object({
  languageId: z.string().min(1),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]),
  title: z.string().trim().min(3, "Title is too short").max(160, "Title is too long"),
  slug: z.string().trim().toLowerCase().min(2).max(96).regex(slugPattern, "Use lowercase letters, numbers and hyphens"),
  excerpt: z.string().trim().min(20, "Excerpt should be at least 20 characters").max(400),
  content: z.string().min(1, "Content is required").max(400_000),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  canonicalUrl: z
    .union([z.literal(""), z.url({ protocol: /^https?$/ })])
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  robots: z.enum(["INDEX_FOLLOW", "NOINDEX_FOLLOW", "NOINDEX_NOFOLLOW"]),
})

export const articleInput = z
  .object({
    id: z.string().optional(),
    categoryId: z.string().min(1, "Choose a category"),
    authorId: z.string().min(1, "Choose an author"),
    featuredImageId: z.string().nullable().optional(),
    tagIds: z.array(z.string()).max(12).default([]),
    status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
    publishedAt: z.iso.datetime({ offset: true }).nullable().optional(),
    featured: z.boolean().default(false),
    trending: z.boolean().default(false),
    editorsPick: z.boolean().default(false),
    allowComments: z.boolean().default(true),
    primaryTopic: optionalText(80),
    secondaryTopics: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
    translations: z.array(translationInput).min(1, "Add at least one language version"),
  })
  .superRefine((v, ctx) => {
    if (v.status === "SCHEDULED") {
      if (!v.publishedAt) ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Pick a publish date for scheduled articles" })
      else if (new Date(v.publishedAt) <= new Date()) ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Scheduled date must be in the future" })
    }
    const langs = v.translations.map((t) => t.languageId)
    if (new Set(langs).size !== langs.length) ctx.addIssue({ code: "custom", path: ["translations"], message: "Each language can only appear once" })
  })

export type ArticleInput = z.input<typeof articleInput>

async function loadForEdit(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { userId: true } },
      category: { select: { slug: true } },
      translations: { select: { id: true, languageId: true, slug: true, status: true, language: { select: { code: true } } } },
    },
  })
}

function assertCanEdit(user: CurrentUser, existing: NonNullable<Awaited<ReturnType<typeof loadForEdit>>> | null) {
  if (!existing) return
  if (can(user.role, "articles.editAny")) return
  if (existing.author.userId !== user.id) throw new AuthError(403, "You can only edit your own articles")
  if (existing.status === "PUBLISHED" || existing.status === "SCHEDULED") throw new AuthError(403, "Published articles can only be edited by editors")
}

/** Creates or updates an article with all its translations atomically. */
export async function saveArticle(user: CurrentUser, raw: unknown) {
  const input = articleInput.parse(raw)
  const existing = input.id ? await loadForEdit(input.id) : null
  if (input.id && !existing) throw new HttpError(404, "Article not found")
  if (!can(user.role, "articles.create")) throw new AuthError(403)
  assertCanEdit(user, existing)

  const canPublish = can(user.role, "articles.publish")
  if (!canPublish) {
    if (!["DRAFT", "REVIEW"].includes(input.status)) throw new AuthError(403, "Only editors can publish, schedule or archive")
    if (input.translations.some((t) => t.status === "PUBLISHED")) throw new AuthError(403, "Only editors can publish translations")
    if (!user.authorId) throw new HttpError(400, "Your account is not linked to an author profile")
    input.authorId = user.authorId
  }

  // Validate references exist.
  const [category, author, langs] = await Promise.all([
    prisma.category.findUnique({ where: { id: input.categoryId }, select: { slug: true } }),
    prisma.author.findUnique({ where: { id: input.authorId }, select: { id: true } }),
    prisma.language.findMany({ where: { id: { in: input.translations.map((t) => t.languageId) } }, select: { id: true, code: true } }),
  ])
  if (!category) throw new HttpError(400, "Category not found")
  if (!author) throw new HttpError(400, "Author not found")
  if (langs.length !== input.translations.length) throw new HttpError(400, "Unknown language")
  const codeOf = new Map(langs.map((l) => [l.id, l.code]))

  // Localised slugs must be unique per language.
  const conflicts = await prisma.articleTranslation.findMany({
    where: { OR: input.translations.map((t) => ({ languageId: t.languageId, slug: t.slug })), ...(input.id ? { articleId: { not: input.id } } : {}) },
    select: { slug: true, languageId: true },
  })
  if (conflicts.length) {
    throw new HttpError(409, "Slug already in use", conflicts.map((c) => ({ language: codeOf.get(c.languageId), slug: c.slug })))
  }

  let publishedAt = input.publishedAt ? new Date(input.publishedAt) : null
  if (input.status === "PUBLISHED" && !publishedAt) publishedAt = existing?.publishedAt ?? new Date()

  const articleData = {
    categoryId: input.categoryId,
    authorId: input.authorId,
    featuredImageId: input.featuredImageId || null,
    status: input.status,
    publishedAt,
    allowComments: input.allowComments,
    primaryTopic: input.primaryTopic,
    secondaryTopics: input.secondaryTopics,
    ...(canPublish
      ? { featured: input.featured, trending: input.trending, editorsPick: input.editorsPick }
      : existing
        ? {}
        : { featured: false, trending: false, editorsPick: false }),
  }

  const translations = input.translations.map((t) => {
    const content = sanitizeArticleHtml(t.content)
    const lang = codeOf.get(t.languageId)!
    return { ...t, content, ...contentStats(content, lang) }
  })

  const saved = await prisma.$transaction(async (tx) => {
    const article = existing
      ? await tx.article.update({ where: { id: existing.id }, data: articleData })
      : await tx.article.create({ data: articleData })

    // Tags
    await tx.articleTag.deleteMany({ where: { articleId: article.id, tagId: { notIn: input.tagIds } } })
    if (input.tagIds.length) {
      await tx.articleTag.createMany({ data: input.tagIds.map((tagId) => ({ articleId: article.id, tagId })), skipDuplicates: true })
    }

    // Translations: upsert submitted ones (removal is an explicit separate action).
    for (const t of translations) {
      const prev = existing?.translations.find((x) => x.languageId === t.languageId)
      const data = {
        status: t.status,
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        canonicalUrl: t.canonicalUrl,
        robots: t.robots,
        wordCount: t.wordCount,
        readingTimeMinutes: t.readingTimeMinutes,
      }
      if (prev) {
        await tx.articleTranslation.update({ where: { id: prev.id }, data })
        // Keep old links working when a published URL changes.
        const code = prev.language.code
        const oldPath = paths.article(code, existing!.category.slug, prev.slug)
        const newPath = paths.article(code, category.slug, t.slug)
        if (prev.status === "PUBLISHED" && oldPath !== newPath) {
          await tx.redirect.upsert({ where: { source: oldPath }, create: { source: oldPath, destination: newPath, statusCode: 301 }, update: { destination: newPath } })
          // Avoid chains/loops: anything pointing to the old path now points to the new one.
          await tx.redirect.updateMany({ where: { destination: oldPath }, data: { destination: newPath } })
          await tx.redirect.deleteMany({ where: { source: newPath } })
        }
      } else {
        await tx.articleTranslation.create({ data: { ...data, articleId: article.id, languageId: t.languageId } })
      }
    }
    return article
  })

  await logActivity(user.id, existing ? "article.update" : "article.create", "Article", saved.id, `${existing ? "Updated" : "Created"} “${translations[0]!.title}” (${saved.status})`)
  return saved
}

export async function deleteTranslation(user: CurrentUser, translationId: string) {
  const tr = await prisma.articleTranslation.findUnique({ where: { id: translationId }, select: { id: true, title: true, articleId: true } })
  if (!tr) throw new HttpError(404, "Translation not found")
  assertCanEdit(user, await loadForEdit(tr.articleId))
  const count = await prisma.articleTranslation.count({ where: { articleId: tr.articleId } })
  if (count <= 1) throw new HttpError(400, "An article needs at least one language version. Delete the article instead.")
  await prisma.articleTranslation.delete({ where: { id: tr.id } })
  await logActivity(user.id, "translation.delete", "ArticleTranslation", tr.id, `Deleted translation “${tr.title}”`)
}

export async function deleteArticle(user: CurrentUser, id: string) {
  if (!can(user.role, "articles.delete")) {
    const existing = await loadForEdit(id)
    if (!existing) throw new HttpError(404, "Article not found")
    // Authors may delete their own unpublished drafts.
    if (existing.author.userId !== user.id || !["DRAFT", "REVIEW"].includes(existing.status)) throw new AuthError(403)
  }
  const a = await prisma.article.findUnique({ where: { id }, select: { id: true, translations: { select: { title: true }, take: 1 } } })
  if (!a) throw new HttpError(404, "Article not found")
  await prisma.article.delete({ where: { id } })
  await logActivity(user.id, "article.delete", "Article", id, `Deleted “${a.translations[0]?.title ?? id}”`)
}

export async function setArticleStatus(user: CurrentUser, id: string, status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED") {
  const existing = await loadForEdit(id)
  if (!existing) throw new HttpError(404, "Article not found")
  if (status !== "REVIEW" && status !== "DRAFT" && !can(user.role, "articles.publish")) throw new AuthError(403)
  assertCanEdit(user, existing)
  const data: { status: typeof status; publishedAt?: Date } = { status }
  if (status === "PUBLISHED" && (!existing.publishedAt || existing.publishedAt > new Date())) data.publishedAt = new Date()
  await prisma.article.update({ where: { id }, data })
  await logActivity(user.id, `article.${status.toLowerCase()}`, "Article", id, `Set status to ${status}`)
}

/** Flips SCHEDULED articles whose time has come to PUBLISHED (visibility already applies at query time). */
export async function publishDueArticles() {
  const res = await prisma.article.updateMany({ where: { status: "SCHEDULED", publishedAt: { lte: new Date() } }, data: { status: "PUBLISHED" } })
  return res.count
}
