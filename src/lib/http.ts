import "server-only"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { AuthError } from "./auth/session"

/** CSRF defence for cookie-authenticated route handlers: the Origin (or Referer) must match the host. */
export function isSameOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  const origin = req.headers.get("origin") || req.headers.get("referer")
  if (!host || !origin) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message)
  }
}

/** Maps domain errors to correct HTTP status codes. */
export function errorResponse(err: unknown) {
  if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status })
  if (err instanceof HttpError) return NextResponse.json({ error: err.message, details: err.details }, { status: err.status })
  if (err instanceof ZodError) return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 })
  console.error(err)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
