"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { track } from "@/components/analytics/track"

export function SearchBox({ initial, labels }: { initial: string; labels: { label: string; placeholder: string; submit: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(initial)
  const [pending, startTransition] = useTransition()
  const lastSent = useRef(initial)

  useEffect(() => {
    const q = value.trim()
    if (q === lastSent.current.trim()) return
    if (q.length === 1) return
    const id = setTimeout(() => {
      lastSent.current = q
      startTransition(() => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false }))
      if (q) track("search", { search_term: q })
    }, 350)
    return () => clearTimeout(id)
  }, [value, pathname, router])

  return (
    <form
      role="search"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault()
        const q = value.trim()
        lastSent.current = q
        startTransition(() => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false }))
      }}
      className="relative"
    >
      <label htmlFor="q" className="sr-only">
        {labels.label}
      </label>
      <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" aria-hidden />
      <input
        id="q"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={labels.placeholder}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        className="input h-14 ps-12 pe-28 text-lg"
      />
      <button type="submit" className="btn btn-primary btn-sm absolute end-2 top-1/2 -translate-y-1/2">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {labels.submit}
      </button>
    </form>
  )
}
