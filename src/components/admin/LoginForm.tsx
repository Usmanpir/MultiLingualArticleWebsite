"use client"

import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { loginAction } from "@/lib/actions/admin/auth"

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, { ok: false })
  const onSubmit = useKeepValuesSubmit(action)
  return (
    <form action={action} onSubmit={onSubmit} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  )
}
