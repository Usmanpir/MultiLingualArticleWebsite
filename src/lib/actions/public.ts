"use server"

import { randomBytes } from "node:crypto"
import { z } from "zod"
import { prisma } from "../prisma"
import { clientFingerprint, rateLimit } from "../rate-limit"
import { getSettings } from "../settings"
import { sanitizePlainText } from "../content"
import { isLocale } from "../i18n/config"
import { liveArticleWhere } from "../data/public"

export type FormState = { status: "idle" | "success" | "invalid" | "error" | "rate" | "closed"; message?: string }

const newsletterInput = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  lang: z.string().refine(isLocale),
  source: z.string().max(40).optional(),
  // Honeypot: real users never fill this hidden field.
  company: z.string().max(0).optional(),
})

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newsletterInput.safeParse({
    email: formData.get("email"),
    lang: formData.get("lang"),
    source: formData.get("source") || undefined,
    company: formData.get("company") || undefined,
  })
  if (!parsed.success) {
    // Pretend success to bots that filled the honeypot.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return { status: "success" }
    return { status: "invalid" }
  }
  const settings = await getSettings()
  if (!settings.newsletterEnabled) return { status: "closed" }

  const limit = await rateLimit(`newsletter:${await clientFingerprint()}`, 5, 3600)
  if (!limit.ok) return { status: "rate" }

  try {
    const { email, lang, source } = parsed.data
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: { email, languageCode: lang, source, unsubscribeToken: randomBytes(24).toString("hex") },
      })
    } else if (existing.status === "UNSUBSCRIBED") {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { status: "SUBSCRIBED", unsubscribedAt: null, languageCode: lang, unsubscribeToken: randomBytes(24).toString("hex") },
      })
    }
    // Same response whether or not the address was already present, so the form can't be used to probe emails.
    return { status: "success" }
  } catch (err) {
    console.error("newsletter subscribe failed", err)
    return { status: "error" }
  }
}

const commentInput = z.object({
  articleId: z.string().min(1).max(40),
  lang: z.string().refine(isLocale),
  name: z.string().trim().min(2).max(80),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().pipe(z.email().max(254))]).optional(),
  content: z.string().trim().min(3).max(3000),
  website: z.string().max(0).optional(),
})

export async function submitComment(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = commentInput.safeParse({
    articleId: formData.get("articleId"),
    lang: formData.get("lang"),
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    content: formData.get("content"),
    website: formData.get("website") || undefined,
  })
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { status: "success" }
    return { status: "invalid", message: parsed.error.issues[0]?.message }
  }
  const settings = await getSettings()
  const { articleId, lang, name, email, content } = parsed.data

  const article = await prisma.article.findFirst({ where: { id: articleId, ...liveArticleWhere() }, select: { allowComments: true } })
  if (!article) return { status: "error" }
  if (!settings.commentsEnabled || !article.allowComments) return { status: "closed" }

  const fp = await clientFingerprint()
  const limit = await rateLimit(`comment:${fp}`, 5, 600)
  if (!limit.ok) return { status: "rate" }

  const clean = sanitizePlainText(content)
  const linkCount = (clean.match(/https?:\/\//g) || []).length
  await prisma.comment.create({
    data: {
      articleId,
      languageCode: lang,
      authorName: sanitizePlainText(name),
      authorEmail: email || null,
      content: clean,
      ipHash: fp,
      // Never auto-publish: everything is PENDING, link-heavy posts go straight to SPAM for review.
      status: linkCount > 2 ? "SPAM" : "PENDING",
    },
  })
  return { status: "success" }
}
