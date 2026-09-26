/**
 * Editorial SEO checklist. These are widely-accepted publishing hygiene
 * checks — NOT a prediction of Google rankings. Pure functions, so the
 * editor can run them live in the browser.
 */
export type AuditStatus = "pass" | "warn" | "fail"
export type AuditCheck = { id: string; label: string; status: AuditStatus; detail: string }

export type AuditInput = {
  lang: string
  title: string
  seoTitle?: string | null
  seoDescription?: string | null
  excerpt: string
  slug: string
  content: string
  canonicalUrl?: string | null
  siteName: string
  siteUrl: string
  featuredImage?: { alt: string } | null
  primaryTopic?: string | null
  translationCount: number
  languageCount: number
}

function text(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim()
}

export function runSeoAudit(a: AuditInput): { checks: AuditCheck[]; passed: number; total: number } {
  const checks: AuditCheck[] = []
  const add = (id: string, label: string, status: AuditStatus, detail: string) => checks.push({ id, label, status, detail })

  const metaTitle = (a.seoTitle || a.title).trim()
  const fullTitleLen = metaTitle.length + a.siteName.length + 3
  if (!metaTitle) add("title", "Title", "fail", "Add a title.")
  else if (metaTitle.length < 25) add("title", "Title length", "warn", `${metaTitle.length} characters — consider a more descriptive title (≈ 30–60).`)
  else if (fullTitleLen > 70) add("title", "Title length", "warn", `${fullTitleLen} characters including the site name — may be truncated in results. Set a shorter SEO title.`)
  else add("title", "Title length", "pass", `${metaTitle.length} characters.`)

  const desc = (a.seoDescription || a.excerpt).trim()
  if (!desc) add("description", "Meta description", "fail", "Add an excerpt or SEO description.")
  else if (desc.length < 70) add("description", "Meta description length", "warn", `${desc.length} characters — aim for roughly 70–160.`)
  else if (desc.length > 165) add("description", "Meta description length", "warn", `${desc.length} characters — will likely be truncated.`)
  else add("description", "Meta description length", "pass", `${desc.length} characters.`)

  const h1InBody = /<h1[\s>]/i.test(a.content)
  add("h1", "Single H1", h1InBody ? "warn" : "pass", h1InBody ? "The body contains an H1; it will be rendered as H2 because the title is the page's H1." : "The article title is the only H1.")

  if (!a.featuredImage) add("image", "Featured image", "warn", "Add a large featured image (≥ 1200px wide) — important for social cards and Discover.")
  else if (a.featuredImage.alt.trim().length < 5) add("image", "Featured image alt text", "fail", "Describe the featured image in its alt text.")
  else add("image", "Featured image", "pass", "Featured image with alt text.")

  const imgs = [...a.content.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const missingAlt = imgs.filter((tag) => !/\balt="[^"]{3,}"/i.test(tag)).length
  if (imgs.length) add("alts", "Inline image alt text", missingAlt ? "fail" : "pass", missingAlt ? `${missingAlt} of ${imgs.length} inline images lack alt text.` : `All ${imgs.length} inline images have alt text.`)

  const words = a.slug.split("-").filter(Boolean)
  if (!a.slug) add("slug", "Slug", "fail", "Add a URL slug.")
  else if (a.slug.length > 75 || words.length > 10) add("slug", "Slug", "warn", "Long slug — keep URLs short, readable and stable.")
  else if (/(\b\w+\b)(-\1\b){1,}/.test(a.slug)) add("slug", "Slug", "warn", "Repeated words in the slug look like keyword stuffing.")
  else add("slug", "Slug", "pass", "Short and readable.")

  if (!a.canonicalUrl) add("canonical", "Canonical URL", "pass", "Self-referencing canonical (default).")
  else if (!a.canonicalUrl.startsWith(a.siteUrl)) add("canonical", "Canonical URL", "warn", "Canonical points to another site — this page won't be indexed on its own. Only use this for syndicated content.")
  else add("canonical", "Canonical URL", "pass", "Custom canonical on this site.")

  const links = [...a.content.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]!)
  const internal = links.filter((h) => h.startsWith("/") || h.startsWith(a.siteUrl)).length
  add("links", "Internal links", internal >= 2 ? "pass" : "warn", internal >= 2 ? `${internal} internal links.` : `${internal} internal link(s) — link to related coverage where it genuinely helps readers.`)

  const plain = text(a.content)
  const wordCount = plain ? plain.split(/\s+/).length : 0
  if (wordCount < 150) add("length", "Article length", "fail", `${wordCount} words — very thin. Useful, original depth matters more than length, but this is likely too short.`)
  else if (wordCount < 300) add("length", "Article length", "warn", `${wordCount} words — consider whether readers need more context.`)
  else add("length", "Article length", "pass", `${wordCount} words.`)

  const headings = [...a.content.matchAll(/<h([2-4])[\s>]/gi)].map((m) => Number(m[1]))
  const h2 = headings.filter((h) => h === 2).length
  const skip = headings.some((h, i) => i > 0 ? h - headings[i - 1]! > 1 : h > 2)
  if (wordCount > 600 && h2 < 2) add("headings", "Headings", "warn", "Long article with fewer than two H2 sections — add subheadings to aid scanning.")
  else if (skip) add("headings", "Heading hierarchy", "warn", "A heading level is skipped (e.g. H2 → H4). Use headings for structure, CSS for size.")
  else add("headings", "Headings", "pass", `${headings.length} subheading(s), hierarchy OK.`)

  const sentences = plain.split(/[.!?؟۔]+\s/).filter((s) => s.trim().split(/\s+/).length > 2)
  const avg = sentences.length ? Math.round(wordCount / sentences.length) : 0
  if (sentences.length > 3) add("readability", "Readability", avg > 26 ? "warn" : "pass", `Average sentence ≈ ${avg} words${avg > 26 ? " — consider shorter sentences." : "."}`)

  if (a.primaryTopic) {
    const topic = a.primaryTopic.toLowerCase()
    const inTitle = metaTitle.toLowerCase().includes(topic)
    const intro = plain.slice(0, 600).toLowerCase().includes(topic)
    add("topic", "Primary topic", inTitle || intro ? "pass" : "warn", inTitle || intro ? "Topic is clear from the title/introduction." : "The primary topic doesn't appear in the title or introduction.")
  }

  add(
    "translations",
    "Translations",
    a.translationCount >= a.languageCount ? "pass" : "warn",
    `${a.translationCount} of ${a.languageCount} languages. Translate only when you can maintain quality.`,
  )

  return { checks, passed: checks.filter((c) => c.status === "pass").length, total: checks.length }
}
