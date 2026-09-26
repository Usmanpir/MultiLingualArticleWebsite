import type { Metadata } from "next"
import { ArchivePage, archiveMetadata, parsePage } from "@/components/articles/archives"

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps<"/[lang]/author/[slug]/page/[page]">): Promise<Metadata> {
  const { lang, slug, page } = await params
  return archiveMetadata("author", lang, slug, parsePage("author", lang, slug, page))
}

export default async function Page({ params }: PageProps<"/[lang]/author/[slug]/page/[page]">) {
  const { lang, slug, page } = await params
  return <ArchivePage kind="author" lang={lang} slug={slug} page={parsePage("author", lang, slug, page)} />
}
