import "server-only"
import { cache } from "react"
import { z } from "zod"
import { prisma } from "./prisma"
import { brandConfig } from "./brand"

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(60),
  /** Localised home-page meta descriptions; falls back to brandConfig.description. */
  descriptions: z.record(z.string(), z.string().trim().max(200)),
  defaultOgImage: z.string().trim().max(500),
  xHandle: z.string().trim().max(30).regex(/^(@?\w{1,15})?$/, "Use a handle like @futuresphere"),
  organizationName: z.string().trim().min(1).max(120),
  organizationLogo: z.string().trim().max(500),
  googleVerification: z.string().trim().max(200),
  bingVerification: z.string().trim().max(200),
  /** Set false on staging to noindex the whole site. */
  indexSite: z.boolean(),
  commentsEnabled: z.boolean(),
  newsletterEnabled: z.boolean(),
  sitemapIncludeTags: z.boolean(),
  sitemapIncludeAuthors: z.boolean(),
  /** Tag pages need at least this many stories (per language) to be indexable. */
  tagIndexThreshold: z.number().int().min(1).max(50),
  /** Use NewsArticle instead of Article — only if you publish genuine news reporting. */
  newsArticleSchema: z.boolean(),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>

export const defaultSettings: SiteSettings = {
  siteName: brandConfig.name,
  descriptions: {},
  defaultOgImage: brandConfig.defaultOgImage,
  xHandle: brandConfig.social.xHandle,
  organizationName: brandConfig.organization.name,
  organizationLogo: brandConfig.organization.logo,
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION || "",
  bingVerification: process.env.BING_SITE_VERIFICATION || "",
  indexSite: process.env.NEXT_PUBLIC_NOINDEX !== "true",
  commentsEnabled: true,
  newsletterEnabled: true,
  sitemapIncludeTags: true,
  sitemapIncludeAuthors: true,
  tagIndexThreshold: 3,
  newsArticleSchema: false,
}

const KEY = "site"

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } })
  if (!row) return defaultSettings
  const parsed = siteSettingsSchema.partial().safeParse(row.value)
  return { ...defaultSettings, ...(parsed.success ? parsed.data : {}) }
})

export async function saveSettings(next: SiteSettings) {
  await prisma.siteSetting.upsert({ where: { key: KEY }, create: { key: KEY, value: next }, update: { value: next } })
}
