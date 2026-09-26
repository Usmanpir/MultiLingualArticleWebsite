"use client"

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { runSeoAudit, type AuditInput } from "@/lib/seo/audit"
import { cn } from "@/lib/utils"

function clip(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s
}

export function SerpPreview({ title, description, url, siteName, dir }: { title: string; description: string; url: string; siteName: string; dir: "ltr" | "rtl" }) {
  let host = url
  let crumbs = ""
  try {
    const u = new URL(url)
    host = u.host
    crumbs = u.pathname.split("/").filter(Boolean).map(decodeURIComponent).join(" › ")
  } catch {}
  return (
    <div className="rounded-xl border border-border bg-white p-4 text-start font-[arial,sans-serif] dark:bg-[#1f1f1f]" dir={dir}>
      <div className="flex items-center gap-2" dir="ltr">
        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{siteName.slice(0, 1)}</span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-[#202124] dark:text-[#dadce0]">{siteName}</p>
          <p className="truncate text-xs text-[#4d5156] dark:text-[#bdc1c6]">
            https://{host} {crumbs && `› ${crumbs}`}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xl leading-snug text-[#1a0dab] dark:text-[#99c3ff]">{clip(title || "Untitled", 62)}</p>
      <p className="mt-1 text-sm leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">{clip(description || "Add an excerpt or SEO description.", 160)}</p>
      <p className="mt-2 text-[11px] text-slate-400" dir="ltr">
        Approximation only — Google may rewrite titles and snippets.
      </p>
    </div>
  )
}

const icon = { pass: CheckCircle2, warn: AlertTriangle, fail: XCircle }
const color = { pass: "text-success", warn: "text-warning", fail: "text-danger" }

export function SeoChecklist({ input }: { input: AuditInput }) {
  const { checks, passed, total } = runSeoAudit(input)
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-semibold">Editorial SEO checklist</p>
        <p className="text-xs text-fg-subtle tabular-nums">
          {passed}/{total} passing
        </p>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${(passed / total) * 100}%` }} />
      </div>
      <ul className="grid gap-2.5">
        {checks.map((c) => {
          const Icon = icon[c.status]
          return (
            <li key={c.id} className="flex gap-2 text-sm">
              <Icon className={cn("mt-0.5 size-4 shrink-0", color[c.status])} aria-label={c.status} />
              <div className="min-w-0">
                <p className="font-medium">{c.label}</p>
                <p className="text-xs text-fg-muted">{c.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-fg-subtle">This checklist covers publishing hygiene. It is not a ranking score and cannot predict search performance.</p>
    </div>
  )
}
