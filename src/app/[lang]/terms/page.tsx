import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "terms")
}

export default async function Page({ params }: PageProps<"/[lang]/terms">) {
  return <StaticPageView lang={(await params).lang} pageKey="terms" />
}
