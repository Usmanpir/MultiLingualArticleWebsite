import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/components/admin/ui"
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor"
import { can } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { editorReferenceData } from "@/lib/data/admin"
import { siteUrl } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "Edit article" }

export default async function EditArticlePage({ params, searchParams }: PageProps<"/admin/articles/[id]/edit">) {
  const user = await requirePageUser("articles.create")
  const { id } = await params
  const sp = await searchParams
  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { userId: true } }, tags: { select: { tagId: true } }, translations: true },
  })
  if (!article) notFound()
  // Server-side ownership check — authors can only open their own articles.
  if (!can(user.role, "articles.editAny") && article.author.userId !== user.id) redirect("/admin/articles")

  const [ref, settings] = await Promise.all([editorReferenceData(user), getSettings()])
  // Make sure the current featured image is selectable even if it's outside the recent list.
  if (article.featuredImageId && !ref.media.some((m) => m.id === article.featuredImageId)) {
    const m = await prisma.media.findUnique({ where: { id: article.featuredImageId }, select: { id: true, url: true, alt: true, width: true, height: true, caption: true } })
    if (m) ref.media.unshift(m)
  }
  const title = article.translations[0]?.title ?? "Untitled"

  return (
    <>
      <PageHeader title={title} description={`Last updated ${article.updatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`} />
      <ArticleEditor
        key={article.updatedAt.toISOString()}
        initial={{
          id: article.id,
          categoryId: article.categoryId,
          authorId: article.authorId,
          featuredImageId: article.featuredImageId,
          tagIds: article.tags.map((t) => t.tagId),
          status: article.status,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          featured: article.featured,
          trending: article.trending,
          editorsPick: article.editorsPick,
          allowComments: article.allowComments,
          primaryTopic: article.primaryTopic ?? "",
          secondaryTopics: article.secondaryTopics,
          translations: article.translations.map((t) => ({
            id: t.id,
            languageId: t.languageId,
            status: t.status,
            title: t.title,
            slug: t.slug,
            excerpt: t.excerpt,
            content: t.content,
            seoTitle: t.seoTitle ?? "",
            seoDescription: t.seoDescription ?? "",
            canonicalUrl: t.canonicalUrl ?? "",
            robots: t.robots,
            slugTouched: true,
          })),
        }}
        {...ref}
        canPublish={can(user.role, "articles.publish")}
        canDelete={can(user.role, "articles.delete") || (article.author.userId === user.id && ["DRAFT", "REVIEW"].includes(article.status))}
        lockedAuthor={!can(user.role, "articles.editAny")}
        siteName={settings.siteName}
        siteUrl={siteUrl}
        initialLang={typeof sp.lang === "string" ? sp.lang : undefined}
        justSaved={sp.saved === "1"}
      />
    </>
  )
}
