import { renderIndex, sitemapFiles } from "@/lib/seo/sitemap"

export const revalidate = 3600

export async function GET() {
  const xml = renderIndex(await sitemapFiles())
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } })
}
