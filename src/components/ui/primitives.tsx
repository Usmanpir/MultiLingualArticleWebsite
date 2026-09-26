import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn, safeJsonLd } from "@/lib/utils"

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  hrefLabel,
  as: As = "h2",
  className,
}: {
  id?: string
  eyebrow?: string
  title: string
  href?: string
  hrefLabel?: string
  as?: "h1" | "h2"
  className?: string
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 border-b border-border pb-3", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <As id={id} className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </As>
      </div>
      {href && hrefLabel && (
        <Link href={href} className="group flex shrink-0 items-center gap-1 text-sm font-medium text-fg-muted hover:text-accent">
          {hrefLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  )
}

export function Breadcrumbs({ items, label }: { items: { name: string; href?: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-fg-subtle">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="hover:text-accent">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-fg-muted">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Crawlable, path-based pagination (/page/2). */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  labels,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
  labels: { label: string; previous: string; next: string; pageOf: string }
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  return (
    <nav aria-label={labels.label} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className="btn btn-ghost btn-sm">
          <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          {labels.previous}
        </Link>
      ) : null}
      <ul className="flex items-center gap-1">
        {pages.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && p - pages[i - 1]! > 1 && <span className="px-1 text-fg-subtle">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={labels.pageOf.replace("{n}", String(p)).replace("{total}", String(totalPages))}
              className={cn("flex size-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums", p === page ? "bg-accent text-accent-fg" : "text-fg-muted hover:bg-surface-2")}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className="btn btn-ghost btn-sm">
          {labels.next}
          <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : null}
    </nav>
  )
}

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="size-12 rounded-full border border-border bg-surface-2 [background-image:radial-gradient(circle_at_30%_30%,var(--accent),transparent_60%)] opacity-80" aria-hidden />
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="max-w-md text-fg-muted">{text}</p>}
      {children}
    </div>
  )
}
