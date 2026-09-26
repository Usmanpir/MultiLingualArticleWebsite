import type { Metadata } from "next"
import { PageHeader } from "@/components/admin/ui"
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor"
import { can } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { editorReferenceData } from "@/lib/data/admin"
import { siteUrl } from "@/lib/env"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "New article" }

export default async function NewArticlePage({ searchParams }: PageProps<"/admin/articles/new">) {
  const user = await requirePageUser("articles.create")
  const sp = await searchParams
  const [ref, settings] = await Promise.all([editorReferenceData(user), getSettings()])
  const lang = ref.languages.find((l) => l.code === (typeof sp.lang === "string" ? sp.lang : "en")) ?? ref.languages[0]!
  return (
    <>
      <PageHeader title="New article" description="Write the first language version, then add translations. Everything starts as a draft." />
      <ArticleEditor
        initial={{
          categoryId: "",
          authorId: user.authorId ?? "",
          featuredImageId: null,
          tagIds: [],
          status: "DRAFT",
          publishedAt: null,
          featured: false,
          trending: false,
          editorsPick: false,
          allowComments: true,
          primaryTopic: "",
          secondaryTopics: [],
          translations: [
            { languageId: lang.id, status: "DRAFT", title: "", slug: "", excerpt: "", content: "", seoTitle: "", seoDescription: "", canonicalUrl: "", robots: "INDEX_FOLLOW" },
          ],
        }}
        {...ref}
        canPublish={can(user.role, "articles.publish")}
        canDelete={false}
        lockedAuthor={!can(user.role, "articles.editAny")}
        siteName={settings.siteName}
        siteUrl={siteUrl}
        initialLang={lang.code}
      />
    </>
  )
}
