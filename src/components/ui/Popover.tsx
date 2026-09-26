"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Minimal accessible disclosure menu: Escape / outside click closes, focus returns to trigger. */
export function Popover({
  label,
  trigger,
  children,
  align = "end",
  className,
}: {
  label: string
  trigger: ReactNode
  children: (close: () => void) => ReactNode
  align?: "start" | "end"
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        className="icon-btn"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={id}
          className={cn(
            "card absolute top-full z-50 mt-2 min-w-44 p-1.5 [animation:fade-in_.15s_ease-out]",
            align === "end" ? "end-0" : "start-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
