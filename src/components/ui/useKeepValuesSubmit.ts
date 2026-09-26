"use client"

import { startTransition, type FormEvent } from "react"

/**
 * React 19 resets uncontrolled fields after a form action completes — which
 * wipes what the user typed when validation fails. Submitting through this
 * handler dispatches the same action without the automatic reset. Keep
 * `action={formAction}` on the <form> too, so it still works without JS.
 */
export function useKeepValuesSubmit(formAction: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter)
    startTransition(() => formAction(fd))
  }
}
