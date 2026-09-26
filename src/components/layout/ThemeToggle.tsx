"use client"

import { useSyncExternalStore } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Popover } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const listeners = new Set<() => void>()
function readTheme(): Theme {
  try {
    return (localStorage.getItem("theme") as Theme) || "system"
  } catch {
    return "system"
  }
}

export function applyTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme)
  } catch {}
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.dataset.theme = theme
  listeners.forEach((l) => l())
}

function useTheme() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    readTheme,
    () => "system" as Theme,
  )
}

export function ThemeOptions({ labels, onPick }: { labels: Record<Theme, string>; onPick?: () => void }) {
  const theme = useTheme()
  const options: { value: Theme; icon: typeof Sun }[] = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ]
  return (
    <div role="radiogroup" className="flex flex-col gap-0.5">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => {
            applyTheme(value)
            onPick?.()
          }}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-surface-2",
            theme === value ? "text-accent font-semibold" : "text-fg-muted",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {labels[value]}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle({ label, labels }: { label: string; labels: Record<Theme, string> }) {
  return (
    <Popover
      label={label}
      trigger={
        <>
          <Sun className="size-[1.15rem] dark:hidden" aria-hidden />
          <Moon className="hidden size-[1.15rem] dark:block" aria-hidden />
        </>
      }
    >
      {(close) => <ThemeOptions labels={labels} onPick={close} />}
    </Popover>
  )
}
