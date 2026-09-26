# FutureSphere — multilingual publishing platform

A production-oriented, multilingual (English · Urdu · Arabic, RTL-aware) editorial platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **PostgreSQL** and **Prisma 7**. It includes a public magazine site, a role-based newsroom CMS, technical SEO, AdSense/GA4 integration points and a consent framework.

> The brand name, tagline and seed content are placeholders. Everything seeded is clearly marked as **demo content** — replace it before launch.

---

## Contents

1. [Quick start (local)](#quick-start-local)
2. [Project architecture](#project-architecture)
3. [Database structure](#database-structure)
4. [Multilingual architecture](#multilingual-architecture)
5. [SEO architecture](#seo-architecture)
6. [Admin CMS & roles](#admin-cms--roles)
7. [AdSense integration](#adsense-integration)
8. [Google Analytics 4](#google-analytics-4)
9. [Privacy & consent](#privacy--consent)
10. [Environment variables](#environment-variables)
11. [PostgreSQL setup](#postgresql-setup)
12. [Deploying to Vercel](#deploying-to-vercel)
13. [Google Search Console](#google-search-console)
14. [SEO checklist](#seo-checklist)
15. [Production launch checklist](#production-launch-checklist)
16. [Scripts](#scripts)
17. [Known limitations](#known-limitations)

---

## Quick start (local)

Requirements: Node.js ≥ 20.19, a PostgreSQL 14+ database.

```bash
npm install                      # also runs `prisma generate`
cp .env.example .env             # then fill DATABASE_URL and AUTH_SECRET
npm run db:deploy                # apply migrations (or `npm run db:migrate` while developing the schema)
npm run db:seed                  # languages, roles, admin user, demo content
npm run dev                      # http://localhost:3000  → redirects to /en
```

No local Postgres? Prisma ships a local server:

```bash
npx prisma dev -n futuresphere --detach   # prints a postgres:// TCP URL — put it in DATABASE_URL
```

Sign in at **/login** with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. If you seeded without a password in development, the seed prints the temporary default — change it immediately in **Admin → Settings → Your password**.

---

## Project architecture

```
src/
  app/
    [lang]/                  Public site (root layout sets <html lang dir>)
      page.tsx               Home
      [category]/[slug]/     Article (canonical URL)
      article/[slug]/        Short link → 308 to canonical
      category|tag|author/[slug]/(page/[n])/   Archives with path pagination
      search/                Search (noindex, follow)
      about … advertising-policy/              Static pages (DB-driven)
      newsletter/unsubscribe/
      [...rest]/             Redirect table lookup, else a real 404
    (cms)/                   Separate root layout for the newsroom
      login/  admin/**       Dashboard, articles, taxonomy, media, …
    api/
      views/                 Cookie-less view counter
      og/[id]/               Dynamic Open Graph image per translation
      articles/ (+[key])     REST: public GET, protected POST/PATCH/DELETE
      admin/**               Authenticated admin endpoints (CSV export, media)
      cron/publish-scheduled Vercel Cron target
    sitemap.xml/ sitemaps/[file]/  Sitemap index + chunked sitemaps
    robots.ts  global-not-found.tsx
  components/                UI (server components by default; client islands marked "use client")
  lib/
    data/public.ts           All public reads (live content only)
    services/                Domain logic shared by server actions + REST (authz, validation, transactions)
    actions/                 Server actions (public + admin)
    auth/                    JWT session, permissions matrix
    seo/                     Metadata builder, JSON-LD, sitemap, audit checklist
    i18n/                    Locale config + UI dictionaries
    content.ts               HTML sanitiser, TOC, heading anchors
  proxy.ts                   Locale negotiation, admin gate, geo cookie (Next 16 "proxy", formerly middleware)
prisma/  schema.prisma, migrations/, seed*.ts
```

Key decisions:

- **Server Components first.** Client JS is limited to small islands: header menus, theme/language switchers, share buttons, reading progress, TOC highlight, forms, consent banner, analytics/ads loaders, and the admin editor.
- **Caching:** public pages use ISR (`revalidate` 300s; static pages 1h) and are purged on every admin mutation via `revalidatePath("/", "layout")`. React `cache()` de-duplicates queries within a render.
- **Real 404s.** Public routes have no `loading.tsx` above them, so `notFound()` runs before streaming and returns HTTP 404 (Next streams a 200 if a Suspense fallback has already flushed).
- **One source of truth for authorization:** `lib/services/*` + `requireUser(permission)`. The proxy only does an optimistic redirect; every page, action and API route re-checks the session against the database (role, active flag, session version).

---

## Database structure

PostgreSQL via Prisma 7 (`prisma-client` generator → `src/generated/prisma`, driver adapter `@prisma/adapter-pg`).

| Model | Purpose |
|---|---|
| `Role`, `User` | Accounts; `sessionVersion` allows revoking all sessions |
| `Author`, `AuthorTranslation` | Public bylines (optionally linked to a user), localised bio/job title |
| `Language` | Active languages, direction (LTR/RTL), OG locale, default |
| `Category`, `CategoryTranslation` | Sections with localised name/description/SEO |
| `Tag`, `TagTranslation`, `ArticleTag` | Topics |
| `Article` | Language-independent: author, category, image, workflow status, flags, `publishedAt`, aggregated `views` |
| `ArticleTranslation` | Per-language title, **localised slug**, excerpt, sanitised HTML, SEO overrides, robots, per-translation status. Unique `(articleId, languageId)` and `(languageId, slug)` |
| `Media` | Images with required alt text, dimensions, storage key |
| `Comment` | Moderated comments (PENDING/APPROVED/REJECTED/SPAM), salted IP hash only |
| `NewsletterSubscriber` | Email, language, status, unsubscribe token |
| `ArticleView` | One row per (article, anonymous visitor hash, day) |
| `Advertisement` | AdSense unit per placement |
| `SiteSetting` | JSON settings (SEO, verification, feature flags) |
| `StaticPage`, `StaticPageTranslation` | About/contact/policies |
| `Redirect` | Editor-managed and automatic (slug change) redirects |
| `ActivityLog`, `RateLimit` | Audit trail; Postgres-backed rate limiting |

Indexes cover status + `publishedAt`, category/author/featured/trending listings, views, `createdAt`, language + slug, and view aggregation by date.

**Workflow.** Article status: `DRAFT → REVIEW → SCHEDULED/PUBLISHED → ARCHIVED`. A translation is public only when the article is live (PUBLISHED, or SCHEDULED with `publishedAt ≤ now`) **and** the translation itself is `PUBLISHED`. Scheduled articles become visible at their go-live time automatically; the daily cron additionally flips their status and purges caches.

---

## Multilingual architecture

- Routes are prefixed: `/en`, `/ur`, `/ar`. `/` redirects (307, `Vary: Accept-Language`) to the reader's preferred supported language; other un-prefixed paths redirect permanently to `/en/...`.
- `<html lang dir>` is set per locale in `app/[lang]/layout.tsx`. Layout uses logical CSS properties (`ms-`, `pe-`, `start-`, `border-s`…), and directional icons are mirrored with `rtl:-scale-x-100`. Urdu uses Noto Nastaliq Urdu with taller line-height; Arabic uses Noto Sans Arabic. Arabic-script fonts aren't preloaded on English pages.
- UI strings live in `src/lib/i18n/dictionaries/{en,ur,ar}.ts` (type-checked against English). Content lives in the database.
- Articles have **localised slugs**. The header language switcher receives the article's real alternates, so it never links to a missing translation (it falls back to that language's home page).

**Adding a language:** add it to `locales` and `localeMeta` in `src/lib/i18n/config.ts`, add a dictionary file, create the `Language` row (add it to `prisma/seed-data.ts` and re-run the seed, or insert it), then enable it in **Admin → Languages**.

---

## SEO architecture

- **Metadata API** everywhere through `buildMetadata()` (`src/lib/seo/metadata.ts`): unique title/description, self-referencing canonical (or the editor's override), `hreflang` + `x-default` **only for versions that exist**, Open Graph (locale + alternates, article times, section, tags), Twitter/X cards, robots with `max-image-preview:large`.
- Titles: `SEO title || title` + ` | Site name`; description: `SEO description || excerpt`.
- **JSON-LD** (`src/lib/seo/jsonld.ts`): `NewsMediaOrganization`, `WebSite` + `SearchAction`, `Article` (or `NewsArticle` if enabled in settings), `BreadcrumbList`, `CollectionPage`, `ProfilePage/Person`. Only visible, true data is emitted.
- **Sitemaps:** `/sitemap.xml` is an index of `/sitemaps/pages.xml`, `categories.xml`, `tags.xml`, `authors.xml`, `articles-N.xml` (5,000 per file) with `xhtml:link` alternates and image entries. Excluded: drafts, unpublished translations, `noindex` pages, external canonicals, admin, search. Tag/author/category URLs appear only where that language actually has stories (tags need `tagIndexThreshold` stories).
- **robots.txt** allows everything public (including `/_next` assets and `/api/og/`), disallows `/admin/`, `/api/`, `/login`, `/register`. Search pages are *not* disallowed — they carry `noindex, follow` so crawlers can see that.
- Status codes: missing content → 404; moved slugs/categories → permanent redirect (Next emits 308, which Google treats like 301); `/page/1` → base URL.
- **Dynamic OG images** (`/api/og/{translationId}`) render title, brand, category and author with bundled Latin + Arabic fonts; text comes only from the database.
- Editor tools: Google-style snippet preview and an **editorial SEO checklist** (title/description length, single H1, image & alt text, slug quality, canonical, internal links, length, heading hierarchy, readability, translation coverage). It's a hygiene checklist, not a ranking score.

---

## Admin CMS & roles

`/admin` (all routes are `noindex` and sent with `X-Robots-Tag`). Sections: Dashboard, Articles (list + editor), Categories, Tags, Authors, Media, Comments, Pages, Languages, Newsletter, Advertising, Redirects, Analytics, Users, Settings.

| Role | Can |
|---|---|
| **ADMIN** | Everything |
| **EDITOR** | All articles (publish/schedule/archive/delete), categories, tags, media, comments, redirects, analytics |
| **AUTHOR** | Create articles, edit **own** drafts/review items, submit for review, upload media. Cannot publish. |

Enforced server-side in `src/lib/auth/permissions.ts` + services — hiding buttons is only cosmetic.

**Editor:** per-language tabs with status, "duplicate structure" into a new language, semantic HTML toolbar (headings, lists, quotes, links, images with captions, tables, code, YouTube-nocookie embeds, dividers), live preview rendered by the same sanitiser as the site, SEO fields, robots, canonical, scheduling, featured/trending/editor's-pick, primary/secondary topics, unsaved-changes guard. Changing a published slug creates a redirect automatically.

**Security notes:** bcrypt (cost 12) passwords, HS256 JWT in an httpOnly/SameSite=Lax/Secure cookie, DB-verified sessions with revocation, login rate limiting (per IP and per account), constant-work failure path, Zod validation on every mutation, server actions' built-in origin checks, same-origin checks on cookie-authenticated REST mutations, sanitize-html allow-list (only YouTube/Vimeo iframes), images re-encoded (strips EXIF/GPS), CSV export guarded against formula injection, security headers (HSTS, nosniff, frame-options, referrer-policy, permissions-policy).

---

## AdSense integration

1. Get approved in AdSense (the site needs substantial original content, clear navigation, privacy policy and contact page first).
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-…` and `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
3. Create ad units in AdSense, then add each unit's numeric slot id in **Admin → Advertising** and pick a placement (article top/middle/bottom, home inline, sidebar). Seeded placeholders are inactive.
4. For the EEA, UK and Switzerland Google requires a **Google-certified CMP** for personalised ads. The built-in banner gates loading on consent but is not a certified CMP — integrate one (e.g. via Funding Choices / Privacy & messaging) before serving ads there.
5. Optional: add `public/ads.txt` with the line AdSense gives you.

`<AdSlot placement>` renders nothing unless enabled + client id + active unit exist (no empty boxes). The container is shown only after advertising consent (pre-paint attribute, so no layout shift), reserves height to avoid CLS, lazy-loads `adsbygoogle.js` near the viewport, and never renders real ads in development unless `NEXT_PUBLIC_ADSENSE_TEST=true`. Ads are labelled "Advertisement" and kept away from navigation. No earnings are implied or guaranteed.

---

## Google Analytics 4

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX`. The tag loads only after analytics consent (or where consent isn't required). Events: automatic page views + history changes and outbound clicks (GA4 enhanced measurement — keep it enabled in the GA stream settings), plus custom `article_view` (language, category), `newsletter_signup`, `search` (`search_term`), `share`. IP anonymisation on; ad storage denied by default.

The first-party view counter is separate, cookie-less and privacy-preserving (daily-rotating salted hash, one row per visitor/article/day, bots filtered, requires 5s visible time).

---

## Privacy & consent

Categories: **necessary** (always on), **analytics**, **advertising**. Choice is stored in the `fs_consent` cookie; readers can reopen "Cookie settings" from the footer. `NEXT_PUBLIC_CONSENT_REGIONS` controls where opt-in is required (`*` default = everywhere; or a list of ISO country codes using Vercel's geo header; `none`). Nothing optional loads before consent where it's required. Review the seeded policy pages with counsel.

---

## Environment variables

See **`.env.example`** (fully commented). Minimum for production: `DATABASE_URL`, `AUTH_SECRET` (32+ random chars), `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN` (for uploads), `CRON_SECRET`. Only `NEXT_PUBLIC_*` values reach the browser.

---

## PostgreSQL setup

Any PostgreSQL 14+ works: Neon, Supabase, Vercel Marketplace Postgres, RDS, Railway, or local.

- Use the **pooled** URL for `DATABASE_URL` on Vercel and the **direct** URL for `DIRECT_URL` (migrations). Keep `DATABASE_POOL_MAX` small (default 5).
- Apply migrations: `npm run db:deploy`. Seed (once): `SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run db:seed` — run it from your machine pointing at the production database, or skip the seed and create content in the CMS (you still need languages, roles and an admin: the seed is idempotent and safe to run on an empty production DB; delete demo articles afterwards).
- Schema changes: edit `prisma/schema.prisma` → `npm run db:migrate -- --name <change>` → commit the migration.

---

## Deploying to Vercel

1. Push the repo to GitHub/GitLab and import it in Vercel (framework: Next.js).
2. Add environment variables (Production + Preview). For previews set `NEXT_PUBLIC_NOINDEX=true`.
3. Create a Blob store (Storage → Blob) and connect it — Vercel adds `BLOB_READ_WRITE_TOKEN`.
4. Build: Vercel runs `npm run vercel-build` = `prisma generate && prisma migrate deploy && next build`. (Use `npm run build` locally; it doesn't migrate.)
5. Cron: `vercel.json` calls `/api/cron/publish-scheduled` daily (Hobby-plan limit); on Pro change the schedule to hourly (`0 * * * *`). Set `CRON_SECRET`.
6. Add your domain, then set `NEXT_PUBLIC_SITE_URL` to the final `https://` origin and redeploy (canonicals, hreflang and sitemaps use it).
7. Seed or create the first admin, sign in at `/login`, replace demo content and brand details (`src/lib/brand.ts`, Admin → Settings).

---

## Google Search Console

1. Add a **Domain property** (DNS TXT — recommended) or URL-prefix property. For the HTML-tag method, paste the token into **Admin → Settings → Google site verification** (or `GOOGLE_SITE_VERIFICATION`); the meta tag is output only when set.
2. Submit `https://your-domain/sitemap.xml`.
3. Use URL Inspection on a home page, category and article in each language; confirm canonical and hreflang are read as expected.
4. Check the Rich Results Test for Article + Breadcrumb markup, and Core Web Vitals once field data accrues.

Nothing here guarantees indexing, rankings, Discover or Google News inclusion — those depend on content quality and Google's systems. Google News: publisher, author bylines, dates, sections and contact/editorial pages are in place; apply via the Publisher Center when you have a track record of original reporting.

---

## SEO checklist

- [ ] `NEXT_PUBLIC_SITE_URL` is the final https origin
- [ ] Unique title + description on home, categories, articles (check a few in each language)
- [ ] Canonicals self-reference; no language canonicalises to English
- [ ] hreflang lists only existing translations + `x-default`
- [ ] `/sitemap.xml` loads; no drafts or noindex URLs inside
- [ ] `/robots.txt` allows content, CSS/JS, images; references the sitemap
- [ ] Article JSON-LD validates (Rich Results Test); Organization logo set
- [ ] Featured images ≥ 1200px wide with descriptive alt text
- [ ] Missing article returns 404; changed slug returns a permanent redirect
- [ ] Search pages are `noindex, follow`; admin is `noindex, nofollow`
- [ ] Mobile layout at 320–414px, RTL pages in ur/ar look right
- [ ] Demo content, demo authors and demo banner text removed

## Production launch checklist

- [ ] Strong `AUTH_SECRET`, admin password changed, unused users removed
- [ ] Migrations applied (`prisma migrate deploy`), backups enabled on the database
- [ ] Blob storage connected; test an upload
- [ ] `CRON_SECRET` set; cron visible in Vercel → Settings → Cron Jobs
- [ ] Legal pages reviewed (privacy, cookies, terms, advertising) and company details filled in
- [ ] Consent regions configured; certified CMP in place before personalised ads in EEA/UK
- [ ] GA4 measurement id set (optional); AdSense only after approval
- [ ] Brand: `src/lib/brand.ts`, `src/app/icon.svg`, `public/images/og-default.png`, `public/images/logo-512.png`
- [ ] Preview deployments set `NEXT_PUBLIC_NOINDEX=true`
- [ ] Search Console property verified and sitemap submitted
- [ ] Run `npm run lint && npm run typecheck && npm run build` in CI

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build / serve |
| `npm run vercel-build` | Build used on Vercel (generate → migrate deploy → build) |
| `npm run lint` / `typecheck` | ESLint / route typegen + `tsc --noEmit` |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:seed` | Idempotent demo seed |
| `npm run db:studio` | Prisma Studio |
| `npm run db:dev-server` | Local Prisma Postgres server |
| `npm run demo:images` | Regenerate demo artwork & brand assets |

---

## Known limitations

- Newsletter **sending** isn't included: subscribers are stored with unsubscribe tokens and can be exported (CSV) to your email provider. The unsubscribe URL format is `/{lang}/newsletter/unsubscribe?token=…`.
- Search uses PostgreSQL `ILIKE` across title, excerpt, category and tag names — fine for thousands of articles; for larger archives add `pg_trgm` indexes or a search service.
- The article editor is a semantic HTML editor with live preview, not a WYSIWYG canvas.
- The consent banner is not a Google-certified CMP (see AdSense section).
#   M u l t i L i n g u a l A r t i c l e W e b s i t e  
 