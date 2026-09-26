import { notFound, permanentRedirect, redirect } from "next/navigation"
import { findRedirect } from "@/lib/data/public"
import { isLocale } from "@/lib/i18n"
import { decodeSegment } from "@/lib/utils"

/**
 * Catches every unmatched public URL: honours editor-managed redirects
 * (Admin → Redirects), otherwise returns a real 404 — never a soft redirect to home.
 */
export default async function CatchAll({ params }: PageProps<"/[lang]/[...rest]">) {
  const { lang, rest } = await params
  if (!isLocale(lang)) notFound()
  const path = `/${lang}/${rest.map(decodeSegment).join("/")}`
  const r = await findRedirect(path)
  if (r) (r.statusCode === 302 || r.statusCode === 307 ? redirect : permanentRedirect)(r.destination)
  notFound()
}
