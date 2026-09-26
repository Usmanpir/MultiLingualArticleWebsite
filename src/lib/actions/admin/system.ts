"use server"

import { z } from "zod"
import { prisma } from "../../prisma"
import { can } from "../../auth/permissions"
import { hashPassword, requireUser } from "../../auth/session"
import { HttpError } from "../../http"
import { removeStoredImage, storeImage } from "../../services/media"
import { logActivity } from "../../services/activity"
import { saveSettings, siteSettingsSchema } from "../../settings"
import { locales } from "../../i18n/config"
import { bool, revalidatePublic, str, toResult, type ActionResult } from "./helpers"

// ───────────── Media ─────────────

export async function uploadMediaAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("media.upload")
    const file = fd.get("file")
    if (!(file instanceof File) || file.size === 0) throw new HttpError(400, "Choose an image to upload")
    const meta = z
      .object({ alt: z.string().trim().min(3, "Describe the image for screen readers (alt text)").max(200), caption: z.string().trim().max(300), credit: z.string().trim().max(120) })
      .parse({ alt: str(fd, "alt"), caption: str(fd, "caption"), credit: str(fd, "credit") })
    const stored = await storeImage(file)
    const media = await prisma.media.create({ data: { ...stored, alt: meta.alt, caption: meta.caption || null, credit: meta.credit || null, uploadedById: user.id } })
    await logActivity(user.id, "media.upload", "Media", media.id, `Uploaded ${media.filename}`)
    return { ok: true, id: media.id, message: "Image uploaded" }
  } catch (err) {
    return toResult(err)
  }
}

export async function updateMediaAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("media.upload")
    const id = str(fd, "id")
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) throw new HttpError(404, "Media not found")
    if (!can(user.role, "media.manage") && media.uploadedById !== user.id) throw new HttpError(403, "You can only edit your own uploads")
    const meta = z
      .object({ alt: z.string().trim().min(3).max(200), caption: z.string().trim().max(300), credit: z.string().trim().max(120) })
      .parse({ alt: str(fd, "alt"), caption: str(fd, "caption"), credit: str(fd, "credit") })
    await prisma.media.update({ where: { id }, data: { alt: meta.alt, caption: meta.caption || null, credit: meta.credit || null } })
    revalidatePublic()
    return { ok: true, message: "Saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("media.manage")
    const media = await prisma.media.findUnique({ where: { id }, include: { _count: { select: { articles: true } } } })
    if (!media) throw new HttpError(404, "Media not found")
    if (media._count.articles) throw new HttpError(409, `This image is the featured image of ${media._count.articles} article(s)`)
    await prisma.media.delete({ where: { id } })
    await removeStoredImage(media)
    await logActivity(user.id, "media.delete", "Media", id, `Deleted ${media.filename}`)
    return { ok: true, message: "Image deleted" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Comments ─────────────

export async function moderateCommentAction(id: string, status: "APPROVED" | "REJECTED" | "SPAM" | "PENDING"): Promise<ActionResult> {
  try {
    const user = await requireUser("comments.moderate")
    await prisma.comment.update({ where: { id }, data: { status, moderatedAt: new Date() } })
    await logActivity(user.id, `comment.${status.toLowerCase()}`, "Comment", id, `Marked comment ${status.toLowerCase()}`)
    revalidatePublic()
    return { ok: true }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteCommentAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("comments.moderate")
    await prisma.comment.delete({ where: { id } })
    await logActivity(user.id, "comment.delete", "Comment", id, "Deleted comment")
    revalidatePublic()
    return { ok: true }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Newsletter ─────────────

export async function deleteSubscriberAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("newsletter.manage")
    await prisma.newsletterSubscriber.delete({ where: { id } })
    await logActivity(user.id, "subscriber.delete", "NewsletterSubscriber", id, "Deleted subscriber (erasure request)")
    return { ok: true }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Advertisements ─────────────

const adSchema = z.object({
  name: z.string().trim().min(2).max(80),
  placement: z.enum(["HEADER_BANNER", "HOME_INLINE", "ARTICLE_TOP", "ARTICLE_MIDDLE", "ARTICLE_BOTTOM", "SIDEBAR", "MOBILE_STICKY"]),
  adSlotId: z.string().trim().regex(/^\d{6,20}$/, "AdSense slot ids are numeric"),
  format: z.enum(["auto", "fluid", "rectangle", "horizontal", "vertical"]),
})

export async function saveAdAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("ads.manage")
    const id = str(fd, "id") || undefined
    const data = { ...adSchema.parse({ name: str(fd, "name"), placement: str(fd, "placement"), adSlotId: str(fd, "adSlotId"), format: str(fd, "format") || "auto" }), responsive: bool(fd, "responsive"), isActive: bool(fd, "isActive") }
    const ad = id ? await prisma.advertisement.update({ where: { id }, data }) : await prisma.advertisement.create({ data })
    await logActivity(user.id, "ad.save", "Advertisement", ad.id, `Saved ad unit ${ad.name}`)
    revalidatePublic()
    return { ok: true, id: ad.id, message: "Ad unit saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteAdAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("ads.manage")
    await prisma.advertisement.delete({ where: { id } })
    await logActivity(user.id, "ad.delete", "Advertisement", id, "Deleted ad unit")
    revalidatePublic()
    return { ok: true }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Settings ─────────────

export async function saveSettingsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("settings.manage")
    const settings = siteSettingsSchema.parse({
      siteName: str(fd, "siteName"),
      descriptions: Object.fromEntries(locales.map((l) => [l, str(fd, `description_${l}`).trim()]).filter(([, v]) => v)),
      defaultOgImage: str(fd, "defaultOgImage"),
      xHandle: str(fd, "xHandle"),
      organizationName: str(fd, "organizationName"),
      organizationLogo: str(fd, "organizationLogo"),
      googleVerification: str(fd, "googleVerification"),
      bingVerification: str(fd, "bingVerification"),
      indexSite: bool(fd, "indexSite"),
      commentsEnabled: bool(fd, "commentsEnabled"),
      newsletterEnabled: bool(fd, "newsletterEnabled"),
      sitemapIncludeTags: bool(fd, "sitemapIncludeTags"),
      sitemapIncludeAuthors: bool(fd, "sitemapIncludeAuthors"),
      tagIndexThreshold: Number(str(fd, "tagIndexThreshold") || 3),
      newsArticleSchema: bool(fd, "newsArticleSchema"),
    })
    await saveSettings(settings)
    await logActivity(user.id, "settings.update", "SiteSetting", "site", "Updated site settings")
    revalidatePublic()
    return { ok: true, message: "Settings saved" }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Redirects ─────────────

const pathSchema = z.string().trim().regex(/^\/[^\s?#]*$/, "Must be a path starting with /").max(500)

export async function saveRedirectAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser("redirects.manage")
    const data = z
      .object({
        source: pathSchema.transform((s) => s.replace(/\/+$/, "") || "/"),
        destination: z.union([pathSchema, z.url({ protocol: /^https?$/ })]),
        statusCode: z.coerce.number().refine((n) => [301, 302, 307, 308].includes(n)),
      })
      .refine((d) => d.source !== d.destination, { message: "Source and destination must differ", path: ["destination"] })
      .parse({ source: str(fd, "source"), destination: str(fd, "destination"), statusCode: str(fd, "statusCode") || "301" })
    if (data.source.startsWith("/admin") || data.source.startsWith("/api")) throw new HttpError(400, "Admin and API paths can't be redirected")
    const r = await prisma.redirect.upsert({ where: { source: data.source }, create: data, update: data })
    await logActivity(user.id, "redirect.save", "Redirect", r.id, `${data.source} → ${data.destination}`)
    revalidatePublic()
    return { ok: true, message: "Redirect saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("redirects.manage")
    await prisma.redirect.delete({ where: { id } })
    await logActivity(user.id, "redirect.delete", "Redirect", id, "Deleted redirect")
    revalidatePublic()
    return { ok: true }
  } catch (err) {
    return toResult(err)
  }
}

// ───────────── Users ─────────────

export async function saveUserAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const me = await requireUser("users.manage")
    const id = str(fd, "id") || undefined
    const base = z
      .object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().pipe(z.email()), role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]) })
      .parse({ name: str(fd, "name"), email: str(fd, "email"), role: str(fd, "role") })
    const password = str(fd, "password")
    if (!id && password.length < 12) throw new HttpError(400, "New users need a password of at least 12 characters")
    if (password && password.length < 12) throw new HttpError(400, "Passwords must be at least 12 characters")
    const isActive = bool(fd, "isActive")
    if (id === me.id && (!isActive || base.role !== "ADMIN")) throw new HttpError(400, "You can't demote or deactivate your own account")
    const role = await prisma.role.findUniqueOrThrow({ where: { name: base.role } })
    const data = { name: base.name, email: base.email, roleId: role.id, isActive, ...(password ? { passwordHash: await hashPassword(password) } : {}) }
    const user = id
      ? await prisma.user.update({ where: { id }, data: { ...data, ...(password || !isActive ? { sessionVersion: { increment: 1 } } : {}) } })
      : await prisma.user.create({ data: data as typeof data & { passwordHash: string } })
    await logActivity(me.id, id ? "user.update" : "user.create", "User", user.id, `Saved user ${user.email} (${base.role})`)
    return { ok: true, id: user.id, message: "User saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function revokeSessionsAction(id: string): Promise<ActionResult> {
  try {
    const me = await requireUser("users.manage")
    await prisma.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } })
    await logActivity(me.id, "user.revoke", "User", id, "Revoked all sessions")
    return { ok: true, message: "Sessions revoked" }
  } catch (err) {
    return toResult(err)
  }
}
