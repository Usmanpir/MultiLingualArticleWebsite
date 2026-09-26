import { articleEntries, authorEntries, categoryEntries, pagesEntries, renderUrlset, tagEntries } from "@/lib/seo/sitemap"
import { getSettings } from "@/lib/settings"

export const revalidate = 3600

export async function GET(_req: Request, ctx: RouteContext<"/sitemaps/[file]">) {
  const { file } = await ctx.params
  const settings = await getSettings()
  if (!settings.indexSite) return new Response(renderUrlset([]), { headers: { "Content-Type": "application/xml; charset=utf-8" } })
  let entries
  if (file === "pages.xml") entries = await pagesEntries()
  else if (file === "categories.xml") entries = await categoryEntries()
  else if (file === "tags.xml" && settings.sitemapIncludeTags) entries = await tagEntries()
  else if (file === "authors.xml" && settings.sitemapIncludeAuthors) entries = await authorEntries()
  else {
    const m = /^articles-(\d{1,4})\.xml$/.exec(file)
    if (!m) return new Response("Not found", { status: 404 })
    entries = await articleEntries(Number(m[1]))
    if (entries.length === 0 && Number(m[1]) > 0) return new Response("Not found", { status: 404 })
  }
  return new Response(renderUrlset(entries), { headers: { "Content-Type": "application/xml; charset=utf-8" } })
}
