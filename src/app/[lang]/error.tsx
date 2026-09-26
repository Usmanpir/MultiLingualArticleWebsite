"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getDictionary, isLocale } from "@/lib/i18n"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const seg = usePathname()?.split("/")[1]
  const lang = isLocale(seg) ? seg : "en"
  const d = getDictionary(lang).errors

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="font-display text-3xl font-bold">{d.errorTitle}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{d.errorText}</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-fg-subtle">ref: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          {d.retry}
        </button>
        <Link href={`/${lang}`} className="btn btn-ghost">
          {d.backHome}
        </Link>
      </div>
    </div>
  )
}
