import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, PenLine, Plus } from "lucide-react"
import { Empty, PageHeader, StatusBadge, Table } from "@/components/admin/ui"
import { can } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { formatDate, formatNumber } from "@/lib/i18n"
import { paths } from "@/lib/urls"
import { clampPage } from "@/lib/utils"

export const metadata: Metadata = { title: "Articles" }

const STATUSES = ["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const
const PER_PAGE = 25

export default async function ArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  const user = await requirePageUser("articles.create")
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q.trim() : ""
  const status = typeof sp.status === "string" && (STATUSES as readonly string[]).includes(sp.status) ? (sp.status as (typeof STATUSES)[number]) : undefined
  const categoryId = typeof sp.category === "string" ? sp.category : undefined
  const page = clampPage(typeof sp.page === "string" ? sp.page : undefined) ?? 1

  const where: Prisma.ArticleWhereInput = {
    ...(can(user.role, "articles.editAny") ? {} : { author: { userId: user.id } }),
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q ? { translations: { some: { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q.toLowerCase() } }] } } } : {}),
  }

  const [articles, total, languages, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        author: { select: { name: true } },
        category: { select: { slug: true, translations: { select: { name: true }, take: 1 } } },
        translations: { select: { title: true, slug: true, status: true, languageId: true, language: { select: { code: true } } } },
      },
    }),
    prisma.article.count({ where }),
    prisma.language.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true } }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const qs = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status) params.set("status", status)
    if (categoryId) params.set("category", categoryId)
    if (p > 1) params.set("page", String(p))
    const s = params.toString()
    return s ? `?${s}` : ""
  }

  return (
    <>
      <PageHeader
        title="Articles"
        description={`${formatNumber(total, "en")} article${total === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/articles/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden />
            New article
          </Link>
        }
      />

      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="sr-only" htmlFor="f-q">
          Search
        </label>
        <input id="f-q" name="q" defaultValue={q} placeholder="Search title or slug…" className="input" />
        <label className="sr-only" htmlFor="f-status">
          Status
        </label>
        <select id="f-status" name="status" defaultValue={status ?? ""} className="input">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase()}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="f-cat">
          Category
        </label>
        <select id="f-cat" name="category" defaultValue={categoryId ?? ""} className="input">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.slug}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-ghost">
          Filter
        </button>
      </form>

      {articles.length === 0 ? (
        <Empty>
          No articles match.{" "}
          <Link href="/admin/articles/new" className="text-accent underline">
            Write one
          </Link>
          .
        </Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Translations</th>
              <th>Status</th>
              <th>Category</th>
              <th>Published</th>
              <th className="!text-end">Views</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => {
              const primary = a.translations.find((t) => t.language.code === "en") ?? a.translations[0]
              const live = a.status === "PUBLISHED" || (a.status === "SCHEDULED" && a.publishedAt && a.publishedAt <= new Date())
              return (
                <tr key={a.id}>
                  <td className="max-w-80">
                    <Link href={`/admin/articles/${a.id}/edit`} className="line-clamp-2 font-medium hover:text-accent">
                      {primary?.title ?? "Untitled"}
                    </Link>
                    <p className="text-xs text-fg-subtle">
                      {a.author.name}
                      {a.featured && " · featured"}
                      {a.trending && " · trending"}
                    </p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {languages.map((l) => {
                        const tr = a.translations.find((t) => t.languageId === l.id)
                        return (
                          <Link key={l.id} href={`/admin/articles/${a.id}/edit?lang=${l.code}`} title={`${l.name}: ${tr ? tr.status.toLowerCase() : "missing"}`}>
                            <StatusBadge status={tr ? tr.status : "MISSING"}>
                              {l.code} {tr ? tr.status.toLowerCase() : "—"}
                            </StatusBadge>
                          </Link>
                        )
                      })}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="text-fg-muted">{a.category.translations[0]?.name ?? a.category.slug}</td>
                  <td className="whitespace-nowrap text-fg-muted">{a.publishedAt ? formatDate(a.publishedAt, "en", { month: "short" }) : "—"}</td>
                  <td className="text-end tabular-nums">{formatNumber(a.views, "en")}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/articles/${a.id}/edit`} className="icon-btn size-8" aria-label="Edit">
                        <PenLine className="size-4" aria-hidden />
                      </Link>
                      {live && primary && primary.status === "PUBLISHED" && (
                        <a href={paths.article(primary.language.code, a.category.slug, primary.slug)} target="_blank" className="icon-btn size-8" aria-label="View on site">
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={`/admin/articles${qs(page - 1)}`} className="btn btn-ghost btn-sm">
              Previous
            </Link>
          )}
          <span className="text-fg-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/articles${qs(page + 1)}`} className="btn btn-ghost btn-sm">
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
