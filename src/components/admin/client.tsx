"use client"

import { createContext, useActionState, useContext, useEffect, useRef, useTransition, type ReactNode } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import type { ActionResult } from "@/lib/actions/admin/helpers"
import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { cn } from "@/lib/utils"

const PendingContext = createContext(false)

export function SubmitButton({ children, className, variant = "primary" }: { children: ReactNode; className?: string; variant?: "primary" | "ghost" | "danger" }) {
  const status = useFormStatus()
  const pending = useContext(PendingContext) || status.pending
  return (
    <button type="submit" disabled={pending} className={cn("btn", `btn-${variant}`, className)}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function FormMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("flex items-center gap-1.5 text-sm", state.ok ? "text-success" : "text-danger")}>
      {state.ok && <CheckCircle2 className="size-4" aria-hidden />}
      {state.message}
    </p>
  )
}

/** Form bound to a server action returning ActionResult; refreshes server data on success. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  onSuccess,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>
  children: ReactNode
  className?: string
  resetOnSuccess?: boolean
  onSuccess?: (state: ActionResult) => void
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false })
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const onSubmit = useKeepValuesSubmit(formAction)
  useEffect(() => {
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset()
      onSuccess?.(state)
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
  const fieldErrors = state.fieldErrors ? Object.entries(state.fieldErrors) : []
  return (
    <form ref={ref} action={formAction} onSubmit={onSubmit} className={className}>
      <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
      <div className="col-span-full grid gap-1" aria-live="polite">
        <FormMessage state={state} />
        {fieldErrors.length > 0 && (
          <ul className="list-inside list-disc text-xs text-danger">
            {fieldErrors.map(([k, v]) => (
              <li key={k}>
                <span className="font-mono">{k}</span>: {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  )
}

/** Button that runs a server action after confirmation. */
export function ConfirmAction({
  action,
  confirm,
  children,
  className,
  variant = "ghost",
  redirectTo,
}: {
  action: () => Promise<ActionResult>
  confirm?: string
  children: ReactNode
  className?: string
  variant?: "ghost" | "danger" | "primary"
  redirectTo?: string
}) {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <button
      type="button"
      disabled={pending}
      className={cn("btn btn-sm", `btn-${variant}`, className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return
        start(async () => {
          const res = await action()
          if (!res.ok && res.message) window.alert(res.message)
          else if (redirectTo) router.push(redirectTo)
          else router.refresh()
        })
      }}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function NavLink({ href, children, exact }: { href: string; children: ReactNode; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent/10 text-accent" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </Link>
  )
}
