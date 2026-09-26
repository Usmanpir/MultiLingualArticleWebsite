"use client"

import { useSyncExternalStore } from "react"
import { AArrowDown, AArrowUp } from "lucide-react"

const sizes = ["sm", "md", "lg", "xl"] as const
type Size = (typeof sizes)[number]
const listeners = new Set<() => void>()

function read(): Size {
  const v = document.documentElement.dataset.articleSize as Size | undefined
  return v && sizes.includes(v) ? v : "md"
}

function write(size: Size) {
  if (size === "md") delete document.documentElement.dataset.articleSize
  else document.documentElement.dataset.articleSize = size
  try {
    if (size === "md") localStorage.removeItem("article-size")
    else localStorage.setItem("article-size", size)
  } catch {}
  listeners.forEach((l) => l())
}

export function FontSizeControl({ labels }: { labels: { fontSize: string; decreaseFont: string; increaseFont: string } }) {
  const size = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    read,
    () => "md" as Size,
  )
  const i = sizes.indexOf(size)
  return (
    <div role="group" aria-label={labels.fontSize} className="flex items-center rounded-xl border border-border">
      <button type="button" className="icon-btn size-9" aria-label={labels.decreaseFont} disabled={i === 0} onClick={() => write(sizes[i - 1]!)}>
        <AArrowDown className="size-4" aria-hidden />
      </button>
      <button type="button" className="icon-btn size-9" aria-label={labels.increaseFont} disabled={i === sizes.length - 1} onClick={() => write(sizes[i + 1]!)}>
        <AArrowUp className="size-4" aria-hidden />
      </button>
    </div>
  )
}
