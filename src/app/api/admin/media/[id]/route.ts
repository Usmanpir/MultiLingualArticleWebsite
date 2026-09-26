import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth/session"
import { errorResponse } from "@/lib/http"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/media/[id]">) {
  try {
    await requireUser("media.upload")
    const { id } = await ctx.params
    const m = await prisma.media.findUnique({ where: { id }, select: { id: true, url: true, alt: true, width: true, height: true, caption: true } })
    if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(m)
  } catch (err) {
    return errorResponse(err)
  }
}
