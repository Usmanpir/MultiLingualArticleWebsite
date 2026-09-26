import type { ReactNode } from "react"
import { ArticleCard } from "@/components/articles/ArticleCard"
import { AdSlot } from "@/components/ads/AdSlot"
import { Breadcrumbs, EmptyState, JsonLd, Pagination } from "@/components/ui/primitives"
import type { ArticleCardData } from "@/lib/data/public"
import { getDictionary, t } from "@/lib/i18n"

type Props = {
  lang: string
  eyebrow: string
  title: string
  description?: string | null
  crumbs: { name: string; href?: string }[]
  items: ArticleCardData[]
  page: number
  totalPages: number
  total: number
  hrefFor: (page: number) => string
  jsonLd: object
  emptyText: string
  header?: ReactNode
  accent?: string
}

export function ArchiveView({ lang, eyebrow, title, description, crumbs, items, page, totalPages, hrefFor, jsonLd, emptyText, header, accent }: Props) {
  const dict = getDictionary(lang)
  const [lead, ...rest] = items
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 start-1/4 size-[28rem] rounded-full opacity-25 blur-3xl"
          style={{ background: accent ?? "var(--accent)" }}
          aria-hidden
        />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs items={crumbs} label={dict.article.breadcrumb} />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                {title}
                {page > 1 && <span className="text-fg-subtle"> — {t(dict.category.page, { n: page })}</span>}
              </h1>
              {description && page === 1 && <p className="mt-4 text-lg text-fg-muted">{description}</p>}
            </div>
            {header}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {items.length === 0 ? (
          <EmptyState title={emptyText} />
        ) : (
          <>
            {page === 1 && lead && (
              <div className="mb-10">
                <ArticleCard article={lead} variant="hero" priority headingLevel={2} />
              </div>
            )}
            <AdSlot placement="HOME_INLINE" label={dict.common.advertisement} className="mb-10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(page === 1 ? rest : items).map((a, i) => (
                <ArticleCard key={a.id} article={a} headingLevel={2} priority={page > 1 && i < 3} className="reveal" />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} labels={dict.pagination} />
          </>
        )}
      </div>
    </>
  )
}
