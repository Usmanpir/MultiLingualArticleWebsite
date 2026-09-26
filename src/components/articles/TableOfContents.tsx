"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Item = { id: string; text: string; level: 2 | 3 }

/** Server-rendered list of anchors; the client only adds active-section highlighting. */
export function TableOfContents({ items, title }: { items: Item[]; title: string }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-130px 0px -65% 0px" },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [items])

  return (
    <nav aria-label={title}>
      <p className="eyebrow mb-3">{title}</p>
      <ol className="grid gap-1 border-s border-border text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ms-px block border-s-2 py-1 leading-snug transition-colors",
                item.level === 3 ? "ps-6" : "ps-3",
                active === item.id ? "border-accent font-medium text-fg" : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
