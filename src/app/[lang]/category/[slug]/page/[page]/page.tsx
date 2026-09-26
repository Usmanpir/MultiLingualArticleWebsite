import type { Metadata } from "next"
import { ArchivePage, archiveMetadata, parsePage } from "@/components/articles/archives"

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]/page/[page]">): Promise<Metadata> {
  const { lang, slug, page } = await params
  return archiveMetadata("category", lang, slug, parsePage("category", lang, slug, page))
}

export default async function Page({ params }: PageProps<"/[lang]/category/[slug]/page/[page]">) {
  const { lang, slug, page } = await params
  return <ArchivePage kind="category" lang={lang} slug={slug} page={parsePage("category", lang, slug, page)} />
}
