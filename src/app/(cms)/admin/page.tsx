import type { Metadata } from "next"
import Link from "next/link"
import { CalendarClock, Eye, FileText, Globe2, Mail, MessageSquare, PenLine, Send } from "lucide-react"
import { PageHeader, Panel, Stat, StatusBadge } from "@/components/admin/ui"
import { can } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { formatDate, formatNumber } from "@/lib/i18n"

export const metadata: Metadata = { title: "Dashboard" }

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requirePageUser()
  const sp = await searchParams
  const own = !can(user.role, "articles.editAny")
  const scope = own ? { author: { userId: user.id } } : {}
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const [byStatus, viewsAgg, todayViews, top, subscribers, languages, pending, activity] = await Promise.all([
    prisma.article.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    prisma.article.aggregate({ where: scope, _sum: { views: true } }),
    prisma.articleView.count({ where: { viewDate: today, article: scope } }),
    prisma.article.findMany({
      where: { ...scope, views: { gt: 0 } },
      orderBy: { views: "desc" },
      take: 6,
      select: { id: true, views: true, status: true, translations: { select: { title: true }, take: 1, orderBy: { createdAt: "asc" } } },
    }),
    can(user.role, "newsletter.manage") ? prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }) : Promise.resolve(null),
    prisma.language.count({ where: { isActive: true } }),
    can(user.role, "comments.moderate") ? prisma.comment.count({ where: { status: "PENDING" } }) : Promise.resolve(null),
    prisma.activityLog.findMany({
      where: own ? { userId: user.id } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
  ])
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0
  const total = byStatus.reduce((n, b) => n + b._count._all, 0)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={own ? "Your articles at a glance." : "What's happening across the publication."}
        actions={
          <Link href="/admin/articles/new" className="btn btn-primary">
            <PenLine className="size-4" aria-hidden />
            New article
          </Link>
        }
      />
      {sp.denied === "1" && <p className="card mb-6 border-warning/40 p-4 text-sm text-warning" role="alert">You don&apos;t have permission to open that page.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total articles" value={formatNumber(total, "en")} icon={<FileText className="size-4" aria-hidden />} hint={`${count("REVIEW")} awaiting review`} />
        <Stat label="Published" value={formatNumber(count("PUBLISHED"), "en")} icon={<Send className="size-4" aria-hidden />} />
        <Stat label="Drafts" value={formatNumber(count("DRAFT"), "en")} icon={<PenLine className="size-4" aria-hidden />} />
        <Stat label="Scheduled" value={formatNumber(count("SCHEDULED"), "en")} icon={<CalendarClock className="size-4" aria-hidden />} />
        <Stat label="Total views" value={formatNumber(viewsAgg._sum.views ?? 0, "en")} icon={<Eye className="size-4" aria-hidden />} hint="Unique daily readers, aggregated" />
        <Stat label="Today's views" value={formatNumber(todayViews, "en")} icon={<Eye className="size-4" aria-hidden />} hint="Since 00:00 UTC" />
        {subscribers !== null && <Stat label="Subscribers" value={formatNumber(subscribers, "en")} icon={<Mail className="size-4" aria-hidden />} />}
        {pending !== null ? (
          <Stat label="Pending comments" value={formatNumber(pending, "en")} icon={<MessageSquare className="size-4" aria-hidden />} />
        ) : (
          <Stat label="Languages" value={languages} icon={<Globe2 className="size-4" aria-hidden />} />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Top articles" description="By aggregated unique views">
          {top.length === 0 ? (
            <p className="text-sm text-fg-muted">No views recorded yet.</p>
          ) : (
            <ol className="grid gap-3">
              {top.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-mono text-fg-subtle">{i + 1}</span>
                  <Link href={`/admin/articles/${a.id}/edit`} className="min-w-0 flex-1 truncate font-medium hover:text-accent">
                    {a.translations[0]?.title ?? "Untitled"}
                  </Link>
                  <StatusBadge status={a.status} />
                  <span className="w-16 text-end tabular-nums text-fg-muted">{formatNumber(a.views, "en")}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Recent activity">
          {activity.length === 0 ? (
            <p className="text-sm text-fg-muted">Nothing yet.</p>
          ) : (
            <ul className="grid gap-3 text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate">{a.summary}</p>
                    <p className="text-xs text-fg-subtle">
                      {a.user?.name ?? "System"} · {formatDate(a.createdAt, "en", { month: "short", hour: "2-digit", minute: "2-digit" })} UTC
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
