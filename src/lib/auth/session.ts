import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "../prisma"
import { can, type Permission, type RoleName } from "./permissions"
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./token"

export type CurrentUser = {
  id: string
  email: string
  name: string
  role: RoleName
  authorId: string | null
}

export class AuthError extends Error {
  constructor(public status: 401 | 403, message = status === 401 ? "Authentication required" : "Not allowed") {
    super(message)
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(user: { id: string; role: RoleName; sessionVersion: number }) {
  const token = await signSession({ uid: user.id, role: user.role, v: user.sessionVersion })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

/**
 * Authoritative identity check: verifies the token AND re-reads the user so
 * deactivated users, role changes and revoked sessions take effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies()
  const payload = await verifySession(jar.get(SESSION_COOKIE)?.value)
  if (!payload) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, email: true, name: true, isActive: true, sessionVersion: true, role: { select: { name: true } }, author: { select: { id: true } } },
  })
  if (!user || !user.isActive || user.sessionVersion !== payload.v) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role.name, authorId: user.author?.id ?? null }
})

/** For admin pages: redirects to login, or to the dashboard when the permission is missing. */
export async function requirePageUser(permission: Permission = "dashboard.view") {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!can(user.role, permission)) redirect("/admin?denied=1")
  return user
}

/** For server actions and route handlers: throws AuthError. */
export async function requireUser(permission: Permission = "dashboard.view") {
  const user = await getCurrentUser()
  if (!user) throw new AuthError(401)
  if (!can(user.role, permission)) throw new AuthError(403)
  return user
}
