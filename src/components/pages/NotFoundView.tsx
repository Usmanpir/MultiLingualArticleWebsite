"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getDictionary, isLocale } from "@/lib/i18n"

export function NotFoundView() {
  const seg = usePathname()?.split("/")[1]
  const lang = isLocale(seg) ? seg : "en"
  const d = getDictionary(lang)
  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-page relative flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-gradient text-7xl font-bold sm:text-9xl" aria-hidden>
          404
        </p>
        <h1 className="font-display mt-6 text-2xl font-bold sm:text-3xl">{d.errors.notFoundTitle}</h1>
        <p className="mt-3 max-w-md text-fg-muted">{d.errors.notFoundText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/${lang}`} className="btn btn-primary">
            {d.errors.backHome}
          </Link>
          <Link href={`/${lang}/search`} className="btn btn-ghost">
            {d.nav.search}
          </Link>
        </div>
      </div>
    </div>
  )
}
