import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, description, children, className, actions }: { title?: string; description?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("card p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

const tones: Record<string, string> = {
  PUBLISHED: "border-success/30 bg-success/10 text-success",
  APPROVED: "border-success/30 bg-success/10 text-success",
  SUBSCRIBED: "border-success/30 bg-success/10 text-success",
  ACTIVE: "border-success/30 bg-success/10 text-success",
  SCHEDULED: "border-accent/30 bg-accent/10 text-accent",
  REVIEW: "border-warning/30 bg-warning/10 text-warning",
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  DRAFT: "border-border-strong bg-surface-2 text-fg-muted",
  INACTIVE: "border-border-strong bg-surface-2 text-fg-muted",
  UNSUBSCRIBED: "border-border-strong bg-surface-2 text-fg-muted",
  ARCHIVED: "border-border-strong bg-surface-2 text-fg-subtle",
  REJECTED: "border-danger/30 bg-danger/10 text-danger",
  SPAM: "border-danger/30 bg-danger/10 text-danger",
  MISSING: "border-dashed border-border-strong text-fg-subtle",
}

export function StatusBadge({ status, children }: { status: string; children?: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase", tones[status] ?? tones.DRAFT)}>{children ?? status.toLowerCase()}</span>
}

export function Stat({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon?: ReactNode }) {
  return (
    <div className="card glow-border p-5">
      <div className="flex items-center justify-between text-fg-subtle">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="font-display mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
    </div>
  )
}

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--accent)]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-fg-subtle">{hint}</span>}
      </span>
    </label>
  )
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-start [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-fg-subtle [&_th]:uppercase [&_thead]:border-b [&_thead]:border-border [&_tbody_tr]:border-b [&_tbody_tr]:border-border [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-surface-2/50">
        {children}
      </table>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card px-6 py-12 text-center text-fg-muted">{children}</div>
}
