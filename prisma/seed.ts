/**
 * Development seed. Idempotent: safe to run repeatedly (upserts by natural keys).
 *   npm run db:seed
 * Creates languages, roles, an admin user, demo authors, categories, tags,
 * demo articles with translations, static pages and ad placeholders (inactive).
 * All article content is clearly marked as demo content.
 */
import "dotenv/config"
import { existsSync } from "node:fs"
import { join } from "node:path"
import bcrypt from "bcryptjs"
import sanitizeHtml from "sanitize-html"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { AUTHORS, CATEGORIES, CATEGORY_COLORS, LANGUAGES } from "./seed-data"
import { articles, TAGS } from "./seed-content"
import { pages } from "./seed-pages"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

function words(html: string) {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()
  return text ? text.split(/\s+/).length : 0
}

async function main() {
  // ── Languages & roles ──────────────────────────────
  const lang: Record<string, string> = {}
  for (const l of LANGUAGES) {
    const row = await prisma.language.upsert({ where: { code: l.code }, create: l, update: { name: l.name, nativeName: l.nativeName, locale: l.locale, direction: l.direction } })
    lang[l.code] = row.id
  }
  const roles: Record<string, string> = {}
  for (const [name, description] of [
    ["ADMIN", "Full access"],
    ["EDITOR", "Articles, taxonomy, media, comments"],
    ["AUTHOR", "Own articles and drafts"],
  ] as const) {
    roles[name] = (await prisma.role.upsert({ where: { name }, create: { name, description }, update: { description } })).id
  }

  // ── Admin user ─────────────────────────────────────
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase()
  let password = process.env.SEED_ADMIN_PASSWORD
  const existingAdmin = await prisma.user.findUnique({ where: { email } })
  if (!existingAdmin) {
    if (!password) {
      if (process.env.NODE_ENV === "production") throw new Error("Set SEED_ADMIN_PASSWORD (min 12 chars) to seed an admin in production.")
      password = "ChangeMe-Now-2026!"
      console.warn(`\n⚠  No SEED_ADMIN_PASSWORD set — using the development default "${password}". Change it after signing in.\n`)
    }
    if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters")
    await prisma.user.create({ data: { email, name: "Site Admin", passwordHash: await bcrypt.hash(password, 12), roleId: roles.ADMIN! } })
    console.log(`admin user created: ${email}`)
  } else {
    console.log(`admin user exists: ${email} (password unchanged)`)
  }

  // ── Categories ─────────────────────────────────────
  const cat: Record<string, string> = {}
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, create: { slug: c.slug, color: CATEGORY_COLORS[c.slug], sortOrder: i }, update: {} })
    cat[c.slug] = row.id
    for (const code of ["en", "ur", "ar"] as const) {
      const t = c[code]
      await prisma.categoryTranslation.upsert({
        where: { categoryId_languageId: { categoryId: row.id, languageId: lang[code]! } },
        create: { categoryId: row.id, languageId: lang[code]!, name: t.name, description: t.description },
        update: { name: t.name, description: t.description },
      })
    }
  }

  // ── Tags ───────────────────────────────────────────
  const tag: Record<string, string> = {}
  for (const t of TAGS) {
    const row = await prisma.tag.upsert({ where: { slug: t.slug }, create: { slug: t.slug }, update: {} })
    tag[t.slug] = row.id
    for (const code of ["en", "ur", "ar"] as const) {
      await prisma.tagTranslation.upsert({
        where: { tagId_languageId: { tagId: row.id, languageId: lang[code]! } },
        create: { tagId: row.id, languageId: lang[code]!, name: t[code] },
        update: { name: t[code] },
      })
    }
  }

  // ── Authors ────────────────────────────────────────
  const author: Record<string, string> = {}
  const admin = await prisma.user.findUniqueOrThrow({ where: { email } })
  for (const a of AUTHORS) {
    const avatar = `/images/demo/avatar-${a.key}.webp`
    const row = await prisma.author.upsert({
      where: { slug: a.slug },
      create: { slug: a.slug, name: a.name, avatarUrl: existsSync(join(process.cwd(), "public", avatar)) ? avatar : null, userId: a.key === "amara" ? admin.id : null },
      update: {},
    })
    author[a.key] = row.id
    for (const code of ["en", "ur", "ar"] as const) {
      await prisma.authorTranslation.upsert({
        where: { authorId_languageId: { authorId: row.id, languageId: lang[code]! } },
        create: { authorId: row.id, languageId: lang[code]!, ...a[code] },
        update: a[code],
      })
    }
  }

  // ── Articles ───────────────────────────────────────
  for (const a of articles) {
    const imgPath = `/images/demo/${a.key}.webp`
    const hasImage = existsSync(join(process.cwd(), "public", imgPath))
    let mediaId: string | null = null
    if (hasImage) {
      const existing = await prisma.media.findFirst({ where: { url: imgPath } })
      mediaId = (
        existing ??
        (await prisma.media.create({
          data: {
            url: imgPath,
            storage: "LOCAL",
            storageKey: imgPath.slice(1),
            filename: `${a.key}.webp`,
            mimeType: "image/webp",
            width: 1600,
            height: 900,
            alt: `Abstract illustration for “${a.translations.en.title}”`,
            caption: "Illustration: generated demo artwork",
            uploadedById: admin.id,
          },
        }))
      ).id
    }

    const publishedAt = new Date(Date.now() - a.daysAgo * 86_400_000)
    const enSlug = a.translations.en.slug
    const existing = await prisma.articleTranslation.findUnique({ where: { languageId_slug: { languageId: lang.en!, slug: enSlug } }, select: { articleId: true } })
    const data = {
      authorId: author[a.author]!,
      categoryId: cat[a.category]!,
      featuredImageId: mediaId,
      status: "PUBLISHED" as const,
      featured: !!a.featured,
      trending: !!a.trending,
      editorsPick: !!a.editorsPick,
      primaryTopic: a.primaryTopic,
      publishedAt,
      // views intentionally not seeded — only real, de-duplicated reads are counted.
    }
    const article = existing ? await prisma.article.update({ where: { id: existing.articleId }, data }) : await prisma.article.create({ data })

    await prisma.articleTag.deleteMany({ where: { articleId: article.id } })
    await prisma.articleTag.createMany({ data: a.tags.map((t) => ({ articleId: article.id, tagId: tag[t]! })), skipDuplicates: true })

    for (const code of ["en", "ur", "ar"] as const) {
      const t = a.translations[code]
      if (!t) continue
      const wc = words(t.content)
      const trData = {
        status: "PUBLISHED" as const,
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
        content: t.content,
        wordCount: wc,
        readingTimeMinutes: Math.max(1, Math.round(wc / (code === "en" ? 230 : 180))),
      }
      await prisma.articleTranslation.upsert({
        where: { articleId_languageId: { articleId: article.id, languageId: lang[code]! } },
        create: { ...trData, articleId: article.id, languageId: lang[code]! },
        update: trData,
      })
    }
    console.log(`article: ${a.key} [${Object.keys(a.translations).join(", ")}]`)
  }

  // ── Static pages ───────────────────────────────────
  for (const [key, byLang] of Object.entries(pages)) {
    const page = await prisma.staticPage.upsert({ where: { key }, create: { key }, update: {} })
    for (const code of ["en", "ur", "ar"] as const) {
      const p = byLang[code]
      await prisma.staticPageTranslation.upsert({
        where: { pageId_languageId: { pageId: page.id, languageId: lang[code]! } },
        create: { pageId: page.id, languageId: lang[code]!, ...p },
        update: p,
      })
    }
  }

  // ── Ad placeholders (inactive; add real slot ids in Admin → Advertising) ──
  if ((await prisma.advertisement.count()) === 0) {
    await prisma.advertisement.createMany({
      data: [
        { name: "Article — mid content", placement: "ARTICLE_MIDDLE", adSlotId: "0000000000", isActive: false },
        { name: "Article — bottom", placement: "ARTICLE_BOTTOM", adSlotId: "0000000000", isActive: false },
        { name: "Home — sidebar", placement: "SIDEBAR", adSlotId: "0000000000", format: "vertical", isActive: false },
      ],
    })
  }

  // ── A few demo comments (one pending, to show moderation) ──
  const firstArticle = await prisma.article.findFirst({ where: { featured: true }, select: { id: true } })
  if (firstArticle && (await prisma.comment.count()) === 0) {
    await prisma.comment.createMany({
      data: [
        { articleId: firstArticle.id, languageCode: "en", authorName: "Demo Reader", content: "Demo comment: a clear explainer — the section on trade-offs was especially useful.", status: "APPROVED", moderatedAt: new Date() },
        { articleId: firstArticle.id, languageCode: "en", authorName: "Pending Example", content: "Demo comment awaiting moderation.", status: "PENDING" },
      ],
    })
  }

  console.log("\n✓ Seed complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
