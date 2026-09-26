import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/advertising-policy">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "advertising-policy")
}

export default async function Page({ params }: PageProps<"/[lang]/advertising-policy">) {
  return <StaticPageView lang={(await params).lang} pageKey="advertising-policy" />
}
