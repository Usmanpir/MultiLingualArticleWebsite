"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, Languages } from "lucide-react"
import { Popover } from "@/components/ui/Popover"
import { useAlternates } from "@/components/i18n/alternates"
import { cn } from "@/lib/utils"

export type LanguageOption = { code: string; nativeName: string; dir: "ltr" | "rtl" }

export function useLanguageHref() {
  const pathname = usePathname() || "/"
  const alternates = useAlternates()
  return (code: string) => {
    if (alternates) return alternates[code] ?? `/${code}`
    const parts = pathname.split("/")
    parts[1] = code
    return parts.join("/") || `/${code}`
  }
}

export function LanguageList({ languages, current, onPick }: { languages: LanguageOption[]; current: string; onPick?: () => void }) {
  const hrefFor = useLanguageHref()
  return (
    <ul className="flex flex-col gap-0.5">
      {languages.map((l) => (
        <li key={l.code}>
          <Link
            href={hrefFor(l.code)}
            hrefLang={l.code}
            lang={l.code}
            dir={l.dir}
            onClick={onPick}
            aria-current={l.code === current ? "true" : undefined}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-2",
              l.code === current ? "text-accent font-semibold" : "text-fg-muted",
            )}
          >
            <span>{l.nativeName}</span>
            {l.code === current && <Check className="size-4" aria-hidden />}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function LanguageSwitcher({ label, languages, current }: { label: string; languages: LanguageOption[]; current: string }) {
  return (
    <Popover label={label} trigger={<Languages className="size-[1.15rem]" aria-hidden />}>
      {(close) => <LanguageList languages={languages} current={current} onPick={close} />}
    </Popover>
  )
}
