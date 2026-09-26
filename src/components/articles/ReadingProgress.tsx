"use client"

import { useEffect, useRef } from "react"

/** Sticky progress bar. Writes directly to a CSS transform (no React re-renders while scrolling). */
export function ReadingProgress({ targetId, label }: { targetId: string; label: string }) {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target || !bar.current) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
      if (bar.current) {
        bar.current.style.transform = `scaleX(${progress})`
        bar.current.parentElement?.setAttribute("aria-valuenow", String(Math.round(progress * 100)))
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-accent to-accent-2 rtl:origin-right" style={{ transform: "scaleX(0)" }} />
    </div>
  )
}
