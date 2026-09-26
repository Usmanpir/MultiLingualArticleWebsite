import "server-only"
import { prisma } from "../prisma"
import type { CurrentUser } from "../auth/session"
import { can } from "../auth/permissions"

/** Reference data needed by the article editor. */
export async function editorReferenceData(user: CurrentUser) {
  const [languages, categories, authors, tags, media] = await Promise.all([
    prisma.language.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, code: true, name: true, nativeName: true, direction: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, translations: { select: { name: true, language: { select: { code: true } } } } } }),
    prisma.author.findMany({ where: can(user.role, "articles.editAny") ? { isActive: true } : { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { slug: "asc" }, select: { id: true, slug: true, translations: { select: { name: true, language: { select: { code: true } } } } } }),
    prisma.media.findMany({
      where: can(user.role, "media.manage") ? {} : { OR: [{ uploadedById: user.id }, { uploadedById: null }] },
      orderBy: { createdAt: "desc" },
      take: 120,
      select: { id: true, url: true, alt: true, width: true, height: true, caption: true },
    }),
  ])
  const en = <T extends { name: string; language: { code: string } }>(trs: T[]) => trs.find((t) => t.language.code === "en")?.name ?? trs[0]?.name
  return {
    languages,
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: en(c.translations) ?? c.slug })),
    authors,
    tags: tags.map((t) => ({ id: t.id, slug: t.slug, name: en(t.translations) ?? t.slug })),
    media,
  }
}
