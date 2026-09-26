import type { Metadata } from "next"
import Link from "next/link"
import { ArticleCard } from "@/components/articles/ArticleCard"
import { SearchBox } from "@/components/search/SearchBox"
import { EmptyState } from "@/components/ui/primitives"
import { getNavCategories, searchArticles } from "@/lib/data/public"
import { getDictionary, isLocale, t } from "@/lib/i18n"
import { buildMetadata } from "@/lib/seo/metadata"
import { getSettings } from "@/lib/settings"
import { paths } from "@/lib/urls"
import { clampPage } from "@/lib/utils"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params
  const settings = await getSettings()
  const dict = getDictionary(lang)
  // Internal search results must not be indexed; links on the page are still followed.
  return buildMetadata({ settings, lang, title: dict.search.title, description: dict.search.placeholder, path: paths.search(lang), robots: "noindex-follow", alternates: null })
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const sp = await searchParams
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100)
  const page = clampPage(typeof sp.page === "string" ? sp.page : undefined) ?? 1
  const dict = getDictionary(lang)
  const s = dict.search
  const [res, categories] = await Promise.all([q.length >= 2 ? searchArticles(lang, q, page) : Promise.resolve(null), getNavCategories(lang)])

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{s.title}</h1>
      <div className="mt-6 max-w-2xl">
        <SearchBox initial={q} labels={s} />
      </div>

      <div className="mt-10" aria-live="polite">
        {!res ? (
          <p className="text-fg-muted">{s.prompt}</p>
        ) : res.total === 0 ? (
          <EmptyState title={t(s.none, { q })} text={s.noneHint}>
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={paths.category(lang, c.slug)} className="chip hover:border-accent hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </EmptyState>
        ) : (
          <>
            <p className="mb-6 text-sm text-fg-muted">{res.total === 1 ? t(s.resultsOne, { q }) : t(s.results, { n: res.total, q })}</p>
            <div className="grid gap-6">
              {res.items.map((a) => (
                <ArticleCard key={a.id} article={a} variant="list" headingLevel={2} />
              ))}
            </div>
            {res.totalPages > 1 && (
              <nav aria-label={dict.pagination.label} className="mt-10 flex justify-center gap-2">
                {page > 1 && (
                  <Link className="btn btn-ghost btn-sm" href={`${paths.search(lang, q)}&page=${page - 1}`} rel="prev">
                    {dict.pagination.previous}
                  </Link>
                )}
                <span className="px-3 py-1.5 text-sm text-fg-muted">{t(dict.pagination.pageOf, { n: page, total: res.totalPages })}</span>
                {page < res.totalPages && (
                  <Link className="btn btn-ghost btn-sm" href={`${paths.search(lang, q)}&page=${page + 1}`} rel="next">
                    {dict.pagination.next}
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
