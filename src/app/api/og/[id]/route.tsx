import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { liveArticleWhere } from "@/lib/data/public"
import { getSettings } from "@/lib/settings"
import { dirOf } from "@/lib/i18n"

export const revalidate = 86400

/**
 * Satori lays words out left-to-right even for Arabic script (glyph shaping is
 * fine). Rendering each word as a flex item in a wrapping `row-reverse` row
 * gives correct right-to-left word order and line wrapping.
 */
function Words({ text, rtl, gap }: { text: string; rtl: boolean; gap: number }) {
  if (!rtl) return <>{text}</>
  return (
    <div style={{ display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", columnGap: gap, rowGap: 0 }}>
      {text.split(/\s+/).map((w, i) => (
        <span key={i} style={{ display: "flex" }}>
          {w}
        </span>
      ))}
    </div>
  )
}

const fontDir = join(process.cwd(), "src/assets/fonts")
const fonts = Promise.all([
  readFile(join(fontDir, "SpaceGrotesk-Bold.woff")),
  readFile(join(fontDir, "Inter-Medium.woff")),
  readFile(join(fontDir, "Vazirmatn-Bold.woff")),
])

/**
 * Social preview card for a published translation. Text comes only from the
 * database (never from the query string), so the endpoint can't be abused to
 * render arbitrary content under the site's domain.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/og/[id]">) {
  const { id } = await ctx.params
  const tr = await prisma.articleTranslation.findFirst({
    where: { id, status: "PUBLISHED", article: liveArticleWhere() },
    select: {
      title: true,
      languageId: true,
      language: { select: { code: true } },
      article: {
        select: {
          author: { select: { name: true } },
          category: { select: { color: true, slug: true, translations: { select: { name: true, languageId: true } } } },
        },
      },
    },
  })
  if (!tr) return new Response("Not found", { status: 404 })

  const [grotesk, inter, arabic] = await fonts
  const settings = await getSettings()
  const lang = tr.language.code
  const rtl = dirOf(lang) === "rtl"
  const cat = tr.article.category
  const catName = cat.translations.find((t) => t.languageId === tr.languageId)?.name ?? cat.slug
  const title = tr.title.length > 120 ? `${tr.title.slice(0, 117)}…` : tr.title
  const titleSize = title.length > 80 ? 52 : title.length > 50 ? 62 : 72
  const textFont = rtl ? "NotoArabic" : "Grotesk"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #070a12 0%, #0b1a2e 55%, #1a1038 100%)",
          color: "#e7ebf3",
          fontFamily: textFont,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 9999, background: cat.color, opacity: 0.22, filter: "blur(80px)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: rtl ? "row-reverse" : "row" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Grotesk", fontSize: 34 }}>
            <div style={{ width: 40, height: 40, borderRadius: 9999, border: "4px solid #22d3ee", display: "flex" }} />
            {settings.siteName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 9999,
              border: `2px solid ${cat.color}`,
              color: cat.color,
              fontSize: 26,
              fontFamily: rtl ? "NotoArabic" : "Inter",
            }}
          >
            <Words text={catName} rtl={rtl} gap={8} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: rtl ? 1.45 : 1.12,
            letterSpacing: rtl ? 0 : -1.5,
            fontWeight: 700,
            textAlign: rtl ? "right" : "left",
            justifyContent: rtl ? "flex-end" : "flex-start",
            maxWidth: 1056,
          }}
        >
          <Words text={title} rtl={rtl} gap={Math.round(titleSize * 0.22)} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: rtl ? "row-reverse" : "row", fontSize: 26, color: "#a3adc2" }}>
          <div style={{ display: "flex", fontFamily: rtl ? "NotoArabic" : "Inter" }}>{tr.article.author.name}</div>
          <div style={{ display: "flex", height: 6, width: 220, borderRadius: 9999, background: "linear-gradient(90deg, #22d3ee, #a78bfa)" }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Grotesk", data: grotesk, weight: 700, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
        { name: "NotoArabic", data: arabic, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  )
}
