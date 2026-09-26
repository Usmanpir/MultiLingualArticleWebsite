import type { Metadata } from "next"
import Link from "next/link"
import { ConfirmAction } from "@/components/admin/client"
import { Empty, PageHeader, StatusBadge } from "@/components/admin/ui"
import { deleteCommentAction, moderateCommentAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { formatDate } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Comments" }
const STATUSES = ["PENDING", "APPROVED", "REJECTED", "SPAM"] as const

export default async function CommentsPage({ searchParams }: PageProps<"/admin/comments">) {
  await requirePageUser("comments.moderate")
  const sp = await searchParams
  const status = (STATUSES as readonly string[]).includes(String(sp.status)) ? (sp.status as (typeof STATUSES)[number]) : "PENDING"
  const [comments, counts, settings] = await Promise.all([
    prisma.comment.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { article: { select: { id: true, translations: { select: { title: true }, take: 1 } } } },
    }),
    prisma.comment.groupBy({ by: ["status"], _count: { _all: true } }),
    getSettings(),
  ])
  return (
    <>
      <PageHeader
        title="Comments"
        description={settings.commentsEnabled ? "Nothing is published until approved. Emails are never shown publicly." : "Comments are currently disabled site-wide (Settings)."}
      />
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/comments?status=${s}`} aria-current={s === status ? "page" : undefined} className={cn("btn btn-sm", s === status ? "btn-primary" : "btn-ghost")}>
            {s.toLowerCase()} ({counts.find((c) => c.status === s)?._count._all ?? 0})
          </Link>
        ))}
      </nav>
      {comments.length === 0 ? (
        <Empty>No {status.toLowerCase()} comments.</Empty>
      ) : (
        <ul className="grid gap-3">
          {comments.map((c) => (
            <li key={c.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{c.authorName}</span>
                {c.authorEmail && <span className="text-fg-subtle">{c.authorEmail}</span>}
                <StatusBadge status={c.status} />
                <span className="text-xs text-fg-subtle">
                  {formatDate(c.createdAt, "en", { month: "short", hour: "2-digit", minute: "2-digit" })} · {c.languageCode}
                </span>
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                on{" "}
                <Link href={`/admin/articles/${c.article.id}/edit`} className="text-accent hover:underline">
                  {c.article.translations[0]?.title}
                </Link>
              </p>
              <p className="mt-3 whitespace-pre-line text-sm">{c.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== "APPROVED" && (
                  <ConfirmAction action={moderateCommentAction.bind(null, c.id, "APPROVED")} variant="primary">
                    Approve
                  </ConfirmAction>
                )}
                {c.status !== "REJECTED" && <ConfirmAction action={moderateCommentAction.bind(null, c.id, "REJECTED")}>Reject</ConfirmAction>}
                {c.status !== "SPAM" && <ConfirmAction action={moderateCommentAction.bind(null, c.id, "SPAM")}>Spam</ConfirmAction>}
                <ConfirmAction action={deleteCommentAction.bind(null, c.id)} confirm="Delete this comment permanently?" className="text-danger">
                  Delete
                </ConfirmAction>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
