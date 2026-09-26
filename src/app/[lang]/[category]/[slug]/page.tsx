import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, permanentRedirect, redirect } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react"
import { AdSlot } from "@/components/ads/AdSlot"
import { ArticleCard } from "@/components/articles/ArticleCard"
import { CommentForm } from "@/components/articles/CommentForm"
import { FontSizeControl } from "@/components/articles/FontSizeControl"
import { ReadingProgress } from "@/components/articles/ReadingProgress"
import { ShareButtons } from "@/components/articles/ShareButtons"
import { TableOfContents } from "@/components/articles/TableOfContents"
import { ViewTracker } from "@/components/articles/ViewTracker"
import { RegisterAlternates } from "@/components/i18n/alternates"
import { NewsletterForm } from "@/components/newsletter/NewsletterForm"
import { Breadcrumbs, JsonLd, SectionHeading } from "@/components/ui/primitives"
import { renderArticleHtml } from "@/lib/content"
import {
  findArticlePathBySlug,
  findRedirect,
  getApprovedComments,
  getArticleBySlug,
  getPopularArticles,
  getPrevNext,
  getRelatedArticles,
} from "@/lib/data/public"
import { formatDate, formatNumber, getDictionary, isLocale, t, type Locale } from "@/lib/i18n"
import { articleJsonLd, breadcrumbJsonLd, graph } from "@/lib/seo/jsonld"
import { buildMetadata, type RobotsMode } from "@/lib/seo/metadata"
import { getSettings } from "@/lib/settings"
import { absoluteUrl, paths } from "@/lib/urls"
import { decodeSegment, initials } from "@/lib/utils"

export const revalidate = 300

// Rendered on first request, then cached (ISR) and revalidated on edit.
export function generateStaticParams() {
  return []
}

const robotsMap: Record<string, RobotsMode> = { INDEX_FOLLOW: "index", NOINDEX_FOLLOW: "noindex-follow", NOINDEX_NOFOLLOW: "noindex-nofollow" }

async function load(params: PageProps<"/[lang]/[category]/[slug]">["params"]) {
  const { lang, category, slug: rawSlug } = await params
  if (!isLocale(lang)) notFound()
  const slug = decodeSegment(rawSlug)
  const data = await getArticleBySlug(lang, slug)
  return { lang, category: decodeSegment(category), slug, data }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[category]/[slug]">): Promise<Metadata> {
  const { lang, data } = await load(params)
  if (!data) return {}
  const settings = await getSettings()
  const tr = data.translation
  const path = paths.article(lang, data.category.slug, tr.slug)
  return buildMetadata({
    settings,
    lang,
    title: tr.seoTitle || tr.title,
    description: tr.seoDescription || tr.excerpt,
    path,
    canonical: tr.canonicalUrl,
    alternates: Object.fromEntries(data.alternates.map((a) => [a.lang, a.href])),
    image: { url: `/api/og/${tr.id}`, width: 1200, height: 630, alt: tr.title },
    type: "article",
    robots: robotsMap[tr.robots],
    article: {
      publishedTime: data.article.publishedAt?.toISOString(),
      modifiedTime: tr.updatedAt.toISOString(),
      authors: [absoluteUrl(paths.author(lang, data.author.slug))],
      section: data.category.name,
      tags: data.tags.map((x) => x.name),
    },
  })
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/[category]/[slug]">) {
  const { lang, category, slug, data } = await load(params)

  if (!data) {
    // Slug changed or article moved? Honour stored redirects, then look the slug up in any category.
    const stored = await findRedirect(`/${lang}/${category}/${slug}`)
    if (stored) (stored.statusCode === 302 || stored.statusCode === 307 ? redirect : permanentRedirect)(stored.destination)
    const moved = await findArticlePathBySlug(lang, slug)
    if (moved) permanentRedirect(moved)
    notFound()
  }
  if (data.category.slug !== category) permanentRedirect(paths.article(lang, data.category.slug, data.translation.slug))

  const l = lang as Locale
  const dict = getDictionary(l)
  const settings = await getSettings()
  const { translation: tr, article, author, tags } = data
  const publishedAt = article.publishedAt ?? tr.createdAt
  const wasUpdated = tr.updatedAt.getTime() - publishedAt.getTime() > 1000 * 60 * 60 * 24
  const path = paths.article(lang, data.category.slug, tr.slug)
  const url = absoluteUrl(path)
  const rendered = renderArticleHtml(tr.content)
  const commentsOpen = settings.commentsEnabled && article.allowComments

  const [related, prevNext, popular, comments] = await Promise.all([
    getRelatedArticles(lang, article.id, article.categoryId, tags.map((x) => x.id), 3),
    getPrevNext(lang, article.id, publishedAt),
    getPopularArticles(lang, article.id, 4),
    settings.commentsEnabled ? getApprovedComments(article.id) : Promise.resolve([]),
  ])

  const image = article.featuredImage
  const crumbs = [
    { name: dict.nav.home, path: paths.home(lang) },
    { name: data.category.name, path: paths.category(lang, data.category.slug) },
    { name: tr.title, path },
  ]
  const otherLanguages = data.alternates.filter((a) => a.lang !== lang)

  return (
    <>
      <JsonLd
        data={graph(
          articleJsonLd({
            settings,
            lang: l,
            url,
            headline: tr.title,
            description: tr.seoDescription || tr.excerpt,
            images: image ? [image.url] : [`/api/og/${tr.id}`],
            datePublished: publishedAt,
            dateModified: tr.updatedAt,
            author: { name: author.name, path: paths.author(lang, author.slug), jobTitle: author.jobTitle },
            section: data.category.name,
            keywords: tags.map((x) => x.name),
            wordCount: tr.wordCount,
          }),
          breadcrumbJsonLd(crumbs),
        )}
      />
      <RegisterAlternates map={Object.fromEntries(data.alternates.map((a) => [a.lang, a.href]))} />
      <ReadingProgress targetId="article-body" label={dict.article.readingProgress} />
      <ViewTracker articleId={article.id} lang={lang} category={data.category.slug} />

      <article className="relative">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60" aria-hidden />
        <header className="container-page relative pt-8 sm:pt-12">
          <Breadcrumbs label={dict.article.breadcrumb} items={crumbs.map((c, i) => ({ name: c.name, href: i < crumbs.length - 1 ? c.path : undefined }))} />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <Link href={paths.category(lang, data.category.slug)} className="eyebrow inline-flex items-center gap-2 hover:underline">
              <span className="size-1.5 rounded-full" style={{ background: data.category.color }} aria-hidden />
              {data.category.name}
            </Link>
            <h1 className="font-display mt-4 text-3xl leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl rtl:leading-[1.45]">{tr.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-fg-muted sm:text-xl">{tr.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-fg-muted">
              <Link href={paths.author(lang, author.slug)} className="flex items-center gap-2.5 font-medium text-fg hover:text-accent" rel="author">
                {author.avatarUrl ? (
                  <Image src={author.avatarUrl} alt="" width={36} height={36} className="size-9 rounded-full border border-border object-cover" />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-xs font-bold" aria-hidden>
                    {initials(author.name)}
                  </span>
                )}
                <span>
                  <span className="sr-only">{dict.article.by} </span>
                  {author.name}
                </span>
              </Link>
              <span>
                {dict.article.published}{" "}
                <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt, lang)}</time>
              </span>
              {wasUpdated && (
                <span>
                  {dict.article.updated} <time dateTime={tr.updatedAt.toISOString()}>{formatDate(tr.updatedAt, lang)}</time>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {t(dict.article.minRead, { n: tr.readingTimeMinutes })}
              </span>
              {article.views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4" aria-hidden />
                  {t(dict.article.views, { n: formatNumber(article.views, lang) })}
                </span>
              )}
            </div>

            {otherLanguages.length > 0 && (
              <p className="mt-4 text-sm text-fg-subtle">
                {dict.article.alsoIn}{" "}
                {otherLanguages.map((a, i) => (
                  <span key={a.lang}>
                    {i > 0 && " · "}
                    <Link href={a.href} hrefLang={a.lang} lang={a.lang} className="font-medium text-accent hover:underline">
                      {a.nativeName}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>

          {image && (
            <figure className="mx-auto mt-10 max-w-5xl">
              <div className="overflow-hidden rounded-3xl border border-border bg-surface-2 shadow-[var(--shadow)]">
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="h-auto w-full"
                />
              </div>
              {(image.caption || image.credit) && (
                <figcaption className="mt-3 text-center text-sm text-fg-subtle">
                  {image.caption}
                  {image.credit && <span className="ms-2 opacity-80">© {image.credit}</span>}
                </figcaption>
              )}
            </figure>
          )}
        </header>

        <div className="container-page mt-10">
          <AdSlot placement="ARTICLE_TOP" label={dict.common.advertisement} className="mx-auto mb-10 max-w-3xl" />
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]">
            <aside className="hidden lg:block">
              <div className="sticky top-[calc(var(--header-h)+1.5rem)] grid gap-8">
                {rendered.toc.length > 1 && <TableOfContents items={rendered.toc} title={dict.article.toc} />}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mx-auto mb-8 flex max-w-[42rem] flex-wrap items-center justify-between gap-3 border-y border-border py-3">
                <ShareButtons url={url} title={tr.title} labels={dict.article} />
                <FontSizeControl labels={dict.article} />
              </div>

              {rendered.toc.length > 1 && (
                <details className="card mx-auto mb-8 max-w-[42rem] p-4 lg:hidden">
                  <summary className="cursor-pointer font-semibold">{dict.article.toc}</summary>
                  <ol className="mt-3 grid gap-1.5 text-sm">
                    {rendered.toc.map((i) => (
                      <li key={i.id} className={i.level === 3 ? "ps-4" : ""}>
                        <a href={`#${i.id}`} className="text-fg-muted hover:text-accent">
                          {i.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              <div id="article-body" className="mx-auto max-w-[42rem]">
                {rendered.parts ? (
                  <>
                    <div className="prose-article" dangerouslySetInnerHTML={{ __html: rendered.parts[0] }} />
                    <AdSlot placement="ARTICLE_MIDDLE" label={dict.common.advertisement} className="my-10" />
                    <div className="prose-article mt-[1.35em]" dangerouslySetInnerHTML={{ __html: rendered.parts[1] }} />
                  </>
                ) : (
                  <div className="prose-article" dangerouslySetInnerHTML={{ __html: rendered.html }} />
                )}
              </div>

              <footer className="mx-auto mt-12 grid max-w-[42rem] gap-8">
                {tags.length > 0 && (
                  <div>
                    <h2 className="eyebrow mb-3">{dict.article.tags}</h2>
                    <ul className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <li key={tag.id}>
                          <Link href={paths.tag(lang, tag.slug)} className="chip hover:border-accent hover:text-accent" rel="tag">
                            #{tag.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                  <span className="text-sm font-semibold">{dict.article.share}</span>
                  <ShareButtons url={url} title={tr.title} labels={dict.article} />
                </div>

                <section aria-labelledby="author-title" className="card flex flex-col gap-4 p-6 sm:flex-row">
                  {author.avatarUrl ? (
                    <Image src={author.avatarUrl} alt={author.name} width={72} height={72} className="size-18 shrink-0 rounded-2xl border border-border object-cover" />
                  ) : (
                    <span className="flex size-18 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-xl font-bold" aria-hidden>
                      {initials(author.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="eyebrow">{dict.article.aboutAuthor}</p>
                    <h2 id="author-title" className="mt-1 text-lg font-semibold">
                      {author.name}
                    </h2>
                    {author.jobTitle && <p className="text-sm text-fg-subtle">{author.jobTitle}</p>}
                    {author.bio && <p className="mt-2 text-sm leading-relaxed text-fg-muted">{author.bio}</p>}
                    <Link href={paths.author(lang, author.slug)} className="mt-3 inline-flex text-sm font-medium text-accent hover:underline">
                      {dict.article.viewProfile}
                    </Link>
                  </div>
                </section>

                <AdSlot placement="ARTICLE_BOTTOM" label={dict.common.advertisement} />

                {(prevNext.prev || prevNext.next) && (
                  <nav aria-label={`${dict.article.previous} / ${dict.article.next}`} className="grid gap-4 sm:grid-cols-2">
                    {prevNext.prev ? (
                      <Link href={prevNext.prev.href} rel="prev" className="card lift group p-5">
                        <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                          <ArrowLeft className="size-3.5 rtl:-scale-x-100" aria-hidden />
                          {dict.article.previous}
                        </span>
                        <span className="mt-2 line-clamp-2 block font-semibold group-hover:text-accent">{prevNext.prev.title}</span>
                      </Link>
                    ) : (
                      <span />
                    )}
                    {prevNext.next && (
                      <Link href={prevNext.next.href} rel="next" className="card lift group p-5 text-end">
                        <span className="flex items-center justify-end gap-1.5 text-xs text-fg-subtle">
                          {dict.article.next}
                          <ArrowRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
                        </span>
                        <span className="mt-2 line-clamp-2 block font-semibold group-hover:text-accent">{prevNext.next.title}</span>
                      </Link>
                    )}
                  </nav>
                )}

                <section aria-labelledby="nl-article" className="glow-border card relative overflow-hidden p-6">
                  <div className="aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden />
                  <div className="relative">
                    <h2 id="nl-article" className="text-lg font-semibold">
                      {dict.newsletter.title}
                    </h2>
                    <p className="mt-1 mb-4 text-sm text-fg-muted">{dict.newsletter.description}</p>
                    {settings.newsletterEnabled && <NewsletterForm lang={lang} source="article" labels={dict.newsletter} compact />}
                  </div>
                </section>
              </footer>
            </div>

            <aside className="hidden lg:block" aria-labelledby="popular-side">
              <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
                <h2 id="popular-side" className="eyebrow mb-4">
                  {dict.home.popular}
                </h2>
                <ol className="grid gap-5">
                  {popular.map((a, i) => (
                    <li key={a.id} className="relative">
                      <ArticleCard article={a} variant="numbered" index={i} />
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-page mt-20">
          <SectionHeading id="related-title" title={dict.article.related} href={paths.category(lang, data.category.slug)} hrefLabel={t(dict.article.moreIn, { category: data.category.name })} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} className="reveal" />
            ))}
          </div>
        </section>
      )}

      {settings.commentsEnabled && (
        <section aria-labelledby="comments-title" className="container-page mt-20">
          <div className="mx-auto max-w-[42rem]">
            <h2 id="comments-title" className="font-display text-2xl font-bold">
              {dict.comments.title} <span className="text-fg-subtle">({comments.length})</span>
            </h2>
            {comments.length === 0 ? (
              <p className="mt-3 text-fg-muted">{dict.comments.none}</p>
            ) : (
              <ol className="mt-6 grid gap-4">
                {comments.map((c) => (
                  <li key={c.id} className="card p-5">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold">{c.authorName}</span>
                      <time dateTime={c.createdAt.toISOString()} className="text-xs text-fg-subtle">
                        {formatDate(c.createdAt, lang)}
                      </time>
                    </p>
                    <p className="mt-2 leading-relaxed whitespace-pre-line text-fg-muted">{c.content}</p>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-8">
              {commentsOpen ? (
                <CommentForm
                  articleId={article.id}
                  lang={lang}
                  labels={{ ...dict.comments, rateLimited: dict.newsletter.rateLimited, error: dict.newsletter.error }}
                />
              ) : (
                <p className="card p-4 text-fg-muted">{dict.comments.closed}</p>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
