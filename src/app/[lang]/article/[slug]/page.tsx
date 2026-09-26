import { notFound, permanentRedirect } from "next/navigation"
import { findArticlePathBySlug } from "@/lib/data/public"
import { isLocale } from "@/lib/i18n"
import { decodeSegment } from "@/lib/utils"

// Short link /{lang}/article/{slug} → permanent redirect to the canonical /{lang}/{category}/{slug}.
export default async function ArticleShortLink({ params }: PageProps<"/[lang]/article/[slug]">) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const target = await findArticlePathBySlug(lang, decodeSegment(slug))
  if (!target) notFound()
  permanentRedirect(target)
}
