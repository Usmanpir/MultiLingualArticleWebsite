import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "privacy")
}

export default async function Page({ params }: PageProps<"/[lang]/privacy">) {
  return <StaticPageView lang={(await params).lang} pageKey="privacy" />
}
