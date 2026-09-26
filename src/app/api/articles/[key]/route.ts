import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/session"
import { getArticleBySlug } from "@/lib/data/public"
import { errorResponse, HttpError, isSameOrigin } from "@/lib/http"
import { isLocale } from "@/lib/i18n"
import { deleteArticle, saveArticle } from "@/lib/services/articles"
import { decodeSegment } from "@/lib/utils"

/** GET /api/articles/:slug?lang=en — a single live article (public fields only). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/articles/[key]">) {
  try {
    const { key } = await ctx.params
    const lang = req.nextUrl.searchParams.get("lang") || "en"
    if (!isLocale(lang)) throw new HttpError(400, "Unsupported language")
    const data = await getArticleBySlug(lang, decodeSegment(key))
    if (!data) throw new HttpError(404, "Article not found")
    const t = data.translation
    return NextResponse.json(
      {
        data: {
          id: data.article.id,
          title: t.title,
          slug: t.slug,
          excerpt: t.excerpt,
          content: t.content,
          readingTimeMinutes: t.readingTimeMinutes,
          publishedAt: data.article.publishedAt,
          updatedAt: t.updatedAt,
          category: { slug: data.category.slug, name: data.category.name },
          author: { name: data.author.name, slug: data.author.slug },
          tags: data.tags,
          alternates: data.alternates,
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
    )
  } catch (err) {
    return errorResponse(err)
  }
}

/** PATCH /api/articles/:id — full update payload (same shape as POST). */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/articles/[key]">) {
  try {
    if (!isSameOrigin(req)) throw new HttpError(403, "Cross-origin request rejected")
    const user = await requireUser("articles.create")
    const { key: id } = await ctx.params
    const body = await req.json().catch(() => {
      throw new HttpError(400, "Invalid JSON body")
    })
    const saved = await saveArticle(user, { ...body, id })
    revalidatePath("/", "layout")
    return NextResponse.json({ data: { id: saved.id, status: saved.status, updatedAt: saved.updatedAt } })
  } catch (err) {
    return errorResponse(err)
  }
}

/** DELETE /api/articles/:id */
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/articles/[key]">) {
  try {
    if (!isSameOrigin(req)) throw new HttpError(403, "Cross-origin request rejected")
    const user = await requireUser("articles.create")
    const { key: id } = await ctx.params
    await deleteArticle(user, id)
    revalidatePath("/", "layout")
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return errorResponse(err)
  }
}
