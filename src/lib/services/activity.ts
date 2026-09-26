import "server-only"
import { prisma } from "../prisma"

export async function logActivity(userId: string | null, action: string, entityType: string, entityId: string | null, summary: string) {
  try {
    await prisma.activityLog.create({ data: { userId, action, entityType, entityId, summary: summary.slice(0, 300) } })
  } catch (err) {
    // Auditing must never break the primary operation.
    console.error("activity log failed", err)
  }
}
