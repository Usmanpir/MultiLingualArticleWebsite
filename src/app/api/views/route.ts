import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { liveArticleWhere } from "@/lib/data/public"
import { isLocale } from "@/lib/i18n"
import { isSameOrigin } from "@/lib/http"

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora|pinterest|vkshare|whatsapp|telegram|lighthouse|headless|curl|wget|python|axios|node-fetch/i

const body = z.object({ articleId: z.string().min(1).max(40), lang: z.string().refine(isLocale) })

/**
 * Records at most one view per (article, anonymous visitor, UTC day).
 * The visitor hash is derived from IP + user agent + a daily salt and is not
 * reversible or linkable across days. No cookies are set.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const ua = req.headers.get("user-agent") || ""
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 })

  let parsed
  try {
    parsed = body.safeParse(JSON.parse(await req.text()))
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  const { articleId, lang } = parsed.data

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "").trim()
  const salt = `${process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev"}:${today.toISOString().slice(0, 10)}`
  const visitorHash = createHash("sha256").update(`${salt}:${ip}:${ua}`).digest("hex").slice(0, 32)

  const exists = await prisma.article.findFirst({ where: { id: articleId, ...liveArticleWhere() }, select: { id: true } })
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    const inserted = await tx.articleView.createMany({ data: [{ articleId, languageCode: lang, visitorHash, viewDate: today }], skipDuplicates: true })
    if (inserted.count > 0) await tx.article.update({ where: { id: articleId }, data: { views: { increment: 1 } } })
  })
  return new NextResponse(null, { status: 204 })
}
