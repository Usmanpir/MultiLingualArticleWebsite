import { SignJWT, jwtVerify } from "jose"
import { authSecret } from "../env"

export const SESSION_COOKIE = "fs_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type SessionPayload = {
  uid: string
  role: "ADMIN" | "EDITOR" | "AUTHOR"
  /** Must equal User.sessionVersion, allowing server-side revocation. */
  v: number
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setAudience("futuresphere-admin")
    .sign(authSecret())
}

/** Signature/expiry check only. Authoritative checks re-read the user from the database. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, authSecret(), { audience: "futuresphere-admin", algorithms: ["HS256"] })
    if (typeof payload.uid !== "string" || typeof payload.v !== "number") return null
    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(payload.role as string)) return null
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
