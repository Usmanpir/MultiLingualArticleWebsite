import type { Metadata } from "next"
import { ArchivePage, archiveMetadata } from "@/components/articles/archives"

export const revalidate = 300

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tag/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params
  return archiveMetadata("tag", lang, slug, 1)
}

export default async function Page({ params }: PageProps<"/[lang]/tag/[slug]">) {
  const { lang, slug } = await params
  return <ArchivePage kind="tag" lang={lang} slug={slug} page={1} />
}
