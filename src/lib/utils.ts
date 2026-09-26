import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * URL-safe slug. Latin text is transliterated to ASCII; Arabic-script text is
 * kept (Unicode slugs are valid and readable for ur/ar audiences).
 */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}

export const slugPattern = /^[\p{Ll}\p{Lo}\p{N}]+(?:-[\p{Ll}\p{Lo}\p{N}]+)*$/u

export function stripHtml(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

export function countWords(text: string) {
  const plain = text.trim()
  if (!plain) return 0
  return plain.split(/\s+/).length
}

/** Words per minute tuned per script; Urdu/Arabic readers average fewer words/min. */
export function readingMinutes(wordCount: number, lang: string) {
  const wpm = lang === "en" ? 230 : 180
  return Math.max(1, Math.round(wordCount / wpm))
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/** Route params may arrive percent-encoded (e.g. Unicode slugs); decode defensively. */
export function decodeSegment(value: string) {
  if (!value.includes("%")) return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function clampPage(value: string | undefined) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 && n < 10_000 ? n : null
}
