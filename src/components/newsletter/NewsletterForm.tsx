"use client"

import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { useActionState, useEffect } from "react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { subscribeNewsletter, type FormState } from "@/lib/actions/public"
import { track } from "@/components/analytics/track"
import { cn } from "@/lib/utils"

type Labels = {
  emailLabel: string
  placeholder: string
  button: string
  submitting: string
  success: string
  invalid: string
  error: string
  rateLimited: string
  privacy: string
}

export function NewsletterForm({ lang, labels, source, compact }: { lang: string; labels: Labels; source: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, { status: "idle" })
  const onSubmit = useKeepValuesSubmit(action)

  useEffect(() => {
    if (state.status === "success") track("newsletter_signup", { language: lang, source })
  }, [state, lang, source])

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-2 font-medium text-success">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        {labels.success}
      </p>
    )
  }

  const message =
    state.status === "invalid" ? labels.invalid : state.status === "rate" ? labels.rateLimited : state.status === "error" || state.status === "closed" ? labels.error : null

  return (
    <form action={action} onSubmit={onSubmit} className="w-full" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="source" value={source} />
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={cn("flex gap-2", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <label htmlFor={`nl-${source}`} className="sr-only">
          {labels.emailLabel}
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          placeholder={labels.placeholder}
          className="input flex-1"
          aria-invalid={state.status === "invalid" || undefined}
          aria-describedby={message ? `nl-${source}-msg` : `nl-${source}-privacy`}
        />
        <button type="submit" className="btn btn-primary min-h-11 px-5" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? labels.submitting : labels.button}
          {!pending && <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />}
        </button>
      </div>
      {message ? (
        <p id={`nl-${source}-msg`} role="alert" className="mt-2 text-sm text-danger">
          {message}
        </p>
      ) : (
        <p id={`nl-${source}-privacy`} className="mt-2 text-xs text-fg-subtle">
          {labels.privacy}
        </p>
      )}
    </form>
  )
}
