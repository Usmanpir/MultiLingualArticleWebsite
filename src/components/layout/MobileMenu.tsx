"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { LanguageList, type LanguageOption } from "./LanguageSwitcher"
import { ThemeOptions } from "./ThemeToggle"

type Props = {
  lang: string
  dir: "ltr" | "rtl"
  labels: { open: string; close: string; sections: string; language: string; theme: string; subscribe: string; themes: { light: string; dark: string; system: string } }
  categories: { slug: string; name: string; color: string }[]
  links: { href: string; label: string }[]
  languages: LanguageOption[]
}

export function MobileMenu({ lang, dir, labels, categories, links, languages }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a, button") ?? [])
    focusable()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "Tab") {
        const items = focusable()
        if (!items.length) return
        const first = items[0]!
        const last = items[items.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    const triggerEl = trigger.current
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
      triggerEl?.focus()
    }
  }, [open])

  return (
    <>
      <button ref={trigger} type="button" className="icon-btn md:hidden" aria-label={labels.open} aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu className="size-5" aria-hidden />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label={labels.sections}>
          <button type="button" tabIndex={-1} aria-hidden className="absolute inset-0 bg-black/50 backdrop-blur-sm [animation:fade-in_.2s_ease-out]" onClick={() => setOpen(false)} />
          <div
            ref={panel}
            className="absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-s border-border bg-bg-elevated shadow-2xl"
            style={{ animation: `${dir === "rtl" ? "slide-in-start" : "slide-in-end"} .25s ease-out` }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="eyebrow">{labels.sections}</span>
              <button type="button" className="icon-btn" aria-label={labels.close} onClick={() => setOpen(false)}>
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="px-2 py-3" aria-label={labels.sections}>
              <ul className="grid gap-0.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/${lang}/category/${c.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium hover:bg-surface-2">
                      <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-border px-2 py-3">
              <ul className="grid gap-0.5 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-lg px-3 py-2 text-fg-muted hover:bg-surface-2 hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 border-t border-border px-4 py-4">
              <div>
                <p className="eyebrow mb-2">{labels.language}</p>
                <LanguageList languages={languages} current={lang} />
              </div>
              <div>
                <p className="eyebrow mb-2">{labels.theme}</p>
                <ThemeOptions labels={labels.themes} />
              </div>
              <Link href="#newsletter" onClick={() => setOpen(false)} className="btn btn-primary">
                {labels.subscribe}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
