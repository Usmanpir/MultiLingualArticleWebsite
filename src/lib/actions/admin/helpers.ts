import "server-only"
import { revalidatePath } from "next/cache"
import { ZodError } from "zod"
import { AuthError } from "../../auth/session"
import { HttpError } from "../../http"

export type ActionResult = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string>
  id?: string
}

export const idle: ActionResult = { ok: false }

/** Converts thrown domain errors into a serialisable result for forms. */
export function toResult(err: unknown): ActionResult {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of err.issues) {
      const key = issue.path.join(".")
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors }
  }
  if (err instanceof AuthError) return { ok: false, message: err.status === 401 ? "Your session has expired. Please sign in again." : err.message }
  if (err instanceof HttpError) {
    const details = Array.isArray(err.details) ? ` (${err.details.map((d: { language?: string; slug?: string }) => `${d.language}: ${d.slug}`).join(", ")})` : ""
    return { ok: false, message: err.message + details }
  }
  // Prisma unique constraint
  if (typeof err === "object" && err && "code" in err && (err as { code: string }).code === "P2002") {
    return { ok: false, message: "That value is already in use." }
  }
  console.error(err)
  return { ok: false, message: "Something went wrong. Please try again." }
}

/** Public pages are ISR-cached; purge them after any content mutation. */
export function revalidatePublic() {
  revalidatePath("/", "layout")
}

export function str(fd: FormData, key: string) {
  const v = fd.get(key)
  return typeof v === "string" ? v : ""
}

export function bool(fd: FormData, key: string) {
  return fd.get(key) === "on" || fd.get(key) === "true"
}
