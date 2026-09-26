"use server"

import { z } from "zod"
import { prisma } from "../../prisma"
import { requireUser } from "../../auth/session"
import { HttpError } from "../../http"
import { sanitizeArticleHtml } from "../../content"
import { logActivity } from "../../services/activity"
import { reservedSlugs, staticPageKeys } from "../../urls"
import { slugPattern } from "../../utils"
import { bool, revalidatePublic, str, toResult, type ActionResult } from "./helpers"

const slug = z.string().trim().toLowerCase().min(2).max(64).regex(slugPattern, "Use lowercase letters, numbers and hyphens")

async function languages() {
  return prisma.language.findMany({ orderBy: { sortOrder: "asc" } })
}

// ───────────── Categories ─────────────

export async function saveCategoryAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("categories.manage")
    const id = str(fd, "id") || undefined
    const data = z
      .object({ slug: slug.refine((s) => !reservedSlugs.has(s), "This slug is reserved by a route"), color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #22d3ee"), sortOrder: z.coerce.number().int().min(0).max(999) })
      .parse({ slug: str(fd, "slug"), color: str(fd, "color"), sortOrder: str(fd, "sortOrder") || "0" })
    const langs = await languages()
    const translations = langs
      .map((l) => ({
        languageId: l.id,
        name: str(fd, `name_${l.id}`).trim(),
        description: str(fd, `description_${l.id}`).trim() || null,
        seoTitle: str(fd, `seoTitle_${l.id}`).trim().slice(0, 70) || null,
        seoDescription: str(fd, `seoDescription_${l.id}`).trim().slice(0, 170) || null,
      }))
      .filter((t) => t.name)
    if (!translations.length) throw new HttpError(400, "Add a name in at least one language")

    const saved = await prisma.$transaction(async (tx) => {
      const cat = id
        ? await tx.category.update({ where: { id }, data: { ...data, isActive: bool(fd, "isActive") } })
        : await tx.category.create({ data: { ...data, isActive: bool(fd, "isActive") } })
      for (const t of translations) {
        await tx.categoryTranslation.upsert({
          where: { categoryId_languageId: { categoryId: cat.id, languageId: t.languageId } },
          create: { ...t, categoryId: cat.id },
          update: t,
        })
      }
      await tx.categoryTranslation.deleteMany({ where: { categoryId: cat.id, languageId: { notIn: translations.map((t) => t.languageId) } } })
      return cat
    })
    await logActivity(user.id, id ? "category.update" : "category.create", "Category", saved.id, `Saved category ${saved.slug}`)
    revalidatePublic()
    return { ok: true, id: saved.id, message: "Category saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("categories.manage")
    const count = await prisma.article.count({ where: { categoryId: id } })
    if (count) throw new HttpError(409, `Move or delete the ${count} article(s) in this category first`)
    const c = await prisma.category.delete({ where: { id } })
    await logActivity(user.id, "category.delete", "Category", id, `Deleted category ${c.slug}`)
    revalidatePublic()
    return { ok: true, message: "Category deleted" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Tags ─────────────

export async function saveTagAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("tags.manage")
    const id = str(fd, "id") || undefined
    const tagSlug = slug.parse(str(fd, "slug"))
    const langs = await languages()
    const translations = langs
      .map((l) => ({ languageId: l.id, name: str(fd, `name_${l.id}`).trim(), description: str(fd, `description_${l.id}`).trim() || null }))
      .filter((t) => t.name)
    if (!translations.length) throw new HttpError(400, "Add a name in at least one language")
    const saved = await prisma.$transaction(async (tx) => {
      const tag = id ? await tx.tag.update({ where: { id }, data: { slug: tagSlug } }) : await tx.tag.create({ data: { slug: tagSlug } })
      for (const t of translations) {
        await tx.tagTranslation.upsert({ where: { tagId_languageId: { tagId: tag.id, languageId: t.languageId } }, create: { ...t, tagId: tag.id }, update: t })
      }
      await tx.tagTranslation.deleteMany({ where: { tagId: tag.id, languageId: { notIn: translations.map((t) => t.languageId) } } })
      return tag
    })
    await logActivity(user.id, id ? "tag.update" : "tag.create", "Tag", saved.id, `Saved tag ${saved.slug}`)
    revalidatePublic()
    return { ok: true, id: saved.id, message: "Tag saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("tags.manage")
    const t = await prisma.tag.delete({ where: { id } })
    await logActivity(user.id, "tag.delete", "Tag", id, `Deleted tag ${t.slug}`)
    revalidatePublic()
    return { ok: true, message: "Tag deleted" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Authors ─────────────

const optionalUrl = z
  .union([z.literal(""), z.url({ protocol: /^https?$/ })])
  .transform((v) => v || null)

export async function saveAuthorAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("authors.manage")
    const id = str(fd, "id") || undefined
    const data = z
      .object({
        name: z.string().trim().min(2).max(80),
        slug,
        avatarUrl: z.string().trim().max(500).transform((v) => v || null),
        website: optionalUrl,
        twitter: optionalUrl,
        linkedin: optionalUrl,
        userId: z.string().transform((v) => v || null),
      })
      .parse({
        name: str(fd, "name"),
        slug: str(fd, "slug"),
        avatarUrl: str(fd, "avatarUrl"),
        website: str(fd, "website"),
        twitter: str(fd, "twitter"),
        linkedin: str(fd, "linkedin"),
        userId: str(fd, "userId"),
      })
    const langs = await languages()
    const translations = langs
      .map((l) => ({ languageId: l.id, jobTitle: str(fd, `jobTitle_${l.id}`).trim() || null, bio: str(fd, `bio_${l.id}`).trim().slice(0, 1500) || null }))
      .filter((t) => t.jobTitle || t.bio)
    const saved = await prisma.$transaction(async (tx) => {
      const author = id
        ? await tx.author.update({ where: { id }, data: { ...data, isActive: bool(fd, "isActive") } })
        : await tx.author.create({ data: { ...data, isActive: bool(fd, "isActive") } })
      for (const t of translations) {
        await tx.authorTranslation.upsert({ where: { authorId_languageId: { authorId: author.id, languageId: t.languageId } }, create: { ...t, authorId: author.id }, update: t })
      }
      await tx.authorTranslation.deleteMany({ where: { authorId: author.id, languageId: { notIn: translations.map((t) => t.languageId) } } })
      return author
    })
    await logActivity(user.id, id ? "author.update" : "author.create", "Author", saved.id, `Saved author ${saved.name}`)
    revalidatePublic()
    return { ok: true, id: saved.id, message: "Author saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteAuthorAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("authors.manage")
    const count = await prisma.article.count({ where: { authorId: id } })
    if (count) throw new HttpError(409, `Reassign this author's ${count} article(s) first, or deactivate the profile instead`)
    const a = await prisma.author.delete({ where: { id } })
    await logActivity(user.id, "author.delete", "Author", id, `Deleted author ${a.name}`)
    revalidatePublic()
    return { ok: true, message: "Author deleted" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Languages ─────────────

export async function saveLanguageAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("languages.manage")
    const id = str(fd, "id")
    const data = z
      .object({
        name: z.string().trim().min(2).max(40),
        nativeName: z.string().trim().min(1).max(40),
        locale: z.string().trim().regex(/^[a-z]{2,3}_[A-Z]{2}$/, "Format like en_US"),
        sortOrder: z.coerce.number().int().min(0).max(99),
      })
      .parse({ name: str(fd, "name"), nativeName: str(fd, "nativeName"), locale: str(fd, "locale"), sortOrder: str(fd, "sortOrder") || "0" })
    const isDefault = bool(fd, "isDefault")
    const isActive = bool(fd, "isActive") || isDefault
    await prisma.$transaction(async (tx) => {
      if (isDefault) await tx.language.updateMany({ where: { id: { not: id } }, data: { isDefault: false } })
      await tx.language.update({ where: { id }, data: { ...data, isActive, isDefault } })
    })
    await logActivity(user.id, "language.update", "Language", id, `Updated language ${data.name}`)
    revalidatePublic()
    return { ok: true, message: "Language saved" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Static pages ─────────────

export async function saveStaticPageAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("pages.manage")
    const key = z.enum(staticPageKeys).parse(str(fd, "key"))
    const languageId = str(fd, "languageId")
    const data = z
      .object({ title: z.string().trim().min(2).max(120), seoDescription: z.string().trim().min(20).max(170), content: z.string().min(1).max(200_000) })
      .parse({ title: str(fd, "title"), seoDescription: str(fd, "seoDescription"), content: str(fd, "content") })
    const page = await prisma.staticPage.upsert({ where: { key }, create: { key }, update: {} })
    const clean = { ...data, content: sanitizeArticleHtml(data.content) }
    await prisma.staticPageTranslation.upsert({
      where: { pageId_languageId: { pageId: page.id, languageId } },
      create: { ...clean, pageId: page.id, languageId },
      update: clean,
    })
    await logActivity(user.id, "page.update", "StaticPage", page.id, `Updated page ${key}`)
    revalidatePublic()
    return { ok: true, message: "Page saved" }
  } catch (err) {
    return toResult(err)
  }
}
