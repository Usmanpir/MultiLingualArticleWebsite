import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "about")
}

export default async function Page({ params }: PageProps<"/[lang]/about">) {
  return <StaticPageView lang={(await params).lang} pageKey="about" />
}
