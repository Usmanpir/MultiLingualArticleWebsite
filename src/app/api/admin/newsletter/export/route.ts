import { requireUser } from "@/lib/auth/session"
import { errorResponse } from "@/lib/http"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/services/activity"

export const dynamic = "force-dynamic"

// Neutralise spreadsheet formula injection first, then quote.
const csv = (raw: string) => {
  const v = raw.replace(/^([=+\-@\t\r])/, "'$1")
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export async function GET() {
  try {
    const user = await requireUser("newsletter.manage")
    const subs = await prisma.newsletterSubscriber.findMany({ where: { status: "SUBSCRIBED" }, orderBy: { createdAt: "asc" } })
    const rows = [["email", "language", "source", "subscribed_at", "unsubscribe_token"], ...subs.map((s) => [s.email, s.languageCode, s.source ?? "", s.createdAt.toISOString(), s.unsubscribeToken])]
    await logActivity(user.id, "newsletter.export", "NewsletterSubscriber", null, `Exported ${subs.length} subscribers`)
    return new Response(rows.map((r) => r.map(csv).join(",")).join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
