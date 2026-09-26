"use client"

import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { useActionState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { submitComment, type FormState } from "@/lib/actions/public"

type Labels = {
  leave: string
  name: string
  email: string
  comment: string
  submit: string
  submitting: string
  pending: string
  closed: string
  policy: string
  invalid: string
  rateLimited: string
  error: string
}

export function CommentForm({ articleId, lang, labels }: { articleId: string; lang: string; labels: Labels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitComment, { status: "idle" })
  const onSubmit = useKeepValuesSubmit(action)

  if (state.status === "success") {
    return (
      <p role="status" className="card flex items-center gap-2 p-4 font-medium text-success">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        {labels.pending}
      </p>
    )
  }

  const error =
    state.status === "invalid" ? labels.invalid : state.status === "rate" ? labels.rateLimited : state.status === "closed" ? labels.closed : state.status === "error" ? labels.error : null

  return (
    <form action={action} onSubmit={onSubmit} className="card grid gap-4 p-5">
      <h3 className="font-semibold">{labels.leave}</h3>
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="lang" value={lang} />
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">
            {labels.name}
          </label>
          <input id="c-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="c-email" className="label">
            {labels.email}
          </label>
          <input id="c-email" name="email" type="email" maxLength={254} autoComplete="email" dir="ltr" className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="c-content" className="label">
          {labels.comment}
        </label>
        <textarea id="c-content" name="content" required minLength={3} maxLength={3000} rows={4} className="input" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-fg-subtle">{labels.policy}</p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? labels.submitting : labels.submit}
        </button>
      </div>
    </form>
  )
}
