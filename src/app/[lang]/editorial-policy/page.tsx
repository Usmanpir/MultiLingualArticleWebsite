import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/editorial-policy">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "editorial-policy")
}

export default async function Page({ params }: PageProps<"/[lang]/editorial-policy">) {
  return <StaticPageView lang={(await params).lang} pageKey="editorial-policy" />
}
