import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/session"
import { getCategoryArticles, getCategoryBySlug, getHomeData, PAGE_SIZE, searchArticles } from "@/lib/data/public"
import { errorResponse, HttpError, isSameOrigin } from "@/lib/http"
import { isLocale } from "@/lib/i18n"
import { saveArticle } from "@/lib/services/articles"
import { prisma } from "@/lib/prisma"
import { clampPage } from "@/lib/utils"

/**
 * GET /api/articles?lang=en&page=1[&q=term][&category=slug]
 * Public: returns only live, published translations. No drafts or private fields.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const lang = sp.get("lang") || "en"
    if (!isLocale(lang)) throw new HttpError(400, "Unsupported language")
    const page = clampPage(sp.get("page") ?? undefined) ?? 1
    const q = (sp.get("q") || "").trim()
    const category = sp.get("category")

    let res
    if (q.length >= 2) res = await searchArticles(lang, q, page)
    else if (category) {
      const c = await getCategoryBySlug(lang, category)
      if (!c) throw new HttpError(404, "Category not found")
      res = await getCategoryArticles(lang, c.id, page)
    } else {
      const home = await getHomeData(lang)
      res = { items: home.latest, total: home.totalArticles, totalPages: Math.ceil(home.totalArticles / PAGE_SIZE), page: 1 }
    }
    return NextResponse.json(
      {
        data: res.items.map((a) => ({ id: a.id, title: a.title, slug: a.slug, url: a.href, excerpt: a.excerpt, category: a.category, author: { name: a.author.name, slug: a.author.slug }, publishedAt: a.publishedAt, image: a.image })),
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
      },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
    )
  } catch (err) {
    return errorResponse(err)
  }
}

/** POST /api/articles — create (session cookie + same-origin required). */
export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) throw new HttpError(403, "Cross-origin request rejected")
    const user = await requireUser("articles.create")
    const body = await req.json().catch(() => {
      throw new HttpError(400, "Invalid JSON body")
    })
    if (body && typeof body === "object" && "id" in body) delete (body as { id?: string }).id
    const article = await saveArticle(user, body)
    revalidatePath("/", "layout")
    const full = await prisma.article.findUnique({ where: { id: article.id }, include: { translations: { select: { id: true, slug: true, status: true, languageId: true } } } })
    return NextResponse.json({ data: full }, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}
