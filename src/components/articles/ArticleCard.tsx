import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"
import type { ArticleCardData } from "@/lib/data/public"
import { formatDate, getDictionary, t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Variant = "hero" | "standard" | "compact" | "list" | "numbered"

export function ArticleCard({
  article,
  variant = "standard",
  priority = false,
  index,
  headingLevel = 3,
  className,
}: {
  article: ArticleCardData
  variant?: Variant
  priority?: boolean
  index?: number
  headingLevel?: 2 | 3
  className?: string
}) {
  const dict = getDictionary(article.lang)
  const H = headingLevel === 2 ? "h2" : "h3"
  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
      <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt, article.lang, { month: "short" })}</time>
      <span className="flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden />
        {t(dict.article.minRead, { n: article.readingTime })}
      </span>
    </p>
  )
  const categoryBadge = (
    <span className="eyebrow relative z-10 flex min-w-0 items-center gap-1.5">
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: article.category.color }} aria-hidden />
      <span className="truncate">{article.category.name}</span>
    </span>
  )

  if (variant === "numbered") {
    return (
      <article className={cn("group flex gap-4", className)}>
        <span className="font-display text-3xl leading-none font-bold text-fg-subtle/50 tabular-nums transition-colors group-hover:text-accent" aria-hidden>
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          {categoryBadge}
          <H className="mt-1 leading-snug font-semibold">
            <Link href={article.href} className="after:absolute after:inset-0 hover:text-accent">
              {article.title}
            </Link>
          </H>
          <div className="mt-1.5">{meta}</div>
        </div>
      </article>
    )
  }

  if (variant === "list" || variant === "compact") {
    return (
      <article className={cn("group relative flex gap-4", className)}>
        {article.image && (
          <div className={cn("relative shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2", variant === "compact" ? "size-20" : "aspect-[4/3] w-32 sm:w-44")}>
            <Image
              src={article.image.url}
              alt={article.image.alt}
              fill
              sizes={variant === "compact" ? "80px" : "(min-width: 640px) 176px, 128px"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {categoryBadge}
          <H className={cn("mt-1 leading-snug font-semibold text-balance", variant === "list" && "sm:text-lg")}>
            <Link href={article.href} className="after:absolute after:inset-0 group-hover:text-accent">
              {article.title}
            </Link>
          </H>
          {variant === "list" && <p className="mt-1.5 line-clamp-2 hidden text-sm text-fg-muted sm:block">{article.excerpt}</p>}
          <div className="mt-2">{meta}</div>
        </div>
      </article>
    )
  }

  if (variant === "hero") {
    return (
      <article className={cn("group glow-border relative overflow-hidden rounded-3xl border border-border bg-surface", className)}>
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-2 lg:aspect-auto lg:min-h-[26rem]">
            {article.image && (
              <Image
                src={article.image.url}
                alt={article.image.alt}
                fill
                loading={priority ? "eager" : undefined}
                fetchPriority={priority ? "high" : undefined}
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            )}
            {!article.image && <ImagePlaceholder color={article.category.color} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden" aria-hidden />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip border-accent/30 text-accent">{dict.common.featured}</span>
              {categoryBadge}
            </div>
            <H className="font-display text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl">
              <Link href={article.href} className="after:absolute after:inset-0 group-hover:text-accent">
                {article.title}
              </Link>
            </H>
            <p className="line-clamp-3 text-fg-muted sm:text-lg">{article.excerpt}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">{article.author.name}</span>
              <span className="text-fg-subtle" aria-hidden>
                ·
              </span>
              {meta}
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={cn("group lift relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {!article.image && <ImagePlaceholder color={article.category.color} />}
        {article.image && (
          <Image
            src={article.image.url}
            alt={article.image.alt}
            fill
            loading={priority ? "eager" : undefined}
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {categoryBadge}
        <H className="text-lg leading-snug font-semibold text-balance">
          <Link href={article.href} className="after:absolute after:inset-0 group-hover:text-accent">
            {article.title}
          </Link>
        </H>
        <p className="line-clamp-2 text-sm text-fg-muted">{article.excerpt}</p>
        <div className="mt-auto pt-2">{meta}</div>
      </div>
    </article>
  )
}

/** Decorative fallback for stories without a featured image (keeps grids aligned, no empty boxes). */
function ImagePlaceholder({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 bg-[#070a12]" aria-hidden>
      <div className="bg-grid absolute inset-0 opacity-70 [animation:none]" />
      <div className="absolute -end-10 -top-10 size-2/3 rounded-full opacity-40 blur-3xl" style={{ background: color }} />
      <div className="absolute start-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-70 rtl:translate-x-1/2" style={{ borderColor: color }} />
    </div>
  )
}
