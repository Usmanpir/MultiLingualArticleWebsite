"use client"

import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { useActionState } from "react"
import { changePasswordAction } from "@/lib/actions/admin/auth"
import { FormMessage, SubmitButton } from "./client"

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, { ok: false })
  const onSubmit = useKeepValuesSubmit(action)
  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-3">
      <div>
        <label htmlFor="pw-cur" className="label">
          Current password
        </label>
        <input id="pw-cur" name="current" type="password" autoComplete="current-password" required className="input" />
      </div>
      <div>
        <label htmlFor="pw-new" className="label">
          New password
        </label>
        <input id="pw-new" name="next" type="password" autoComplete="new-password" minLength={12} required className="input" />
      </div>
      <div>
        <label htmlFor="pw-conf" className="label">
          Confirm new password
        </label>
        <input id="pw-conf" name="confirm" type="password" autoComplete="new-password" minLength={12} required className="input" />
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton className="btn-sm">Change password</SubmitButton>
      </div>
    </form>
  )
}
