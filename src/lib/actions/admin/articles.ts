"use server"

import { requireUser } from "../../auth/session"
import { renderArticleHtml } from "../../content"
import { deleteArticle, deleteTranslation, saveArticle, setArticleStatus } from "../../services/articles"
import { revalidatePublic, toResult, type ActionResult } from "./helpers"

export async function saveArticleAction(payload: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("articles.create")
    const saved = await saveArticle(user, payload)
    revalidatePublic()
    return { ok: true, id: saved.id, message: "Saved" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("articles.create")
    await deleteArticle(user, id)
    revalidatePublic()
    return { ok: true, message: "Article deleted" }
  } catch (err) {
    return toResult(err)
  }
}

export async function deleteTranslationAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser("articles.create")
    await deleteTranslation(user, id)
    revalidatePublic()
    return { ok: true, message: "Translation deleted" }
  } catch (err) {
    return toResult(err)
  }
}

export async function setArticleStatusAction(id: string, status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult> {
  try {
    const user = await requireUser("articles.create")
    await setArticleStatus(user, id, status)
    revalidatePublic()
    return { ok: true, message: `Status changed to ${status.toLowerCase()}` }
  } catch (err) {
    return toResult(err)
  }
}

/** Live preview uses the exact server-side sanitiser/renderer the public site uses. */
export async function previewContentAction(content: string): Promise<{ html: string; toc: { id: string; text: string; level: number }[] }> {
  await requireUser("articles.create")
  const { html, toc } = renderArticleHtml(content.slice(0, 400_000))
  return { html, toc }
}
