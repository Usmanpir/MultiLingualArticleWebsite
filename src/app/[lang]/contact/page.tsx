import type { Metadata } from "next"
import { StaticPageView, staticPageMetadata } from "@/components/pages/StaticPage"

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  return staticPageMetadata((await params).lang, "contact")
}

export default async function Page({ params }: PageProps<"/[lang]/contact">) {
  return <StaticPageView lang={(await params).lang} pageKey="contact" />
}
