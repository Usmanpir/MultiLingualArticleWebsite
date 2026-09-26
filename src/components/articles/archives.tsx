import type { Metadata } from "next"
import Image from "next/image"
import { notFound, permanentRedirect } from "next/navigation"
import { ArchiveView } from "./ArchiveView"
import {
  archiveLanguageCounts,
  getAuthorArticles,
  getAuthorBySlug,
  getCategoryArticles,
  getCategoryBySlug,
  getTagArticles,
  getTagBySlug,
} from "@/lib/data/public"
import { getDictionary, isLocale, t, type Locale } from "@/lib/i18n"
import { breadcrumbJsonLd, collectionPageJsonLd, graph, personJsonLd } from "@/lib/seo/jsonld"
import { buildMetadata } from "@/lib/seo/metadata"
import { getSettings } from "@/lib/settings"
import { paths } from "@/lib/urls"
import { clampPage, decodeSegment, initials, truncate } from "@/lib/utils"

type Kind = "category" | "tag" | "author"

/** Parses `/page/:n`; `/page/1` permanently redirects to the base URL. */
export function parsePage(kind: Kind, lang: string, slug: string, raw?: string) {
  if (raw === undefined) return 1
  const page = clampPage(raw)
  if (!page) notFound()
  if (page === 1) permanentRedirect(paths[kind](lang, slug))
  return page
}

function alternatesFor(kind: Kind, slug: string, counts: Record<string, number>, page: number) {
  if (page > 1) return null // page N rarely aligns across languages
  return Object.fromEntries(Object.keys(counts).filter(isLocale).map((code) => [code, paths[kind](code, slug)]))
}

async function resolve(kind: Kind, lang: string, rawSlug: string) {
  if (!isLocale(lang)) notFound()
  const slug = decodeSegment(rawSlug)
  if (kind === "category") {
    const c = await getCategoryBySlug(lang, slug)
    return c ? { kind, slug, entity: c, where: { categoryId: c.id } } : null
  }
  if (kind === "tag") {
    const tg = await getTagBySlug(lang, slug)
    return tg ? { kind, slug, entity: tg, where: { tags: { some: { tagId: tg.id } } } } : null
  }
  const a = await getAuthorBySlug(lang, slug)
  return a ? { kind, slug, entity: a, where: { authorId: a.id } } : null
}

export async function archiveMetadata(kind: Kind, lang: string, rawSlug: string, page: number): Promise<Metadata> {
  const r = await resolve(kind, lang, rawSlug)
  if (!r) return {}
  const settings = await getSettings()
  const dict = getDictionary(lang)
  const counts = await archiveLanguageCounts(r.where)
  const count = counts[lang] ?? 0
  const threshold = kind === "tag" ? settings.tagIndexThreshold : 1
  const indexable = count >= threshold

  let title: string
  let description: string
  if (r.kind === "category") {
    const c = r.entity as NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>
    title = c.seoTitle || c.name
    description = c.seoDescription || c.description || `${c.name} — ${settings.siteName}`
  } else if (r.kind === "tag") {
    const tg = r.entity as NonNullable<Awaited<ReturnType<typeof getTagBySlug>>>
    title = t(dict.tag.title, { tag: tg.name })
    description = tg.description || t(dict.tag.title, { tag: tg.name })
  } else {
    const a = r.entity as NonNullable<Awaited<ReturnType<typeof getAuthorBySlug>>>
    title = a.name
    description = truncate(a.bio || t(dict.author.articles, { name: a.name }), 160)
  }
  if (page > 1) {
    title = `${title} — ${t(dict.category.page, { n: page })}`
    description = `${t(dict.category.page, { n: page })} · ${description}`
  }

  const onlyIndexable = Object.fromEntries(Object.entries(counts).filter(([, n]) => n >= threshold))
  return buildMetadata({
    settings,
    lang,
    title,
    description,
    path: paths[kind](lang, r.slug, page),
    alternates: indexable ? alternatesFor(kind, r.slug, onlyIndexable, page) : null,
    type: kind === "author" ? "profile" : "website",
    robots: indexable ? "index" : "noindex-follow",
  })
}

export async function ArchivePage({ kind, lang, slug: rawSlug, page }: { kind: Kind; lang: string; slug: string; page: number }) {
  const r = await resolve(kind, lang, rawSlug)
  if (!r) notFound()
  const l = lang as Locale
  const dict = getDictionary(l)
  const home = { name: dict.nav.home, href: paths.home(lang) }

  if (r.kind === "category") {
    const c = r.entity as NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>
    const res = await getCategoryArticles(lang, c.id, page)
    if (page > 1 && page > res.totalPages) notFound()
    const path = paths.category(lang, c.slug, page)
    return (
      <ArchiveView
        lang={lang}
        eyebrow={dict.category.label}
        title={c.name}
        description={c.description}
        accent={c.color}
        crumbs={[home, { name: c.name }]}
        {...res}
        hrefFor={(p) => paths.category(lang, c.slug, p)}
        emptyText={dict.category.empty}
        jsonLd={graph(collectionPageJsonLd({ name: c.name, description: c.description || c.name, path, lang: l }), breadcrumbJsonLd([{ name: home.name, path: home.href }, { name: c.name, path }]))}
      />
    )
  }

  if (r.kind === "tag") {
    const tg = r.entity as NonNullable<Awaited<ReturnType<typeof getTagBySlug>>>
    const res = await getTagArticles(lang, tg.id, page)
    if (page > 1 && page > res.totalPages) notFound()
    const path = paths.tag(lang, tg.slug, page)
    const title = t(dict.tag.title, { tag: tg.name })
    return (
      <ArchiveView
        lang={lang}
        eyebrow={`${dict.tag.label} · #${tg.name}`}
        title={title}
        description={tg.description}
        crumbs={[home, { name: `#${tg.name}` }]}
        {...res}
        hrefFor={(p) => paths.tag(lang, tg.slug, p)}
        emptyText={dict.category.empty}
        jsonLd={graph(collectionPageJsonLd({ name: title, description: tg.description || title, path, lang: l }), breadcrumbJsonLd([{ name: home.name, path: home.href }, { name: `#${tg.name}`, path }]))}
      />
    )
  }

  const a = r.entity as NonNullable<Awaited<ReturnType<typeof getAuthorBySlug>>>
  const res = await getAuthorArticles(lang, a.id, page)
  if (page > 1 && page > res.totalPages) notFound()
  const path = paths.author(lang, a.slug, page)
  const sameAs = [a.website, a.twitter, a.linkedin].filter((x): x is string => !!x)
  return (
    <ArchiveView
      lang={lang}
      eyebrow={dict.author.label}
      title={a.name}
      description={a.bio}
      crumbs={[home, { name: a.name }]}
      {...res}
      hrefFor={(p) => paths.author(lang, a.slug, p)}
      emptyText={dict.author.empty}
      header={
        <div className="flex items-center gap-4">
          {a.avatarUrl ? (
            <Image src={a.avatarUrl} alt={a.name} width={96} height={96} loading="eager" className="size-24 rounded-3xl border border-border object-cover" />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-3xl bg-surface-2 text-2xl font-bold" aria-hidden>
              {initials(a.name)}
            </span>
          )}
          <div className="text-sm">
            {a.jobTitle && <p className="font-medium">{a.jobTitle}</p>}
            {sameAs.length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-3">
                {sameAs.map((s) => (
                  <li key={s}>
                    <a href={s} rel="me noopener" target="_blank" className="text-accent hover:underline">
                      {new URL(s).hostname.replace(/^www\./, "")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      }
      jsonLd={graph(
        { "@type": "ProfilePage", mainEntity: personJsonLd({ name: a.name, path, image: a.avatarUrl, jobTitle: a.jobTitle, description: a.bio, sameAs }) },
        breadcrumbJsonLd([{ name: home.name, path: home.href }, { name: a.name, path }]),
      )}
    />
  )
}
