import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs, JsonLd } from "@/components/ui/primitives"
import { renderArticleHtml } from "@/lib/content"
import { getStaticPage } from "@/lib/data/public"
import { formatDate, getDictionary, isLocale } from "@/lib/i18n"
import { breadcrumbJsonLd, graph } from "@/lib/seo/jsonld"
import { buildMetadata } from "@/lib/seo/metadata"
import { getSettings } from "@/lib/settings"
import { paths, type StaticPageKey } from "@/lib/urls"

export async function staticPageMetadata(lang: string, key: StaticPageKey): Promise<Metadata> {
  if (!isLocale(lang)) return {}
  const page = await getStaticPage(lang, key)
  if (!page) return {}
  const settings = await getSettings()
  return buildMetadata({
    settings,
    lang,
    title: page.title,
    description: page.seoDescription,
    path: paths.page(lang, key),
    alternates: Object.fromEntries(page.availableIn.filter(isLocale).map((code) => [code, paths.page(code, key)])),
  })
}

export async function StaticPageView({ lang, pageKey }: { lang: string; pageKey: StaticPageKey }) {
  if (!isLocale(lang)) notFound()
  const page = await getStaticPage(lang, pageKey)
  if (!page) notFound()
  const dict = getDictionary(lang)
  const { html } = renderArticleHtml(page.content)
  const path = paths.page(lang, pageKey)
  return (
    <article className="container-page py-10 sm:py-14">
      <JsonLd data={graph(breadcrumbJsonLd([{ name: dict.nav.home, path: paths.home(lang) }, { name: page.title, path }]))} />
      <Breadcrumbs label={dict.article.breadcrumb} items={[{ name: dict.nav.home, href: paths.home(lang) }, { name: page.title }]} />
      <header className="mx-auto mt-8 max-w-[42rem]">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
        <p className="mt-3 text-sm text-fg-subtle">
          {dict.article.updated} <time dateTime={page.updatedAt.toISOString()}>{formatDate(page.updatedAt, lang)}</time>
        </p>
      </header>
      <div className="prose-article mx-auto mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  )
}
