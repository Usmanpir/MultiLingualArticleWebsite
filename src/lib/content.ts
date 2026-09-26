import "server-only"
import sanitizeHtml from "sanitize-html"
import { countWords, readingMinutes, stripHtml } from "./utils"

const EMBED_HOSTS = ["www.youtube-nocookie.com", "www.youtube.com", "youtube.com", "player.vimeo.com"]

const articleOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
    "strong", "b", "em", "i", "u", "s", "mark", "sup", "sub", "small", "abbr",
    "a", "ul", "ol", "li", "blockquote", "cite",
    "figure", "figcaption", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "pre", "code", "span", "div", "iframe",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "width", "height", "title"],
    iframe: ["src", "title", "allow", "allowfullscreen", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    ol: ["start", "reversed"],
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    div: ["class"],
    abbr: ["title"],
  },
  allowedClasses: {
    code: [/^language-[a-z0-9+#-]+$/],
    pre: [/^language-[a-z0-9+#-]+$/],
    div: ["embed", "callout", "table-wrap"],
    span: ["highlight"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: EMBED_HOSTS,
  transformTags: {
    // Only the article title may be an H1.
    h1: "h2",
    a: (tagName, attribs) => {
      const href = attribs.href || ""
      const external = /^https?:\/\//i.test(href) && !href.startsWith(process.env.NEXT_PUBLIC_SITE_URL || "\u0000")
      const next: Record<string, string> = { href }
      if (attribs.title) next.title = attribs.title
      if (external) {
        next.target = "_blank"
        next.rel = Array.from(new Set(["noopener", "noreferrer", ...(attribs.rel || "").split(/\s+/).filter((r) => ["nofollow", "sponsored", "ugc"].includes(r))])).join(" ")
      }
      return { tagName, attribs: next }
    },
    iframe: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        loading: "lazy",
        allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: "",
        title: attribs.title || "Embedded video",
      },
    }),
  },
  exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
}

/** Sanitise editor HTML. Safe to call repeatedly (idempotent). */
export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, articleOptions)
}

/** Comments are plain text only. */
export function sanitizePlainText(input: string) {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).replace(/\s+\n/g, "\n").trim()
}

export type TocItem = { id: string; text: string; level: 2 | 3 }

function headingId(text: string, used: Set<string>) {
  let base = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
  if (!base) base = "section"
  let id = base
  let i = 2
  while (used.has(id)) id = `${base}-${i++}`
  used.add(id)
  return id
}

export type RenderedArticle = {
  html: string
  /** Content split roughly in half at a paragraph boundary, for an optional mid-article ad. */
  parts: [string, string] | null
  toc: TocItem[]
}

/**
 * Sanitise, then enhance: heading anchors, lazy images, responsive tables and
 * embeds. Operates on sanitiser output, which is well-formed.
 */
export function renderArticleHtml(raw: string): RenderedArticle {
  const clean = sanitizeArticleHtml(raw)
  const used = new Set<string>()
  const toc: TocItem[] = []

  let html = clean.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
    const text = stripHtml(inner)
    const id = headingId(text, used)
    toc.push({ id, text, level: Number(lvl) as 2 | 3 })
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`
  })

  html = html
    .replace(/<img /g, '<img loading="lazy" decoding="async" ')
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<iframe /g, '<div class="embed"><iframe ')
    .replace(/<\/iframe>/g, "</iframe></div>")

  // Find top-level paragraph ends (not inside quotes, lists, tables…) to split near the middle.
  const ends: number[] = []
  const tagRe = /<(\/?)(blockquote|ul|ol|table|figure|div|pre)\b|<\/p>/g
  let depth = 0
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html))) {
    if (m[2]) depth += m[1] ? -1 : 1
    else if (depth === 0) ends.push(m.index + 4)
  }
  let parts: [string, string] | null = null
  if (ends.length >= 6) {
    const cut = ends[Math.floor(ends.length / 2)]!
    parts = [html.slice(0, cut), html.slice(cut)]
  }

  return { html, parts, toc }
}

export function contentStats(html: string, lang: string) {
  const words = countWords(stripHtml(html))
  return { wordCount: words, readingTimeMinutes: readingMinutes(words, lang) }
}
