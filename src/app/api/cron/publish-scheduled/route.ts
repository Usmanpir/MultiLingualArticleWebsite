import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { publishDueArticles } from "@/lib/services/articles"

export const dynamic = "force-dynamic"

/**
 * Vercel Cron target. Scheduled articles already become visible at their
 * go-live time (the public queries check publishedAt); this job flips their
 * status to PUBLISHED and purges cached pages so they appear in listings promptly.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization") || ""
  const expected = `Bearer ${secret}`
  if (!secret || auth.length !== expected.length || !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const published = await publishDueArticles()
  if (published > 0) revalidatePath("/", "layout")
  return NextResponse.json({ published })
}
