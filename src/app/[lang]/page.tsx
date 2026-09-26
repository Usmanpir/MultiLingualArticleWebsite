import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown } from "lucide-react"
import { ArticleCard } from "@/components/articles/ArticleCard"
import { AdSlot } from "@/components/ads/AdSlot"
import { EmptyState, JsonLd, SectionHeading } from "@/components/ui/primitives"
import { brandDescription, brandTagline } from "@/lib/brand"
import { getActiveLanguages, getHomeData } from "@/lib/data/public"
import { formatNumber, getDictionary, isLocale, locales, type Locale } from "@/lib/i18n"
import { buildMetadata } from "@/lib/seo/metadata"
import { graph, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld"
import { getSettings } from "@/lib/settings"
import { paths } from "@/lib/urls"

export const revalidate = 300

async function homeDescription(lang: string) {
  const settings = await getSettings()
  return settings.descriptions[lang] || brandDescription(lang)
}

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params
  const settings = await getSettings()
  const languages = await getActiveLanguages()
  return buildMetadata({
    settings,
    lang,
    title: `${settings.siteName} — ${brandTagline(lang)}`,
    absoluteTitle: true,
    description: await homeDescription(lang),
    path: paths.home(lang),
    alternates: Object.fromEntries(languages.filter((l) => isLocale(l.code)).map((l) => [l.code, paths.home(l.code)])),
  })
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params
  const lang = (isLocale(raw) ? raw : locales[0]) as Locale
  const dict = getDictionary(lang)
  const [data, settings, languages, description] = await Promise.all([getHomeData(lang), getSettings(), getActiveLanguages(), homeDescription(lang)])
  const h = dict.home

  const stats = [
    { value: data.totalArticles, label: h.statArticles },
    { value: data.categories.length, label: h.statSections },
    { value: languages.length, label: h.statLanguages },
  ]

  return (
    <>
      <JsonLd data={graph(organizationJsonLd(settings), websiteJsonLd(settings, lang, description))} />

      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="aurora pointer-events-none absolute -inset-x-20 -top-40 h-[34rem]" aria-hidden />
        <div className="particles pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-16 sm:py-24 lg:py-28">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3 py-1">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            {h.eyebrow}
          </p>
          <h1 id="hero-title" className="font-display text-gradient mt-6 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl rtl:leading-[1.35]">
            {h.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-fg-muted sm:text-xl">{h.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="#latest" className="btn btn-primary min-h-12 px-6 text-base">
              {h.cta}
              <ArrowDown className="size-4" aria-hidden />
            </Link>
            <Link href="#newsletter" className="btn btn-ghost min-h-12 px-6 text-base">
              {dict.nav.subscribe}
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-fg-subtle sm:text-sm">{s.label}</dt>
                <dd className="font-display mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
                  <span className="counter" style={{ ["--target" as string]: s.value }} aria-hidden />
                  <span className="sr-only">{formatNumber(s.value, lang)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container-page">
        {!data.featured ? (
          <div className="py-16">
            <EmptyState title={dict.category.empty} />
          </div>
        ) : (
          <>
            {/* Featured */}
            <section aria-labelledby="featured-title" className="pt-12 sm:pt-16">
              <SectionHeading id="featured-title" eyebrow={dict.common.featured} title={h.featured} />
              <ArticleCard article={data.featured} variant="hero" priority />
            </section>

            {/* Latest + Trending */}
            <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <section id="latest" aria-labelledby="latest-title">
                <SectionHeading id="latest-title" title={h.latest} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {data.latest.slice(0, 6).map((a) => (
                    <ArticleCard key={a.id} article={a} className="reveal" />
                  ))}
                </div>
              </section>
              <aside aria-labelledby="trending-title" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
                <SectionHeading id="trending-title" eyebrow={dict.common.trending} title={h.trending} />
                <ol className="grid gap-5">
                  {data.trending.map((a, i) => (
                    <li key={a.id} className="relative">
                      <ArticleCard article={a} variant="numbered" index={i} />
                    </li>
                  ))}
                </ol>
                <AdSlot placement="SIDEBAR" label={dict.common.advertisement} className="mt-10" />
              </aside>
            </div>

            <AdSlot placement="HOME_INLINE" label={dict.common.advertisement} className="mt-16" />

            {/* Editor's picks */}
            {data.picks.length > 0 && (
              <section aria-labelledby="picks-title" className="mt-16">
                <SectionHeading id="picks-title" title={h.editorsPicks} />
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  {data.picks.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="list" className="reveal" />
                  ))}
                </div>
              </section>
            )}

            {/* Category sections */}
            {data.sections.map(({ category, items }) => (
              <section key={category.slug} aria-labelledby={`sec-${category.slug}`} className="mt-16">
                <SectionHeading id={`sec-${category.slug}`} title={category.name} href={paths.category(lang, category.slug)} hrefLabel={h.viewAll} />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr]">
                  <ArticleCard article={items[0]!} className="reveal" />
                  <div className="grid content-start gap-6">
                    {items.slice(1).map((a) => (
                      <ArticleCard key={a.id} article={a} variant="list" className="reveal" />
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {/* Most read */}
            {data.popular.length > 0 && (
              <section aria-labelledby="popular-title" className="mt-16">
                <SectionHeading id="popular-title" title={h.popular} />
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  {data.popular.map((a, i) => (
                    <li key={a.id} className="relative">
                      <ArticleCard article={a} variant="numbered" index={i} />
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
