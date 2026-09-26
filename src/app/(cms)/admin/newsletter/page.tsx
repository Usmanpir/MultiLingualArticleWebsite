import type { Metadata } from "next"
import Link from "next/link"
import { Download } from "lucide-react"
import { ConfirmAction } from "@/components/admin/client"
import { Empty, PageHeader, Stat, StatusBadge, Table } from "@/components/admin/ui"
import { deleteSubscriberAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { formatDate } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { clampPage } from "@/lib/utils"

export const metadata: Metadata = { title: "Newsletter" }
const PER_PAGE = 50

export default async function NewsletterPage({ searchParams }: PageProps<"/admin/newsletter">) {
  await requirePageUser("newsletter.manage")
  const sp = await searchParams
  const page = clampPage(typeof sp.page === "string" ? sp.page : undefined) ?? 1
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : ""
  const where = q ? { email: { contains: q } } : {}
  const [subs, total, byStatus, byLang] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.newsletterSubscriber.groupBy({ by: ["languageCode"], where: { status: "SUBSCRIBED" }, _count: { _all: true } }),
  ])
  const active = byStatus.find((s) => s.status === "SUBSCRIBED")?._count._all ?? 0
  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Subscribers are stored in your database only. Connect an email provider (see README) to send campaigns; include each subscriber's unsubscribe link."
        actions={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from a route handler, not a page
          <a href="/api/admin/newsletter/export" className="btn btn-ghost">
            <Download className="size-4" aria-hidden />
            Export CSV
          </a>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active subscribers" value={active} />
        <Stat label="Unsubscribed" value={byStatus.find((s) => s.status === "UNSUBSCRIBED")?._count._all ?? 0} />
        {byLang.map((l) => (
          <Stat key={l.languageCode} label={`Active · ${l.languageCode}`} value={l._count._all} />
        ))}
      </div>
      <form className="card mb-4 flex gap-2 p-3" role="search">
        <label htmlFor="nq" className="sr-only">
          Search email
        </label>
        <input id="nq" name="q" defaultValue={q} placeholder="Search email…" className="input" />
        <button className="btn btn-ghost" type="submit">
          Search
        </button>
      </form>
      {subs.length === 0 ? (
        <Empty>No subscribers yet.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Language</th>
              <th>Source</th>
              <th>Joined</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-xs">{s.email}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>{s.languageCode}</td>
                <td className="text-fg-muted">{s.source ?? "—"}</td>
                <td className="text-fg-muted">{formatDate(s.createdAt, "en", { month: "short" })}</td>
                <td className="text-end">
                  <ConfirmAction action={deleteSubscriberAction.bind(null, s.id)} confirm={`Permanently erase ${s.email}? Use this for data-deletion requests.`} className="text-danger">
                    Erase
                  </ConfirmAction>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {total > PER_PAGE && (
        <nav className="mt-6 flex justify-center gap-3" aria-label="Pagination">
          {page > 1 && (
            <Link className="btn btn-ghost btn-sm" href={`/admin/newsletter?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
              Previous
            </Link>
          )}
          {page * PER_PAGE < total && (
            <Link className="btn btn-ghost btn-sm" href={`/admin/newsletter?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
